'use strict'
const SDK = require("victsaitw-sdk");
const R = require('ramda');
class BLJPlugin{
  constructor(){
    this.state = null;
  }
  start(){
    return this.defineMongoDBSchema();
  }
  defineMongoDBSchema(){
    console.log('defineMonoDBSchema');
    return Promise.resolve().then(() => {
      return SDK.redis.sendCommand({
        command: 'SET', 
        data: ['mongo_schema_lock', Date.now(),  'EX', 60, 'NX']
      })
    }).then(result => {
      console.log(result);
      if (R.isNil(result)){
        throw new Error('SET mongo_schema_lock Failed.');
      }
      return result;
    }).then(result => {
      return SDK.mongo.ensureIndex({
        db: 'test',
        collection: 'MemberDB',
        index: 'user_id',
        options: { unique: true }
      });
    }).then(result => {
      return SDK.mongo.ensureIndexes({
        db: 'test',
        collection: 'BLJMoneyInTable',
        indexes: { area: 1, user_id: 1, table_id: 1},
        options: { unique: true }
      });
    }).catch(err => {
      console.log(err);
    });
  }
  onBLJ2DBA_REQ_WRITE_SCORE(protocol){
    let response = SDK.protocol.makeEmptyProtocol(
      'DBA2GCT_RSP_WRITE_SCORE'
    );
    response.toTopic = protocol.fromTopic;
    response.update({
      seq_back: protocol.seq,
      result: 'SUCCESS'
    });
    SDK.send2XYZ(response);
  }
  onBLJ2DBA_REQ_BUY_IN(protocol){
    let response = SDK.protocol.makeEmptyProtocol('DBA2BLJ_RSP_BUY_IN');
    const area = protocol.find('area', '');
    const table_id = protocol.find('table_id', -1);
    const user_id = protocol.find('user_id', -1);
    const buy_in = protocol.find('buy_in', 0);
    response.update({
      seq_back: protocol.seq,
      area: area,
      table_id: table_id,
      user_id: user_id,
      money_in_pocket: 0,
      money_in_table: 0,
      result: 'FALSE'
    });
    response.toTopic = protocol.fromTopic;
    return Promise.resolve().then(() => {
      return SDK.mongo.findOne({
        db: 'test',
        collection: 'MemberDB',
        query: {
          _id: SDK.mongo.toObjectId(user_id),
        }
      });
    }).then((data) => {
      console.log(`find user ${JSON.stringify(data)}`);
      return data;
    }).then(data => {
      if(!data){
        throw new Error(`user ${user_id} in not in MemberDB`);
      }
      const money_in_pocket = R.pathOr(0, ['money'], data);
      if(money_in_pocket < buy_in){
        throw new Error(`user not enough money:${money_in_pocket}`);
      }
      // deduct money
      return SDK.mongo.updateOne({
        db: 'test',
        collection: 'MemberDB',
        query: {
          _id: SDK.mongo.toObjectId(user_id),
        },
        content: {
          '$set': { money: (money_in_pocket - buy_in)},  
        }
      }).then(result => {
        console.log(`updateOne ${result}`);
        response.update({
          money_in_pocket: money_in_pocket - buy_in,
        });
        return result;
      });
    }).then(result => {
      return SDK.mongo.upsertOne({
        db: 'test',
        collection: 'BLJMoneyInTable',
        query: {
          area: area,
          table_id: table_id,
          user_id: user_id,
        },
        content: {
          '$set': {money: buy_in},  
        }
      }).then(result => {
        console.log(`upsertOne ${result}`);
        response.update({
          money_in_table: buy_in,
        });
        return result;  
      });
    }).then(result => {
      response.update({
        result: 'SUCCESS'
      });
      return SDK.send2XYZ(response);
    }).catch(err => {
      console.log(err);
      return SDK.send2XYZ(response);
    });
  }
  onBLJ2DBA_REQ_JOIN_TABLE(protocol){
    // set the default response.
    let packet = SDK.protocol.makeEmptyProtocol('DBA2BLJ_RSP_JOIN_TABLE')
    packet.update({
      to_topic: protocol.fromTopic,
      seq_back: protocol.find('seq'),
      area: protocol.find('area'),
      table_id: protocol.find('table_id'),
      user_id: protocol.find('user_id'),
      money_in_pocket: -1,
      money_in_table: -1,
      nickname: '',
      result: 'False'
    });
    // query MemberDB
    SDK.mongo.findOne({
      db: 'test',
      collection: 'MemberDB',
      query: {
        _id: SDK.mongo.toObjectId(protocol.find('user_id'))
      }
    }).then(data => {
      console.log(`MongoDB findOne:${JSON.stringify(data)}`);
      // query moneyInTable
      return SDK.mongo.findOne({
        db: 'test',
        collection: 'BLJMoneyInTable',
        query: {
          area: protocol.find('area'),
          table_id: protocol.find('table_id'),
          user_id: protocol.find('user_id'),
        }
      }).then(inData => {
        return packet.update({
          money_in_table: R.pathOr(0, ['money'], inData),
          money_in_pocket: R.pathOr(0, ['money'], data),
          nickname: R.pathOr('', 'nickname', data),
          result: 'SUCCESS'
        })
      });
    }).then(packet => {
      return SDK.send2XYZ(packet);
    }).catch((err) => {
      console.log(err);
      return SDK.send2XYZ(packet);
    });
  }
  onBLJ2DBA_REQ_CONFIG(protocol){
    // set the default response.
    console.log(protocol);
    let packet = SDK.protocol.makeEmptyProtocol(
      'DBA2BLJ_RSP_CONFIG'
    );
    console.log(protocol.fromTopic);
    packet.update({
      to_topic: protocol.fromTopic,
      seq_back:protocol.seq,
      config: {}
    });
    SDK.mongo.findOne({
      db: 'test', collection: 'BLJConfig',
      query: {
        area: protocol.area 
      }
    }).then(data => {
      packet.update({
        config: data ? data: {}
      });
      console.log(packet.toString());
      SDK.send2XYZ(packet);
    }).catch(err => {
      console.log(err);  
    });
  }
}

module.exports = new BLJPlugin();

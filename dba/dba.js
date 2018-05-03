const SDK = require("victsaitw-sdk");
const NewnewPlugin = require('./api/newnewPlugin');
const R = require('ramda');
class DBA{
  constructor(){
    this.state = null;
  }
  start(){
    SDK.on('stateChange', (state) => {
      this.state = 'ready';
    });
    SDK.on('kafkaMessage', (data) => {
      return this.protocolHandler(data);
    });
    SDK.start({mongo_url: '123', kafka_url: '123'});
  }
  findFunc(name){
    const fn = this[name];
    return fn ? fn.bind(this) : undefined;
  }
  protocolHandler(data){
    return Promise.resolve().then(() => {
      console.log(data);
      return SDK.protocol.validate(data);
    }).then((protocol) => {
      const fn = this.findFunc('on' + protocol.proto);
      if (!fn){
        throw new Error(`NO_METHOD_FOR_PROTOCOL:${protocol}`);
      }
      return {fn, protocol};
    }).then(({fn, protocol}) => {
      return fn(protocol);
    }).catch((err) => {
      throw err;
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
        user_id: protocol.find('user_id')
      }
    }).then(data => {
      console.log(`MongoDB findOne:${data}`);
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
          money_in_pocket: R.pathOr(0, ['money_in_pocket'], data),
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
  onGCT2DBA_REQ_SIGN_UP(protocol){
    let response = SDK.protocol.makeEmptyProtocol(
      'DBA2GCT_RSP_SIGN_UP'
    );
    response.toTopic = protocol.fromTopic;
    response.update({
      seq_back: protocol.seq
    });
    SDK.mongo.insertOne({
      db: 'test',
      collection: 'MemberDB',
      content: {
        user_id: protocol.find('user_id'),
        nickname: protocol.find('nickname'),
        money_in_pocket: 100000,
        created_dt: Date.now(),
      }
    }).then(result => {
      console.log(result);
      response.update({
        result: 'SUCCESS',
      });
      return SDK.send2XYZ(response);
    }).catch(err => {
      console.log(err);
      response.update({
        result: 'FAIL',
      });
      return SDK.send2XYZ(response);
    });
  }
  onGCT2DBA_REQ_LOGIN(protocol){
    let packet = SDK.protocol.makeEmptyProtocol('DBA2GCT_RSP_LOGIN');
    let nickname = '';
    let money = 0;
    SDK.mongo.findOne({
      db: 'test',
      collection: 'MemberDB',
      query: {
        _id: protocol.user_id,
      }
    }).then((data) => {
      console.log(data);
      packet.update({
        to_topic: protocol.fromTopic,
        seq_back: protocol.find('seq'),
        money: data.money,
        nickname: data.nickname,
        user_id: protocol.user_id
      });
    return SDK.send2XYZ(packet);
    }).catch((err) => {
      console.log(err);  
    });
  }
  onGCT2BLJ_REQ_BUY_IN(protocol){
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
    return Promise.resolve(() => {
      return SDK.mongo.findOne({
        db: 'test',
        collection: 'MemberDB',
        query: {
          _id: user_id,
        }
      });
    }).then((data) => {
      console.log(`find user ${data}`);
      return data;
    }).then(data => {
      if(!data){
        throw new Error(`user ${user_id} in not in MemberDB`);
      }
      const money_in_pocket = R.pathOf(0, ['money'], data);
      if(money_in_pocket > buy_in){
        throw new Error(`user not enough money:${money_in_pocket}`);
      }
      // deduct money
      return SDK.mongo.updateOne({
        db: 'test',
        collection: 'MemberDB',
        query: {
          user_id: user_id,
        },
        content: {
          money: money_in_pocket - buy_in,  
        }
      }).then(result => {
        response.update({
          money_in_pocket: money_in_pocket - buy_in,
        });
        return result;
      });
    }).then(result => {
      return SDK.mongo.updateOrInser({
        db: 'test',
        collection: 'MemberDB',
        query: {
          area: area,
          table_id: table_id,
          user_id: user_id,
        },
        content: {
          money: buy_in,  
        }
      }).then(result => {
        response.update({
          money_in_table: buy_in,
          result: 'SUCCESS'
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
};
module.exports = new DBA();

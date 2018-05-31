'use strict'
const SDK = require("victsaitw-sdk");
const R = require('ramda');
const BLJPlugin = require('./api/dba4blj.js');
class DBA{
  constructor(){
    this.state = null;
  }
  start(){
    SDK.on('stateChange', (state) => {
      if ('ready' == this.state){
        return;
      }
      this.triggerWhenReady();
    });
    SDK.on('kafkaMessage', (data) => {
      return this.protocolHandler(data);
    });
    SDK.start({
      kafka_url: 'kafka:9092',
      mongo_url: 'mongo:27017',
      redis_url: 'redis:6379'
    });
  }
  triggerWhenReady(){
    this.state = 'ready';
    return Promise.resolve().then(() => {
      return BLJPlugin.start();
    }).catch(err => {
      console.log(err);
    });
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
  onGWY2SVR_REQ_GAME_PLAY(protocol){
    let payload = protocol.find('payload', {});
    return this.protocolHandler(Object.assign(payload, 
      {
        from_topic: protocol.fromTopic
      }));  
  };
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
        money: 100000,
        exp: 0,
        level: 0,
        created_dt: Date.now(),
        updated_dt: Date.now(),
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
  onBLJ2DBA_REQ_BUY_IN(protocol){
    return BLJPlugin.onBLJ2DBA_REQ_BUY_IN(protocol);
  }
  onBLJ2DBA_REQ_WRITE_SCORE(protocol){
    return BLJPlugin.onBLJ2DBA_REQ_WRITE_SCORE(protocol);
  }
  onBLJ2DBA_REQ_JOIN_TABLE(protocol){
    return BLJPlugin.onBLJ2DBA_REQ_JOIN_TABLE(protocol);
  }
  onBLJ2DBA_REQ_CONFIG(protocol){
    return BLJPlugin.onBLJ2DBA_REQ_CONFIG(protocol);
  }
};
module.exports = new DBA();

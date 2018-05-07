'use strict'
const SDK = require('victsaitw-sdk');
const ws = require('./websocket');
const R = require('ramda');
class GWY{
  constructor(){
    this.user_binding = {};
    this.state = 'init';
    this.ws = null;
  }
  start(server){
    this.ws = ws.start(server);;
    SDK.on('stateChange', (state) => {
      this.triggerWhenReady();
    });
    SDK.on('kafkaMessage', (data) => {
      return this.protocolHandler(data);
    });
    ws.on('webSocketMessage', (data) => {
      console.log(`gwy on events:${data}`);
      return this.protocolHandler(data);  
    });
    ws.on('webSocketConnect', (client_id) => {
      let packet = SDK.protocol.makeEmptyProtocol(
        'GWY2GCT_RSP_CLIENT_ID',
      );
      packet.update({
        client_id: client_id
      });
      this.ws.send(client_id, packet);
    });
    SDK.start({
      schemas: {},
      kafka_url: 'kafka:9092',
    });
  }
  findFunc(name){
    const fn = this[name];
    return fn ? fn.bind(this) : undefined;
  }
  protocolHandler(data){
    return Promise.resolve().then(() => {
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
      console.log(err.stack);
      throw err;
    });
  }
  // send2DBA(packet){
  //   console.log(`send2DBA:${JSON.stringify(packet.toString())}`);
  //   packet.toTopic = 'dbaPool';
  //   return SDK.send2XYZ(packet);
  // }
  triggerWhenReady(){
    this.state = 'ready';
  }
  onGCT2GWY_REQ_BIND_USER(protocol){
    let packet = SDK.protocol.makeEmptyProtocol(
      'GWY2GCT_RSP_BIND_USER'
    );
    const user_id = protocol.find('user_id', -1);
    const client_id = protocol.find('client_id', -1);
    packet.update({
      seq_back: protocol.seq,
      result: 'FAIL'
    });
    return Promise.resolve().then(() => {
      if (!this.ws.checkConnection(client_id)){
        throw new Error(`onGCT2GCY_GAME_PLAY:web socket not found ${protocol}`);
      }
      if (-1 == user_id){
        throw new Error(`onGCT2GWY_REQ_BIND_USER:user id is -1`);
      }
      return protocol;
    }).then(() => {
      this.user_binding[user_id] = client_id;
      packet.update({
        result: 'SUCCESS'
      });
      return this.ws.send(client_id, packet);
    }).catch(err => {
      console.log(err);
    });
  }
  onGCT2GWY_REQ_GAME_PLAY(protocol){
    console.log(`gwy->onGCT2GWY_REQ_GAME_PLAY:${protocol}`);
    return Promise.resolve().then(() => {
      if (!this.ws.checkConnection(protocol.find('client_id', -1))){
        throw new Error(`onGCT2GCY_GAME_PLAY:web socket not found ${protocol}`);
      }
      return protocol;
    }).then(() => {
      let packet = SDK.protocol.makeEmptyProtocol(
        'GWY2SVR_REQ_GAME_PLAY',
      );
      packet.update({
        seq: protocol.seq,
        payload: protocol.find('payload', {}),
      });
      packet.toTopic = protocol.toTopic;
      packet.timeout = 5;
      return SDK.send2XYZ(packet);
    }).then(data => {
      console.log(data);
      let packet = SDK.protocol.makeEmptyProtocol(
        'GWY2GCT_RSP_GAME_PLAY'
      );
      packet.update({
        seq_back: data.req.seq,
        payload: data.rsp,
      });
      return this.ws.send(protocol.find('client_id', -1), packet);
    }).catch(err => {
      console.log(`onGCT2GWY_REQ_GAME_PLAY:${err}`);
    });
  }
  onSVR2GWY_NTF_GAME_PLAY(protocol){
    const user_id = protocol.find('user_id', -1);
    const client_id = R.pathOr(-1, [user_id], this.user_binding);
    let packet = SDK.protocol.makeEmptyProtocol(
      'GWY2GCT_NTF_GAME_PLAY'
    );
    packet.update({
      payload: protocol.find('payload', {})
    });
    return this.ws.send(client_id, packet);
  }
  onPARSE_ERROR(protocol){
   console.log(protocol.err);
  }
}

module.exports = new GWY();

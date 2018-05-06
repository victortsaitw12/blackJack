'use strict'
const SDK = require('victsaitw-sdk');
const ws = require('./websocket');
const R = require('ramda');
class GWY{
  constructor(){
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
  send2DBA(packet){
    console.log(`send2DBA:${JSON.stringify(packet.toString())}`);
    packet.toTopic = 'dbaPool';
    return SDK.send2XYZ(packet);
  }
  triggerWhenReady(){
    this.state = 'ready';
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
  onPARSE_ERROR(protocol){
   console.log(protocol.err);
  }
}

module.exports = new GWY();

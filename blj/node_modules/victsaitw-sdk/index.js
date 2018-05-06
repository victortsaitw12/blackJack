'use strict'
const mongo = require('./mongo.js');
const kafka = require('./kafka.js');
const Protocol = require('./protocol');
const Timeout = require('./timeout');
const EventEmitter = require('events').EventEmitter;
class SDK extends EventEmitter{
  constructor(){
    super();
    this.state = null;
    this.protocol = null;
    this.mongo_url = null;
    this.kafka_url = null;
    this.timeout = this.newTimeoutRegister();
    this.mongo = mongo;
    this.kafka = kafka;
    this.mongo.on('stateChange', this.stateChange.bind(this));
    this.kafka.on('stateChange', this.stateChange.bind(this));
    this.kafka.on('kafkaMessage', this.kafkaMessage.bind(this));
  }
  newTimeoutRegister(){
    return new Timeout();
  }
  get sequence(){
    return new Date().valueOf() + '' + process.pid;
  }
  start({schemas, mongo_url, kafka_url}){
    this.mongo_url = mongo_url;
    this.kafka_url = kafka_url;
    schemas = schemas ? schemas : {};
    if (mongo_url){
      this.mongo.start({
        mongo: {
          url: 'mongodb://' + mongo_url,
        }
      });
    }
    if (kafka_url){
      this.kafka.start({
        url: kafka_url,
        self_queue: process.env.BIND_QUEUE,
        group_queue: process.env.BIND_POOL,
      });
    }
    this.protocol = new Protocol(schemas); 
  }
  sendWithTimeout(payload){
    console.log(`sendWithTimeout:${payload.timeout}`);
    if (!payload.seq) {
      return Promise.reject(new Error(`protocol has no seq:${payload.toString()}`));
    }
    let promise = new Promise((resolve, reject) => {
      this.timeout.registerTimeoutProtocol(payload.seq, payload, resolve, reject);
      this.send(payload.toTopic, payload.toObject());
    });
    return this.timeout.promiseTimeout(payload.seq, payload.timeout, promise);
  }
  send(topic, protocol){
    return this.kafka.send2XYZ({
      topic: topic,
      protocol: protocol
    });
  }
  send2XYZ(payload){
    if (!payload.toTopic) {
      return Promise.reject(new Error(`I do not know send to where:${payload.topic}`));
    }
    if (!payload.timeout){
      return Promise.resolve().then(() => {
        return this.send(payload.toTopic, payload.toObject());
      });
    }
    return this.sendWithTimeout(payload);
  }
  kafkaMessage(msg){
    console.log(`kafkaMessage:${msg}`);
    let data = this.timeout.getTimeoutRegister(msg.seq_back);
    if (!data){
      return this.emit('kafkaMessage', msg);  
    }
    this.timeout.resolveTimeoutRegister(msg.seq_back, msg);
  }
  stateChange(state){
    console.log('kafka state:', this.kafka.state);
    console.log('mong state:', this.mongo.state);
    if((!this.kafka_url || 'ready' == this.kafka.state) &&
       (!this.mongo_url || 'ready' == this.mongo.state)){
      this.state = 'ready';
      this.emit('stateChange', this.state);
    }
  }
}
module.exports = new SDK();

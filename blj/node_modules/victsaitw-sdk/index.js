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
    this.mongo = mongo;
    this.kafka = kafka;
    this.mongo.on('stateChange', this.stateChange.bind(this));
    this.kafka.on('stateChange', this.stateChange.bind(this));
    this.kafka.on('kafkaMessage', this.kafkaMessage.bind(this));
  }
  get sequence(){
    return new Date().valueOf() + '' + process.pid;
  }
  start({schemas, mongo_url, kafka_url}){
    schemas = schemas ? schemas : {};
    if (mongo_url){
      this.mongo.start({
        mongo: {
          url: 'mongodb://mongo:27017'  
        }
      });
    }
    if (kafka_url){
      this.kafka.start({
        url: 'kafka:9092',
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
      Timeout.registerTimeoutProtocol(payload.seq, payload, resolve, reject);
      this.send(payload.toTopic, payload.toObject());
    });
    return Timeout.promiseTimeout(payload.seq, payload.timeout, promise);
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
    let data = Timeout.getTimeoutRegister(msg.seq_back);
    if (!data){
      return this.emit('kafkaMessage', msg);  
    }
    Timeout.resolveTimeoutRegister(msg.seq_back, msg);
  }
  stateChange(state){
    console.log('kafka state:', this.kafka.state);
    console.log('mong state:', this.mongo.state);
    if('ready' == this.kafka.state &&
       'ready' == this.mongo.state){
      this.state = 'ready';
      this.emit('stateChange', this.state);
    }
  }
}
module.exports = new SDK();

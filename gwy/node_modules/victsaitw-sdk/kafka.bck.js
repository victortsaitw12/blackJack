'use strict'
var Kafka = require('no-kafka');
var KeyPartitioner = require('./keyPartitioner');
var R = require('ramda');
var EventEmitter = require('events').EventEmitter;
class MessageBroker extends EventEmitter{
  constructor(){
    super();
    this.state = null;
    this.url = '';
    this.producer = null;
    this.consumer = null;
    this.groupConsumer = null;
  }
  groupDataHandler(messageSet, topic, partition){
    messageSet.forEach((m) => {
      console.log(topic, partition, m.offset, m.message.value.toString('utf8'));
      if ('KAFKA_NTF_READY' === m.message.value.toString('utf8')){
        this.state = 'ready';
        this.emit('stateChange', this.state);
      } else {
        this.emit('kafkaMessage', m.message.value.toString('utf8')); 
      }
      // commit offset
      return this.groupConsumer.commitOffset({
        topic: topic,
        partition: partition,
        offset: m.offset,
        metadata: 'optional'
      });
    });  
  }
  getKey(){
    if (process.env.BIND_KEY && '' !== process.env.BIND_KEY){
      return process.env.BIND_KEY;
    }
    return Math.floor(Math.random() * Math.floor(4)) + '-key';
  }
  initProducer(){
    if ('ready' == this.state){
      return;
    }
    console.log('initProducer');
    this.producer.send({
      topic: process.env.BIND_QUEUE,
      message: {
        key: this.getKey(),
        value: 'KAFKA_NTF_READY'
      }
    });
    setTimeout(this.initProducer.bind(this), 5000);
  }
  send2DBA(data){
    return this.producer.send({
      topic: process.env.DBA_POOL,
      // partition: 0,
      message: {
        key: this.getKey(),
        value: JSON.stringify(data) 
      }
    })  
  }
  send2XYZ(data){
    return this.producer.send({
      topic: data.to_topic,
      message: {
        key: data.to_key,
        value: JSON.stringify(data),
      }
    });
  }
  send2BLJ(data){
    return this.producer.send({
      topic: process.env.BLJ_QUEUE,
      message: {
        key: this.getKey(),
        value: JSON.stringify(data) 
      }
    });
  }
  start(config){
    this.url = R.path(['kafka', 'url'], config);
    this.producer = new Kafka.Producer({
      connectionString: this.url,
      partitioner: KeyPartitioner,
    });
    this.selfConsumer = new Kafka.GroupConsumer({
      connectionString: this.url, 
      groupId: process.env.BIND_QUEUE,  
    })
    this.groupConsumer = new Kafka.GroupConsumer({
      connectionString: this.url,
      groupId: process.env.BIND_POOL,  
    })
    return Promise.resolve().then(() => {
      if (!process.env.BIND_QUEUE || '' == process.env.BIND_QUEUE){
        return;
      }
      this.selfConsumer.init({
        subscriptions: [process.env.BIND_QUEUE],
        handler: this.groupDataHandler.bind(this)
      }).catch((err) => {
        console.log('selfConsumer init error');
        throw err;
      });
    }).then(() => {
      if (!process.env.BIND_POOL || '' == process.env.BIND_POOL){
        return;
      }
      return this.groupConsumer.init({
        subscriptions: [process.env.BIND_POOL],
        handler: this.groupDataHandler.bind(this)
      }).catch((err) => {
        console.log('groupConsumer init error');
        throw err;
      });   
    }).then(() => {
      return this.producer.init().then(() => {
        return this.initProducer();
      }).catch((err) => {
        console.log('produce init error')
        throw err;
      });
    }).catch((err) => {
      console.log(err.message);
      console.log(err);
      throw err;
    });
  }
}

module.exports = new MessageBroker();

'use strict'
var kafka = require('kafka-node'),
    Producer = kafka.HighLevelProducer,
    Client = kafka.KafkaClient,
    ConsumerGroup = kafka.ConsumerGroup,
    EventEmitter = require('events').EventEmitter;
class MessageBroker extends EventEmitter{
  constructor(){
    super();
    this.config = {};
    this.state = 'init';
    this.producer = null;
    this.selfConsumer = null;
    this.groupConsumer = null;
    this.client = null;
  }
  createProducer(config){
    this.client = new Client({
      kafkaHost:config.url
    });
    this.producer = new Producer(this.client,
      { requireAcks: 1, ackTimeoutMs: 100, partitionerType: 3});
    this.producer.on('error', (err) => {
      console.log('kafka init producer fail');
      console.log(err);
      process.exit(1);
    });
    this.producer.on('ready', () => {
      this.createTopics(config);
      this.createSelfConsumer(config);
      this.createGroupConsumer(config);
      this.issueReadyMsg(config);  
    });
  }
  issueReadyMsg(config){
    if ('ready' == this.state){
      return;
    }
    this.send2XYZ({
      topic: config.self_queue,
      protocol: {
        proto: 'KAFKA_NTF_READY',  
      }
    });
    setTimeout(this.issueReadyMsg.bind(this), 5000, config);
  }
  send2XYZ(data){
    this.client.refreshMetadata([data.topic], (err) => {
      if(err){
        console.log(`refreshMetadata err ${err}`);
      }
      this.send2XYZAfterRefreshMetadata(data);
    });
  }
  send2XYZAfterRefreshMetadata(data){
    data.from_topic = this.config.self_queue;
    const packet = [{
      topic: data.topic,
      messages: [JSON.stringify(data)],
      key: data.protocol.proto,
      attributes: 1,
      timestamp: Date.now(),
    }];
    console.log(`send2XYZ:${packet}`)
    this.producer.send(packet, (err, data) => {
      console.log('result of send2XYZ');
      if (err) {
        return console.log(err);
      }
      return console.log(data);  
    });
  }
  createTopics(config){
    console.log('create topics');
    let topics = [];
    if (!config.self_queue &&
        '' !== config.self_queue){
      topics.push(config.self_queue);
    }
    if (!config.group_queue &&
        '' !== config.group_queue){
      topics.push(config.group_queue);
    }
    if (0 == topics.length){
      console.log('topics is empty');
      return;
    }
    return this.producer.createTopics(
      topics, false, (err, data) => {
      if (err) {
        console.log('kafka create topics fail');
        console.log(err);
        return process.exit(1);
      }
      console.log('this is a topic:');
      console.log(data);
    });  
  }
  createSelfConsumer(config){
    console.log('createSelfConsumer');
    if (!config.self_queue ||
        '' == config.self_queue){
      return console.log('config.self_queue is empty');;
    }
    this.selfConsumer = new ConsumerGroup({
      kafkaHost: config.url,
      groupId: config.self_queue,
      sessionTimeout: 15000,
      protocol: ['roundrobin'],
      fromOffset: 'earliest',
      // id: process.ppid
    }, config.self_queue);
    this.selfConsumer.on('error', (err) => {
      conole.log('kafka init selfConsumer fail');
      console.log(err);
      process.exit(1);
    });
    this.selfConsumer.on('message', this.onMessage.bind(this));
  }
  createGroupConsumer(config){
    console.log('createGroupConsumer');
    if (!config.group_queue ||
        '' == config.group_queue){
      return console.log('config.group_queue is empty');;
    }
    this.groupConsumer = new ConsumerGroup({
      kafkaHost: config.url,
      groupId: config.group_queue,
      sessionTimeout: 15000,
      protocol: ['roundrobin'],
      fromOffset: 'earliest',
      // id: process.ppid
    }, config.group_queue);
    this.groupConsumer.on('error', (err) => {
      conole.log('kafka init groupConsumer fail');
      console.log(err);
      process.exit(1);
    });
    this.groupConsumer.on('message', this.onMessage.bind(this));
  }
  onMessage(message){
    console.log('onMessage');
    const packet = JSON.parse(message.value);
    if (packet.protocol &&
        'KAFKA_NTF_READY' == packet.protocol.proto){
      this.state = 'ready';
      return this.emit('stateChange', this.state);
    }
    this.emit('kafkaMessage', 
      Object.assign(packet.protocol, {
        from_topic: packet.from_topic
     }));
    console.log(message);
  }
  start(config){
    // config = { url, self_queue, group_queue, broadcast_queue }
    this.config = config;
    this.createProducer(config);
  }
}

module.exports = new MessageBroker();

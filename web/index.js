'use strict'

const SDK = require('victsaitw-sdk');
const register = require('./register');
process.on('uncaughtException', (err) => {
  console.error('Unhandled Exception', err);  
});

process.on('uncaughtRejection', (err, promise) => {
  console.error('Unhandled Rejection', err);  
});

SDK.on('stateChange', (state) => {
  if ('ready' == state){
    const Web = require('./web');
  }
});
SDK.kafka.on('kafkaMessage', (proto) => {
  console.log(proto);
  register.eventTrigger(proto);
});
const startSDK = () => {
  SDK.start({mongo_url: '123', kafka_url: '123'});
}

setTimeout(startSDK, 20000);

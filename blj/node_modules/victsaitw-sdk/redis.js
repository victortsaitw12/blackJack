'use strict'
var Redis = require('ioredis');
var Joi = require('joi');
var R = require('ramda');
var EventEmitter = require('events').EventEmitter;
class RedisConnect extends EventEmitter{
  constructor(){
    super();
    this.state = null;
    this.connection = null;  
  }
  start(config){
    const url = R.path(['url'], config);
    this.connection = new Redis(url);
    return this.connection.connect(() => {
      this.state = 'ready';
      return this.emit('stateChange', this.state);
    });
  }
  sendCommand({command, data}){
    return new Promise((resolve, reject) => {
      return this.connection.sendCommand(
        new Redis.Command(command, data, 'utf-8', (err, value) => {
          if (err) reject(err);
          resolve(value ? value.toString() : value);
        })
      )
    });
  }
}

module.exports = new RedisConnect();

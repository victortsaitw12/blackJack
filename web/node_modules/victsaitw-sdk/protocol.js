'use strict'
const Joi = require('joi');
class Payload{
  constructor(proto, data){
    this.content = Object.assign({
      proto: proto
    }, data);
    this._timeout = data.timeout * 1000;
    this._to_topic = data.to_topic;
  }
  update(data){
    this.content = Object.assign(this.content, data);
    this._timeout = data.timeout * 1000;
    this._to_topic = data.to_topic;
    return this;
  }
  find(key){
    return this.content[key];
  }
  toObject(){
    return this.content;
  }
  toString(){
    return JSON.stringify(this.content);
  }
  get seq() {
    return this.content.seq;
  }
  get fromTopic(){
    return this.content.from_topic;
  }
  get proto(){
    return this.content.proto;
  }
  set toTopic(topic){
    this._to_topic = topic;
  }
  get toTopic(){
    return this._to_topic;
  }
  set timeout(sec){
    this._timeout = sec * 1000;
  }
  get timeout(){
    return this._timeout;
  }
}

class Protocol{
  constructor(schemas){
    this.schemas = schemas;
  }
  validate(protocol){
    return Promise.resolve(protocol).then(in_protocol => {
      const schema = this.schemas[in_protocol.proto];
      if (!schema){
        throw new Error(`schema not found:${in_protocol}`);
      }
      return {
        protocol: in_protocol, 
        schema: schema
      };
    }).then(data => {
      return Joi.validate(data.protocol, data.schema);
    }).then(data => {
      return new Payload(data.proto, data);
    });
  }
  makeEmptyProtocol(proto){
    return new Payload(proto, {});
  }
};

module.exports = Protocol;

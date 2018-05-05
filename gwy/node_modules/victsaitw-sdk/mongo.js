var MongoClient = require('mongodb').MongoClient;
var Joi = require('joi');
var R = require('ramda');
var EventEmitter = require('events').EventEmitter;
class Database extends EventEmitter{
  constructor(){
    super();
    this.state = null;
    this.connection = null;  
  }
  start(config){
    const url = R.path(['mongo', 'url'], config);
    return MongoClient.connect(url).then((connection) => {
      this.connection = connection;
      this.state = 'ready';
      return this.emit('stateChange', this.state);
    });
  }
  validateInsert(data){
    const schema = Joi.object().keys({
      db: Joi.string().required(),
      collection: Joi.string().required(),
      content: Joi.object()
    });
    return Joi.validate(data, schema);
  }
  insertOne(data){
    return this.validateInsert(data).then((inData) => {
      return this.connection.db(inData.db).collection(
        inData.collection).insertOne(inData.content);  
    });
  }
  validateFindOne(data){
    const schema = Joi.object().keys({
      db: Joi.string().required(),
      collection: Joi.string().required(),
      query: Joi.object().required(),
    });
    return Joi.validate(data, schema);
  }
  findOne(data){
    return this.validateFindOne(data).then((inData) => {
      return this.connection.db(inData.db).collection(
        inData.collection).findOne(inData.query);
    });
  }
  validateUpdateOne(data){
    const schema = Joi.object().keys({
      db: Joi.string().required(),
      collection: Joi.string().required(),
      query: Joi.object().required(),
      content: Joi.object().required()
    });
    return Joi.validate(data, schema);
  }
  updateOne(data){
    return this.validateUpdateOne(data).then(inData => {
      return this.connection.db(inData.db).collection(
        inData.collection).updateOne(
          inData.query,
          inData.content,
        )
    });
  }
  upsertOne(data){
    return this.validateUpdateOne(data).then(inData => {
      return this.connection.db(inData.db).collection(
        inData.collection
      ).updateOne(
        inData.query,
        inData.content,
        { upsert: true},
      )
    });
  }
}

module.exports = new Database();

const SDK = require("victsaitw-sdk");
const Joi = require('joi');
var newnew = {};
newnew.onNEW2DBA_REQ_NEW_HAND = (proto) => {
  const schema = Joi.object().keys({
    table_id: Joi.number().integer(),
    area: Joi.string(),
    min_bet: Joi.number().integer()
  })
  return Joi.validate(proto, schema).then(() => {
    return SDK.mongo.insertOne({
      db: 'newnew',
      collection: 'hand_record',
      content: {
        table_id: proto.table_id,
        area: proto.area,
        min_bet: proto.min_bet,
      }
    })
  }).then((result) => {
    console.log('insert success');
    console.log(result); 
  }).catch((error) => {
    console.log(error.message);  
    throw error;
  });
}

newnew.onNEW2DBA_REQ_JOIN_TABLE = (proto) => {
  const schema = Joi.object().keys({
    user_id: Joi.number().integer(),
  });
  return Joi.validate(proto, schema).then(() => {
    return SDK.mongo.findOne({
      user_id: proto.user_id
    }).then((result) => {
      console.log(result);  
    }).catch((error) => {
      throw error;  
    });
  });
}

module.exports = newnew;

const SDK = require("victsaitw-sdk");
const NewnewPlugin = require('./api/newnewPlugin');
class DBA{
  constructor(){
    this.state = null;
  }
  start(){
    SDK.on('stateChange', (state) => {
      this.state = 'ready';
    });
    SDK.on('kafkaMessage', (data) => {
      return this.protocolHandler(data);
    });
    SDK.start({});
  }
  findFunc(name){
    const fn = this[name];
    return fn ? fn.bind(this) : undefined;
  }
  protocolHandler(data){
    return Promise.resolve().then(() => {
      console.log(data);
      return data;
      //return Protocol.validate(data);
    }).then((protocol) => {
      const fn = this.findFunc('on' + protocol.proto);
      if (!fn){
        throw new Error(`NO_METHOD_FOR_PROTOCOL:${protocol}`);
      }
      return {fn, protocol};
    }).then(({fn, protocol}) => {
      return fn(protocol);
    }).catch((err) => {
      throw err;
    });
  }
  onBLJ2DBA_REQ_CONFIG(protocol){
    // set the default response.
    let packet = SDK.protocol.makeEmptyProtocol(
      'DBA2BLJ_RSP_CONFIG'
    );
    packet.update({
      to_topic: protocol.from_topic,
      seq_back:protocol.seq,
      config: {}
    });
    SDK.mongo.findOne({
      db: 'test', collection: 'BLJConfig',
      query: {
        area: protocol.area 
      }
    }).then(data => {
      packet.update({config: data});
      SDK.send2XYZ(packet);
    }).catch(err => {
      console.log(err);  
    });
  }
  onBLJ2DBA_REQ_JOIN_TABLE(protocol){
    // set the default response.
    let packet = SDK.protocol.makeEmptyProtocol('DBA2BLJ_RSP_JOIN_TABLE')
    packet.update({
      to_topic: protocol.from_topic,
      seq_back: protocol.seq,
      area: protocol.area,
      table_id: protocol.table_id,
      user_id: protocol.user_id,
      money_in_pocket: -1,
      money_in_table: -1,
      nickname: '',
      result: 'False'
    });
    // query MemberDB
    SDK.mongo.findOne({
      db: 'test',
      collection: 'MemberDB',
      query: {
        user_id: protocol.user_id
      }
    }).then(data => {
      // query moneyInTable
      return SDK.mongo.findOne({
        db: 'test',
        collection: 'BLJMoneyInTable'
        query: {
          area: protocol.area,
          table_id: protocol.table_id,
          user_id: protocol.user_id,
        }
      }).then(inData => {
        return packet.update({
          money_in_table: inData.money,
          money_in_pocket: data.money_in_pocket,
          nickname: data.nickname,
          result: 'SUCCESS'
        })
      });
    }).then(packet => {
      return SDK.send2XYZ(packet);
    }).catch((err) => {
      console.log(err);
      return SDK.send2XYZ(packet);
    });
  }
  onGCT2DBA_REQ_LOGIN(protocol){
    let packet = SDK.protocol.makeEmptyProtocol('DBA2GCT_RSP_LOGIN');
    let nickname = '';
    let money = 0;
    SDK.mongo.findOne({
      db: 'test',
      collection: 'MemberDB',
      query: {
        _id: protocol.user_id,
      }
    }).then((data) => {
      console.log(data);
      packet.update({
        to_topic: protocol.from_topic,
        seq_back: protocol.seq,
        money: data.money,
        nickname: data.nickname,
        user_id: protocol.user_id
      });
    return SDK.send2XYZ(packet);
    }).catch((err) => {
      console.log(err);  
    });
  }
};
module.exports = new DBA();

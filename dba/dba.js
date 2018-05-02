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
  onBLJ2DBA_REQ_JOIN_TABLE(protocol){
    let packet = SDK.protocol.makeEmptyProtocol('DBA2BLJ_RSP_JOIN_TABLE')
    packet.update({
      to_topic: protocol.from_topic,
      seq_back: protocol.seq,
      area: 'coin_100',
      table_id: protocol.table_id,
      user_id: 10001,
      money_in_pocket: 1000,
      money_in_table: 1000,
      nickname: 'victor tsai',
      result: 'SUCCESS'
    });
    return SDK.send2XYZ(packet);
  }
};
module.exports = new DBA();

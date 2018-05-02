'use strict'
const SDK = require("victsaitw-sdk");
const StateMachine = require('./state');
// const Protocol = require('./table/protocol');
const Schemas = require('./table/schemas');
const R = require('ramda');
class BLJ{
  constructor(){
    this.state = null;
    this.tables = {};
  }
  start(){
    SDK.on('stateChange', (state) => {
      this.state = 'ready';
    });
    SDK.on('kafkaMessage', (data) => {
      return this.protocolHandler(data);
    });
    SDK.start({schemas: Schemas});
  }
  findFunc(name){
    const fn = this[name];
    return fn ? fn.bind(this) : undefined;
  }
  protocolHandler(data){
    return Promise.resolve().then(() => {
      return SDK.protocol.validate(data);
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
  onTEST_HANDLER_PL(protocol){
    return 'TEST_SUCCESS';
  }
  send2DBA(packet){
    console.log(`send2DBA:${JSON.stringify(packet.toString())}`);
    packet.toTopic = 'dbaPool';
    return SDK.send2XYZ(packet);
  }
  onGCT2BLJ_REQ_LOGIN(protocol){
    let packet = SDK.protocol.makeEmptyProtocol('BLJ2GCT_RSP_LOGIN');
    packet.update({
      'seq_back': protocol.seq,
    });
    packet.toTopic = protocol.from_topic;
    SDK.send2XYZ(packet);
  }
  findTablesWithSeats(tables){
    return R.compose(
      R.filter(
        R.compose(R.gt(5),
        R.length,
        R.path(['sit']))
      ),
      R.map(t => t.onData({
        proto: 'GCT2BLJ_REQ_TABLE_INFO', 
      })),
      R.values
    )(tables);
  }
  findTableHasLeastEmptySeat(tables){
    return R.compose(
      R.ifElse(
        R.compose(R.equals(-1), R.path(['table_id'])),
        R.always({}),
        R.identity
      ),
      R.reduce(
        R.minBy(
          R.compose(R.length, R.path(['sit']))
        ), { table_id: -1, sit: R.repeat({}, 100) })
    )(tables);
  }
  getNewTableId(tables){
    return R.compose(
      R.add(1),
      R.length,
      R.keys
    )(tables);
  }
  findTableOrCreateNewOne(tables){
    const new_table_id = this.getNewTableId(tables);
    const tables_with_seats = this.findTablesWithSeats(tables);   
    const available = this.findTableHasLeastEmptySeat(tables_with_seats);
    return R.cond([
      [({available}) => R.isEmpty(available), ({new_table_id}) => {
        console.log('create table');
        return {
          table_id: new_table_id,
          join_table: StateMachine.createTable({
            table_id: new_table_id
          })
        };
      }],
      [R.T, ({available}) => {
        return {
          table_id: available.table_id,
          join_table: this.tables[available.table_id]
        };
      }]
    ])({new_table_id, available})
  }
  onGCT2BLJ_REQ_JOIN_TABLE(protocol){
    const available = this.findTableOrCreateNewOne();
    this.tables[available.table_id] = available.join_table;
    let packet = SDK.protocol.makeEmptyProtocol('BLJ2DBA_REQ_JOIN_TABLE');
    packet.update({
      seq: 12345,
      area: protocol.area,
      table_id: available.table_id,
      user_id: protocol.user_id,
    });
    packet.timeout = 10;
    this.send2DBA(packet).then((data) => {
      console.log(data);
      let ret = SDK.protocol.makeEmptyProtocol('BLJ2GCT_RSP_JOIN_TABLE');
      ret.update({
        seq_back: protocol.seq,
        area: protocol.area,
        table_id: available.table_id,
        user_id: protocol.user_id,
        to_topic: protocol.fromTopic,
      });
      SDK.send2XYZ(ret);
    }).catch(err => console.log(err));
  } 
};
module.exports = new BLJ();

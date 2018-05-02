'use strict'
const R = require('ramda');
const SDK = require("victsaitw-sdk");
class Table{
  constructor(config){
    this.players = {};
    this.table_config = config;
  }
  findFunc(name){
    const fn = this[name];
    return fn ? fn.bind(this) : undefined;
  }
  onData(protocol){
    const fn = this.findFunc('on' + protocol.proto);
    if (!fn){
      throw new Error(`TABLE_NO_METHOD_FOR_PROTOCOL:${protocol}`);
    }
    return fn(protocol);
  }
  listSitPlayerPL(){
    return R.compose(
      R.map(p => p.toObject()),
      R.values,
      R.pickBy(p => 0 < p.seatId)
    )(this.players);
  }
  listStandPlayerPL(){
    return R.compose(
      R.map(p => p.toObject()),
      R.values,
      R.pickBy(p => -1 == p.seatId)
    )(this.players);
  }
  listAllPlayerPL(){
    return R.compose(
      R.map(p => p.toObject()),
      R.values
    )(this.players);
  }
  onGCT2BLJ_REQ_TABLE_INFO(protocol){
    return Object.assign({
      proto: 'BLJ2GCT_RSP_TABLE_INFO',
    }, {
      seq_back: protocol.seq ? protocol.seq : -1,
      table_id: this.table_config.table_id,
      sit: this.listSitPlayerPL(),
      stand: this.listStandPlayerPL(),
      from_topic: 'temp',
    });
  }
  onGCT2BLJ_REQ_JOIN_TABLE(protocol){
    return;
  }
  onSTATE_REQ_CHECK_POOL(proto){
    return {
      proto: 'STATE_RSP_CHECK_POOL',
      result: false,
    }
  }
  onSTATE_NTF_START_BET(proto){
    return;
  }
  onSTATE_REQ_BET_COUNT(proto){
    return {
      proto: 'STATE_RSP_BET_COUNT',
      count: 0,
    };
  }
  onSTATE_NTF_DEALING_CARD(proto){
    return;
  }
  onSTATE_REQ_DECIDE_FORK(proto){
    return {
      proto: 'STATE_RSP_DECIDE_FORK',
      result: '',
    };
  }
  onSTATE_NTF_USER_PLAY(proto){
    return;
  }
  onSTATE_NTF_PLAY_TIMEOUT(proto){
    return;
  }
  onSTATE_NTF_DEALER_PLAY(proto){
    return;
  }
  onSTATE_NTF_SHOWDOWN(proto){
    return;
  }
  onSTATE_NTF_JOIN_TABLE(proto){
    let player = new Player({
      user_id: proto.rsp.user_id,
      money_in_pocket: proto.rsp.money_in_pocket,
      money_in_table: proto.rsp.money_in_table,
      nickname: proto.rsp.nickname
    });
    this.players[player.user_id] = player;
    return player.toObject();
  }
}

module.exports = Table;

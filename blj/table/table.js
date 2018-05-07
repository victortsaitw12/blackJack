'use strict'
const R = require('ramda');
const SDK = require("victsaitw-sdk");
const Player = require('./player');
class Table{
  constructor(config){
    this.players = {};
    this.table_config = config;
    this.hand_id = -1;
  }
  get area(){
    return R.pathOr('', ['area'], this.table_config);
  }
  get table_id(){
    return R.pathOr(-1, ['table_id'], this.table_config);
  }
  broadcast(packet){
    return R.map(p => {
      return this.send2User(p.userId, packet);
    }, this.players);
  }
  send2User(user_id, packet){
    let wrapper = SDK.protocol.makeEmptyProtocol(
      'SVR2GWY_NTF_GAME_PLAY'
    );
    wrapper.toTopic = 'gwy';
    wrapper.update({
      user_id: user_id,
      payload: packet.toObject(),
    });
    console.log(`send2User: ${wrapper.toString()}`);
    return SDK.send2XYZ(wrapper);
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
  onSTATE_REQ_CHECK_SEAT(proto){
    const available = this.getAvailableSeatIds();
    return {
      proto: 'STATE_RSP_CHECK_SEAT',
      result: available.length == 5 ? false : true,
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
    this.players[player.userId] = player;
    console.log(`table ${this.table_config.table_id} join the user ${player.userId} from ${Object.keys(this.players)}`);
    return player.toObject();
  }
  onSTATE_NTF_START_HAND(proto){
    console.log('start hand');
    this.hand_id = SDK.sequence;
    let packet = SDK.protocol.makeEmptyProtocol(
      'BLJ2GCT_NTF_START_HAND'
    )
    packet.update({
      area: this.area,
      table_id: this.table_id,
      hand_id: this.hand_id,
    });
    return this.broadcast(packet);
  }
  onGCT2BLJ_REQ_BUY_IN_TABLE(protocol){
    let ret = {
      proto: 'GCT2BLJ_RSP_BUY_IN_TABLE',
      result: 'FALSE',
    };
    const player = this.players[protocol.user_id];
    console.log(`table ${this.table_config.table_id} find the user ${protocol.user_id} from ${Object.keys(this.players)}`);
    if (!player){
      return ret;
    }
    player.moneyInPocket = protocol.money_in_pocket;
    player.moneyInTable = protocol.money_in_table;
    return ret.player = player.toObject();
  }
  onGCT2BLJ_REQ_PLAYER_INFO(protocol){
    let ret = {
      proto: 'BLJ2GCT_RSP_PLAYER_INFO',
    };
    console.log(`table ${this.table_config.table_id} cannot find the user ${protocol.user_id} from ${Object.keys(this.players)}`);
    const player = this.players[protocol.user_id];
    if (!player){
      console.log(`table ${this.table_config.table_id} cannot find the user`);
      return ret;
    }
    ret.player = player.toObject();
    return ret;
  }
  getOccupiedSeatIds(){
    return R.reduce((acc, p) => {
      if(-1 == p.seatId) return acc;
      return R.concat(acc, [p.seatId])
    }, [], R.values(this.players));
  }
  getAvailableSeatIds(){
    const seat_ids = R.range(1, 6);
    const occupied_seat_ids = this.getOccupiedSeatIds();
    const availables = R.difference(seat_ids, occupied_seat_ids);
    console.log(`occupied seat ids: ${occupied_seat_ids}`);
    console.log(`available seat ids: ${availables}`);
    return availables;
  }
  pickAvailableSeatId(){
    const availables = this.getAvailableSeatIds();
    if (0 == availables.length){
      return;
    }
    const random_index = Math.floor(Math.random() * availables.length);
    return R.nth(random_index, availables);
  }
  onGCT2BLJ_REQ_SIT_DOWN(protocol){
    console.log(`table.onGCT2BLJ_REQ_SIT_DOWN ${protocol}`);
    let seat_id = undefined;
    if (-1 == protocol.seat_id){
      seat_id = this.pickAvailableSeatId();
    } else {
      seat_id = protocol.seat_id;
    }
    const availables = this.getAvailableSeatIds();
    if(!R.contains(seat_id, availables)){
      return -1;
    }
    const player = this.players[protocol.user_id];
    player.seatId = seat_id;
    return player.seatId;
  }
}

module.exports = Table;

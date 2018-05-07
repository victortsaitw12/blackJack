'use strict'
const R = require('ramda');
class Player{
  constructor(config){
    this._config = config ? config : {};
    this._config.seat_id = -1;
  }
  get userId(){
    return R.path(['user_id'], this._config);
  }
  get moneyInPacket(){
    return R.path(['money_in_packet'], this._config);
  }
  set moneyInPocket(money){
    this._config.money_in_pocket = money;
  }
  get moneyInTable(){
    return R.path(['money_in_table'], this._config);
  }
  set moneyInTable(money){
    this._config.money_in_table = money;
  }
  get seatId(){
    return R.path(['seat_id'], this._config);
  }
  set seatId(seat_id){
    console.log(`player ${this.userId} sit on ${this.seatId}`);
    this._config.seat_id = seat_id;
  }
  toObject(){
    return Object.assign({
      proto: 'PLAYER_PL'  
    }, this._config);
  }
}
module.exports = Player;

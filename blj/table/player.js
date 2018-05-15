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
  addMoneyInTable(money){
    const new_money_in_table = this._config.money_in_table + money;
    if(0 > new_money_in_table){
      throw new Error(`Money in table shoud not be negative:${new_money_in_table}`);
    }
    this._config.money_in_table = new_money_in_table;
    return this._config.money_in_table;
  }
  deductMoneyInTable(money){
    if(0 > R.subtract(this._config.money_in_table, money)){
      throw new Error(`deductMoneyInTable:Money in table should not be negative`);
    }
    this._config.money_in_table = this._config.money_in_table - money;
    return this._config.money_in_table;
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

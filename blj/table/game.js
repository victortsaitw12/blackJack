'use strict'
const SDK = require('victsaitw-sdk');
const R = require('ramda');
class Game{
  constructor(){
    this._hand_id = SDK.sequence;
    this._bets = {};
    this._pair_bets = {};
    this._hand_owners = {};
    this._hands = {};
    this._dealer_hand = null;
  }
  registerHand({hand_id, hand}){
    this._hands[hand_id] = hand;
    return this._hands;
  }
  getHands(){
    return this._hands;
  }
  getHand({hand_id}){
    return this._hands[hand_id];
  }
  registerDealerHand({hand}){
    this._dealer_hand = hand;
  }
  getDealerHand(){
    return this._dealer_hand;
  }
  setHandOwner({seat_id, user_id}){
    const hand_id = R.multiply(100, seat_id);
    this._hand_owners[hand_id] = user_id;
    return this._hand_owners;
  }
  getHandOwner({hand_id}){
    return R.path([hand_id], this._hand_owners);
  }
  getHandOwners(){
    return this._hand_owners;
  }
  get handId(){
    return this._hand_id;
  }
  betOnSeat({user_id, seat_id, money}){
    if(R.any(R.isNil)([user_id, seat_id, money])){
      throw new Error('Parameters is illegal');
    }
    let current_bet = R.pathOr({}, [seat_id], this._bets);
    let current_user_bet = R.pathOr(0, [user_id], current_bet);
    current_bet[user_id] = current_user_bet + money;
    this._bets[seat_id] = current_bet;
    return this._bets;
  }
  betOnPair({user_id, seat_id, money}){
    if(R.any(R.isNil)([user_id, seat_id, money])){
      throw new Error('Parameters is illegal');
    }
    let current_bet = R.pathOr({}, [seat_id], this._pair_bets);
    let current_user_bet = R.pathOr(0, [user_id], current_bet);
    current_bet[user_id] = current_user_bet + money;
    this._pair_bets[seat_id] = current_bet;
    return this._pair_bets;
  }
  getMoneyOnPairBySeatId({seat_id}){
    const bets = R.pathOr({}, [seat_id], this._pair_bets);
    return R.reduce(R.add, 0, R.values(bets));
  }
  getMoneyOnSeatBySeatId({seat_id}){
    const bets = R.pathOr({}, [seat_id], this._bets);
    return R.reduce(R.add, 0, R.values(bets));
  }
  getUserSeatBetMoney({seat_id, user_id}){
    return R.pathOr(0, [seat_id, user_id], this._bets);
  }
  getUserPairBetMoney({seat_id, user_id}){
    return R.pathOr(0, [seat_id, user_id], this._pair_bets);
  }
  getAllSeatBetMoney(){
    return R.reduce((acc, data) => {
      return acc + R.sum(R.values(data));
    }, 0, R.values(this._bets));
  }
  groupBetBySeatId(){
    let reduceToMoneyBy = R.reduceBy((acc, bet) => {
      return acc + R.sum(R.values(bet[1]));
    }, 0);
    let moneyBySeat = reduceToMoneyBy(function(bet){
      return bet[0];
    });
    return moneyBySeat(R.toPairs(this._bets));
  }
  
}

module.exports = {
  newGame: () => {
    return new Game();
  }
};

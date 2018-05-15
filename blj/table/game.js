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
    this._refunds = {};
    this._dealer_hand = null;
    this._operating_hand = null;
  }
  registerHand({hand_id, hand}){
    this._hands[hand_id] = hand;
    return this._hands;
  }
  getHands(){
    return this._hands;
  }
  getHandsBySeatId({seat_id}){
    return R.compose(
      R.filter(hand => hand.seatId == seat_id),
      R.values
    )(this._hands);
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
  getSeatBet({seat_id}){
    return R.pathOr({}, [seat_id], this._bets);
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
  isDealerBlackJack(){
    return this._dealer_hand.blackJack;
  }
  selectTheOperationHand(){
    return R.compose(
      R.find((hand) => {
        return R.not(hand.blackJack) &&
          R.contains(hand.option, ['init', 'hit']);
      }),
      R.sortBy(hand => hand.handId),
      R.values
    )(this._hands);
  }
  isAllUserHandBlackJack(){
    return R.compose(
      R.cond([
        [R.isEmpty, R.F],
        [R.T, R.all(hand => hand.blackJack)],
      ]),
      R.values
    )(this._hands);
  }
  registerOperatingHand({operating_hand}){
    this._operating_hand = operating_hand;
  }
  getOperatingHand(){
    return this._operating_hand;
  }
  getHitOption({operating_hand, user}){
    if (
      R.contains(operating_hand.option, ['init', 'hit']) &&
      !operating_hand.blackJack &&
      !operating_hand.busted
    ){
      return 'hit';
    }
    return;
  }
  getDoubleOption({operating_hand, user}){
    if (
      R.contains(operating_hand.option, ['init']) &&
      !operating_hand.blackJack &&
      !operating_hand.busted
    ){
      return 'double';
    }
    return;
  }
  getSplitOption({operating_hand, user}){
    if (
      R.contains(operating_hand.option, ['init', 'hit']) &&
      !operating_hand.blackJack &&
      !operating_hand.busted &&
      operating_hand.isPair &&
      0 > operating_hand.parentId
    ){
      return 'split';
    }
    return;
  }
  getStandOption({operating_hand, user}){
    if (
      R.contains(operating_hand.option, ['init', 'hit']) &&
      !operating_hand.blackJack &&
      !operating_hand.busted
    ){
      return 'stand';
    }
    return;
  }
  getGiveupOption({operating_hand, user}){
    if (
      R.contains(operating_hand.option, ['init']) &&
      !operating_hand.blackJack &&
      !operating_hand.busted &&
      0 > operating_hand.parentId
    ){
      return 'stand';
    }
    return;
  }
  getOperatingHandOption({operating_hand, user}){
    let acc = [];
    acc.push(this.getHitOption({operating_hand, user}));
    acc.push(this.getDoubleOption({operating_hand, user}));
    acc.push(this.getSplitOption({operating_hand, user}));
    acc.push(this.getStandOption({operating_hand, user}));
    acc.push(this.getGiveupOption({operating_hand, user}));
    return R.takeWhile(R.complement(R.isNil), acc);
  }
  payUserWinMoney({seat_id, percent}){
    let bets = R.pathOr({}, [seat_id], this._bets);
    let refunds = {};
    R.mapObjIndexed((money, user_id) => {
      let refund = R.multiply(money, percent);
      refunds[user_id] = refund;
    }, bets);
    this._refunds[seat_id] = refunds;
    return this._refunds;
  }
  getUserWinMoney({seat_id, user_id}){
    return R.pathOr(0, [seat_id, user_id], this._refunds);
  }
  getBetResult(){
    return R.reduce((acc, seat_id) => {
      const bets = this.getSeatBet({seat_id});
      if (R.isEmpty(bets)){
        return acc;
      }
      let user_result = R.mapObjIndexed((bet, user_id) => {
        let refund = this.getUserWinMoney({seat_id, user_id});
        return {
          user_id: user_id,
          win_money: refund,
          bet_money: bet,
        };
      }, bets);
      return R.concat(acc, R.values(user_result));
    }, [], R.range(1, 6));
  }
}

module.exports = {
  newGame: () => {
    return new Game();
  }
};

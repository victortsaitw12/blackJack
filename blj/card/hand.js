'use strict'
const R = require('ramda');
const Card = require('./card');
class Hand{
  constructor({hand_id, cards}){
    this._hand_id = hand_id;
    cards = R.when(R.isNil, R.always([]))(cards);
    this._cards = Hand.transformCardStrToCardObjects(cards);
    this._soft_point = 0;
    this._hard_point = 0;
    this._parent_id = -1;
    this._option = 'init';
    this._timeout = false;
    this._result = 'init';
    this.updatePoint();
  }
  updatePoint(){
    this._soft_point = Hand.getSoftPoint(this._cards);
    this._hard_point = Hand.getHardPoint(this._cards);
  }
  static transformCardStrToCardObjects(cards){
    return R.map((card) => new Card(card), cards);
  }
  static deduct10ByA(total, cards){
    return R.reduceWhile((acc, card) => {
      return card.isA && acc > 21;  
    },
    (acc, card) => { return acc - 10 },
    total, cards);
  }
  static getSoftPoint(cards){
    let total = R.reduce((acc, card) => {
      return acc + card.point;
    }, 0, cards);
    return Hand.deduct10ByA(total, cards);
  }
  static getHardPoint(cards){
    return R.reduce((acc, card) => {
      return acc + card.hardPoint
    }, 0, cards);
  }
  get softPoint(){
    return this._soft_point;
  }
  get hardPoint(){
    return this._hard_point;
  }
  get cards() {
    return this._cards;
  }
  get blackJack(){
    return R.equals(2, this._cards.length) &&
      R.equals(21, this._soft_point);
  }
  get busted(){
    return this.softPoint > 21;
  }
  get isPair(){
    return 2 == this._cards.length && 
          this._cards[0].figure == this._cards[1].figure;
  }
  get parentId(){
    return this._parent_id;
  }
  set parentId(parent_id){
    this._parent_id = parent_id;
    return this._parent_id;
  }
  get option(){
    return this._option;
  }
  set option(user_option){
    this._option = user_option;
    return this._option;
  }
  get timeout(){
    return this._timeout;
  }
  set timeout(t){
    this._timeout = t;
    return this._timeout;
  }
  push(card){
    this._cards.push(card);
    this.updatePoint();
    return this._cards;
  }
  get handId(){
    return this._hand_id;
  }
  get seatId(){
    return Math.floor(this.handId / 100);
  }
  set result(r){
    this._result = r;
    return this._result;
  }
  get result(){
    return this._result;
  }
  fight(other_hand){
    if (other_hand.blackJack){
      return -1;
    }
    if (this.blackJack){
      return 1;
    }
    if(this.busted){
      return -1;
    }
    if (other_hand.busted){
      return 1;
    }
    return this.softPoint - other_hand.softPoint;
  }
  toObject(){
    return Object.assign({
      proto: 'HAND_PL',
    }, {
      hand_id: this.handId,
      seat_id: Math.floor(this.handId / 100),
      is_pair: this.isPair,
      blackJack: this.blackJack,
      cards: R.map(card => card.toString(), this.cards),
      soft_point: this.softPoint,
      hard_point: this.hardPoint,
      parent_id: this.parentId,
      option: this.option,
      result: this.result,
    });
  }
  toString(){
    return JSON.stringify(this.toObject());
  }
}

module.exports = Hand

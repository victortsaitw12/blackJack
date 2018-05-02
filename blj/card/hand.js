'use strict'
const R = require('ramda');
const Card = require('./card');
class Hand{
  constructor(cards){
    cards = R.when(R.isNil, R.always([]))(cards);
    this._cards = Hand.transformCardStrToCardObjects(cards);
    this._soft_point = 0;
    this._hard_point = 0;
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
  get isPair(){
    return 2 == this._cards.length && 
          this._cards[0].figure == this._cards[1].figure;
  }
  push(card){
    this._cards.push(card);
    this.updatePoint();
    return this._cards;
  }
}

module.exports = Hand
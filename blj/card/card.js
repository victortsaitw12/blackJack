'use strict'
const R = require('ramda');
class Card{
  constructor(card){
    this._card = card;
    this._point = R.pipe(R.head, R.splitEvery(1))(card);
    this._num = Card.getPoint(this._point);
    this._hard_num = Card.getHardPoint(this._num);
  } 
  get isA(){
    return 'A' == this._point;
  }
  static getHardPoint(point){
    return R.when((p) => 11 === p,
      R.always(1))(point);
  }
  static getPoint(card){
    const points = {
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 5,
      '6': 6,
      '7': 7,
      '8': 8,
      '9': 9,
      'T': 10,
      'J': 10,
      'Q': 10,
      'K': 10,
      'A': 11,
    }
    return R.path(card, points);
  }
  get figure(){
    return R.head(this._point);
  }
  get point(){
    return this._num;
  }
  get hardPoint(){
    return this._hard_num;
  }
  toString(){
    return this._card;
  }
}

module.exports = Card;

'use strict'
const R = require('ramda');
const _ = require('lodash');
const Card = require('./card');
class Deck{
  constructor(count){
    this._cards = R.compose(
      Deck.transformCardStrToCardObjects,
      _.shuffle,
      Deck.generateDeck
    )(count);
  }
  static transformCardStrToCardObjects(cards){
    return R.map((card) => new Card(card), cards);
  }
  deal(){
    return this._cards.pop();
  }
  get cards(){
    return this._cards;
  }
  push(card){
    this._cards.push(card);
    return this._cards;
  }
  static generateDeck(count){
    return R.reduce((arr) => {
      const cards = Deck.generateOneDeck();
      return R.compose(
        R.flatten, 
        R.append(cards)
      )(arr);
    }, [], R.range(0, count));
  }
  static combineStr(arr){
    return R.map((strs) => R.join('')(strs), arr);
  }
  static combineIndexWithColor(index, color){
    const fn_find_point = R.cond([
      [R.equals(0), R.always('A')],
      [R.equals(1), R.always('2')],
      [R.equals(2), R.always('3')],
      [R.equals(3), R.always('4')],
      [R.equals(4), R.always('5')],
      [R.equals(5), R.always('6')],
      [R.equals(6), R.always('7')],
      [R.equals(7), R.always('8')],
      [R.equals(8), R.always('9')],
      [R.equals(9), R.always('T')],
      [R.equals(10), R.always('J')],
      [R.equals(11), R.always('Q')],
      [R.equals(12), R.always('K')],
      [R.T, R.always('')],
    ]);
    const point = R.compose(fn_find_point, parseInt)(index);
    return R.zip(R.repeat(point, 4), color);
  }
  static generateOneDeck(){
    let index = 0;
    return R.reduce((arr, colors) => {
      const arr_point_with_color = Deck.combineIndexWithColor(index, colors);
      const str_point_with_color = Deck.combineStr(arr_point_with_color);
      index++;
      return R.compose(
        R.flatten, 
        R.append(str_point_with_color)
      )(arr);
    }, [], R.times(() => ['S', 'H', 'D', 'C'], 13));
  }
}

module.exports = Deck;

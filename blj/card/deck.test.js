const expect = require('chai').expect;
const Deck = require('./deck');
const R = require('ramda');
describe('Deck function', () => {
  let allCard;
  before(() => {
    allCard = [
    'AS', 'AH', 'AD', 'AC',
    '2S', '2H', '2D', '2C',
    '3S', '3H', '3D', '3C',
    '4S', '4H', '4D', '4C',
    '5S', '5H', '5D', '5C',
    '6S', '6H', '6D', '6C',
    '7S', '7H', '7D', '7C',
    '8S', '8H', '8D', '8C', 
    '9S', '9H', '9D', '9C',
    'TS', 'TH', 'TD', 'TC',
    'JS', 'JH', 'JD', 'JC',
    'QS', 'QH', 'QD', 'QC',
    'KS', 'KH', 'KD', 'KC'
    ];
  });
  it('generateOneDeck', () => {
    const deck = Deck.generateOneDeck();
    expect(deck).to.have.members(allCard);
  });  
  it('generateDeck 1', () => {
    const deck = Deck.generateDeck(1);
    expect(deck).to.have.members(allCard);
  }); 
  it('generateDeck 2', () => {
    const deck = Deck.generateDeck(2);
    expect(deck).to.have.members(R.flatten(R.repeat(allCard, 2)));
  }); 
  it('generateDeck 6', () => {
    const deck = Deck.generateDeck(6);
    expect(deck).to.have.members(R.flatten(R.repeat(allCard, 6)));
  }); 
  it('constructor 1 deck', () => {
    let deck = new Deck(1);
    expect(deck.cards.length).to.equal(52);
  });
  it('constructor 6 deck', () => {
    let deck = new Deck(6);
    expect(deck.cards.length).to.equal(52 * 6);
  });
  it('deal one card', () => {
    let deck = new Deck(1);
    const card = deck.deal();
    expect(deck.cards.length).to.equal(51);
  });
  it('push one card', () => {
    let deck = new Deck(1);
    const card = deck.deal();
    deck.push(card);
    expect(deck.cards.length).to.equal(52);
  });
});

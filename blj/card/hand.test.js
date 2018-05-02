const expect = require('chai').expect;
const Hand = require('./hand');
const Card = require('./card');
describe('Hand functions', () => {
  it('transformCardStrToCardObjects', () => {
    let cards = Hand.transformCardStrToCardObjects(['3S', '2S']);
    cards.map((card) => {
      expect(card).to.be.instanceOf(Card);
    });
  });
  it('getSoftPoint', () => {
    let cards = Hand.transformCardStrToCardObjects(['3S', '2S']);
    expect(Hand.getSoftPoint(cards)).to.equal(5);
  });
  it('getHardPoint', () => {
    let cards = Hand.transformCardStrToCardObjects(['3S', '2S']);
    expect(Hand.getHardPoint(cards)).to.equal(5);
  });
  it('cards length', () => {
    const hand = new Hand(['3S', '2S']);
    expect(hand.cards.length, hand.cards.length).to.equal(2);
  });
  it('3S, 2S softPoint', () => {
    let hand = new Hand(['3S',  '2S']);
    expect(hand.softPoint,
      hand.softPoint).to.equal(5);
  });  
  it('AS, 2S softPoint', () => {
    let hand = new Hand(['AS',  '2S']); 
    expect(hand.softPoint,
      hand.softPoint).to.equal(13);
  });
  it('AS, 5S, 9S softPoint', () => {
    let hand = new Hand(['AS',  '5S', '9H']); 
    expect(hand.softPoint,
      hand.softPoint).to.equal(15);
  });
  it('AS, AS, 9S softPoint', () => {
    let hand = new Hand(['AS',  'AS', '9H']); 
    expect(hand.softPoint,
      hand.softPoint).to.equal(21);
  });
  it('AS, JS softPoint', () => {
    let hand = new Hand(['AS',  'JS']); 
    expect(hand.softPoint,
      hand.softPoint).to.equal(21);
  });
  it('AS, AS softPoint', () => {
    let hand = new Hand(['AS',  'AS']); 
    expect(hand.softPoint,
      hand.softPoint).to.equal(12);
  });
  it('AS, AS hardPoint', () => {
    let hand = new Hand(['AS',  'AS']); 
    expect(hand.hardPoint,
      hand.hardPoint).to.equal(2);
  });
  it('3S, 2S hardPoint', () => {
    let hand = new Hand(['3S',  '2S']); 
    expect(hand.hardPoint,
      hand.hardPoint).to.equal(5);
  });
  it('AS, 2S hardPoint', () => {
    let hand = new Hand(['AS',  '2S']); 
    expect(hand.hardPoint,
      hand.hardPoint).to.equal(3);
  });
  it('QH, 2S softPoint', () => {
    let hand = new Hand(['QS',  '2S']); 
    expect(hand.hardPoint,
      hand.hardPoint).to.equal(12);
  });
  it('QH, 2S hardPoint', () => {
    let hand = new Hand(['QS',  '2S']); 
    expect(hand.hardPoint,
      hand.hardPoint).to.equal(12);
  });
  it('AS, JS is blackJack', () => {
    let hand = new Hand(['AS', 'JS']);
    expect(hand.blackJack).to.be.true;
  });
  it('AS, 3S is not blackJack', () => {
    let hand = new Hand(['AS', '3S']);
    expect(hand.blackJack).to.be.false;
  });
  it('AS, 9S, AS is not blackJack', () => {
    let hand = new Hand(['AS', '9S', 'AS']);
    expect(hand.softPoint, hand.softPoint).to.equal(21);
    expect(hand.blackJack).to.be.false;
  });
  it('2S, 2H is p air', () => {
    let hand = new Hand(['2S', '2H']);  
    expect(hand.isPair).to.be.true;
  });
  it('2S, 3H is not a pair', () => {
    let hand = new Hand(['2S', '3H']);  
    expect(hand.isPair).to.be.false;
  });
  it('AS, AS is a pair', () => {
    let hand = new Hand(['AS', 'AH']);
    expect(hand.isPair).to.be.true;
  });
  it('JS, JS is a pair', () => {
    let hand = new Hand(['JS', 'JH']);
    expect(hand.isPair).to.be.true;
  });
  it('JS, JS, 3H is a pair', () => {
    let hand = new Hand(['JS', 'JH', '3H']);
    expect(hand.isPair).to.be.false;
  });
  it('JS, QS is a pair', () => {
    let hand = new Hand(['JS', 'QS']);
    expect(hand.isPair).to.be.false;
  });
  it('JS, QS, 3H is pair', () => {
    let hand = new Hand(['JS', 'QS', '3H']);
    expect(hand.isPair).to.be.false;
  });
  it('AS, 3S push 2S', () => {
    let hand = new Hand(['AS', '3S']);
    hand.push(new Card('2S'));
    expect(hand.softPoint).to.equal(16);
  });
  it('null push 2S', () => {
    let hand = new Hand();
    hand.push(new Card('2S'));
    expect(hand.softPoint).to.equal(2);
  });
  it('null push AS, QS', () => {
    let hand = new Hand();
    hand.push(new Card('AS'));
    hand.push(new Card('QS'));
    expect(hand.softPoint).to.equal(21);
    expect(hand.blackJack).to.be.true;
  });
});

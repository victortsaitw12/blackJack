const chai = require('chai');
const Card = require('./card');

describe('card functions', () => {
  it('getPoint', () => {
    let card = new Card('TS');
    chai.expect(Card.getPoint('T'),
    Card.getPoint('T')
    ).to.equal(10);
  });
  it('A point is 11', () => {
    let card = new Card('AS');
    chai.expect(card.point).to.equal(11);
  });
  it('J point is 10', () => {
    let card = new Card('JS');
    chai.expect(card.point).to.equal(10);
  });
  it('3 isNotA', () => {
    let card = new Card('3H');
    chai.expect(card.isA).to.be.false;
  });
  it('A isA', () => {
    let card = new Card('AH');
    chai.expect(card.isA).to.be.true;
  });
  it('A hardPoint', () => {
    let card = new Card('AH');
    chai.expect(card.hardPoint).to.equal(1);
  });
});

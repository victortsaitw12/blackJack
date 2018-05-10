const expect = require('chai').expect;
const Game = require('./game');

describe('bet', () => {
  let game = null;
  beforeEach(() => {
    game = Game.newGame();
  });  
  it('normal bet', () => {
    let bets = game.betOnSeat({
      user_id: 117,
      seat_id: 1,
      money: 100
    });
    console.log(bets);
    expect(bets).to.deep.includes({
      '1': {'117': 100}
    });
  });
  it('no seat id', () => {
    expect(() => game.betOnSeat({
      user_id: 117, 
      money: 100
    })).to.throw();
  });
  it('no user id', () => {
    expect(() => game.betOnSeat({
      seat_id: 1,
      money: 100
    })).to.throw();
  });
  it('money not set', () => {
    expect(() => game.betOnSeat({
      seat_id: 1,
      user_id: 117
    })).to.throw();
  });
  it('increment bet', () => {
    game.betOnSeat({
      user_id: 117, 
      seat_id: 1,
      money: 100
    });
    let bets = game.betOnSeat({
      user_id: 117, 
      seat_id: 1,
      money: 100
    });
    expect(bets).to.deep.includes({
      '1': { '117': 200}
    });
  });
  it('add other seat bet', () => {
    game.betOnSeat({
      user_id: 117, 
      seat_id: 1,
      money: 100
    });
    let bets = game.betOnSeat({
      user_id: 116, 
      seat_id: 2,
      money: 100
    });
    expect(bets).to.deep.includes({
      '1': { '117': 100},
      '2': { '116': 100}
    });
  });
  it('add other user bet on the same seat', () => {
    game.betOnSeat({
      user_id: 117, 
      seat_id: 1,
      money: 100
    });
    let bets = game.betOnSeat({
      user_id: 116, 
      seat_id: 1,
      money: 100
    });
    expect(bets).to.deep.includes({
      '1': { '117': 100, '116': 100},
    });
  });
});

describe('getMoneyOnPairBySeat', () => {
  let game;
  beforeEach(() => { 
    game = Game.newGame();
    game.betOnPair({
      seat_id: 1, user_id: 117, money: 100,
    });
    game.betOnPair({
      seat_id: 1, user_id: 116, money: 100,
    });
    game.betOnPair({
      seat_id: 2, user_id: 115, money: 100,
    });
  });
  it('normal', () => {
    const money = game.getMoneyOnPairBySeatId({ seat_id: 1 });  
    expect(money).to.equal(200);
  });
  it('no this bet on seat', () => {
    const money = game.getMoneyOnPairBySeatId({ seat_id: 3 });  
    expect(money).to.equal(0);
  });
  it('no this bet on seat', () => {
    const money = game.getMoneyOnPairBySeatId({ seat_id: 3 });  
    expect(money).to.equal(0);
  });
  it('no pair bet', () => {
    const game2 = Game.newGame();
    const money = game2.getMoneyOnPairBySeatId({ seat_id: 3 });  
    expect(money).to.equal(0);
  });
});

describe('getUserSeatBetMoney', () => {
  let game;
  beforeEach(() => {
    game = Game.newGame();
    game.betOnSeat({
      seat_id: 1, user_id: 117, money: 100,
    });
    game.betOnSeat({
      seat_id: 1, user_id: 116, money: 100,
    });
    game.betOnSeat({
      seat_id: 2, user_id: 115, money: 100,
    });
  });
  it('normal', () => {
    const money = game.getUserSeatBetMoney({user_id: 117, seat_id: 1});
    expect(money).to.equal(100);
  });
  it('no bet on the seat', () => {
    const money = game.getUserSeatBetMoney({user_id: 117, seat_id: 4});
    expect(money).to.equal(0);
  });
  it('user not bet', () => {
    const money = game.getUserSeatBetMoney({user_id: 118, seat_id: 1});
    expect(money).to.equal(0);
  });
});

describe('getAllSeatBetGroupBySeatId', () => {
  let game;
  beforeEach(() => {
    game = Game.newGame();
    game.betOnSeat({
      seat_id: 1, user_id: 117, money: 100,
    });
    game.betOnSeat({
      seat_id: 1, user_id: 116, money: 100,
    });
    game.betOnSeat({
      seat_id: 2, user_id: 115, money: 100,
    });
  });
  it('normal', () => {
    let total = game.getAllSeatBetMoney();
    console.log(total);
    expect(total).to.equal(300);
  });
  it('no bet', () => {
    let game2 = Game.newGame();
    let total = game2.getAllSeatBetMoney();
    expect(total).to.equal(0);
  });
  it('groupBetBySeatId', () => {
    let group = game.groupBetBySeatId();
    console.log(group);
  });
  it('unknown', () => {
    let game2 = Game.newGame();
    let group = game2.groupBetBySeatId();
    console.log(group);
  });
});

const expect = require('chai').expect;
const Game = require('./game');
const Hand = require('../card').Hand;

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
    expect(total).to.equal(300);
  });
  it('no bet', () => {
    let game2 = Game.newGame();
    let total = game2.getAllSeatBetMoney();
    expect(total).to.equal(0);
  });
  it('groupBetBySeatId', () => {
    let group = game.groupBetBySeatId();
  });
  it('unknown', () => {
    let game2 = Game.newGame();
    let group = game2.groupBetBySeatId();
  });
});

describe('selectTheOperationHand', () => {
  let game;
  beforeEach(() => {
    game = Game.newGame();
  });
  it('no hand', () => {
    const operation = game.selectTheOperationHand();  
    expect(operation).to.be.undefined;
  });
  it('one hand and the hand is blackjack', () => {
    const hand = new Hand({
      hand_id: 100,
      cards: ['AS', 'JH']
    });
    game.registerHand({hand_id: 100, hand: hand});
    const operation = game.selectTheOperationHand();
    expect(operation).to.be.undefined;
  });
  it('one hand and the hand is init', () => {
    const hand = new Hand({
      hand_id: 100,
      cards: ['AS', '2H']
    });
    game.registerHand({hand_id: 100, hand: hand});
    const operation = game.selectTheOperationHand();
    expect(operation.handId).to.equals(100);
  });
  it('two hands and both are init', () => {
    game.registerHand({
      hand_id: 100, hand: new Hand({
        hand_id: 100, cards: ['3H', 'AH']
      })
    });
    game.registerHand({
      hand_id: 200, hand: new Hand({
        hand_id: 200, cards: ['5H', '4H']
      })
    });
    const operation = game.selectTheOperationHand();
    expect(operation.handId).to.equals(100);
  });
  it('two hands, one is init and the other is blackjack ', () => {
    game.registerHand({
      hand_id: 100, hand: new Hand({
        hand_id: 100, cards: ['JH', 'AH']
      })
    });
    game.registerHand({
      hand_id: 200, hand: new Hand({
        hand_id: 200, cards: ['5H', '4H']
      })
    });
    const operation = game.selectTheOperationHand();
    expect(operation.handId).to.equals(200);
  });
  it('two hands, one is init and the other is stand', () => {
    const hand_100 = new Hand({
      hand_id: 100,
      cards: ['JH', '5H'],
    });
    hand_100.option = 'stand';
    game.registerHand({
      hand_id: 100,
      hand: hand_100,
    });
    game.registerHand({
      hand_id: 200, hand: new Hand({
        hand_id: 200, cards: ['5H', '4H']
      })
    });
    const operation = game.selectTheOperationHand();
    expect(operation.handId).to.equals(200);
  });
  it('two hands and both hands are blackjack', () => {
    const hand_100 = new Hand({
      hand_id: 100,
      cards: ['AH', 'JH'],
    });
    const hand_200 = new Hand({
      hand_id: 200,
      cards: ['AS', 'QH'],
    });
    game.registerHand({
      hand_id: 100,
      hand: hand_100,
    });
    game.registerHand({
      hand_id: 200,
      hand: hand_200,
    });
    const operation = game.selectTheOperationHand();
    expect(operation).to.be.undefined;
  });
  it('two hands and both hands are stand', () => {
    const hand_100 = new Hand({
      hand_id: 100,
      cards: ['3H', '4H'],
    });
    hand_100.option = 'stand';
    const hand_200 = new Hand({
      hand_id: 200,
      cards: ['5S', 'JH'],
    });
    hand_200.option = 'stand';
    game.registerHand({
      hand_id: 100,
      hand: hand_100,
    });
    game.registerHand({
      hand_id: 200,
      hand: hand_200,
    });
    const operation = game.selectTheOperationHand();
    expect(operation).to.be.undefined;
  });
});

describe('isAllUserHandBlackJack', () => {
  let game;
  beforeEach(() => {
    game = Game.newGame();
  });
  it('no hands', () => {
    const res = game.isAllUserHandBlackJack();
    expect(res).to.be.false;
  });
  it('one hand that is blackjack', () => {
    game.registerHand({
      hand_id: 100,
      hand: new Hand({
        hand_id: 100, cards: ['AS', 'JH']
      })
    });
    const res = game.isAllUserHandBlackJack();
    expect(res).to.be.true;
  });
  it('one hand that is not blackjack', () => {
    game.registerHand({
      hand_id: 100,
      hand: new Hand({
        hand_id: 100, cards: ['AS', '4H']
      })
    });
    const res = game.isAllUserHandBlackJack();
    expect(res).to.be.false;
  });
  it('two hands which are blackjack', () => {
    game.registerHand({
      hand_id: 100,
      hand: new Hand({
        hand_id: 100, cards: ['AS', 'QH']
      })
    });
    game.registerHand({
      hand_id: 100,
      hand: new Hand({
        hand_id: 100, cards: ['KS', 'AH']
      })
    });

    const res = game.isAllUserHandBlackJack();
    expect(res).to.be.true;
  });
  it('two hands which one is blackjack and the other one is not', () => {
    game.registerHand({
      hand_id: 100,
      hand: new Hand({
        hand_id: 100, cards: ['AS', 'QH']
      })
    });
    game.registerHand({
      hand_id: 100,
      hand: new Hand({
        hand_id: 100, cards: ['KS', '3H']
      })
    });
    const res = game.isAllUserHandBlackJack();
    expect(res).to.be.false;
  });
});

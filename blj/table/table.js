'use strict'
const R = require('ramda');
const SDK = require("victsaitw-sdk");
const Player = require('./player');
const Game = require('./game');
const Deck = require('../card').Deck;
const Hand = require('../card').Hand;
class Table{
  constructor(config){
    this.players = {};
    this.table_config = config;
    this.game = null;
    this.deck = null;
  }
  get area(){
    return R.pathOr('', ['area'], this.table_config);
  }
  get table_id(){
    return R.pathOr(-1, ['table_id'], this.table_config);
  }
  broadcast(packet){
    return R.map(p => {
      return this.send2User(p.userId, packet);
    }, this.players);
  }
  send2User(user_id, packet){
    let wrapper = SDK.protocol.makeEmptyProtocol(
      'SVR2GWY_NTF_GAME_PLAY'
    );
    wrapper.toTopic = 'gwy';
    wrapper.update({
      user_id: user_id,
      payload: packet.toObject(),
    });
    console.log(`send2User: ${wrapper.toString()}`);
    return SDK.send2XYZ(wrapper);
  }
  findFunc(name){
    const fn = this[name];
    return fn ? fn.bind(this) : undefined;
  }
  onData(protocol){
    const fn = this.findFunc('on' + protocol.proto);
    if (!fn){
      throw new Error(`TABLE_NO_METHOD_FOR_PROTOCOL:${protocol}`);
    }
    return fn(protocol);
  }
  listSitPlayerPL(){
    return R.compose(
      R.map(p => p.toObject()),
      R.values,
      R.pickBy(p => 0 < p.seatId)
    )(this.players);
  }
  listStandPlayerPL(){
    return R.compose(
      R.map(p => p.toObject()),
      R.values,
      R.pickBy(p => -1 == p.seatId)
    )(this.players);
  }
  listAllPlayerPL(){
    return R.compose(
      R.map(p => p.toObject()),
      R.values
    )(this.players);
  }
  onGCT2BLJ_REQ_TABLE_INFO(protocol){
    return Object.assign({
      proto: 'BLJ2GCT_RSP_TABLE_INFO',
    }, {
      seq_back: protocol.seq ? protocol.seq : -1,
      table_id: this.table_config.table_id,
      sit: this.listSitPlayerPL(),
      stand: this.listStandPlayerPL(),
      from_topic: 'temp',
    });
  }
  onGCT2BLJ_REQ_JOIN_TABLE(protocol){
    return;
  }
  onSTATE_REQ_CHECK_POOL(proto){
    return {
      proto: 'STATE_RSP_CHECK_POOL',
      result: false,
    }
  }
  onSTATE_REQ_CHECK_SEAT(proto){
    const available = this.getAvailableSeatIds();
    return {
      proto: 'STATE_RSP_CHECK_SEAT',
      result: available.length == 5 ? false : true,
    }
  }
  onSTATE_NTF_START_BET(proto){
    return;
  }
  onSTATE_REQ_BET_COUNT(proto){
    return {
      proto: 'STATE_RSP_BET_COUNT',
      bet: this.game.getAllSeatBetMoney()
    };
  }
  getUserIdBySeatId(seat_id){
    const p = R.find((player) => {
      return parseInt(seat_id) === player.seatId;  
    }, R.values(this.players));
    if(p){
      return p.userId;
    }
    return;
  };
  onSTATE_NTF_REGISTER_PLAYERS(proto){
    const bet_seat = this.game.groupBetBySeatId();
    console.log(`onSTATE_NTF_REGISTER_PLAERS:${JSON.stringify(bet_seat)}`);
    R.map(seat_id => {
      const user_id = this.getUserIdBySeatId(seat_id);
      console.log(`onSTATE_NTF_REGISTER_PLAERS:${user_id}`);
      this.game.setHandOwner({
        seat_id: seat_id,
        user_id: user_id,
      });
    }, R.keys(bet_seat));
    console.log(this.game.getHandOwners());
  }
  dealPlayerCards(){
    const hand_owners = this.game.getHandOwners();
    const hands = R.mapObjIndexed((user_id, hand_id) => {
      const hand = new Hand({
        hand_id: hand_id
      });
      hand.push(this.deck.deal());
      hand.push(this.deck.deal());
      return hand;
    }, hand_owners);
    R.mapObjIndexed((hand, hand_id) => {
      this.game.registerHand({
        hand: hand, hand_id: hand_id
      });
    }, hands);
    return this.game.getHands();
  }
  dealDealerCards(){
    const hand = new Hand({hand: 999});
    hand.push(this.deck.deal());
    hand.push(this.deck.deal());
    this.game.registerDealerHand({hand});
    return this.game.getDealerHand();
  }
  onSTATE_NTF_DEALING_CARD(proto){
    this.dealPlayerCards();
    this.dealDealerCards();
    let packet = SDK.protocol.makeEmptyProtocol(
      'BLJ2GCT_NTF_DEAL_CARD'
    )
    packet.update({
      area: this.area,
      table_id: this.table_id,
    });
    R.mapObjIndexed((hand, hand_id) => {
      let seat_id = parseInt(hand_id) / 100;
      let user_id = this.getUserIdBySeatId(seat_id);
      packet.update({
        user_id: user_id,
        seat_id: seat_id,
        hand: hand.toObject(),
      });
      return this.send2User(user_id, packet);
    }, this.game.getHands());
  }
  onSTATE_REQ_DECIDE_FORK(proto){
    let res = {
      proto: 'STATE_RSP_DECIDE_FORK',
      result: '',
    };
    if(this.game.isDealerBlackJack()){
      return Object.assign(res, {
        reason: 'dealer is blackjack',
        result: 'showdown',  
      });
    }
    if(this.game.isAllUserHandBlackJack()){
      return Object.assign(res, {
        reason: 'user hands are blackjack',
        result: 'showdown',
      });
    }
    const operation = this.game.selectTheOperationHand();
    if (R.compose(R.not, R.isNil)(operation)){
      return Object.assign(res, {
        reason: `operation hand: ${operation.handId}`,
        result: 'user_play'
      });
    }
    const dealer_hand = this.game.getDealerHand();
    if (dealer_hand.softPoint < 17){
      return Object.assign({
        reason: 'dealer softPoint is less than 17',
        result: 'dealer_play',
      });
    }
    return Object.assign(res, {
      reason: 'no match all other conditions',
      result: 'showdown',
    });
  }
  onSTATE_NTF_USER_PLAY(proto){
    console.log(`onSTATE_NTF_USER_PLAY:${proto}`);
    const operating_hand = this.game.selectTheOperationHand();
    this.game.registerOperatingHand({
      operating_hand
    });
    // find the user for this hand
    const user_id = this.getUserIdBySeatId(operating_hand.seatId);
    const user = this.players[user_id];
    if (R.isNil(user)){
      throw new Error(`There is not this user : ${user_id}`);
    }
    let packet = SDK.protocol.makeEmptyProtocol(
      'BLJ2GCT_NTF_YOUR_TURN_TO_PLAY'
    )
    packet.update({
      area: this.area,
      table_id: this.table_id,
      seat_id: operating_hand.seatId,
      hand_id: operating_hand.handId,
      operation: this.game.getOperatingHandOption({
        operating_hand, user
      }),
    });
    return this.send2User(user_id, packet);
  }
  onSTATE_NTF_PLAY_TIMEOUT(proto){
    console.log(`onSTATE_NTF_PLAY_TIMEOUT:${proto}`);
    const operating_hand = this.game.getOperatingHand();
    if(R.isNil(operating_hand)){
      throw new Error(`operating is undefinded`);
    }
    if(R.not(R.contains(operating_hand.option, ['hit', 'init']))){
      throw new Error(`operating hand is already decided
      ${operating_hand.option}`);
    }
    operating_hand.option = 'stand';
    operating_hand.timeout = true;
    this.game.registerHand({
      hand_id: operating_hand.handId,
      hand: operating_hand
    });
    let packet = SDK.protocol.makeEmptyProtocol(
      'BLJ2GCT_NTF_OTHER_PLAY'
    )
    let user_id = this.getUserIdBySeatId(operating_hand.seatId);
    packet.update({
      area: this.area,
      table_id: this.table_id,
      user_id: user_id,
      seat_id: operating_hand.seatId,
      hand_id: operating_hand.handId,
      option: operating_hand.option,
    });
    return this.send2User(user_id, packet);
  }
  dealingDealerCard(hand){
    if (17 > hand.softPoint){
      hand.push(this.deck.deal());
      return this.dealingDealerCard(hand);
    }
    return;
  }
  onSTATE_NTF_DEALER_PLAY(proto){
    const dealer_hand = this.game.getDealerHand();
    this.dealingDealerCard(dealer_hand);
    let packet = SDK.protocol.makeEmptyProtocol(
      'BLJ2GCT_NTF_DEALER_CARDS'
    )
    packet.update({
      area: this.area,
      table_id: this.table_id,
      hand: this.game.getDealerHand().toObject(),
    });
    return this.broadcast(packet);
  }
  processWinHand(hand){
    hand.result = 'win';
    let percent = 2;
    if (hand.blackJack){
      percent = 2.5
    }
    this.game.payUserWinMoney({seat_id: hand.seatId, percent: percent});
    return hand.toObject();
  }
  processLoseHand(hand){
    hand.result = 'lose';
    this.game.payUserWinMoney({seat_id: hand.seatId, percent: 0});
    return hand.toObject();
  }
  processTieHand(hand){
    hand.result = 'tie';
    this.game.payUserWinMoney({seat_id: hand.seatId, percent: 1});
    return hand.toObject();
  }
  preparePlayerScorePL(){
    return R.map(res => {
      const player = this.players[res.user_id];
      player.addMoneyInTable(res.win_money);
      return {
        proto: 'PLAYER_SCORE_PL',
        user_id: player.userId,
        money_in_table: player.moneyInTable,
        seat_id: player.seatId,
        win_money: res.win_money,
        hands: R.map(hand => hand.toObject(),
          this.game.getHandsBySeatId({seat_id: player.seatId})
        ),
      }
    }, this.game.getBetResult());
  }
  onSTATE_NTF_SHOWDOWN(proto){
    console.log(`onSTATE_NTF_SHOWDOWN:${proto}`);
    const dealer = this.game.getDealerHand();
    const hands = R.map(hand => {
      const result = hand.fight(dealer);
      if (result > 0) {
        return this.processWinHand(hand);
      }
      if (result < 0) {
        return this.processLoseHand(hand);
      }
      return this.processTieHand(hand);
    }, R.values(this.game.getHands()));
    let packet = SDK.protocol.makeEmptyProtocol(
      'BLJ2DBA_REQ_WRITE_SCORE'
    )
    packet.update({
      seq: SDK.sequence,
      area: this.area,
      table_id: this.table_id,
      dealer_hand: this.game.getDealerHand().toObject(),
      player_scores: this.preparePlayerScorePL(),
    });
    packet.toTopic = 'dbaPool';
    packet.timeout = 10;
    SDK.send2XYZ(packet).then(data => {
      this.onDBA2BLJ_RSP_WRITE_SCORE(data);
    }).catch(err => {
      console.log(err);
    });
  }
  onDBA2BLJ_RSP_WRITE_SCORE(data){
    let packet = SDK.protocol.makeEmptyProtocol(
      'BLJ2GCT_NTF_SHOWDOWN'
    )
    const hands = R.compose(R.map(h => h.toObject()), R.values)(
      this.game.getHands()
    );
    const dealer_hand = this.game.getDealerHand();
    packet.update({
      area: this.area,
      table_id: this.table_id,
      hands: hands,
      dealer_hand: dealer_hand.toObject(),
      refunds: req.player_scores,
    });
    return this.broadcast(packet);
  }
  onSTATE_NTF_JOIN_TABLE(proto){
    let player = new Player({
      user_id: proto.rsp.user_id,
      money_in_pocket: proto.rsp.money_in_pocket,
      money_in_table: proto.rsp.money_in_table,
      nickname: proto.rsp.nickname
    });
    this.players[player.userId] = player;
    console.log(`table ${this.table_config.table_id} join the user ${player.userId} from ${Object.keys(this.players)}`);
    return player.toObject();
  }
  onSTATE_NTF_START_HAND(proto){
    console.log('start hand');
    this.game = Game.newGame();
    this.deck = new Deck(6);
    let packet = SDK.protocol.makeEmptyProtocol(
      'BLJ2GCT_NTF_START_HAND'
    )
    packet.update({
      area: this.area,
      table_id: this.table_id,
      hand_id: this.game.handId,
    });
    return this.broadcast(packet);
  }
  onGCT2BLJ_REQ_BUY_IN_TABLE(protocol){
    let ret = {
      proto: 'GCT2BLJ_RSP_BUY_IN_TABLE',
      result: 'FALSE',
    };
    const player = this.players[protocol.user_id];
    console.log(`table ${this.table_config.table_id} find the user ${protocol.user_id} from ${Object.keys(this.players)}`);
    if (!player){
      return ret;
    }
    player.moneyInPocket = protocol.money_in_pocket;
    player.moneyInTable = protocol.money_in_table;
    return ret.player = player.toObject();
  }
  onGCT2BLJ_REQ_PLAYER_INFO(protocol){
    let ret = {
      proto: 'BLJ2GCT_RSP_PLAYER_INFO',
    };
    console.log(`table ${this.table_config.table_id} cannot find the user ${protocol.user_id} from ${Object.keys(this.players)}`);
    const player = this.players[protocol.user_id];
    if (!player){
      console.log(`table ${this.table_config.table_id} cannot find the user`);
      return ret;
    }
    ret.player = player.toObject();
    return ret;
  }
  getOccupiedSeatIds(){
    return R.reduce((acc, p) => {
      if(-1 == p.seatId) return acc;
      return R.concat(acc, [p.seatId])
    }, [], R.values(this.players));
  }
  getAvailableSeatIds(){
    const seat_ids = R.range(1, 6);
    const occupied_seat_ids = this.getOccupiedSeatIds();
    const availables = R.difference(seat_ids, occupied_seat_ids);
    console.log(`occupied seat ids: ${occupied_seat_ids}`);
    console.log(`available seat ids: ${availables}`);
    return availables;
  }
  pickAvailableSeatId(){
    const availables = this.getAvailableSeatIds();
    if (0 == availables.length){
      return;
    }
    const random_index = Math.floor(Math.random() * availables.length);
    return R.nth(random_index, availables);
  }
  onGCT2BLJ_REQ_SIT_DOWN(protocol){
    console.log(`table.onGCT2BLJ_REQ_SIT_DOWN ${protocol}`);
    let seat_id = undefined;
    if (-1 == protocol.seat_id){
      seat_id = this.pickAvailableSeatId();
    } else {
      seat_id = protocol.seat_id;
    }
    const availables = this.getAvailableSeatIds();
    if(!R.contains(seat_id, availables)){
      return -1;
    }
    const player = this.players[protocol.user_id];
    player.seatId = seat_id;
    return player.seatId;
  }
  onGCT2BLJ_REQ_BET(protocol){
    console.log('onGCT2BLJ_REQ_BET');
    let player = this.players[protocol.user_id];
    if (R.isNil(player)){
      throw new Error('player is undefined');
    }
    if(!R.isEmpty(protocol.bets)){
      player.deductMoneyInTable(protocol.bets.bet);
      this.game.betOnSeat({
        user_id: protocol.user_id,
        seat_id: protocol.bets.seat_id,
        money: protocol.bets.bet
      });
    }
    if(!R.isEmpty(protocol.pair_bets)){
      player.deductMoneyInTable(protocol.pair_bets.bet);
      this.game.betOnPair({
        user_id: protocol.user_id,
        seat_id: protocol.pair_bets.seat_id,
        money: protocol.pair_bets.bet
      });
    }
    return {
      bets: protocol.bets,
      pair_bets: protocol.pair_bets,
    }
  }

}

module.exports = Table;

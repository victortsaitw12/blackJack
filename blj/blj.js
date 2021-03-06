'use strict'
const SDK = require("victsaitw-sdk");
const StateMachine = require('./state');
const Schemas = require('./table/schemas');
const R = require('ramda');
const di = require('./di');
const asClass = require('awilix').asClass;
const asValue = require('awilix').asValue;
class BLJ{
  constructor(){
    this.state = null;
    this.tables = {};
  }
  start(){
    SDK.on('stateChange', (state) => {
      this.triggerWhenReady();
    });
    SDK.on('kafkaMessage', (data) => {
      return this.protocolHandler(data);
    });
    SDK.start({
      schemas: Schemas,
      kafka_url: 'kafka:9092',
      redis_url: 'redis:6379'
    });
  }
  findFunc(name){
    const fn = this[name];
    return fn ? fn.bind(this) : undefined;
  }
  protocolHandler(data){
    return Promise.resolve().then(() => {
      return SDK.protocol.validate(data);
    }).then((protocol) => {
      const fn = this.findFunc('on' + protocol.proto);
      if (!fn){
        throw new Error(`NO_METHOD_FOR_PROTOCOL:${protocol}`);
      }
      return {fn, protocol};
    }).then(({fn, protocol}) => {
      return fn(protocol);
    }).catch((err) => {
      throw err;
    });
  }
  onTEST_HANDLER_PL(protocol){
    return 'TEST_SUCCESS';
  }
  onGWY2SVR_REQ_GAME_PLAY(protocol){
    let payload = protocol.find('payload', {});
    return this.protocolHandler(Object.assign(payload, 
      {
        from_topic: protocol.fromTopic
      }));  
  };
  send2DBA(packet){
    console.log(`send2DBA:${JSON.stringify(packet.toString())}`);
    packet.toTopic = 'dbaPool';
    return SDK.send2XYZ(packet);
  }
  triggerWhenReady(){
    let req = SDK.protocol.makeEmptyProtocol(
      'BLJ2DBA_REQ_CONFIG'
    );
    req.update({ seq: SDK.sequence });
    req.timeout = 10;
    this.send2DBA(req).then(data => {
      console.log(data);
      di.register({
        serverConfig: asValue(data.rsp.config),
      });
      this.state = 'ready';
    }).catch(err => {
      console.log(err);  
    });
  }
  findTablesWithSeats(tables){
    return R.compose(
      R.filter(
        R.compose(R.gt(5),
        R.length,
        R.path(['sit']))
      ),
      R.map(t => t.onData({
        proto: 'GCT2BLJ_REQ_TABLE_INFO', 
      })),
      R.values
    )(tables);
  }
  findTableHasLeastEmptySeat(tables){
    return R.compose(
      R.ifElse(
        R.compose(R.equals(-1), R.path(['table_id'])),
        R.always({}),
        R.identity
      ),
      R.reduce(
        R.minBy(
          R.compose(R.length, R.path(['sit']))
        ), { table_id: -1, sit: R.repeat({}, 100) })
    )(tables);
  }
  getNewTableId(tables){
    return R.compose(
      R.add(1),
      R.length,
      R.keys
    )(tables);
  }
  findTableOrCreateNewOne(tables){
    const new_table_id = this.getNewTableId(tables);
    const tables_with_seats = this.findTablesWithSeats(tables);   
    const available = this.findTableHasLeastEmptySeat(tables_with_seats);
    return R.cond([
      [({available}) => R.isEmpty(available), ({new_table_id}) => {
        console.log('create table');
        return {
          table_id: new_table_id,
          join_table: StateMachine.createTable({
            table_id: new_table_id
          })
        };
      }],
      [R.T, ({available}) => {
        return {
          table_id: available.table_id,
          join_table: this.tables[available.table_id]
        };
      }]
    ])({new_table_id, available})
  }
  onGCT2BLJ_REQ_JOIN_TABLE(protocol){
    // set the default response.
    let response = SDK.protocol.makeEmptyProtocol(
      'BLJ2GCT_RSP_JOIN_TABLE'
    );
    response.update({
      to_topic: protocol.fromTopic,
      seq_back: protocol.seq,
      player: {},
      result: 'FALSE'
    });
    if (!R.equals('ready', this.state)){
      SDK.send2XYZ(response);
      throw new Error('Server is not ready.');
    }
    // find or creat an available table.
    const available = this.findTableOrCreateNewOne();
    console.log(`available table id:${available.table_id}`);
    this.tables[available.table_id] = available.join_table;
    // prepare the request protocol.
    let packet = SDK.protocol.makeEmptyProtocol('BLJ2DBA_REQ_JOIN_TABLE');
    packet.update({
      seq: SDK.sequence,
      area: protocol.find('area'),
      table_id: available.table_id,
      user_id: protocol.find('user_id'),
    });
    packet.timeout = 10;
    return this.send2DBA(
      packet
    ).then(R.cond([
      [(data) => {
        return R.equals('SUCCESS', data.rsp.result);  
      },
      (data) => {
        let player_obj = available.join_table.onData(Object.assign({
          proto: 'STATE_NTF_JOIN_TABLE',
        }, data));
        console.log(player_obj);
        response.update({
          table_id: available.table_id,
          area: protocol.find('area'),
          player: player_obj,
          result: data.rsp.result,
        });
        console.log(response.toString());
        return SDK.send2XYZ(response);
      }],
      [R.T, (data) => {
        response.update({
          result: data.rsp.result,
        });
        return SDK.send2XYZ(response);
      }]
    ])).catch(err => {
      console.log(err);  
      return SDK.send2XYZ(response);
    });
  }
  onGCT2BLJ_REQ_TABLE_INFO(protocol){
    let response = SDK.protocol.makeEmptyProtocol(
      'BLJ2GCT_RSP_TABLE_INFO'
    );
    response.update({
      to_topic: protocol.fromTopic,
      seq_back: protocol.seq,
      table_id: protocol.find('table_id'),
      result: 'FALSE'
    });
    const table_id = protocol.find('table_id', -1);
    const table = this.tables[table_id];
    if (!table){
      return SDK.send2XYZ(response);
    }
    const table_info = table.onData({
      proto: 'GCT2BLJ_REQ_TABLE_INFO', 
    });
    response.update({
      sit: table_info.sit,
      stand: table_info.stand,
    });
    return SDK.send2XYZ(response);
  }
  onGCT2BLJ_REQ_BUY_IN(protocol){
    let response = SDK.protocol.makeEmptyProtocol(
      'BLJ2GCT_RSP_BUY_IN'
    );
    const area = protocol.find('area', '');
    const table_id = protocol.find('table_id', -1);
    const user_id = protocol.find('user_id', -1);
    response.update({
      to_topic: protocol.fromTopic,
      seq_back: protocol.seq,
      area: area,
      table_id: table_id,
      user_id: user_id,
      money_in_pocket: -1,
      money_in_table: -1,
      result: 'FALSE'
    });
    const table = this.tables[table_id];
    if (!table){
      console.log('CAN NOT FIND THE TABLE');
      return SDK.send2XYZ(response);
    }
    const player_pl = table.onData({
      proto: 'GCT2BLJ_REQ_PLAYER_INFO',
      user_id: user_id
    });
    if (!player_pl.player){
      console.log('CONNOT FIND THE USER');
      return SDK.send2XYZ(response);
    }
    return Promise.resolve().then(() => {
      let req_dba_buy_in = SDK.protocol.makeEmptyProtocol(
        'BLJ2DBA_REQ_BUY_IN'
      );
      req_dba_buy_in.update({
        seq: SDK.sequence,
        area: area,
        table_id: table_id,
        user_id: user_id,
        buy_in: protocol.find('buy_in', 0),
      });
      req_dba_buy_in.timeout = 10;
      return this.send2DBA(req_dba_buy_in);
    }).then(data => {
      console.log(data);
      if ('FALSE' == data.rsp.result){
        return SDK.send2XYZ(response);
      }
      const table_rsp = table.onData({
        proto: 'GCT2BLJ_REQ_BUY_IN_TABLE',
        user_id: user_id,
        money_in_table: R.pathOr(0, ['rsp', 'money_in_table'], data),
        money_in_pocket: R.pathOr(0, ['rsp', 'money_in_pocket'], data),
      });
      console.log(`table buy_in success:${JSON.stringify(table_rsp)}`);
      response.update({
        money_in_pocket: R.pathOr(0, ['money_in_pocket'], table_rsp),
        money_in_table: R.pathOr(0, ['money_in_table'], table_rsp),
        result: 'SUCCESS',
      });
      return SDK.send2XYZ(response);
    }).catch(err => {
      console.log(err);
      return SDK.send2XYZ(response);
    });
  };
  onGCT2BLJ_REQ_SIT_DOWN(protocol){
    let response = SDK.protocol.makeEmptyProtocol(
      'BLJ2GCT_RSP_SIT_DOWN'
    );
    const area = protocol.find('area', '');
    const table_id = protocol.find('table_id', -1);
    const user_id = protocol.find('user_id', -1);
    const seat_id = protocol.find('seat_id', -1);
    response.update({
      to_topic: protocol.fromTopic,
      seq_back: protocol.seq,
      area: area,
      table_id: table_id,
      user_id: user_id,
      seat_id: -1,
      result: 'FALSE'
    });
    const table = this.tables[table_id];
    if (!table){
      console.log('CAN NOT FIND THE TABLE');
      return SDK.send2XYZ(response);
    }
    const player_pl = table.onData({
      proto: 'GCT2BLJ_REQ_PLAYER_INFO',
      user_id: user_id
    });
    if (!player_pl.player){
      console.log('CONNOT FIND THE USER');
      return SDK.send2XYZ(response);
    }
    if(0 < player_pl.player.seat_id){
      console.log(`User has sat on ${player_pl.player.seat_id}`);
      return SDK.send2XYZ(response);
    }
    let real_seat_id = table.onData(protocol.toObject());
    if (-1 == real_seat_id){
      return SDK.send2XYZ(response);
    }
    console.log(`real seat:${real_seat_id}`)
    response.update({
      seat_id: real_seat_id,
      result: 'SUCCESS',
    });
    return SDK.send2XYZ(response);
  }
  onGCT2BLJ_REQ_BET(protocol){
    let response = SDK.protocol.makeEmptyProtocol(
      'BLJ2GCT_RSP_BET'
    );
    const area = protocol.find('area', '');
    const table_id = protocol.find('table_id', -1);
    const user_id = protocol.find('user_id', -1);
    response.update({
      to_topic: protocol.fromTopic,
      seq_back: protocol.seq,
      bets: {},
      pair_bets: {},
      result: 'FALSE'
    });
    const table = this.tables[table_id];
    if (!table){
      console.log('CAN NOT FIND THE TABLE');
      return SDK.send2XYZ(response);
    }
    const player_pl = table.onData({
      proto: 'GCT2BLJ_REQ_PLAYER_INFO',
      user_id: user_id
    });
    if (!player_pl.player){
      console.log('CONNOT FIND THE USER');
      return SDK.send2XYZ(response);
    }
    if(0 >= player_pl.player.seat_id){
      console.log(`User did not sit`);
      return SDK.send2XYZ(response);
    }
    let rsp = table.onData(protocol.toObject());
    console.log(`rsp bet:${rsp}`)
    response.update({
      bets: rsp.bets,
      pair_bets: rsp.pair_bets,
      result: 'SUCCESS',
    });
    return SDK.send2XYZ(response);
  }
};

module.exports = new BLJ();

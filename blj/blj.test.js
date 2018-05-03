const expect = require('chai').expect;
const Table = require('./table/table');
const Player = require('./table/player');
const blj = require('./blj');
const SDK = require('victsaitw-sdk');
const sinon = require('sinon');
const R = require('ramda');
describe('BLJ:Test Handler', () => {
  let proto, stub;
  before(() => {
    blj.start();
    blj.state = 'ready';
    proto = {
      proto: 'TEST_HANDLER_PL',
      user_id: 11763600,
      from_topic: 'web1'
    };
  });
  it('test protocol handler:success', (done) => {
    blj.protocolHandler(
      proto  
    ).then(data => {
      expect(data).to.equal('TEST_SUCCESS');
      done();  
    }).catch(err => {
      done(err);
    });
  });
  it('test protcol handler: protocol validate fail', (done) => {
    blj.protocolHandler(
      R.omit(['user_id'], proto)
    ).then(data => {
      done('should be test fail');
    }).catch(err => {
      expect(err.message).to.equal(
        'child "user_id" fails because ["user_id" is required]'
      );
      done();
    })
  });
  it('tes protocol handler: protocol not register', (done) => {
    blj.protocolHandler({
      proto: 'NO_THIS_METHOD'
    }).then(data => {
      done('should be test fail');  
    }).catch(err => {
      expect(err.message).to.equal('schema not found:[object Object]');
      done();  
    });
  });
});

describe('BLJ:GCT2BLJ_REQ_JOIN_TABLE', () => {
  let stub;
  beforeEach(() => {
    blj.start();
    stub = undefined;
    blj.tables = {};  
  });
  it('findTablesWithSeats:no tables', () => {
     const tables = blj.findTablesWithSeats(blj.tables);   
     expect(tables).to.be.empty;
  });
  it('findTablesWithSeats: 1 table, users sit on 1 seatt', () => {
     let table = new Table({ table_id: 1 });
     let player = new Player();
     player.seatId = 1;
     table.players['1'] = player;
     blj.tables['1'] = table;
     const tables = blj.findTablesWithSeats(blj.tables);   
     expect(tables, tables).to.be.not.empty;
  });
  it('findTableWithSeats: 1 table, users sit on 5 seats', () => {
     let table = new Table({ table_id: 1 });
     for(let i = 1; i < 6; i++){
       let player = new Player();
       player.seatId = i;
       table.players[i] = player;
     }
     blj.tables['1'] = table;
     const tables = blj.findTablesWithSeats(blj.tables);   
     expect(tables, tables).to.be.empty;
  });
  it('indTableHasLeastEmptySeat: 2 tables, users sit on 1 seat in table 1 and users sit on 2 seats in table 2', () => {
    let table1 = new Table({ table_id: 1 });
    for(let i = 1; i < 4; i++){
      let player = new Player();
      player.seatId = i;
      table1.players[i] = player;
    }
    blj.tables['1'] = table1;

    let table2 = new Table({ table_id: 2 });
    for(let i = 1; i < 3; i++){
      let player = new Player();
      player.seatId = i;
      table2.players[i] = player;
    }
    blj.tables['2'] = table2;
    const tables = blj.findTablesWithSeats(blj.tables);   
    const available_tables = blj.findTableHasLeastEmptySeat(tables);
    expect(available_tables).to.be.not.empty;
  });
  it('getNewTableId:table id should be 1', () => {
    const new_id = blj.getNewTableId({});
    expect(new_id).to.be.equal(1);
  });
  it('getNewTableId:table id should be 3', () => {
    const new_id = blj.getNewTableId({'1': {}, '2': {}});
    expect(new_id).to.be.equal(3);
  });
  it('onGCT2BLJ_REQ_JOIN_TABLE', (done) => {
    Promise.resolve().then(() => {
      stub = sinon.stub(SDK, 'send2XYZ').callsFake((data) => {
        console.log(data);  
        return Promise.resolve();
      });
      return ;
    }).then(() => {
      return blj.onGCT2BLJ_REQ_JOIN_TABLE({
        seq: SDK.sequence,
        area: 'coin_100',
        user_id: 11763600,
      });
    }).then(() => {
      SDK.send2XYZ.restore();  
      done();
    }).catch(err => {
      console.log(err);
      SDK.send2XYZ.restore();  
      done(err);
    });
  });
});

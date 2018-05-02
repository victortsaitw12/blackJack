const expect = require('chai').expect;
const Table = require('./table');
const Player = require('./player');
const Joi = require('joi');
const Schema = require('./schemas');
describe('Table', () => {
  let table  = null;
  before(() => {
    table = new Table({
      table_id: 1,
    });
  });  
  it('GCT2BLJ_REQ_TABLE_INFO empty', () => {
    const rsp = table.onData({
      proto: 'GCT2BLJ_REQ_TABLE_INFO',  
    });
    Joi.assert(rsp, Schema.BLJ2GCT_RSP_TABLE_INFO);
  });
  it('GCT2BLJ_REQ_TABLE_INFO one stand', () => {
    table.players['1'] = new Player({});
    const rsp = table.onData({
      proto: 'GCT2BLJ_REQ_TABLE_INFO'  
    });
    Joi.assert(rsp, Schema.BLJ2GCT_RSP_TABLE_INFO);
    expect(rsp.sit).is.empty;
    expect(rsp.stand).is.not.empty;
  });
  it('GCT2BLJ_REQ_TABLE_INFO one sit', () => {
    let player = new Player();
    player.seatId = 1;

    table.players['1'] = player;
    const rsp = table.onData({
      proto: 'GCT2BLJ_REQ_TABLE_INFO'  
    });
    Joi.assert(rsp, Schema.BLJ2GCT_RSP_TABLE_INFO);
    expect(rsp.sit).is.not.empty;
    expect(rsp.stand).is.empty;
  });
});

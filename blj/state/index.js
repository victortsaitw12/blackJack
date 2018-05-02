'use strict'
const init = require('./init');
const join = require('./join');
const checkPool = require('./checkPool');
const startBet = require('./startBet');
const bet = require('./bet');
const dealing = require('./dealing');
const fork = require('./fork');
const userPlay = require('./userPlay');
const playing = require('./playing');
const dealerPlay = require('./dealerPlay');
const showdown = require('./showdown');
const next = require('./next');
var StateMachine = require('./stateMachine');
module.exports = {
  createTable: (config) => {
    const machine = new StateMachine();
    machine.createTable(config);
    return machine;
  }
}

'use strict'
const di = require('../di');
const asClass = require('awilix').asClass;
class StartBet{
  constructor(){
    this.name = 'startBet';
  }
  onData({stateMachine, proto}){
    proto.state = this.name;
    return stateMachine.table.onData(proto);
  }
  changeState(stateMachine){
    console.log('changeState:', this.name);
    stateMachine.table.onData({
      proto: 'STATE_NTF_START_BET',
      state: this.name,
    });
    stateMachine.setTimeout(10);
  }
  timeout(stateMachine){
    console.log('timeout:', this.name);
    stateMachine.changeState(di.resolve('bet'));
  }
}

di.register({
  startBet: asClass(StartBet).singleton()
});

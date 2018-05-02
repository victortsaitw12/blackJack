'use strict'
const di = require('../di');
const asClass = require('awilix').asClass;
class Bet{
  constructor(){
    this.name = 'Bet';
  }
  onData(data){
    data.proto.state = this.name;
    return data.stateMachin.table.onData(data.proto);
  }
  changeState(stateMachine){
    console.log('changeState:', this.name);
    const rsp = stateMachine.table.onData({
      proto: 'STATE_REQ_BET_COUNT',
      state: this.name,
    });
    if(0 == rsp.count){
      return stateMachine.changeState(di.resolve('join'));
    }
    return stateMachine.changeState(di.resolve('dealing'));
  }
  timeout(stateMachine){
    console.log('timeout:', this.name);
  }
}

di.register({
  bet: asClass(Bet).singleton()
});

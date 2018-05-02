'use strict'
const di = require('../di.js');
const asClass = require('awilix').asClass;
class CheckPool{
  constructor(){
    this.name = 'checkPool';
  }
  onData(data){
    data.proto.state = this.name;
    return data.stateMachin.table.onData(data.proto);
  }
  changeState(stateMachine){
    console.log('changeState:', this.name);
    const rsp = stateMachine.table.onData({
      proto: 'STATE_REQ_CHECK_POOL',
      state: this.name,
    });
    console.log(rsp);
    if (!rsp.result){
      return stateMachine.changeState(di.resolve('join'));
    }
    return stateMachine.changeState(di.resolve('startBet'));
  }
  timeout(stateMachine){
    console.log('timeout:', this.name);
  }
}

di.register({
  checkPool: asClass(CheckPool).singleton(),
});

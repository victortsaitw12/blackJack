'use strict'
const di = require('../di.js');
const asClass = require('awilix').asClass;
class Fork{
  constructor(){
    this.name = 'fork';
  }
  onData(data){
    data.proto.state = this.name;
    return data.stateMachin.table.onData(data.proto);
  }
  changeState(stateMachine){
    console.log('changeState:', this.name);
    return stateMachine.setTimeout(1);
  }
  timeout(stateMachine){
    console.log('timeout:', this.name);
    const rsp = stateMachine.table.onData({
      proto: 'STATE_REQ_DECIDE_FORK',
      state: this.name,
    });
    console.log(rsp);
    if ('play' == rsp.result){
      return stateMachine.changeState(di.resolve('userPlay'));
    }
    if('dealer_play' == rsp.result){
      return stateMachine.changeState(di.resolve('dealerPlay'));
    }
    if('showdown' == rsp.result){
      return stateMachine.changeState(di.resolve('showdown'));
    }
    return stateMachine.setTimeout(1);
  }
}

di.register({
  fork: asClass(Fork).singleton(),
});

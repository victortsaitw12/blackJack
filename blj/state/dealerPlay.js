'use strict'
const di = require('../di.js');
const asClass = require('awilix').asClass;
class DealerPlay{
  constructor(){
    this.name = 'dealerPlay';
  }
  onData(data){
    data.proto.state = this.name;
    return data.stateMachin.table.onData(data.proto);
  }
  changeState(stateMachine){
    console.log('changeState:', this.name);
    stateMachine.table.onData({
      proto: 'STATE_NTF_DEALER_PLAY',
      state: this.name,
    });
    return stateMachine.setTimeout(5);
  }
  timeout(stateMachine){
    console.log('timeout:', this.name);
    return stateMachine.changeState(di.resolve('fork'));
  }
}

di.register({
  dealerPlay: asClass(DealerPlay).singleton(),
});

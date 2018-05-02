'use strict'
const di = require('../di.js');
const asClass = require('awilix').asClass;
class Dealing{
  constructor(){
    this.name = 'dealing';
  }
  onData(data){
    data.proto.state = this.name;
    return data.stateMachin.table.onData(data.proto);
  }
  changeState(stateMachine){
    console.log('changeState:', this.name);
    const rsp = stateMachine.table.onData({
      proto: 'STATE_NTF_DEALING_CARD',
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
  dealing: asClass(Dealing).singleton(),
});

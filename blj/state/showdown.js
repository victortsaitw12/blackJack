'use strict'
const di = require('../di.js');
const asClass = require('awilix').asClass;
class Showdown{
  constructor(){
    this.name = 'showdown';
  }
  onData(data){
    data.proto.state = this.name;
    return data.stateMachin.table.onData(data.proto);
  }
  changeState(stateMachine){
    console.log('changeState:', this.name);
    stateMachine.table.onData({
      proto: 'STATE_NTF_SHOWDOWN',
      state: this.name,
    });
    return stateMachine.setTimeout(5);
  }
  timeout(stateMachine){
    console.log('timeout:', this.name);
    return stateMachine.changeState(di.resolve('next'));
  }
}

di.register({
  showdown: asClass(Showdown).singleton(),
});

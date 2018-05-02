'use strict'
const di = require('../di.js');
const asClass = require('awilix').asClass;
class Playing{
  constructor(){
    this.name = 'playing';
  }
  onData(data){
    data.proto.state = this.name;
    return data.stateMachin.table.onData(data.proto);
  }
  changeState(stateMachine){
    console.log('changeState:', this.name);
    return stateMachine.setTimeout(10);
  }
  timeout(stateMachine){
    console.log('timeout:', this.name);
    stateMachine.table.onData({
      proto: 'STATE_NTF_PLAY_TIMEOUT',
      state: this.name,
    });
    stateMachine.changeState(di.resolve('fork'));
  }
}

di.register({
  playing: asClass(Playing).singleton(),
});

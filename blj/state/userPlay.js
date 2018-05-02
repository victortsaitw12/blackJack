'use strict'
const di = require('../di.js');
const asClass = require('awilix').asClass;
class UserPlay{
  constructor(){
    this.name = 'userPlay';
  }
  onData(data){
    data.proto.state = this.name;
    return data.stateMachin.table.onData(data.proto);
  }
  changeState(stateMachine){
    console.log('changeState:', this.name);
    stateMachine.table.onData({
      proto: 'STATE_NTF_USER_PLAY',
      state: this.name,
    });
    return stateMachine.changeState(di.resolve('playing'));
  }
  timeout(stateMachine){
    console.log('timeout:', this.name);
  }
}

di.register({
  userPlay: asClass(UserPlay).singleton(),
});

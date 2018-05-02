'use strict'
const di = require('../di.js');
const asClass = require('awilix').asClass;
class Next{
  constructor(){
    this.name = 'next';
  }
  onData(data){
    data.proto.state = this.name;
    return data.stateMachin.table.onData(data.proto);
  }
  changeState(stateMachine){
    console.log('changeState:', this.name);
    return stateMachine.changeState(di.resovlve('join'));
  }
  timeout(stateMachine){
    console.log('timeout:', this.name);
  }
}

di.register({
  next: asClass(Next).singleton(),
});

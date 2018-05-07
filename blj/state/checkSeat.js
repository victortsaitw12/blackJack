'use strict'
const di = require('../di.js');
const asClass = require('awilix').asClass;
class checkSeat{
  constructor(){
    this.name = 'checkSeat';
  }
  onData(data){
    data.proto.state = this.name;
    return data.stateMachin.table.onData(data.proto);
  }
  changeState(stateMachine){
    console.log('changeState:', this.name);
    const rsp = stateMachine.table.onData({
      proto: 'STATE_REQ_CHECK_SEAT',
      state: this.name,
    });
    console.log(rsp);
    if (!rsp.result){
      return stateMachine.changeState(di.resolve('join'));
    }
    stateMachine.table.onData({
      proto: 'STATE_NTF_START_HAND',
      state: this.name,
    });
    return stateMachine.changeState(di.resolve('startBet'));
  }
  timeout(stateMachine){
    console.log('timeout:', this.name);
  }
}

di.register({
  checkSeat: asClass(checkSeat).singleton(),
});

const di = require('../di');
const asClass = require('awilix').asClass;
class Init{
  constructor(){
    this.name = 'init';
  }
  onData(data){
    data.proto.state = this.name;
    return data.stateMachin.table.onData(data.proto);
  }
  changeState(stateMachine){
    console.log('changeState:', this.name);
    stateMachine.changeState(di.resolve('join'));
  }
  timeout(stateMachine){
    console.log('timeout:', this.name);
  }
}

di.register({
  init: asClass(Init).singleton()
});

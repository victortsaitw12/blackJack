const di = require('../di');
const asClass = require('awilix').asClass;
class Join{
  constructor(){
    this.name = 'join';
  }
  onData(data){
    data.proto.state = this.name;
    return data.stateMachin.table.onData(data.proto);
  }
  changeState(stateMachine){
    console.log('changeState:', this.name);
    stateMachine.setTimeout(1);
  }
  timeout(stateMachine){
    console.log('timeout:', this.name);
    const checkPool = di.resolve('checkPool');
    stateMachine.stop();
    // stateMachine.changeState(checkPool);
  }
}

di.register({
  join: asClass(Join).singleton()
});

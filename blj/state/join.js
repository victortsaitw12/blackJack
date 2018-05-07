const di = require('../di');
const asClass = require('awilix').asClass;
class Join{
  constructor(){
    this.name = 'join';
  }
  onData({stateMachine, proto}){
    proto.state = this.name;
    return stateMachine.table.onData(proto);
  }
  changeState(stateMachine){
    console.log('changeState:', this.name);
    stateMachine.setTimeout(1);
  }
  timeout(stateMachine){
    console.log('timeout:', this.name);
    const checkSeat = di.resolve('checkSeat');
    stateMachine.changeState(checkSeat);
  }
}

di.register({
  join: asClass(Join).singleton()
});

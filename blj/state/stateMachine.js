const Table = require('../table').Table;
const di = require('../di.js');
class StateMachine{
  constructor(){
    this.state = null;
    this.table = null;
  }
  createTable(config){
    this.table = new Table(config);
    this.changeState(di.resolve('init'));
    return this;
  }
  changeState(state){
    this.state = state;
    console.log(`StateMachine.chageState:${state.name}`);
    this.state.changeState(this);
  }
  setTimeout(sec){
    setTimeout(() => {
      this.timeout();  
    }, sec * 1000);
  }
  timeout(){
    this.state.timeout(this);
  }
  onData(proto){
    this.state.onData({
      stateMachine: this,
      proto: proto,
    });
  }
  stop(){
    this.state = null;
    this.table = null;
  }
}

module.exports = StateMachine;

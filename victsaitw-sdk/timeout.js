'use strict'

class TimeoutRegister{
  constructor(){
    this.timeout_register = {};
  }
  promiseTimeout(seq, timeout, promise){
    let id = setTimeout(() => {
      clearTimeout(id);
      let data = this.getTimeoutRegister(seq);
      if (data){
        delete this.timeout_register[seq];
        data.reject(new Error(`Timed out in ${timeout}ms`));
      }
    }, timeout);  
    this.updateTimeoutIdInTimeoutRegister(seq, id);
    return Promise.race([
      promise,
    ]);
  }
  resolveTimeoutRegister(seq, msg){
    let data = this.timeout_register[seq];
    clearTimeout(data.timeout_id);
    delete this.timeout_register[seq];
    data.resolve({req: data.payload.toObject(), rsp: msg});
  }
  updateTimeoutIdInTimeoutRegister(seq, id){
    this.timeout_register[seq].timeout_id = id;
  }
  getTimeoutRegister(seq){
    return this.timeout_register[seq];
  }
  registerTimeoutProtocol(seq, payload, resolve, reject){
    this.timeout_register[seq] = {
      payload,
      resolve,
      reject,
    }
  }
}

module.exports = TimeoutRegister;

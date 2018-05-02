'use strict'
class Register{
  constructor(){
    this.register = {};
  }
  registeEvent(proto, resolve, reject){
    this.register[proto.protocol.seq] = {
      protocol: proto, 
      resolve: resolve,
    };
    setTimeout(() => {
      delete this.register[proto.protocol.seq];
      reject(new Error('timeout'));  
    }, 1000);
  }
  eventTrigger(proto){
   const data = this.register[proto.seq_back];
   if (!data){
     return 'no data'; 
   }
   delete this.register[proto.seq_back];
   data.resolve({
     req: data.protocol,
     rsp: proto,
   });
  }
  get length(){
    return Object.keys(this.register).length;
  }
}

module.exports = new Register(); 

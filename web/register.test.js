const expect = require('chai').expect;
const register = require('./register');
describe('register', () => {
  let protocol;
  before(() => {
    protocol = {
      action: {
        seq: 12345,
        proto: 'GCT2BLJ_REQ_JOIN',
      }
    }  
  });
  it('timeout', (done) => {
     new Promise((resolve, reject) => {
       register.registeEvent(protocol, resolve, reject);
     }).then(data => {
       done('should be timeout');
     }).catch(err => {
       if (register.length != 0){
         return done('length is not 0');
       }
       done();  
     });
  });
  it('evnetTrigger', (done) => {
    new Promise((resolve, reject) => {
      register.registeEvent(protocol, resolve, reject);
      setTimeout(() => {
        register.eventTrigger({
          action: { seq_back: 12345 }
        });  
      }, 500);
    }).then(data => {
      if (register.length != 0){
        return done('length is not 0');
      }
      done();
    }).catch(err => {
      done('shoult not be timeout');  
    }); 
  }); 
  it('no register', () => {
    const data = register.eventTrigger({
      action: { seq_back: 12345 }
    });  
    expect(data).to.equal('no data');
  });
});

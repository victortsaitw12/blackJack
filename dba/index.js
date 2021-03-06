'use strict'

const DBA = require('./dba');

process.on('uncaughtException', (err) => {
  console.error('Unhandled Exception', err);  
});

process.on('uncaughtRejection', (err, promise) => {
  console.error('Unhandled Rejection', err);  
});
setTimeout(() => {
  DBA.start();
}, 20000);

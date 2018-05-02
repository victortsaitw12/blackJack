'use strict'

const BLJ = require('./blj');

process.on('uncaughtException', (err) => {
  console.error('Unhandled Exception', err);  
});

process.on('uncaughtRejection', (err, promise) => {
  console.error('Unhandled Rejection', err);  
});

setTimeout(() => {
  BLJ.start();
}, 20000);

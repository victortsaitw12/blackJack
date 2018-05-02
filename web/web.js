'use strict'
const express = require('express');
const SDK = require('victsaitw-sdk');
const register = require('./register');
const app = new express();
app.get('/', (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(`<h1>${process.env.MESSAGE}</h1>`);
});
app.get('/start', (req, res) => {
  let packet = SDK.protocol.makeEmptyProtocol('GCT2BLJ_REQ_JOIN_TABLE');
  packet.update({
    seq: 123456,
    area: 'coin_100',
    user_id: 11763650
  });
  packet.toTopic = process.env.BLJ_QUEUE;
  packet.timeout = 10;
  SDK.send2XYZ(packet).then(data => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`<h1>Login success</h1>`);
  }).catch(err => {
    console.log(err);
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`<h1>${err.message}</h1>`);
  });
});
app.get('/login', (req, res) => {
  let packet = SDK.protocol.makeEmptyProtocol('GCT2DBA_REQ_LOGIN');
  packet.update({
    seq: 1234567,
    user_id: 11763650,
  });
  packet.toTopic = 'dbaPool';
  packet.timeout = 10;
  SDK.send2XYZ(packet).then(data => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`<h1>Login success:${JSON.stringify(data.rsp)}</h1>`);
  }).catch(err => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`<h1>${err.message}</h1>`);
  });
});
app.listen(process.env.PORT);

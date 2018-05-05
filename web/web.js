'use strict'
const express = require('express');
const SDK = require('victsaitw-sdk');
const register = require('./register');
const app = express.createServer();
let user = {
  area: 'coin_100',
  id: 11763600,
  nickname: 'victor',
  buy_in: 5000,
};
app.get('/', (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(`<h1>${process.env.MESSAGE}</h1>`);
});
app.get('/join', (req, res) => {
  let packet = SDK.protocol.makeEmptyProtocol('GCT2BLJ_REQ_JOIN_TABLE');
  packet.update({
    seq: SDK.sequence,
    area: user.area,
    user_id:user.id, 
  });
  packet.toTopic = process.env.BLJ_QUEUE;
  packet.timeout = 10;
  SDK.send2XYZ(packet).then(data => {
    user.table_id = data.rsp.table_id;
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`<h1>Login success</h1>`);
  }).catch(err => {
    console.log(err);
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`<h1>${err.message}</h1>`);
  });
});
app.get('/buy_in', (req, res) => {
  let packet = SDK.protocol.makeEmptyProtocol('GCT2BLJ_REQ_BUY_IN');
  packet.update({
    seq: SDK.sequence,
    area: user.area,
    table_id: user.table_id,
    user_id: user.id,
    buy_in: user.buy_in
  });
  packet.toTopic = process.env.BLJ_QUEUE;
  packet.timeout = 10;
  SDK.send2XYZ(packet).then(data => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`<h1>buy_in:${JSON.stringify(data.rsp)}</h1>`);
  }).catch(err => {
    console.log(err);
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`<h1>buy_in:${err.message}</h1>`);
  });
});
app.get('/table_info', (req, res) => {
  let packet = SDK.protocol.makeEmptyProtocol('GCT2BLJ_REQ_TABLE_INFO');
  packet.update({
    seq: SDK.sequence,
    area: user.area,
    table_id:user.table_id, 
  });
  packet.toTopic = process.env.BLJ_QUEUE;
  packet.timeout = 10;
  SDK.send2XYZ(packet).then(data => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`<h1>get table info:${JSON.stringify(data.rsp)}</h1>`);
  }).catch(err => {
    console.log(err);
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`<h1>get table info:${err.message}</h1>`);
  });
});
app.get('/signUp', (req, res) => {
  let packet = SDK.protocol.makeEmptyProtocol('GCT2DBA_REQ_SIGN_UP');
  packet.update({
    seq: SDK.sequence,
    user_id: user.id,
    nickname: user.nickname,
  });
  packet.toTopic = 'dbaPool';
  packet.timeout = 10;
  SDK.send2XYZ(packet).then(data => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`<h1>SIGN success:${JSON.stringify(data.rsp)}</h1>`);
  }).catch(err => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`<h1>SIGN FAIL:${err.message}</h1>`);
  });
});
app.listen(process.env.PORT);

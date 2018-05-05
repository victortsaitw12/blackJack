'use strict'
const express = require('express');
const ws = require('./websocket');
const http = require('http');
const app = express();

const server = http.createServer(app);
app.get('/webclient', (req, res) => {
  res.sendFile(__dirname + '/webclient.html');  
});
server.listen(9081, () => {
  console.log((new Date()) + 'Server is listening on port 9081');
});
app.get('/', (req, res) => {
  res.send('hello by GWY');  
});
ws.start(server);

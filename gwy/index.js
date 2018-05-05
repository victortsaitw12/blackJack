'use strict'
const express = require('express');
const ws = require('./websocket');
const http = require('http');
const app = express();

const server = http.createServer(app);
app.get('/webclient', (req, res) => {
  res.sendFile(__dirname + '/webclient.html');  
});
server.listen(process.env.PORT ? process.env.PORT : 9080, () => {
  console.log((new Date()) + 'Server is listening on port 9080');
});
ws.start(server);

'use strict'
const express = require('express');
const gwy = require('./gwy');
const http = require('http');
const app = express();

const server = http.createServer(app);
server.listen(9081, () => {
  console.log((new Date()) + 'Server is listening on port 9081');
});
app.get('/', (req, res) => {
  res.send('hello by GWY');  
});
gwy.start(server);

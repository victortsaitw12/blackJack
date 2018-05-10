'use strict'
const WebSocketServer = require('ws').Server;
const EventEmitter = require('events').EventEmitter;
const SDK = require('victsaitw-sdk');
const R = require('ramda');
class WS extends EventEmitter{
  constructor(){
    super();
    this.wsServer = null;
    this.connections = {}; //key: user id
  }
  registeConnection(connection){
    let client_id = SDK.sequence;
    this.connections[client_id] = connection;
    return client_id;
  }
  removeConnection(client_id){
    delete this.connections[client_id];
  }
  start(server){
    console.log(`webSocket start`);
    this.wsServer = new WebSocketServer({
      server
    });
    this.wsServer.on('connection', (connection, req) => {
      console.log(new Date() + ' connection accepted');
      const client_id = this.registeConnection(connection);
      connection.on('message', message => {
        console.log(`Received Message: ${message}`);
        let protocol = null;
        try{
          protocol = JSON.parse(message);
        } catch(err){
          protocol = { proto: 'PARSE_ERROR', err: err};
        }
        this.emit('webSocketMessage', protocol);
      });
      connection.on('close', (code, reason) => {
        console.log(`connection disconnected ${code}:${reason}`); 
        delete this.connections[client_id];
      });
      this.emit('webSocketConnect', client_id);
      return client_id;
    });
    return this;
  }
  checkConnection(client_id){
    console.log(`checkConnection:${client_id}`);
    return R.pathOr(undefined, [client_id], this.connections);
  }
  send(client_id, packet){
    const connection = this.connections[client_id];
    if (connection){
      console.log(`send ${packet.toString()}`);
      return connection.send(packet.toString());
    }
    throw new Error(`connection is disconnected ${client_id}`);
  }
}
module.exports = new WS();

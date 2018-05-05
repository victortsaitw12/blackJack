const WebSocketServer = require('ws').Server;
const EventEmitter = require('events').EventEmitter;
const SDK = require('victsaitw-sdk');
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
        this.emit('webSocketMessage', message);
      });
      return client_id;
    });
  }
}
module.exports = new WS();

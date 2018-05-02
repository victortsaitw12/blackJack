const protocol = require('./protocol');
const SDK = require('./index');

let packet = protocol.make_empty_protocol('NEW_PROTOCOL');
packet.update({
  seq: 12345,
  name: 'victor',
  to_topic: 'japan',
  timeout: 3
});
SDK.send2XYZ(packet).then(data => console.log(data)).catch(err => console.log(err));;
setTimeout((msg) => {
 SDK.kafkaMessage(msg)  
}, 2000, {proto: 'RESPONSE', seq_back: 12345});

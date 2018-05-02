var util = require('util');
var Kafka = require('no-kafka');

var DefaultPartitioner = Kafka.DefaultPartitioner;

function MyPartitioner(){
  DefaultPartitioner.apply(this, arguments);
}

util.inherits(MyPartitioner, DefaultPartitioner);

MyPartitioner.prototype.getKey = function getKey(message) {
    return message.key ? message.key : '0';
    // return message.key.split('-')[0];
};

module.exports = new MyPartitioner();

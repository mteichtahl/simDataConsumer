'use strict'

var AWS = require('aws-sdk');

class KinesisClient {
  constructor(region, streamName, partitionCount) {
    this.kinesis = new AWS.Kinesis({region: region});
    this.kinesisPartition = "0";
    this.partitionCount = partitionCount || 1;
    this.streamName = streamName;
    this.kinesisEndpoint = this.kinesis.config.endpoint;

    console.log(`Kinesis ready (${this.kinesisEndpoint}/${this.streamName})`);
  }

  getPartition() {
    if (kinesisPartition < partitionCount) {
      return kinesisPartition.toString();
    }
    kinesisPartition++;
  }

  write(data, seq, cb) {
    var params = {
        Data: data, 
        StreamName: this.streamName, 
        PartitionKey: this.kinesisPartition,
        SequenceNumberForOrdering: seq.toString()};

    this.kinesis.putRecord(params, function(err, data) {
      if (err) {
        console.log(err.message);
      } else {
        cb(data);
      }
    })
  }
}

module.exports = KinesisClient
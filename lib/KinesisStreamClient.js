'use strict'

var AWS = require('aws-sdk')

class KinesisClient {
  constructor (region, streamName, partitionCount) {
    this.kinesis = new AWS.Kinesis({region: region})
    this.kinesisPartition = 'simDataPartition'
    this.partitionCount = partitionCount || 1
    this.streamName = streamName
    this.kinesisEndpoint = this.kinesis.config.endpoint
    this.prevSeqNumber = undefined

    console.log(`Kinesis ready (${this.kinesisEndpoint}/${this.streamName})`)
  }

  getPartition () {
    if (kinesisPartition < partitionCount) {
      return kinesisPartition.toString()
    }
    kinesisPartition++
  }

  write (data, cb) {
    var self = this
    var params = {
      Data: data,
      StreamName: this.streamName,
      PartitionKey: this.kinesisPartition,
      SequenceNumberForOrdering: self.prevSeqNumber
    }

    this.kinesis.putRecord(params, function (err, data) {
      if (err) {
        console.log(err.message)
      } else {
        self.prevSeqNumber = data.SequenceNumber
        cb(data)
      }
    })
  }
}

module.exports = KinesisClient

var AWS = require('aws-sdk');
var _ = require('lodash');
var base64 = require('base-64');

var cloudwatch = new AWS.CloudWatch();
var dynamodb = new AWS.DynamoDB();

/**
 * cleanJSONString
 *
 * @param {any} string string that requires cleaning
 * @returns string cleaned string
 */
function cleanJSONString(string) {
  // preserve newlines, etc - use valid JSON
  string = string.replace(/\\n/g, '\\n')
               .replace(/\\'/g, '\\\'')
               .replace(/\\"/g, '\\"')
               .replace(/\\&/g, '\\&')
               .replace(/\\r/g, '\\r')
               .replace(/\\t/g, '\\t')
               .replace(/\\b/g, '\\b')
               .replace(/\\f/g, '\\f');
  // remove non-printable and other non-valid JSON chars
  return string.replace(/[\u0000-\u0019]+/g, '');
}

function writeToDynamo(data, cb) {
  var params = {
    Item: {
      'id': {S: 'simData'},
      'ts': {S: data.ts},
      'sts': {S: data.sts},
      'roll': {S: data.roll},
      'yaw': {S: data.yaw},
      'pitch': {S: data.pitch},
      'airspeed': {S: data.airspeed},
      'altitude': {S: data.altitude},
      'heading': {S: data.heading.true.toString()},
      'vspeed': {S: data.vspeed},
      'lat': {S: data.lat.toString()},
      'lng': {S: data.lng.toString()}
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: 'simDataStore'
  };

  dynamodb.putItem(params, function(err, data) {
    if (err)
      console.log(err, err.stack, params);  // an error occurred
    else
      cb(data);
  });
}

function putCloudwatchMetric(metricName, dimName, dimValue, ts, value) {
  var params = {
    MetricData: [
      /* required */
      {
        MetricName: metricName,
        Dimensions: [
          {Name: dimName, Value: dimValue},
        ],
        StorageResolution: 1,
        Timestamp: new Date(ts).toISOString(),
        Unit: 'None',
        Value: parseFloat(value)
      },

    ],
    Namespace: 'simhub' /* required */
  };

  cloudwatch.putMetricData(params, function(err, data) {
    if (err)
      console.log(err, err.stack);  // an error occurred
    else
      console.log(data);  // successful response
  });
}

/**
 * Main lambda handler and entry point
 */
exports.index = function(event, context, callback) {
  // find the number of records being given to us by kinesis
  var recordCount = event.Records.length;
  //   console.log(recordCount);

  // iterate through the records
  for (i = 0; i < recordCount; i++) {
    // get the kinesis payload
    var flightData = event.Records[i].kinesis;

    // convert from base64, clean up and "funny" characters and parse into
    // JSON
    try {
      var JSONdata = JSON.parse(cleanJSONString(base64.decode(flightData.data)));
      writeToDynamo(JSONdata, function(ret) {
        console.log('done');
      });
    } catch (err) {
      continue;
    }

    //
    // console.log(cleanJSONString(base64.decode(flightData.data)));
    // putCloudwatchMetric(data.s, data.s, 'On/Off', parseInt(data.ts),
    // data.val);
  }


  callback(null, 'Complete');
}

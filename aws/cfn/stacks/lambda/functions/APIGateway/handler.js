var AWS = require('aws-sdk');
var _ = require('lodash');

var dynamodb = new AWS.DynamoDB()

/**
 * Main lambda handler and entry point
 */
exports.index = function(event, context, callback) {
  var retVal = undefined;
  var statusCode = undefined;

  var params = {Key: {'id': {S: 'simData'}}, TableName: 'simDataStore'};

  dynamodb.getItem(params, function(err, data) {
    if (err) {
      retVal = err;
      statusCode = 400;
    } else {
      retVal = data;
      statusCode = 200;
    }

    callback(null, {
      statusCode: statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: retVal
    });
  })
}

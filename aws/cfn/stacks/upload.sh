#!/bin/bash

aws s3 cp APIGatewayAndLambdaStack.json s3://reinvent-abd322-workshop/APIGatewayAndLambdaStack.json --acl public-read
echo "https://s3-ap-southeast-2.amazonaws.com/reinvent-abd322-workshop/APIGatewayAndLambdaStack.json"

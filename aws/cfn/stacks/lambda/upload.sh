#!/bin/bash

. config

FUNCTION_NAME=$1
FUNCTION_PATH=functions
FUNCTION=$FUNCTION_PATH/$FUNCTION_NAME


echo "Creating lambda function "$FUNCTION_NAME" from "$FUNCTION

pushd $FUNCTION
zip -q -r $FUNCTION_NAME . -x "*.DS_Store" 
popd

aws s3 cp $FUNCTION/$FUNCTION_NAME.zip $S3_BUCKET/$FUNCTION_NAME.zip
rm $FUNCTION/$FUNCTION_NAME.zip
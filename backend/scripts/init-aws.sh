#!/bin/bash

awslocal dynamodb create-table \
  --table-name NotesTable \
  --billing-mode PAY_PER_REQUEST \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH

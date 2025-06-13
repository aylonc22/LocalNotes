#!/bin/bash

set -e

API_NAME="NotesApi"
STAGE_NAME="dev"
REGION="us-east-1"
LAMBDA_ACCOUNT_ID="000000000000"
LOCALSTACK_HOST="localhost:4566"
FUNCTIONS_DIR="./functions"

echo "🔧 Setting up API Gateway for $API_NAME..."

# Create the API if it doesn't exist
API_ID=$(awslocal apigateway get-rest-apis --query "items[?name=='$API_NAME'].id" --output text || true)
if [ -z "$API_ID" ]; then
  API_ID=$(awslocal apigateway create-rest-api --name "$API_NAME" --output text --query 'id')
  echo "📦 Created API Gateway with ID: $API_ID"
else
  echo "📦 Found existing API Gateway with ID: $API_ID"
fi

# Get root resource ID
ROOT_ID=$(awslocal apigateway get-resources --rest-api-id "$API_ID" --query 'items[0].id' --output text)

# Ensure /notes and /notes/{id} exist
NOTES_RESOURCE_ID=$(awslocal apigateway get-resources --rest-api-id "$API_ID" --query "items[?path=='/notes'].id" --output text || true)
if [ -z "$NOTES_RESOURCE_ID" ]; then
  NOTES_RESOURCE_ID=$(awslocal apigateway create-resource \
    --rest-api-id "$API_ID" \
    --parent-id "$ROOT_ID" \
    --path-part notes \
    --query id --output text)
  echo "📂 Created /notes resource with ID: $NOTES_RESOURCE_ID"
fi

ID_RESOURCE_ID=$(awslocal apigateway get-resources --rest-api-id "$API_ID" --query "items[?path=='/notes/{id}'].id" --output text || true)
if [ -z "$ID_RESOURCE_ID" ]; then
  ID_RESOURCE_ID=$(awslocal apigateway create-resource \
    --rest-api-id "$API_ID" \
    --parent-id "$NOTES_RESOURCE_ID" \
    --path-part "{id}" \
    --query id --output text)
  echo "📂 Created /notes/{id} resource with ID: $ID_RESOURCE_ID"
fi

# Helper function
attach_method() {
  RESOURCE_ID=$1
  METHOD=$2
  LAMBDA_NAME=$3

  echo "🔗 Attaching $METHOD to $LAMBDA_NAME at resource $RESOURCE_ID"

  awslocal apigateway put-method \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method "$METHOD" \
    --authorization-type "NONE"

  awslocal apigateway put-integration \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method "$METHOD" \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$LAMBDA_ACCOUNT_ID:function:$LAMBDA_NAME/invocations

  awslocal lambda add-permission \
    --function-name "$LAMBDA_NAME" \
    --statement-id "apigateway-${LAMBDA_NAME}-${METHOD}" \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$REGION:$LAMBDA_ACCOUNT_ID:$API_ID/*/$METHOD/notes*"
}

echo "🔍 Scanning functions directory..."

for file in "$FUNCTIONS_DIR"/*.{ts,js}; do
  filename=$(basename -- "$file")
  func_name="${filename%.*}"

  if [[ "$func_name" == create* ]]; then
    attach_method "$NOTES_RESOURCE_ID" POST "$func_name"
  elif [[ "$func_name" == delete* ]]; then
    attach_method "$ID_RESOURCE_ID" DELETE "$func_name"
  elif [[ "$func_name" == update* ]]; then
    attach_method "$ID_RESOURCE_ID" PUT "$func_name"
  elif [[ "$func_name" == find* ]]; then
    attach_method "$NOTES_RESOURCE_ID" GET "$func_name"
    attach_method "$ID_RESOURCE_ID" GET "$func_name"
  fi
done

# Deploy
awslocal apigateway create-deployment --rest-api-id "$API_ID" --stage-name "$STAGE_NAME"

echo "✅ API Gateway setup complete!"
echo "🌐 Base URL: http://$LOCALSTACK_HOST/restapis/$API_ID/$STAGE_NAME/_user_request_/notes"

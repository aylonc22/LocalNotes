#!/bin/bash

# Load .env variables
set -o allexport
source .env
set +o allexport

FUNCTION_NAME="createNote"
SOURCE_FILE="functions/$FUNCTION_NAME.ts"
BUILD_DIR="dist"
ZIP_FILE="$BUILD_DIR/$FUNCTION_NAME.zip"
ENTRY_JS="$BUILD_DIR/$FUNCTION_NAME.js"

echo "📦 Bundling $SOURCE_FILE..."
npx esbuild $SOURCE_FILE --bundle --platform=node --target=node18 --outfile=$ENTRY_JS

echo "📁 Zipping $ENTRY_JS..."
cd $BUILD_DIR && zip -r $FUNCTION_NAME.zip $FUNCTION_NAME.js && cd ..

echo "🚀 Deploying to LocalStack..."
aws lambda update-function-code \
  --function-name $FUNCTION_NAME \
  --zip-file fileb://$ZIP_FILE \
  --endpoint-url "$AWS_ENDPOINT" \
  --region "$AWS_REGION"

echo "✅ $FUNCTION_NAME deployed successfully."

#!/bin/bash

# Exit immediately if a command fails
set -e

# Load .env if needed
set -o allexport
source .env
set +o allexport

echo "✅ Running tests..."
npm run test

echo "✅ Tests passed. Deploying to LocalStack..."

# Build the functions (adjust as needed)
npm run build:only

# Deploy (adjust to your deploy logic)
./scripts/deploy-functions.sh

echo "🚀 Deployment to LocalStack complete."

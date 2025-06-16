const AWS = require('aws-sdk');
const path = require('path');
const glob = require('glob');

const API_NAME = 'NotesApi';
const STAGE_NAME = 'dev';
const REGION = 'us-east-1';
const LAMBDA_ACCOUNT_ID = '000000000000';
const LOCALSTACK_HOST = 'http://localhost:4566';
const FUNCTIONS_DIR = './functions';

AWS.config.update({
  accessKeyId: 'test',
  secretAccessKey: 'test',
  region: REGION,
  endpoint: LOCALSTACK_HOST,
});

const apigateway = new AWS.APIGateway();
const lambda = new AWS.Lambda();

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function getOrCreateApi() {
  const apis = await apigateway.getRestApis({}).promise();
  const existing = apis.items.find(api => api.name === API_NAME);
  if (existing) {
    console.log(`📦 Found existing API Gateway with ID: ${existing.id}`);
    return existing.id;
  }
  const created = await apigateway.createRestApi({ name: API_NAME }).promise();
  console.log(`📦 Created API Gateway with ID: ${created.id}`);
  return created.id;
}

async function getResourceId(apiId, pathToMatch) {
  const resources = await apigateway.getResources({ restApiId: apiId }).promise();
  const match = resources.items.find(r => r.path === pathToMatch);
  return match ? match.id : null;
}

async function createResource(apiId, parentId, pathPart) {
  const res = await apigateway.createResource({
    restApiId: apiId,
    parentId,
    pathPart,
  }).promise();
  console.log(`📂 Created /${pathPart} resource with ID: ${res.id}`);
  return res.id;
}

async function attachMethod(apiId, resourceId, method, lambdaName) {
  console.log(`🔗 Attaching ${method} to ${lambdaName} at resource ${resourceId}`);
  
  try {
    await apigateway.putMethod({
      restApiId: apiId,
      resourceId,
      httpMethod: method,
      authorizationType: 'NONE',
    }).promise();
  } catch (err) {
    if (err.code !== 'ConflictException') throw err;
  }

  await apigateway.putIntegration({
    restApiId: apiId,
    resourceId,
    httpMethod: method,
    type: 'AWS_PROXY',
    integrationHttpMethod: 'POST',
    uri: `arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/arn:aws:lambda:${REGION}:${LAMBDA_ACCOUNT_ID}:function:${lambdaName}/invocations`,
  }).promise();

  try {
    await lambda.addPermission({
      FunctionName: lambdaName,
      StatementId: `apigateway-${lambdaName}-${method}`,
      Action: 'lambda:InvokeFunction',
      Principal: 'apigateway.amazonaws.com',
      SourceArn: `arn:aws:execute-api:${REGION}:${LAMBDA_ACCOUNT_ID}:${apiId}/*/${method}/notes*`,
    }).promise();
  } catch (err) {
    if (err.code !== 'ResourceConflictException') throw err;
  }
}

async function main() {
  console.log(`🔧 Setting up API Gateway for ${API_NAME}...`);

  const apiId = await getOrCreateApi();
  const rootId = (await apigateway.getResources({ restApiId: apiId }).promise()).items.find(r => r.path === '/').id;

  let notesId = await getResourceId(apiId, '/notes');
  if (!notesId) {
    notesId = await createResource(apiId, rootId, 'notes');
  }

  let idId = await getResourceId(apiId, '/notes/{id}');
  if (!idId) {
    idId = await createResource(apiId, notesId, '{id}');
  }

  console.log('🔍 Scanning functions directory...');
  const files = glob.sync(`${FUNCTIONS_DIR}/*.{ts,js}`);
  for (const file of files) {
    const funcName = path.basename(file).split('.')[0];

    if (funcName.startsWith('create')) {
      await attachMethod(apiId, notesId, 'POST', funcName);
    } else if (funcName.startsWith('delete')) {
      await attachMethod(apiId, idId, 'DELETE', funcName);
    } else if (funcName.startsWith('update')) {
      await attachMethod(apiId, idId, 'PUT', funcName);
    } else if (funcName.startsWith('find')) {
      await attachMethod(apiId, notesId, 'GET', funcName);
      await attachMethod(apiId, idId, 'GET', funcName);
    }
  }

  await apigateway.createDeployment({
    restApiId: apiId,
    stageName: STAGE_NAME,
  }).promise();

  console.log('✅ API Gateway setup complete!');
  console.log(`🌐 Base URL: http://localhost:4566/restapis/${apiId}/${STAGE_NAME}/_user_request_/notes`);
}

main().catch(err => {
  console.error('❌ Error setting up API:', err.message);
  process.exit(1);
});

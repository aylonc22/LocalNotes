// deploy-createNote.js
const { LambdaClient, UpdateFunctionCodeCommand } = require("@aws-sdk/client-lambda");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const FUNCTION_NAME = "createNote";
const BUILD_DIR = "dist";
const ZIP_FILE_PATH = path.resolve(BUILD_DIR, `${FUNCTION_NAME}.zip`);
const AWS_ENDPOINT = process.env.AWS_ENDPOINT;
const AWS_REGION = process.env.AWS_REGION;

async function deploy() {
  const client = new LambdaClient({
    region: AWS_REGION,
    endpoint: AWS_ENDPOINT,
  });

  const zipFile = fs.readFileSync(ZIP_FILE_PATH);

  const command = new UpdateFunctionCodeCommand({
    FunctionName: FUNCTION_NAME,
    ZipFile: zipFile,
  });

  try {
    const response = await client.send(command);
    console.log(`✅ ${FUNCTION_NAME} deployed successfully.`);
  } catch (err) {
    console.error("Deployment failed:", err);
    process.exit(1);
  }
}

deploy();

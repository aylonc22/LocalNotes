// deploy-createNote.js
const {
  LambdaClient,
  GetFunctionCommand,
  UpdateFunctionCodeCommand,
  CreateFunctionCommand,
} = require("@aws-sdk/client-lambda");
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

  try {
    // Try to get the function
    await client.send(new GetFunctionCommand({ FunctionName: FUNCTION_NAME }));

    // If exists, update it
    const updateCmd = new UpdateFunctionCodeCommand({
      FunctionName: FUNCTION_NAME,
      ZipFile: zipFile,
    });

    await client.send(updateCmd);
    console.log(`✅ ${FUNCTION_NAME} updated successfully.`);
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      // If function doesn't exist, create it
      const createCmd = new CreateFunctionCommand({
        FunctionName: FUNCTION_NAME,
        Role: "arn:aws:iam::000000000000:role/lambda-role", // Must exist in LocalStack
        Handler: "index.handler",
        Runtime: "nodejs18.x",
        Code: { ZipFile: zipFile },
        Environment: {
          Variables: {
            TABLE_NAME: "NotesTable", // Optional env vars
          },
        },
      });

      await client.send(createCmd);
      console.log(`✅ ${FUNCTION_NAME} created successfully.`);
    } else {
      console.error("Deployment failed:", err);
      process.exit(1);
    }
  }
}

deploy();

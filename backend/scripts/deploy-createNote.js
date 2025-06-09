const {
  LambdaClient,
  GetFunctionCommand,
  UpdateFunctionCodeCommand,
  CreateFunctionCommand,
} = require("@aws-sdk/client-lambda");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
require("dotenv").config();

const FUNCTIONS_DIR = path.resolve("functions");
const BUILD_DIR = path.resolve("dist");
const AWS_ENDPOINT = process.env.AWS_ENDPOINT;
const AWS_REGION = process.env.AWS_REGION;
const LAMBDA_ROLE_ARN = "arn:aws:iam::000000000000:role/lambda-role"; // LocalStack-compatible role

const lambda = new LambdaClient({
  region: AWS_REGION,
  endpoint: AWS_ENDPOINT,
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
    },
});

async function zipFunction(handlerName) {
  const zipPath = path.join(BUILD_DIR, `${handlerName}.zip`);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    archive.pipe(output);
    archive.file(`dist/${handlerName}.js`, { name: `${handlerName}.js` });
    archive.file(`dist/${handlerName}.js.map`, { name: `${handlerName}.js.map` });

    archive.finalize();

    output.on("close", () => resolve(zipPath));
    archive.on("error", reject);
  });
}

async function deployFunction(handlerName) {
  console.log(`🚀 Deploying ${handlerName}...`);
  const zipPath = await zipFunction(handlerName);
  const zipFile = fs.readFileSync(zipPath);

  try {
    await lambda.send(new GetFunctionCommand({ FunctionName: handlerName }));

    const updateCmd = new UpdateFunctionCodeCommand({
      FunctionName: handlerName,
      ZipFile: zipFile,
    });

    await lambda.send(updateCmd);
    console.log(`✅ ${handlerName} updated successfully.`);
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      const createCmd = new CreateFunctionCommand({
        FunctionName: handlerName,
        Role: LAMBDA_ROLE_ARN,
        Handler: `${handlerName}.handler`,
        Runtime: "nodejs18.x",
        Code: { ZipFile: zipFile },
        Environment: {
          Variables: {
            TABLE_NAME: "NotesTable",
          },
        },
      });

      await lambda.send(createCmd);
      console.log(`✅ ${handlerName} created successfully.`);
    } else {
      console.error(`❌ Failed to deploy ${handlerName}:`, err);
    }
  }
}

async function main() {
  const files = fs.readdirSync(FUNCTIONS_DIR);
  const handlers = files
    .filter((f) => f.endsWith(".ts") || f.endsWith(".js"))
    .map((f) => path.basename(f, path.extname(f)));

  for (const handlerName of handlers) {
    await deployFunction(handlerName);
  }

  console.log("🎉 Deployment complete.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

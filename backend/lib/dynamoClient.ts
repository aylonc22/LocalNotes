import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";
dotenv.config();

const client = new DynamoDBClient({
  region:process.env.AWS_REGION || "us-east-1",
  endpoint:process.env.AWS_ENDPOINT_LOCALSTACK || 'http://host.docker.internal:4566',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  },
});

export const ddb = DynamoDBDocumentClient.from(client);

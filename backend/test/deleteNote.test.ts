import { handler as deleteNote } from "../functions/deleteNote";
import { describe, it, expect } from "vitest";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import dotenv from "dotenv";

dotenv.config();
const isBuild = process.env.BUILD === "true";
describe("deleteNote Lambda", () => {
  it("should return 400 when id is missing", async () => {
    const result = await deleteNote({ pathParameters: {} } as any);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toMatch(/Missing 'id'/);
  });

  it("should return 200 when id is provided", async () => {
    const result = await deleteNote({
      pathParameters: { id: "123456" },
    } as any);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).message).toMatch(/deleted/);
  });
});

const lambda = new LambdaClient({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT || 'http://localhost:4566' ,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  },
});

describe.skipIf(isBuild)("deleteNote Lambda - E2E", () => {
  it("should delete a note by ID", async () => {
    const noteId = Date.now().toString();

    // First, insert the note
    const createPayload = {
      body: JSON.stringify({
        title: "Note to delete",
        content: "Some content",
        id: noteId,
      }),
    };

    await lambda.send(
      new InvokeCommand({
        FunctionName: "createNote",
        Payload: Buffer.from(JSON.stringify(createPayload)),
      })
    );

    // Now, delete the note
    const deletePayload = {
      pathParameters: { id: noteId },
    };

    const response = await lambda.send(
      new InvokeCommand({
        FunctionName: "deleteNote",
        Payload: Buffer.from(JSON.stringify(deletePayload)),
      })
    );

    const payload = JSON.parse(
      Buffer.from(response.Payload!).toString("utf-8")
    );
    
    expect(payload.statusCode).toBe(200);
    expect(JSON.parse(payload.body).message).toMatch(/deleted/);
  });
});

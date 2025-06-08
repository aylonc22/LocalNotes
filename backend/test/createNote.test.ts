import { handler as createNote } from '../functions/createNote';
import { describe, it, expect } from 'vitest';
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import dotenv from "dotenv";

const isBuild = process.env.BUILD === "true";

describe('createNote Lambda', () => {
  it('should create a note and return success', async () => {
    const event = {
      body: JSON.stringify({ title: 'Test', content: 'This is a test' }),
    }

    const result = await createNote(event as any)

    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body).message).toBe('Note created!');
  })
})

// createNote.test.ts


dotenv.config();

const lambda = new LambdaClient({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT, // e.g., http://localhost:4566
});

describe.skipIf(isBuild)("createNote Lambda - E2E", () => {
  it("should create a note successfully", async () => {
    const payload = {
      body: JSON.stringify({
        title: "Test Note",
        content: "This is a test.",       
      }),
    };

    const command = new InvokeCommand({
      FunctionName: "createNote",
      Payload: Buffer.from(JSON.stringify(payload)),
    });

    const response = await lambda.send(command);

    expect(response.StatusCode).toBe(200);

    const responsePayload = JSON.parse(
      Buffer.from(response.Payload!).toString("utf-8")
    );

    expect(responsePayload.statusCode).toBe(200);
    expect(typeof responsePayload.body).toBe("string");

    const body = JSON.parse(responsePayload.body);   
    expect(body.note).toHaveProperty("id");
    expect(body.note.title).toBe("Test Note");
  });
});


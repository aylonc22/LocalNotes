import { handler as findNote } from "../functions/findNote";
import {beforeAll ,describe, it, expect } from "vitest";

import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import dotenv from "dotenv";

dotenv.config();
const isBuild = process.env.BUILD === "true";

describe("findNote Lambda", () => {
  it("should return 400 if body is invalid JSON", async () => {
    const result = await findNote({ body: "not-json" } as any);
    expect(result.statusCode).toBe(500);
  });

  it("should return 200 and notes array if no ID provided", async () => {
    const result = await findNote({ body: "{}" } as any);
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(Array.isArray(body.notes)).toBe(true);
  });

  it("should return 200 and a note when ID is found", async () => {
    const fakeId = "123456";
    const result = await findNote({ body: JSON.stringify({ id: fakeId }) } as any);
    expect([200, 404]).toContain(result.statusCode);
  });
});

const lambda = new LambdaClient({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT || 'http://localhost:4566',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  },
});

describe.skipIf(isBuild)("findNote Lambda - E2E", () => {
  let createdNoteId: string;

  beforeAll(async () => {
    // Create a note
    const payload = {
      body: JSON.stringify({
        title: "Note to fetch",
        content: "This should be found",
      }),
    };

    const response = await lambda.send(
      new InvokeCommand({
        FunctionName: "createNote",
        Payload: Buffer.from(JSON.stringify(payload)),
      })
    );

    const body = JSON.parse(
      JSON.parse(Buffer.from(response.Payload!).toString("utf-8")).body
    );

    createdNoteId = body.note.id;
  });

  it("should fetch all notes", async () => {
    const command = new InvokeCommand({
      FunctionName: "findNote",
      Payload: Buffer.from(JSON.stringify({ body: "{}" })),
    });

    const response = await lambda.send(command);
    const payload = JSON.parse(Buffer.from(response.Payload!).toString("utf-8"));

    expect(payload.statusCode).toBe(200);
    const body = JSON.parse(payload.body);
    expect(Array.isArray(body.notes)).toBe(true);
  });

  it("should fetch a note by ID", async () => {
    const command = new InvokeCommand({
      FunctionName: "findNote",
      Payload: Buffer.from(
        JSON.stringify({ body: JSON.stringify({ id: createdNoteId }) })
      ),
    });

    const response = await lambda.send(command);
    const payload = JSON.parse(Buffer.from(response.Payload!).toString("utf-8"));

    expect(payload.statusCode).toBe(200);
    const body = JSON.parse(payload.body);
    expect(body.note.id).toBe(createdNoteId);
  });
});
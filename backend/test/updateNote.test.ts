// test/updateNote.test.ts
import { handler as updateNote } from '../functions/updateNote';
import { handler as createNote } from '../functions/createNote';
import { describe, it, expect } from 'vitest';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import dotenv from 'dotenv';

dotenv.config();
console.log(process.env.AWS_REGION)
console.log(process.env.AWS_ENDPOINT_LOCALSTACK);

describe('updateNote Lambda', () => {
  it('should update a note and return updated note', async () => {
    // First, create a note
    const createResult = await createNote({
      body: JSON.stringify({ title: 'Original', content: 'Initial content' }),
    } as any);

    const createdNote = JSON.parse(createResult.body).note;

    // Then, update that note
    const updateEvent = {
      body: JSON.stringify({
        id: createdNote.id,
        title: 'Updated',
        content: 'Updated content',
      }),
    };

    const result = await updateNote(updateEvent as any);

    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);   
    expect(body.message).toBe('Note updated!');
    expect(body.note.title).toBe('Updated');
    expect(body.note.content).toBe('Updated content');
  });
});

const isBuild = process.env.BUILD === 'true';

const lambda = new LambdaClient({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  },
});

describe.skipIf(isBuild)('updateNote Lambda - E2E', () => {
  it('should update a note successfully', async () => {
    // Step 1: Create note
    const createPayload = {
      body: JSON.stringify({ title: 'Note to Update', content: 'Old Content' }),
    };

    const createCommand = new InvokeCommand({
      FunctionName: 'createNote',
      Payload: Buffer.from(JSON.stringify(createPayload)),
    });

    const createResponse = await lambda.send(createCommand);
    const createdNote = JSON.parse(
      JSON.parse(Buffer.from(createResponse.Payload!).toString('utf-8')).body
    ).note;

    // Step 2: Update the note
    const updatePayload = {
      body: JSON.stringify({
        id: createdNote.id,
        title: 'Updated Title',
        content: 'Updated Content',
      }),
    };

    const updateCommand = new InvokeCommand({
      FunctionName: 'updateNote',
      Payload: Buffer.from(JSON.stringify(updatePayload)),
    });

    const updateResponse = await lambda.send(updateCommand);
    const updatePayloadResponse = JSON.parse(
      Buffer.from(updateResponse.Payload!).toString('utf-8')
    );

    expect(updatePayloadResponse.statusCode).toBe(200);
    const updatedBody = JSON.parse(updatePayloadResponse.body);

    expect(updatedBody.message).toBe('Note updated!');
    expect(updatedBody.note.id).toBe(createdNote.id);
    expect(updatedBody.note.title).toBe('Updated Title');
    expect(updatedBody.note.content).toBe('Updated Content');
  });
});

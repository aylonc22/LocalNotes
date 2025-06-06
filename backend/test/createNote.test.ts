import { handler as createNote } from '../functions/createNote';
import { describe, it, expect } from 'vitest';

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

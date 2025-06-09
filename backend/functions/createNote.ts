import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda'
import { ddb } from '../lib/dynamoClient';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const { title, content } = JSON.parse(event.body || '{}')

  // In a real app, you'd save to DynamoDB here
  const note = {
    id: Date.now().toString(),
    title,
    content,
    createdAt: new Date().toISOString()
  }

  await ddb.send(new PutCommand({
    TableName:'NotesTable',
    Item:note
  }))

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Note created!',
      note
    })
  }
}

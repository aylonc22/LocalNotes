import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda'
import { ddb } from '../lib/dynamoClient';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { withCors } from '../lib/withCors';

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const { title, content } = JSON.parse(event.body || '{}')

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

  return withCors(200, {
      message: 'Note created!',
      note})
 
}

import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ddb } from '../lib/dynamoClient';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ReturnValue } from '@aws-sdk/client-dynamodb';
import { withCors } from '../lib/withCors';

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    const { title, content } = JSON.parse(event.body || '{}');

    if (!id) {
      return withCors(400, { message: 'Missing required field: id' });
    }

    let updateExpression = 'set ';
    const ExpressionAttributeNames: Record<string, string> = {};
    const ExpressionAttributeValues: Record<string, any> = {};

    if (title !== undefined) {
      updateExpression += '#title = :title, ';
      ExpressionAttributeNames['#title'] = 'title';
      ExpressionAttributeValues[':title'] = title;
    }

    if (content !== undefined) {
      updateExpression += '#content = :content, ';
      ExpressionAttributeNames['#content'] = 'content';
      ExpressionAttributeValues[':content'] = content;
    }

    if (updateExpression === 'set ') {
      return withCors(400, { message: 'No fields to update' });
    }

    updateExpression += '#updatedAt = :updatedAt';
    ExpressionAttributeNames['#updatedAt'] = 'updatedAt';
    ExpressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const params = {
      TableName: 'NotesTable',
      Key: { id },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: ReturnValue.ALL_NEW,
    };

    const result = await ddb.send(new UpdateCommand(params));

    return withCors(200, {
      message: 'Note updated!',
      note: result.Attributes,
    });
  } catch (error: any) {
    return withCors(500, {
      message: 'Could not update note',
      error: error.message,
    });
  }
};

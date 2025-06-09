import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda'
import { ddb } from '../lib/dynamoClient';
import { UpdateCommand  } from '@aws-sdk/lib-dynamodb';
import { ReturnValue } from "@aws-sdk/client-dynamodb";

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { id, title, content } = JSON.parse(event.body || '{}')

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required field: id' })
      }
    }

    // Build the UpdateExpression dynamically, depending on which fields were passed
    let updateExpression = 'set '
    const ExpressionAttributeNames: Record<string, string> = {}
    const ExpressionAttributeValues: Record<string, any> = {}

    if (title !== undefined) {
      updateExpression += '#title = :title, '
      ExpressionAttributeNames['#title'] = 'title'
      ExpressionAttributeValues[':title'] = title
    }
    if (content !== undefined) {
      updateExpression += '#content = :content, '
      ExpressionAttributeNames['#content'] = 'content'
      ExpressionAttributeValues[':content'] = content
    }

    if (updateExpression === 'set ') {
      // nothing to update
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'No fields to update' }),
      }
    }

    // Remove trailing comma and space
    updateExpression = updateExpression.slice(0, -2)

    // Add updatedAt timestamp
    updateExpression += ', #updatedAt = :updatedAt'
    ExpressionAttributeNames['#updatedAt'] = 'updatedAt'
    ExpressionAttributeValues[':updatedAt'] = new Date().toISOString()

    const params = {
      TableName: 'NotesTable',
      Key: { id },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: ReturnValue.ALL_NEW,  // returns the updated item
    }

    const result = await ddb.send(new UpdateCommand(params))

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Note updated!',
        note: result.Attributes
      })
    }
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Could not update note',
        error: error.message,
      }),
    }
  }
}

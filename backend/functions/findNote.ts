import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { ddb } from "../lib/dynamoClient";
import { GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = JSON.parse(event.body || "{}");

    if (id) {
      const result = await ddb.send(
        new GetCommand({
          TableName: "NotesTable",
          Key: { id },
        })
      );

      if (!result.Item) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: `Note with id ${id} not found.` }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ note: result.Item }),
      };
    } else {
      const result = await ddb.send(
        new ScanCommand({
          TableName: "NotesTable",
        })
      );

      return {
        statusCode: 200,
        body: JSON.stringify({ notes: result.Items || [] }),
      };
    }
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "An error occurred.",
        error: error.message || error,
      }),
    };
  }
};

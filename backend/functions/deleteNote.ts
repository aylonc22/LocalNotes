import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { ddb } from "../lib/dynamoClient";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const { id } = JSON.parse(event.body || "{}");

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing 'id' in request body" }),
    };
  }

  await ddb.send(
    new DeleteCommand({
      TableName: "NotesTable",
      Key: { id },
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Note with id ${id} deleted.` }),
  };
};

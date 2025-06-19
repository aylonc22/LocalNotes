import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { ddb } from "../lib/dynamoClient";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { withCors } from "../lib/withCors";

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  if (!id) {
    console.error("Missing id:", event.pathParameters);
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

  return withCors(200,
    { message: `Note with id ${id} deleted.` });
};

import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { ddb } from "../lib/dynamoClient";
import { GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { withCors } from "../lib/withCors";

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  try {
   const id = event.pathParameters?.id;
   
    if (id) {
      console.log('here');
      const result = await ddb.send(
        new GetCommand({
          TableName: "NotesTable",
          Key: { id },
        })
      );
     
      if (!result.Item) {
        console.log(result)
        return withCors(404, { message: `Note with id ${id} not found.` });
      }
      return withCors(200, { note: result.Item });
    } else {      
      const result = await ddb.send(
        new ScanCommand({
          TableName: "NotesTable",
        })
      );

      return withCors(200, { notes: result.Items || [] });
    }
  } catch (error: any) {
    return withCors(500, {
      message: "An error occurred.",
      error: error.message || error,
    });
  }
};

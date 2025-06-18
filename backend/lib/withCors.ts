export function withCors(statusCode: number, data: any) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*", // or specific origin
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(data),
  };
}
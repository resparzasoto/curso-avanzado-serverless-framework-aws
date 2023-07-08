import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';

const hello = async (
  _request: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const hours = new Date().getUTCHours();
  const minutes = new Date().getUTCMinutes();
  const seconds = new Date().getUTCSeconds();

  const response: APIGatewayProxyResult = {
    statusCode: 200,
    body: JSON.stringify({
      message: `Current time in UTC: ${hours}:${minutes}:${seconds}!`,
    }),
  };

  return response;
};

export { hello };

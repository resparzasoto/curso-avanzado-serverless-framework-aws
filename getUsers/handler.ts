import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
} from '@aws-sdk/lib-dynamodb';

let ddbClientConfig: DynamoDBClientConfig = {
  region: process.env.AWS_REGION,
};

if (process.env.IS_OFFLINE) {
  ddbClientConfig = {
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    credentials: {
      accessKeyId: 'MockAccessKeyId',
      secretAccessKey: 'MockSecretAccessKey',
    },
  };
  process.env.USERS_TABLE_NAME = 'Users';
}

const ddbClient = new DynamoDBClient(ddbClientConfig);
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const getUsers = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  if (id === undefined) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'user id not provided' }),
    };
  }

  const params: GetCommandInput = {
    TableName: process.env.USERS_TABLE_NAME,
    Key: {
      id,
    },
  };

  const result = await ddbDocClient.send(new GetCommand(params));

  if (result.Item === undefined) {
    return {
      statusCode: 204,
      body: JSON.stringify({ message: 'user not found' }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: result.Item }),
  };
};

export { getUsers };

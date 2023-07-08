import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  PutCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

let ddbClientConfig: DynamoDBClientConfig = {
  region: process.env.AWS_REGION,
};

if (process.env.IS_OFFLINE) {
  ddbClientConfig = {
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    credentials: {
      accessKeyId: 'DUMMY_AWS_ACCESS_KEY_ID',
      secretAccessKey: 'DUMMY_AWS_SECRET_ACCESS_KEY',
    },
  };
  process.env.USERS_TABLE_NAME = 'Users';
}

const ddbClient = new DynamoDBClient(ddbClientConfig);
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const createUsers = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'user not provided' }),
    };
  }

  const user = JSON.parse(event.body);
  user.id = randomUUID();

  const params: PutCommandInput = {
    TableName: process.env.USERS_TABLE_NAME,
    Item: user,
  };

  console.info(`user to create: ${JSON.stringify(params.Item)}`);

  await ddbDocClient.send(new PutCommand(params));

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: `user created with id: ${params.Item!.id}`,
    }),
  };
};

export { createUsers };

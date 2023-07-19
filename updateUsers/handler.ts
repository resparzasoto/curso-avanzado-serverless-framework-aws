import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  PutCommandInput,
} from '@aws-sdk/lib-dynamodb';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';

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

const updateUsers = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  if (!event.pathParameters?.id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'id parameter not provided' }),
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'body not provided' }),
    };
  }

  const user = JSON.parse(event.body);
  const id = event.pathParameters.id;

  if (user.id !== id) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'the parameter id is not equal to body id',
      }),
    };
  }

  const params: PutCommandInput = {
    TableName: process.env.USERS_TABLE_NAME,
    Item: user,
  };

  console.log(`user to update: ${JSON.stringify(params.Item)}`);

  await ddbDocClient.send(new PutCommand(params));

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: params.Item,
    }),
  };
};

export { updateUsers };

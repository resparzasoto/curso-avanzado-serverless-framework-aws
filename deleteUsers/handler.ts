import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DeleteCommandInput,
  DynamoDBDocumentClient,
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
      secretAccessKey: 'DUMMY_AWS_SECRET_ACCESS_KEY ',
    },
  };
  process.env.USERS_TABLE_NAME = 'Users';
}

const ddbClient = new DynamoDBClient(ddbClientConfig);
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const deleteUsers = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  if (id === undefined) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'id parameter not provided' }),
    };
  }

  const params: DeleteCommandInput = {
    TableName: process.env.USERS_TABLE_NAME,
    Key: {
      id,
    },
  };

  console.info(`user to delete: ${id}`);

  await ddbDocClient.send(new DeleteCommand(params));

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `user ${id} deleted` }),
  };
};

export { deleteUsers };

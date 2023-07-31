import { Context, SQSEvent } from 'aws-lambda';
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  UpdateCommandInput,
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

const likeUser = async (event: SQSEvent, _context: Context) => {
  console.info('event:', JSON.stringify(event, null, 2));

  const body = event.Records[0].body;
  console.info('body:', JSON.stringify(body, null, 2));

  const { id } = JSON.parse(body);
  console.info('id:', id);

  if (!id) {
    throw new Error('id is required');
  }

  const commandInput: UpdateCommandInput = {
    TableName: 'Users',
    Key: {
      id,
    },
    UpdateExpression: 'ADD likes :inc',
    ExpressionAttributeValues: {
      ':inc': 1,
    },
    ReturnValues: 'ALL_NEW',
  };
  console.info('commandInput:', JSON.stringify(commandInput, null, 2));

  const commandOutput = await ddbDocClient.send(
    new UpdateCommand(commandInput)
  );
  console.info('commandOutput:', JSON.stringify(commandOutput, null, 2));
};

export { likeUser };

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';

const signedUrl = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const { filename } = event.queryStringParameters!;
  const s3Client = new S3Client({});

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `uploads/${filename}`,
  });
  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 300,
  });

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: `${filename} presigned url generated`,
      url: `${presignedUrl}`,
    }),
  };
  console.log('Response:', JSON.stringify(response, null, 2));

  return response;
};

export { signedUrl };

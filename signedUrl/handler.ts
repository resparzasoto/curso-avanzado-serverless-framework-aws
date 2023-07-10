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
  const { filename } = event.queryStringParameters!;

  const client = new S3Client({});
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `public/${filename}`,
  });
  const presignedUrl = await getSignedUrl(client, command, { expiresIn: 300 });

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `${filename} presigned url generated`,
      url: `${presignedUrl}`,
    }),
  };
};

export { signedUrl };

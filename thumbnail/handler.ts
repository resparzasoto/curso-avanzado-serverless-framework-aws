import {
  GetObjectCommand,
  GetObjectCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Context, S3CreateEvent } from 'aws-lambda';
import sharp from 'sharp';
import { Readable } from 'stream';
import util from 'util';

const s3 = new S3Client({});

const generator = async (event: S3CreateEvent, _context: Context) => {
  console.log(
    'Reading options from event:\n',
    util.inspect(event, { depth: 5 })
  );

  const srcBucket = event.Records[0].s3.bucket.name;
  console.log('srcBucket:', event.Records[0].s3.bucket.name);

  const srcKey = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, ' ')
  );
  console.log('srcKey:', srcKey);

  const typeMatch = srcKey.match(/\.([^.]*)$/);
  if (!typeMatch) {
    console.log('Could not determine the image type.');
    return;
  }
  console.log('typeMatch:', typeMatch[1]);

  const imageType = typeMatch[1].toLowerCase();
  if (imageType !== 'jpg' && imageType !== 'png') {
    console.log(`Unsupported image type: ${imageType}`);
    return;
  }
  console.log('imageType:', imageType);

  let contentBuffer = null;
  try {
    const params: GetObjectCommandInput = {
      Bucket: srcBucket,
      Key: srcKey,
    };

    const originImage = await s3.send(new GetObjectCommand(params));
    console.log('originImage:', originImage);

    if (!(originImage.Body instanceof Readable)) {
      throw new Error('Unknown object stream type');
    }

    contentBuffer = await originImage.Body.transformToByteArray();
  } catch (error) {
    console.log(error);
    return;
  }

  const widths = [50, 100, 200];

  for (const width of widths) {
    await resize(contentBuffer, width, srcBucket, srcKey);
  }
};

const resize = async (
  imgBody: Uint8Array,
  newSize: number,
  destBucket: any,
  fileKey: string
) => {
  const filename = fileKey.split('/')[1];
  const destKey = `resized/${newSize}-${filename}`;
  console.log('filename:', filename);
  console.log('destKey:', destKey);

  let buffer = null;
  try {
    buffer = await sharp(imgBody).resize(newSize).toBuffer();
  } catch (error) {
    console.log(error);
    return;
  }

  try {
    const destParams: PutObjectCommandInput = {
      Bucket: destBucket,
      Key: destKey,
      Body: buffer,
      ContentType: 'image',
    };
    console.log('destParams:', JSON.stringify(destParams));

    await s3.send(new PutObjectCommand(destParams));
  } catch (error) {
    console.log(error);
    return;
  }

  console.log(
    `Successfully resized ${destBucket} / ${fileKey} and uploaded to ${destBucket} / ${destKey}`
  );
};

export { generator };

import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
  Context,
} from 'aws-lambda';
import * as jwt from 'jsonwebtoken';

const authorizer = async (
  event: APIGatewayTokenAuthorizerEvent,
  _context: Context
): Promise<APIGatewayAuthorizerResult> => {
  try {
    const [type, token] = event.authorizationToken.split(' ');
    console.info('type:', type);
    console.info('token:', token);

    if (type !== 'Bearer') {
      throw new Error('Token malformed');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (typeof decoded.sub !== 'string') {
      throw new Error('Sub claim malformed');
    }

    const { sub } = decoded;
    console.info('sub:', sub);

    return {
      principalId: sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn,
          },
        ],
      },
    };
  } catch (error) {
    const e = error as Error;

    console.error(
      'error:',
      JSON.stringify(
        {
          name: e.name,
          message: e.message,
          cause: e.cause,
          stack: e.stack,
        },
        undefined,
        2
      )
    );

    throw new Error('Unauthorized');
  }
};

export { authorizer };

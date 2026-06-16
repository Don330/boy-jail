import { randomUUID } from 'node:crypto';
import type { Schema } from '../../data/resource';
import {
  CognitoIdentityProviderClient,
  CreateGroupCommand,
  AdminAddUserToGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const cognito = new CognitoIdentityProviderClient();
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient());

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const handler: Schema['startJail']['functionHandler'] = async (event) => {
  const name = event.arguments.name?.trim();
  if (!name) throw new Error('Jail name is required');

  const sub = event.identity && 'sub' in event.identity ? event.identity.sub : null;
  if (!sub) throw new Error('Unauthenticated');

  const userPoolId = process.env.USER_POOL_ID;
  const jailTable = process.env.JAIL_TABLE_NAME;
  const memberTable = process.env.MEMBER_TABLE_NAME;
  if (!userPoolId || !jailTable || !memberTable) {
    throw new Error('Missing required environment configuration');
  }

  const jailId = randomUUID();
  const jailGroup = `jail-${jailId}`;
  const inviteCode = generateInviteCode();
  const now = new Date().toISOString();

  await cognito.send(
    new CreateGroupCommand({ UserPoolId: userPoolId, GroupName: jailGroup }),
  );
  await cognito.send(
    new AdminAddUserToGroupCommand({
      UserPoolId: userPoolId,
      Username: sub,
      GroupName: jailGroup,
    }),
  );

  const jailItem = {
    id: jailId,
    name,
    inviteCode,
    createdBy: sub,
    jailGroup,
    visibility: 'private' as const,
    __typename: 'Jail',
    createdAt: now,
    updatedAt: now,
  };

  await ddb.send(new PutCommand({ TableName: jailTable, Item: jailItem }));

  await ddb.send(
    new PutCommand({
      TableName: memberTable,
      Item: {
        id: randomUUID(),
        jailId,
        userId: sub,
        joinedAt: now,
        jailGroup,
        __typename: 'JailMember',
        createdAt: now,
        updatedAt: now,
      },
    }),
  );

  return jailItem;
};

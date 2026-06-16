import { randomUUID } from 'node:crypto';
import type { Schema } from '../../data/resource';
import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

const cognito = new CognitoIdentityProviderClient();
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient());

export const handler: Schema['joinJail']['functionHandler'] = async (event) => {
  const inviteCode = event.arguments.inviteCode?.trim().toUpperCase();
  if (!inviteCode) throw new Error('Invite code is required');

  const sub = event.identity && 'sub' in event.identity ? event.identity.sub : null;
  if (!sub) throw new Error('Unauthenticated');

  const userPoolId = process.env.USER_POOL_ID;
  const jailTable = process.env.JAIL_TABLE_NAME;
  const memberTable = process.env.MEMBER_TABLE_NAME;
  const jailByInviteIndex = process.env.JAIL_INVITE_INDEX_NAME;
  if (!userPoolId || !jailTable || !memberTable || !jailByInviteIndex) {
    throw new Error('Missing required environment configuration');
  }

  const jails = await ddb.send(
    new QueryCommand({
      TableName: jailTable,
      IndexName: jailByInviteIndex,
      KeyConditionExpression: 'inviteCode = :code',
      ExpressionAttributeValues: { ':code': inviteCode },
      Limit: 1,
    }),
  );

  const jail = jails.Items?.[0];
  if (!jail) throw new Error('No jail found with that invite code');

  const jailGroup = jail.jailGroup as string;
  const jailId = jail.id as string;

  await cognito.send(
    new AdminAddUserToGroupCommand({
      UserPoolId: userPoolId,
      Username: sub,
      GroupName: jailGroup,
    }),
  );

  const now = new Date().toISOString();
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

  return {
    id: jailId,
    name: jail.name as string,
    inviteCode: jail.inviteCode as string,
    createdBy: jail.createdBy as string,
    jailGroup,
    visibility: (jail.visibility as 'private' | 'public') ?? 'private',
    createdAt: jail.createdAt as string,
    updatedAt: jail.updatedAt as string,
  };
};

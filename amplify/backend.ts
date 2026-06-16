import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { createJail } from './functions/create-jail/resource';
import { joinJail } from './functions/join-jail/resource';
import { addBoy } from './functions/add-boy/resource';

const backend = defineBackend({
  auth,
  data,
  createJail,
  joinJail,
  addBoy,
});

const userPool = backend.auth.resources.userPool;
const jailTable = backend.data.resources.tables.Jail;
const memberTable = backend.data.resources.tables.JailMember;

const jailByInviteIndexName = 'jailsByInviteCode';

for (const fn of [backend.createJail, backend.joinJail]) {
  fn.addEnvironment('USER_POOL_ID', userPool.userPoolId);
  fn.addEnvironment('JAIL_TABLE_NAME', jailTable.tableName);
  fn.addEnvironment('MEMBER_TABLE_NAME', memberTable.tableName);

  fn.resources.lambda.addToRolePolicy(
    new PolicyStatement({
      actions: ['cognito-idp:CreateGroup', 'cognito-idp:AdminAddUserToGroup'],
      resources: [userPool.userPoolArn],
    }),
  );

  jailTable.grantReadWriteData(fn.resources.lambda);
  memberTable.grantReadWriteData(fn.resources.lambda);
}

backend.joinJail.addEnvironment('JAIL_INVITE_INDEX_NAME', jailByInviteIndexName);
backend.joinJail.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:Query'],
    resources: [`${jailTable.tableArn}/index/${jailByInviteIndexName}*`],
  }),
);

// The add-boy Lambda's data access is granted via `allow.resource(addBoy)` in
// the schema. Amplify auto-injects AMPLIFY_DATA_DEFAULT_NAME, the GraphQL
// endpoint, and the S3 bucket/key holding the model introspection schema, plus
// the necessary IAM. Lambda calls AppSync via IAM so subscriptions still fire.

// Enable DynamoDB TTL on the Presence table — the client writes `ttl` as the
// epoch second at which a heartbeat should be considered abandoned, and
// DynamoDB sweeps those records eventually (within ~48h).
backend.data.resources.cfnResources.amplifyDynamoDbTables['Presence'].timeToLiveAttribute = {
  attributeName: 'ttl',
  enabled: true,
};

import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * Boy Jail data schema — see DESIGN.md for the full design.
 *
 * v1 authorization model: Cognito-authenticated users can read/create/update
 * across models, with delete restricted to record owners. Per-jail read
 * scoping is enforced client-side by filtering on `jailId`. Proper
 * server-side jail-scoping (custom resolvers, Cognito groups) is deferred
 * to a later phase — acceptable for a "trusted friends" MVP.
 */
const schema = a.schema({
  Jail: a
    .model({
      name: a.string().required(),
      inviteCode: a.string().required(),
      createdBy: a.string().required(),
      members: a.hasMany('JailMember', 'jailId'),
      boys: a.hasMany('Boy', 'jailId'),
      events: a.hasMany('Event', 'jailId'),
    })
    .secondaryIndexes((index) => [index('inviteCode')])
    .authorization((allow) => [
      allow.authenticated().to(['create', 'read', 'update']),
      allow.ownerDefinedIn('createdBy').to(['delete']),
    ]),

  JailMember: a
    .model({
      jailId: a.id().required(),
      userId: a.string().required(),
      joinedAt: a.datetime().required(),
      jail: a.belongsTo('Jail', 'jailId'),
    })
    .authorization((allow) => [
      allow.authenticated().to(['create', 'read']),
      allow.ownerDefinedIn('userId').to(['delete']),
    ]),

  Room: a
    .model({
      name: a.string().required(),
      x: a.float().required(),
      y: a.float().required(),
      width: a.float().required(),
      height: a.float().required(),
      capacity: a.integer(),
      acceptsBoys: a.boolean().required().default(true),
    })
    .authorization((allow) => [allow.authenticated().to(['read'])]),

  Boy: a
    .model({
      jailId: a.id().required(),
      name: a.string().required(),
      emoji: a.string().required(),
      imageUrl: a.string(),
      sentenceRoom: a.enum([
        'max',
        'general',
        'psych',
        'death',
        'solitary',
        'processing',
        'kitchen',
        'yard',
        'dayRelease',
      ]),
      severity: a.enum(['petty', 'misdemeanor', 'felony', 'capital']),
      crime: a.string().required(),
      roomId: a.id().required(),
      addedBy: a.string().required(),
      jail: a.belongsTo('Jail', 'jailId'),
    })
    .authorization((allow) => [
      allow.authenticated().to(['create', 'read', 'update']),
      allow.ownerDefinedIn('addedBy').to(['delete']),
    ]),

  Event: a
    .model({
      jailId: a.id().required(),
      actorUserId: a.string().required(),
      action: a.enum(['create', 'move', 'delete']),
      targetBoyId: a.id().required(),
      fromRoomId: a.id(),
      toRoomId: a.id(),
      jail: a.belongsTo('Jail', 'jailId'),
    })
    .authorization((allow) => [
      allow.authenticated().to(['create', 'read']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});

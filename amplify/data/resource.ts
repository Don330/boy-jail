import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { createJail } from '../functions/create-jail/resource';
import { joinJail } from '../functions/join-jail/resource';
import { addBoy } from '../functions/add-boy/resource';

/**
 * Boy Jail data schema — see DESIGN.md for the full design.
 *
 * Authorization model (V2 Batch 1):
 * Each per-jail record carries a `jailGroup` string of the form `jail-<jailId>`.
 * Access is gated by membership in the matching Cognito group, populated by the
 * `createJail` and `joinJail` Lambdas. Owner-delete rules let a user delete
 * their own Boys and leave a jail (by deleting their own JailMember).
 *
 * Room is global / seeded, so it stays on `allow.authenticated()`.
 *
 * Jail.visibility is a placeholder for a future public-read mode — when set to
 * `public`, a custom resolver will permit unauthenticated reads of the jail and
 * its boys without breaking the current member-only rules.
 */
const schema = a.schema({
  Jail: a
    .model({
      name: a.string().required(),
      inviteCode: a.string().required(),
      createdBy: a.string().required(),
      jailGroup: a.string().required(),
      visibility: a.enum(['private', 'public']),
      members: a.hasMany('JailMember', 'jailId'),
      boys: a.hasMany('Boy', 'jailId'),
      events: a.hasMany('Event', 'jailId'),
    })
    .secondaryIndexes((index) => [index('inviteCode')])
    .authorization((allow) => [
      allow.groupDefinedIn('jailGroup').to(['read', 'update']),
      allow.ownerDefinedIn('createdBy').to(['delete']),
    ]),

  JailMember: a
    .model({
      jailId: a.id().required(),
      userId: a.string().required(),
      joinedAt: a.datetime().required(),
      jailGroup: a.string().required(),
      jail: a.belongsTo('Jail', 'jailId'),
    })
    .authorization((allow) => [
      allow.groupDefinedIn('jailGroup').to(['read']),
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
    .authorization((allow) => [allow.authenticated()]),

  Boy: a
    .model({
      jailId: a.id().required(),
      jailGroup: a.string().required(),
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
      addedByName: a.string(),
      jail: a.belongsTo('Jail', 'jailId'),
    })
    .authorization((allow) => [
      allow.groupDefinedIn('jailGroup').to(['read', 'update']),
      allow.ownerDefinedIn('addedBy').to(['delete']),
    ]),

  Event: a
    .model({
      jailId: a.id().required(),
      jailGroup: a.string().required(),
      actorUserId: a.string().required(),
      actorName: a.string(),
      action: a.enum(['create', 'move', 'delete', 'edit']),
      targetBoyId: a.id().required(),
      fromRoomId: a.id(),
      toRoomId: a.id(),
      jail: a.belongsTo('Jail', 'jailId'),
    })
    .authorization((allow) => [
      allow.groupDefinedIn('jailGroup').to(['create', 'read']),
    ]),

  Presence: a
    .model({
      jailId: a.id().required(),
      jailGroup: a.string().required(),
      userId: a.string().required(),
      lastSeen: a.datetime().required(),
      ttl: a.integer(),
    })
    .authorization((allow) => [
      allow.groupDefinedIn('jailGroup'),
    ]),

  startJail: a
    .mutation()
    .arguments({ name: a.string().required() })
    .returns(a.ref('Jail'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(createJail)),

  joinJail: a
    .mutation()
    .arguments({ inviteCode: a.string().required() })
    .returns(a.ref('Jail'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(joinJail)),

  addBoy: a
    .mutation()
    .arguments({
      jailId: a.id().required(),
      name: a.string().required(),
      emoji: a.string().required(),
      crime: a.string().required(),
      severity: a.string(),
      sentenceRoom: a.string(),
      roomId: a.id().required(),
      addedByName: a.string(),
    })
    .returns(a.ref('Boy'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(addBoy)),
}).authorization((allow) => [allow.resource(addBoy)]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});

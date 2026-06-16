import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import type { Schema } from '../../data/resource';

// We set AMPLIFY_DATA_DEFAULT_NAME ourselves in backend.ts because grantMutation
// doesn't auto-inject it. Cast process.env to the shape the helper expects.
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
  process.env as unknown as Parameters<typeof getAmplifyDataClientConfig>[0],
);
Amplify.configure(resourceConfig, libraryOptions);

const dataClient = generateClient<Schema>();

type Identity = { sub: string; groups: string[] };

function getIdentity(event: { identity?: unknown }): Identity {
  const id = event.identity as
    | { sub?: string; groups?: string[]; claims?: Record<string, unknown> }
    | null
    | undefined;
  if (!id || typeof id.sub !== 'string') throw new Error('Unauthenticated');
  const groupsClaim = id.claims?.['cognito:groups'];
  const groups = Array.isArray(id.groups)
    ? id.groups
    : Array.isArray(groupsClaim)
      ? (groupsClaim as string[])
      : [];
  return { sub: id.sub, groups };
}

type SentenceRoom =
  | 'max' | 'general' | 'psych' | 'death' | 'solitary'
  | 'processing' | 'kitchen' | 'yard' | 'dayRelease';
type Severity = 'petty' | 'misdemeanor' | 'felony' | 'capital';

export const handler: Schema['addBoy']['functionHandler'] = async (event) => {
  const {
    jailId, name, emoji, crime, severity, sentenceRoom, roomId, addedByName,
  } = event.arguments;
  if (!jailId || !name || !emoji || !crime || !roomId) {
    throw new Error('Missing required boy fields');
  }

  const { sub, groups } = getIdentity(event);
  const jailGroup = `jail-${jailId}`;
  if (!groups.includes(jailGroup)) {
    throw new Error('Not a member of this jail');
  }

  const displayName = addedByName?.trim() || sub;

  const { data: boy, errors: boyErrors } = await dataClient.models.Boy.create({
    jailId,
    jailGroup,
    name: name.trim(),
    emoji: emoji.trim(),
    crime: crime.trim(),
    severity: (severity ?? null) as Severity | null,
    sentenceRoom: (sentenceRoom ?? null) as SentenceRoom | null,
    roomId,
    addedBy: sub,
    addedByName: displayName,
  });
  if (boyErrors?.length || !boy) {
    throw new Error(boyErrors?.[0]?.message ?? 'Failed to create boy');
  }

  await dataClient.models.Event.create({
    jailId,
    jailGroup,
    actorUserId: sub,
    actorName: displayName,
    action: 'create',
    targetBoyId: boy.id,
    fromRoomId: null,
    toRoomId: roomId,
  });

  return boy;
};

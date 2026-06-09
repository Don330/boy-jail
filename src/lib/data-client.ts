'use client';

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

/**
 * Typed AppSync client. Use this for every GraphQL operation:
 *   const { data } = await client.models.Boy.list({ filter: { jailId: { eq: id } } });
 *   const sub = client.models.Boy.onCreate({ filter: ... }).subscribe(...);
 */
export const client = generateClient<Schema>();

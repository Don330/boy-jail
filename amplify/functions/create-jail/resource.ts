import { defineFunction } from '@aws-amplify/backend';

export const createJail = defineFunction({
  name: 'create-jail',
  entry: './handler.ts',
  timeoutSeconds: 15,
  resourceGroupName: 'data',
});

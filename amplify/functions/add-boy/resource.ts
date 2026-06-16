import { defineFunction } from '@aws-amplify/backend';

export const addBoy = defineFunction({
  name: 'add-boy',
  entry: './handler.ts',
  timeoutSeconds: 15,
  resourceGroupName: 'data',
});

import { defineAuth } from '@aws-amplify/backend';

/**
 * Boy Jail auth config.
 *
 * Phase 1: email + password only (works against sandbox with zero setup).
 *
 * Phase 2 (when adding Google federation):
 * 1. Create OAuth client in Google Cloud Console
 * 2. Run: npx ampx sandbox secret set GOOGLE_CLIENT_ID
 *         npx ampx sandbox secret set GOOGLE_CLIENT_SECRET
 * 3. Uncomment the externalProviders block below and the `secret` import
 *
 * import { defineAuth, secret } from '@aws-amplify/backend';
 *
 * externalProviders: {
 *   google: {
 *     clientId: secret('GOOGLE_CLIENT_ID'),
 *     clientSecret: secret('GOOGLE_CLIENT_SECRET'),
 *     scopes: ['email', 'profile', 'openid'],
 *   },
 *   callbackUrls: ['http://localhost:3000/', '<PROD_URL>/'],
 *   logoutUrls: ['http://localhost:3000/', '<PROD_URL>/'],
 * },
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
});

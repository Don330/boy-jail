'use client';

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import outputs from '../../amplify_outputs.json';

// Side-effect: configure Amplify on the client before any GraphQL call.
// `ssr: true` enables the Next.js adapter and httpOnly cookie token storage.
Amplify.configure(outputs, { ssr: true });

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  return <Authenticator.Provider>{children}</Authenticator.Provider>;
}

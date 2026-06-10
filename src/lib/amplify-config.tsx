'use client';

import '@/lib/amplify-setup';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  return <Authenticator.Provider>{children}</Authenticator.Provider>;
}

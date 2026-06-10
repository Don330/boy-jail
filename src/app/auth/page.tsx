'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';

function AuthRedirect() {
  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);
  const router = useRouter();

  useEffect(() => {
    if (authStatus === 'authenticated') {
      router.replace('/');
    }
  }, [authStatus, router]);

  return null;
}

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-zinc-900">
          Boy Jail
        </h1>
        <Authenticator>
          <AuthRedirect />
        </Authenticator>
      </div>
    </div>
  );
}

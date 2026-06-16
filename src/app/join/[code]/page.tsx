'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchAuthSession } from 'aws-amplify/auth';
import { client } from '@/lib/data-client';

export default function JoinPage() {
  const router = useRouter();
  const { code } = useParams<{ code: string }>();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function join() {
      try {
        const { data: jail, errors } = await client.mutations.joinJail({
          inviteCode: code.toUpperCase(),
        });
        if (errors?.length || !jail) {
          setError(errors?.[0]?.message ?? 'No jail found with that invite code.');
          setStatus('error');
          return;
        }

        // Force a new ID token so the newly-granted jail group claim is on the
        // next GraphQL call. Without this, the jail page would 401 on its first
        // few queries until the token rotated naturally.
        await fetchAuthSession({ forceRefresh: true });

        router.replace(`/jail/${jail.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setStatus('error');
      }
    }

    join();
  }, [code, router]);

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center space-y-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/welcome')}
            className="text-sm text-zinc-600 underline"
          >
            Back to welcome
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <p className="text-zinc-500 text-sm">Joining jail…</p>
    </div>
  );
}

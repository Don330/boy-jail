'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCurrentUser } from 'aws-amplify/auth';
import { client } from '@/lib/data-client';

export default function JoinPage() {
  const router = useRouter();
  const { code } = useParams<{ code: string }>();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function join() {
      try {
        const { username } = await getCurrentUser();

        const { data: jails, errors } = await client.models.Jail.listByInviteCode(
          { inviteCode: code.toUpperCase() },
          { limit: 1 }
        );
        if (errors?.length || !jails?.length) {
          setError('No jail found with that invite code.');
          setStatus('error');
          return;
        }

        const jail = jails[0];

        const { data: existing } = await client.models.JailMember.list({
          filter: { jailId: { eq: jail.id }, userId: { eq: username } },
        });

        if (!existing?.length) {
          await client.models.JailMember.create({
            jailId: jail.id,
            userId: username,
            joinedAt: new Date().toISOString(),
          });
        }

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

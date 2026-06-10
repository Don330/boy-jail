'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from 'aws-amplify/auth';
import { client } from '@/lib/data-client';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    async function redirect() {
      try {
        const { username } = await getCurrentUser();

        const { data: memberships } = await client.models.JailMember.list({
          filter: { userId: { eq: username } },
          limit: 1,
        });

        if (memberships?.length) {
          router.replace(`/jail/${memberships[0].jailId}`);
        } else {
          router.replace('/welcome');
        }
      } catch {
        router.replace('/auth');
      }
    }

    redirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <p className="text-zinc-400 text-sm">Loading…</p>
    </div>
  );
}

'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { client } from '@/lib/data-client';

type Jail = { id: string; name: string; inviteCode: string };

export default function JailPage() {
  const { id } = useParams<{ id: string }>();
  const [jail, setJail] = useState<Jail | null>(null);

  useEffect(() => {
    client.models.Jail.get({ id }).then(({ data }) => {
      if (data) setJail(data);
    });
  }, [id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-zinc-900">
          {jail ? jail.name : 'Loading…'}
        </h1>
        {jail && (
          <p className="text-sm text-zinc-500">
            Invite code: <span className="font-mono font-semibold tracking-widest">{jail.inviteCode}</span>
          </p>
        )}
        <p className="text-xs text-zinc-400 pt-4">Canvas coming in Phase 3</p>
      </div>
    </div>
  );
}

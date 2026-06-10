'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { client } from '@/lib/data-client';
import { JailCanvas } from '@/components/JailCanvas';

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
    <div className="min-h-screen flex flex-col bg-zinc-100">
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-zinc-200">
        <h1 className="text-lg font-bold text-zinc-900">{jail?.name ?? 'Loading…'}</h1>
        {jail && (
          <span className="text-xs text-zinc-500">
            Invite: <span className="font-mono font-semibold tracking-widest text-zinc-700">{jail.inviteCode}</span>
          </span>
        )}
      </header>
      <main className="flex-1 p-4">
        <JailCanvas jailId={id} />
      </main>
    </div>
  );
}

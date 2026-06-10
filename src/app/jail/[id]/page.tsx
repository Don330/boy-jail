'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { client } from '@/lib/data-client';
import { JailCanvas } from '@/components/JailCanvas';
import { AddBoyModal } from '@/components/AddBoyModal';

type Jail = { id: string; name: string; inviteCode: string };

export default function JailPage() {
  const { id } = useParams<{ id: string }>();
  const [jail, setJail] = useState<Jail | null>(null);
  const [showAddBoy, setShowAddBoy] = useState(false);
  const [boyVersion, setBoyVersion] = useState(0);

  useEffect(() => {
    client.models.Jail.get({ id }).then(({ data }) => {
      if (data) setJail(data);
    });
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100">
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-zinc-200">
        <h1 className="text-lg font-bold text-zinc-900">{jail?.name ?? 'Loading…'}</h1>
        <div className="flex items-center gap-4">
          {jail && (
            <span className="text-xs text-zinc-500">
              Invite: <span className="font-mono font-semibold tracking-widest text-zinc-700">{jail.inviteCode}</span>
            </span>
          )}
          <button
            onClick={() => setShowAddBoy(true)}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            + Add Boy
          </button>
        </div>
      </header>

      <main className="flex-1 p-4">
        <JailCanvas jailId={id} boyVersion={boyVersion} />
      </main>

      {showAddBoy && (
        <AddBoyModal
          jailId={id}
          onClose={() => setShowAddBoy(false)}
          onAdded={() => setBoyVersion(v => v + 1)}
        />
      )}
    </div>
  );
}

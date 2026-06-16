'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { client } from '@/lib/data-client';
import { JailCanvas } from '@/components/JailCanvas';
import { AddBoyModal } from '@/components/AddBoyModal';
import { ToastContainer } from '@/components/ToastContainer';
import { ActivityFeed } from '@/components/ActivityFeed';
import { PresenceIndicator } from '@/components/PresenceIndicator';
import { useToasts } from '@/hooks/useToasts';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { InviteShare } from '@/components/InviteShare';

type Jail = { id: string; name: string; inviteCode: string };
type LoadState = 'loading' | 'denied' | 'ok';

export default function JailPage() {
  const { id } = useParams<{ id: string }>();
  const [jail, setJail] = useState<Jail | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [showAddBoy, setShowAddBoy] = useState(false);
  const { toasts, addToast } = useToasts();
  const currentUser = useCurrentUser();
  const currentUsername = currentUser?.username ?? '';
  const displayName = currentUser?.displayName ?? '';

  useEffect(() => {
    let cancelled = false;
    client.models.Jail.get({ id }).then(({ data, errors }) => {
      if (cancelled) return;
      if (data) {
        setJail(data);
        setLoadState('ok');
      } else {
        // Non-member: AppSync returns null data + an Unauthorized error rather
        // than throwing. Treat any falsy data as "no access" so the user gets
        // a clear message instead of a permanent "Loading…".
        if (errors?.length) console.warn('Jail.get errors', errors);
        setLoadState('denied');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loadState === 'denied') {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50 px-6">
        <div className="max-w-sm text-center space-y-4">
          <h1 className="text-xl font-semibold text-zinc-900">You don&apos;t have access to this jail</h1>
          <p className="text-sm text-zinc-600">
            Ask the jail owner for an invite code, or head back to start your own.
          </p>
          <Link
            href="/welcome"
            className="inline-block rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            Back to welcome
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-zinc-100">
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-zinc-200">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-zinc-900">{jail?.name ?? 'Loading…'}</h1>
          {currentUsername && displayName && (
            <PresenceIndicator jailId={id} currentUsername={currentUsername} displayName={displayName} />
          )}
        </div>
        <div className="flex items-center gap-4">
          {jail && <InviteShare inviteCode={jail.inviteCode} />}
          <button
            onClick={() => setShowAddBoy(true)}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            + Add Boy
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 p-4 overflow-hidden">
          {currentUsername && (
            <JailCanvas
              jailId={id}
              currentUsername={currentUsername}
              currentDisplayName={displayName}
              onActivity={addToast}
            />
          )}
        </main>
        <ActivityFeed jailId={id} />
      </div>

      {showAddBoy && (
        <AddBoyModal
          jailId={id}
          currentDisplayName={displayName}
          onClose={() => setShowAddBoy(false)}
          onAdded={() => setShowAddBoy(false)}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}

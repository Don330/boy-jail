'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { client } from '@/lib/data-client';
import { JailCanvas } from '@/components/JailCanvas';
import { AddBoyModal } from '@/components/AddBoyModal';
import { ToastContainer } from '@/components/ToastContainer';
import { ActivityFeed } from '@/components/ActivityFeed';
import { PresenceIndicator } from '@/components/PresenceIndicator';
import { useToasts } from '@/hooks/useToasts';

type Jail = { id: string; name: string; inviteCode: string };

export default function JailPage() {
  const { id } = useParams<{ id: string }>();
  const [jail, setJail] = useState<Jail | null>(null);
  const [currentUsername, setCurrentUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showAddBoy, setShowAddBoy] = useState(false);
  const { toasts, addToast } = useToasts();

  useEffect(() => {
    client.models.Jail.get({ id }).then(({ data }) => {
      if (data) setJail(data);
    });
    // Get the logged-in user. `username` is the Cognito sub (UUID) — we keep
    // it for unique IDs and ownership checks. The email-derived `displayName`
    // is shown in UI (avatar initial, etc).
    (async () => {
      const { username } = await getCurrentUser();
      setCurrentUsername(username);
      const attrs = await fetchUserAttributes();
      const email = attrs.email ?? '';
      setDisplayName(email.split('@')[0] || username);
    })();
  }, [id]);

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

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 p-4 overflow-hidden">
          {currentUsername && (
            <JailCanvas
              jailId={id}
              currentUsername={currentUsername}
              onActivity={addToast}
            />
          )}
        </main>
        <ActivityFeed jailId={id} />
      </div>

      {showAddBoy && (
        <AddBoyModal
          jailId={id}
          onClose={() => setShowAddBoy(false)}
          onAdded={() => setShowAddBoy(false)}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}

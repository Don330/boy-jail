'use client';

import { useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { client } from '@/lib/data-client';

const SEVERITY_LABELS: Record<string, { label: string; className: string }> = {
  petty:       { label: 'Petty',       className: 'bg-green-100 text-green-800' },
  misdemeanor: { label: 'Misdemeanor', className: 'bg-yellow-100 text-yellow-800' },
  felony:      { label: 'Felony',      className: 'bg-red-100 text-red-800' },
  capital:     { label: 'Capital',     className: 'bg-purple-100 text-purple-800' },
};

const SENTENCE_LABELS: Record<string, string> = {
  max:        'Maximum Security',
  general:    'General Population',
  psych:      'Psych Ward',
  death:      'Death Row',
  solitary:   'Solitary Confinement',
  processing: 'Processing',
  kitchen:    'Kitchen',
  yard:       'Yard',
  dayRelease: 'Day Release',
};

export type BoyCardData = {
  id: string;
  name: string;
  emoji: string;
  crime: string;
  severity: string | null;
  sentenceRoom: string | null;
  addedBy: string;
  jailId: string;
};

interface Props {
  boy: BoyCardData;
  currentUsername: string;
  onClose: () => void;
  onDeleted: (boyId: string) => void;
}

export function BoyCard({ boy, currentUsername, onClose, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOwner = boy.addedBy === currentUsername;
  const severity = boy.severity ? SEVERITY_LABELS[boy.severity] : null;

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const { username } = await getCurrentUser();
      await client.models.Boy.delete({ id: boy.id });
      await client.models.Event.create({
        jailId: boy.jailId,
        actorUserId: username,
        action: 'delete',
        targetBoyId: boy.id,
        fromRoomId: null,
        toRoomId: null,
      });
      onDeleted(boy.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 text-2xl leading-none"
        >
          &times;
        </button>

        <div className="flex items-center gap-4">
          <span className="text-5xl">{boy.emoji}</span>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">{boy.name}</h2>
            {severity && (
              <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${severity.className}`}>
                {severity.label}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Crime</span>
            <p className="text-zinc-900 mt-0.5">{boy.crime}</p>
          </div>
          {boy.sentenceRoom && (
            <div>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Sentenced to</span>
              <p className="text-zinc-900 mt-0.5">{SENTENCE_LABELS[boy.sentenceRoom] ?? boy.sentenceRoom}</p>
            </div>
          )}
          <div>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Added by</span>
            <p className="text-zinc-900 mt-0.5">{boy.addedBy}</p>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2">{error}</p>}

        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {deleting ? 'Deleting…' : 'Delete boy'}
          </button>
        )}
      </div>
    </div>
  );
}

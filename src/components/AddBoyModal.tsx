'use client';

import { useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { client } from '@/lib/data-client';

type SeverityValue = 'petty' | 'misdemeanor' | 'felony' | 'capital';
type SentenceRoomValue = 'max' | 'general' | 'psych' | 'death' | 'solitary' | 'processing' | 'kitchen' | 'yard' | 'dayRelease';

const SENTENCE_ROOMS: { value: SentenceRoomValue; label: string; roomId: string }[] = [
  { value: 'max',        label: 'Maximum Security',   roomId: 'max-security' },
  { value: 'general',    label: 'General Population', roomId: 'general-population' },
  { value: 'psych',      label: 'Psych Ward',         roomId: 'psych-ward' },
  { value: 'death',      label: 'Death Row',          roomId: 'death-row' },
  { value: 'solitary',   label: 'Solitary Confinement', roomId: 'solitary-confinement' },
  { value: 'processing', label: 'Processing',         roomId: 'processing' },
  { value: 'kitchen',    label: 'Kitchen',            roomId: 'kitchen' },
  { value: 'yard',       label: 'Yard',               roomId: 'yard' },
  { value: 'dayRelease', label: 'Day Release',        roomId: 'day-release' },
];

const SEVERITIES: { value: SeverityValue; label: string; color: string }[] = [
  { value: 'petty',       label: 'Petty',       color: 'bg-green-200 border-green-400' },
  { value: 'misdemeanor', label: 'Misdemeanor', color: 'bg-yellow-200 border-yellow-400' },
  { value: 'felony',      label: 'Felony',      color: 'bg-red-200 border-red-400' },
  { value: 'capital',     label: 'Capital',     color: 'bg-purple-200 border-purple-400' },
];

interface Props {
  jailId: string;
  onClose: () => void;
  onAdded: () => void;
}

export function AddBoyModal({ jailId, onClose, onAdded }: Props) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [crime, setCrime] = useState('');
  const [severity, setSeverity] = useState<SeverityValue>('misdemeanor');
  const [sentenceRoom, setSentenceRoom] = useState<SentenceRoomValue>('general');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { username } = await getCurrentUser();
      const room = SENTENCE_ROOMS.find(r => r.value === sentenceRoom)!;

      const { data: boy, errors } = await client.models.Boy.create({
        jailId,
        name: name.trim(),
        emoji: emoji.trim(),
        crime: crime.trim(),
        severity,
        sentenceRoom,
        roomId: room.roomId,
        addedBy: username,
      });

      if (errors?.length || !boy) throw new Error(errors?.[0]?.message ?? 'Failed to add boy');

      await client.models.Event.create({
        jailId,
        actorUserId: username,
        action: 'create',
        targetBoyId: boy.id,
        fromRoomId: null,
        toRoomId: room.roomId,
      });

      onAdded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900">Add a Boy</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 text-2xl leading-none">&times;</button>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-zinc-600 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={30}
                required
                placeholder="e.g. Big Steve"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            <div className="w-20">
              <label className="block text-xs font-medium text-zinc-600 mb-1">Emoji</label>
              <input
                type="text"
                value={emoji}
                onChange={e => setEmoji(e.target.value)}
                maxLength={2}
                required
                placeholder="😈"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Crime <span className="text-zinc-400">(max 60 chars)</span></label>
            <input
              type="text"
              value={crime}
              onChange={e => setCrime(e.target.value)}
              maxLength={60}
              required
              placeholder="e.g. Stole the last slice of pizza"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-2">Severity</label>
            <div className="grid grid-cols-4 gap-2">
              {SEVERITIES.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSeverity(s.value)}
                  className={`rounded-lg border-2 py-2 text-xs font-semibold transition-all ${
                    severity === s.value ? s.color + ' scale-105' : 'border-zinc-200 bg-zinc-50 text-zinc-500'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Sentence Room</label>
            <select
              value={sentenceRoom}
              onChange={e => setSentenceRoom(e.target.value as SentenceRoomValue)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
            >
              {SENTENCE_ROOMS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting || !name.trim() || !emoji.trim() || !crime.trim()}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Adding…' : 'Add Boy'}
          </button>
        </form>
      </div>
    </div>
  );
}

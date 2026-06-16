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

const SEVERITIES = ['petty', 'misdemeanor', 'felony', 'capital'] as const;

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

const SENTENCE_ORDER = [
  'max', 'general', 'psych', 'death', 'solitary',
  'processing', 'kitchen', 'yard', 'dayRelease',
] as const;

type Severity = typeof SEVERITIES[number];
type SentenceRoom = typeof SENTENCE_ORDER[number];

export type BoyCardData = {
  id: string;
  name: string;
  emoji: string;
  crime: string;
  severity: string | null;
  sentenceRoom: string | null;
  addedBy: string;
  addedByName: string | null;
  jailId: string;
};

interface Props {
  boy: BoyCardData;
  currentUsername: string;
  currentDisplayName: string;
  onClose: () => void;
  onDeleted: (boyId: string) => void;
}

export function BoyCard({ boy, currentUsername, currentDisplayName, onClose, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(boy.name);
  const [emoji, setEmoji] = useState(boy.emoji);
  const [crime, setCrime] = useState(boy.crime);
  const [severity, setSeverity] = useState<Severity>((boy.severity ?? 'misdemeanor') as Severity);
  const [sentenceRoom, setSentenceRoom] = useState<SentenceRoom>(
    (boy.sentenceRoom ?? 'general') as SentenceRoom,
  );

  const isOwner = boy.addedBy === currentUsername;
  const severityMeta = boy.severity ? SEVERITY_LABELS[boy.severity] : null;

  function startEdit() {
    setError(null);
    setName(boy.name);
    setEmoji(boy.emoji);
    setCrime(boy.crime);
    setSeverity((boy.severity ?? 'misdemeanor') as Severity);
    setSentenceRoom((boy.sentenceRoom ?? 'general') as SentenceRoom);
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const trimmedCrime = crime.trim();
      const crimeChanged = trimmedCrime !== boy.crime;
      const severityChanged = severity !== boy.severity;

      await client.models.Boy.update({
        id: boy.id,
        name: name.trim(),
        emoji: emoji.trim(),
        crime: trimmedCrime,
        severity,
        sentenceRoom,
      });

      // Only log an Event when the story-shaping fields change (crime, severity).
      // Cosmetic edits to name/emoji/sentenceRoom stay silent.
      if (crimeChanged || severityChanged) {
        const { username } = await getCurrentUser();
        await client.models.Event.create({
          jailId: boy.jailId,
          jailGroup: `jail-${boy.jailId}`,
          actorUserId: username,
          actorName: currentDisplayName,
          action: 'edit',
          targetBoyId: boy.id,
          fromRoomId: null,
          toRoomId: null,
        });
      }

      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const { username } = await getCurrentUser();
      await client.models.Boy.delete({ id: boy.id });
      await client.models.Event.create({
        jailId: boy.jailId,
        jailGroup: `jail-${boy.jailId}`,
        actorUserId: username,
        actorName: currentDisplayName,
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
          aria-label="Close"
        >
          &times;
        </button>

        {!editing && (
          <button
            onClick={startEdit}
            className="absolute top-4 right-12 text-zinc-400 hover:text-zinc-600 text-lg leading-none"
            aria-label="Edit boy"
            title="Edit boy"
          >
            ✎
          </button>
        )}

        {editing ? (
          <form onSubmit={handleSave} className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900">Edit boy</h2>
            <div className="grid grid-cols-[1fr_72px] gap-2">
              <div>
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={30}
                  required
                  className="mt-0.5 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Emoji</label>
                <input
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  maxLength={2}
                  required
                  className="mt-0.5 w-full rounded-lg border border-zinc-300 px-3 py-2 text-center text-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Crime</label>
              <input
                value={crime}
                onChange={(e) => setCrime(e.target.value)}
                maxLength={60}
                required
                className="mt-0.5 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Severity</label>
              <div className="mt-1 flex gap-1.5 flex-wrap">
                {SEVERITIES.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSeverity(s)}
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                      severity === s ? SEVERITY_LABELS[s].className + ' border-transparent' : 'border-zinc-300 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {SEVERITY_LABELS[s].label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Sentenced to</label>
              <select
                value={sentenceRoom}
                onChange={(e) => setSentenceRoom(e.target.value as SentenceRoom)}
                className="mt-0.5 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                {SENTENCE_ORDER.map((s) => (
                  <option key={s} value={s}>{SENTENCE_LABELS[s]}</option>
                ))}
              </select>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !name.trim() || !emoji.trim() || !crime.trim()}
                className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <span className="text-5xl">{boy.emoji}</span>
              <div>
                <h2 className="text-xl font-bold text-zinc-900">{boy.name}</h2>
                {severityMeta && (
                  <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${severityMeta.className}`}>
                    {severityMeta.label}
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
                <p className="text-zinc-900 mt-0.5">{boy.addedByName ?? boy.addedBy}</p>
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
          </>
        )}
      </div>
    </div>
  );
}

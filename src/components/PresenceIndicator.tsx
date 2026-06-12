'use client';

import { useEffect, useRef, useState } from 'react';
import { client } from '@/lib/data-client';

type Presence = {
  id: string;
  jailId: string;
  userId: string;
  lastSeen: string;
};

const HEARTBEAT_MS = 15_000;     // how often we update our own lastSeen
const REFRESH_MS = 10_000;       // how often we re-query active users (polling safety net)
const ONLINE_WINDOW_MS = 30_000; // a user is "online" if lastSeen is newer than now − 30s

// Stable presence id so heartbeats keep updating the same record (no duplicates)
function presenceId(jailId: string, userId: string) {
  return `${jailId}__${userId}`;
}

// Deterministic colour per user so the same person always gets the same avatar shade
function colorFromName(name: string) {
  const palette = [
    'bg-rose-500', 'bg-amber-500', 'bg-emerald-500',
    'bg-sky-500', 'bg-violet-500', 'bg-pink-500',
    'bg-orange-500', 'bg-teal-500', 'bg-indigo-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length];
}

interface Props {
  jailId: string;
  currentUsername: string;
}

export function PresenceIndicator({ jailId, currentUsername }: Props) {
  const [presences, setPresences] = useState<Presence[]>([]);
  const myIdRef = useRef(presenceId(jailId, currentUsername));

  // Upsert: try update first; if record doesn't exist yet, create it
  async function heartbeat() {
    const id = myIdRef.current;
    const lastSeen = new Date().toISOString();
    try {
      const { data } = await client.models.Presence.update({ id, lastSeen });
      if (!data) {
        await client.models.Presence.create({ id, jailId, userId: currentUsername, lastSeen });
      }
    } catch {
      // If update fails because the record was missing, create it
      try {
        await client.models.Presence.create({ id, jailId, userId: currentUsername, lastSeen });
      } catch (err) {
        console.error('Presence heartbeat failed', err);
      }
    }
  }

  async function refresh() {
    const { data } = await client.models.Presence.list({ filter: { jailId: { eq: jailId } } });
    if (data) setPresences(data as Presence[]);
  }

  // Heartbeat loop
  useEffect(() => {
    heartbeat();
    const t = setInterval(heartbeat, HEARTBEAT_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jailId, currentUsername]);

  // Polling loop (safety net for missed subscription events)
  useEffect(() => {
    refresh();
    const t = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jailId]);

  // Live subscriptions
  useEffect(() => {
    const subs = [
      client.models.Presence.onCreate({ filter: { jailId: { eq: jailId } } }).subscribe({
        next: (p) => setPresences(prev => prev.some(x => x.id === p.id) ? prev : [...prev, p as Presence]),
      }),
      client.models.Presence.onUpdate({ filter: { jailId: { eq: jailId } } }).subscribe({
        next: (p) => setPresences(prev => prev.map(x => x.id === p.id ? (p as Presence) : x)),
      }),
      client.models.Presence.onDelete({ filter: { jailId: { eq: jailId } } }).subscribe({
        next: (p) => setPresences(prev => prev.filter(x => x.id !== p.id)),
      }),
    ];
    return () => subs.forEach(s => s.unsubscribe());
  }, [jailId]);

  // Clean up our own presence when leaving the jail
  useEffect(() => {
    const id = myIdRef.current;
    return () => {
      client.models.Presence.delete({ id }).catch(() => {});
    };
  }, []);

  const now = Date.now();
  const online = presences
    .filter(p => now - new Date(p.lastSeen).getTime() < ONLINE_WINDOW_MS)
    .sort((a, b) => a.userId.localeCompare(b.userId));

  if (online.length === 0) return null;

  return (
    <div className="flex items-center -space-x-2">
      {online.map(p => {
        const isMe = p.userId === currentUsername;
        const initial = (p.userId[0] ?? '?').toUpperCase();
        return (
          <div
            key={p.id}
            title={isMe ? `${p.userId} (you)` : p.userId}
            className={`w-7 h-7 rounded-full ${colorFromName(p.userId)} text-white text-xs font-semibold flex items-center justify-center ring-2 ring-white`}
          >
            {initial}
          </div>
        );
      })}
    </div>
  );
}

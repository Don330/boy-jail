'use client';

import { useEffect, useRef, useState } from 'react';
import { client } from '@/lib/data-client';

type Event = {
  id: string;
  jailId: string;
  actorUserId: string;
  action: string | null;
  targetBoyId: string;
  fromRoomId: string | null;
  toRoomId: string | null;
  createdAt: string;
};

type Boy = { id: string; name: string; emoji: string };
type Room = { id: string; name: string };

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function buildMessage(event: Event, boys: Boy[], rooms: Room[]): string {
  const boy = boys.find(b => b.id === event.targetBoyId);
  const label = boy ? `${boy.emoji} ${boy.name}` : 'a boy';
  const toRoom = rooms.find(r => r.id === event.toRoomId);

  if (event.action === 'create') return `added ${label}`;
  if (event.action === 'move')   return `moved ${label} to ${toRoom?.name ?? '?'}`;
  if (event.action === 'delete') return `removed ${label}`;
  return 'did something';
}

interface Props {
  jailId: string;
}

export function ActivityFeed({ jailId }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [boys, setBoys] = useState<Boy[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [, forceTick] = useState(0);

  // Refs so subscription callback sees latest events without recreating sub
  const eventsRef = useRef<Event[]>([]);
  useEffect(() => { eventsRef.current = events; }, [events]);

  useEffect(() => {
    client.models.Event.list({ filter: { jailId: { eq: jailId } } }).then(({ data }) => {
      if (data) {
        const sorted = [...data].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
        setEvents(sorted as Event[]);
      }
    });
    client.models.Boy.list({ filter: { jailId: { eq: jailId } } }).then(({ data }) => {
      if (data) setBoys(data as Boy[]);
    });
    client.models.Room.list().then(({ data }) => {
      if (data) setRooms(data as Room[]);
    });
  }, [jailId]);

  // Re-render every 30s so "X minutes ago" stays current
  useEffect(() => {
    const i = setInterval(() => forceTick(n => n + 1), 30000);
    return () => clearInterval(i);
  }, []);

  // Live: new events prepend to the list
  useEffect(() => {
    const sub = client.models.Event.onCreate({ filter: { jailId: { eq: jailId } } }).subscribe({
      next: (event) => {
        setEvents(prev => {
          if (prev.some(e => e.id === event.id)) return prev;
          return [event as Event, ...prev];
        });
      },
      error: (err) => console.error('ActivityFeed Event.onCreate error', err),
    });
    return () => sub.unsubscribe();
  }, [jailId]);

  // Live: keep boy list current so messages can show emoji/name
  useEffect(() => {
    const sub = client.models.Boy.onCreate({ filter: { jailId: { eq: jailId } } }).subscribe({
      next: (boy) => {
        setBoys(prev => prev.some(b => b.id === boy.id) ? prev : [...prev, boy as Boy]);
      },
      error: (err) => console.error('ActivityFeed Boy.onCreate error', err),
    });
    return () => sub.unsubscribe();
  }, [jailId]);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="self-start mt-2 mr-2 bg-white rounded-l-lg shadow border border-r-0 border-zinc-200 px-2 py-3 text-xs text-zinc-600 hover:bg-zinc-50"
      >
        ◀ Activity
      </button>
    );
  }

  return (
    <aside className="w-72 bg-white border-l border-zinc-200 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
        <h2 className="text-sm font-semibold text-zinc-800">Activity</h2>
        <button
          onClick={() => setCollapsed(true)}
          className="text-zinc-400 hover:text-zinc-600 text-sm"
          aria-label="Collapse feed"
        >
          ▶
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-xs text-zinc-400 p-4 text-center">No activity yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {events.map(event => (
              <li key={event.id} className="px-4 py-3 hover:bg-zinc-50">
                <p className="text-xs text-zinc-900">
                  <span className="font-semibold">{event.actorUserId}</span>{' '}
                  {buildMessage(event, boys, rooms)}
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">{timeAgo(event.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

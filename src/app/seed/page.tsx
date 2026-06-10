'use client';

import { useState } from 'react';
import { client } from '@/lib/data-client';

const ROOMS = [
  { id: 'max-security', name: 'Maximum Security', x: 55, y: 55, width: 430, height: 400, capacity: 10, acceptsBoys: true },
  { id: 'general-population', name: 'General Population', x: 490, y: 55, width: 555, height: 400, capacity: null, acceptsBoys: true },
  { id: 'psych-ward', name: 'Psych Ward', x: 1050, y: 55, width: 435, height: 400, capacity: 8, acceptsBoys: true },
  { id: 'death-row', name: 'Death Row', x: 55, y: 460, width: 430, height: 180, capacity: 6, acceptsBoys: true },
  { id: 'solitary-confinement', name: 'Solitary Confinement', x: 1050, y: 460, width: 435, height: 255, capacity: 8, acceptsBoys: true },
  { id: 'staff-office', name: 'Staff Office', x: 490, y: 460, width: 170, height: 315, capacity: null, acceptsBoys: false },
  { id: 'processing', name: 'Processing', x: 665, y: 460, width: 200, height: 315, capacity: null, acceptsBoys: true },
  { id: 'kitchen', name: 'Kitchen', x: 870, y: 460, width: 175, height: 315, capacity: null, acceptsBoys: true },
  { id: 'yard', name: 'Yard', x: 55, y: 645, width: 430, height: 325, capacity: null, acceptsBoys: true },
  { id: 'day-release', name: 'Day Release', x: 1050, y: 720, width: 435, height: 250, capacity: null, acceptsBoys: true },
];

export default function SeedPage() {
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  function append(msg: string) {
    setLog((prev) => [...prev, msg]);
  }

  async function handleSeed() {
    setRunning(true);
    setLog([]);

    append('Checking for existing rooms...');
    const { data: existing } = await client.models.Room.list();
    if (existing && existing.length > 0) {
      append(`Found ${existing.length} existing rooms — deleting...`);
      await Promise.all(existing.map((r) => client.models.Room.delete({ id: r.id })));
    }

    append('Seeding rooms...');
    for (const room of ROOMS) {
      const { data, errors } = await client.models.Room.create(room);
      if (errors?.length) {
        append(`✗ ${room.name}: ${errors[0].message}`);
      } else {
        append(`✓ ${data?.name}`);
      }
    }

    append('Done!');
    setRunning(false);
    setDone(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md space-y-6 p-8">
        <h1 className="text-2xl font-bold text-zinc-900">Seed Rooms</h1>
        <p className="text-sm text-zinc-500">
          Creates the 10 rooms in DynamoDB with their canvas coordinates.
          Safe to re-run — it deletes existing rooms first.
        </p>

        {!done && (
          <button
            onClick={handleSeed}
            disabled={running}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {running ? 'Seeding…' : 'Seed rooms'}
          </button>
        )}

        {log.length > 0 && (
          <div className="bg-zinc-900 rounded-lg p-4 font-mono text-xs text-zinc-100 space-y-1">
            {log.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        )}

        {done && (
          <a href="/" className="block text-center text-sm text-zinc-500 underline">
            Back to jail
          </a>
        )}
      </div>
    </div>
  );
}

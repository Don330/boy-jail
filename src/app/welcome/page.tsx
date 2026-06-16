'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAuthSession } from 'aws-amplify/auth';
import { client } from '@/lib/data-client';

export default function WelcomePage() {
  const router = useRouter();
  const [jailName, setJailName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const { data: jail, errors } = await client.mutations.startJail({
        name: jailName.trim(),
      });
      if (errors?.length || !jail) throw new Error(errors?.[0]?.message ?? 'Failed to create jail');

      // Force a new ID token so the freshly-assigned `jail-<id>` group claim
      // is present on the very next GraphQL call from this client.
      await fetchAuthSession({ forceRefresh: true });

      router.replace(`/jail/${jail.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setCreating(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setJoining(true);
    setError(null);
    try {
      router.push(`/join/${inviteCode.trim().toUpperCase()}`);
    } catch {
      setError('Something went wrong');
      setJoining(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md space-y-8 p-8">
        <h1 className="text-3xl font-bold text-center text-zinc-900">Welcome to Boy Jail</h1>

        {error && (
          <p className="text-sm text-red-600 text-center bg-red-50 rounded-lg p-3">{error}</p>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-800">Create a new jail</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              placeholder="Jail name"
              value={jailName}
              onChange={(e) => setJailName(e.target.value)}
              maxLength={40}
              required
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <button
              type="submit"
              disabled={creating || !jailName.trim()}
              className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              {creating ? 'Creating…' : 'Create jail'}
            </button>
          </form>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-zinc-50 px-3 text-zinc-500">or</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-800">Join an existing jail</h2>
          <form onSubmit={handleJoin} className="space-y-3">
            <input
              type="text"
              placeholder="Invite code (e.g. X7K9AB)"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              maxLength={6}
              required
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <button
              type="submit"
              disabled={joining || inviteCode.trim().length !== 6}
              className="w-full rounded-lg border border-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:opacity-50"
            >
              {joining ? 'Joining…' : 'Join jail'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

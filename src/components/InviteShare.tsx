'use client';

import { useState } from 'react';

interface Props {
  inviteCode: string;
}

export function InviteShare({ inviteCode }: Props) {
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/join/${inviteCode}`
      : `/join/${inviteCode}`;

  async function copyCode() {
    await navigator.clipboard.writeText(inviteCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(joinUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(joinUrl)}`;

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500">
          Invite:{' '}
          <span className="font-mono font-semibold tracking-widest text-zinc-700">
            {inviteCode}
          </span>
        </span>

        {/* Copy code */}
        <button
          onClick={copyCode}
          title="Copy invite code"
          className="rounded px-1.5 py-0.5 text-xs text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
        >
          {codeCopied ? '✓' : '⎘'}
        </button>

        {/* Copy link */}
        <button
          onClick={copyLink}
          title="Copy join link"
          className="rounded px-1.5 py-0.5 text-xs text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
        >
          {linkCopied ? '✓ Copied' : '🔗 Link'}
        </button>

        {/* QR */}
        <button
          onClick={() => setShowQR(true)}
          title="Show QR code"
          className="rounded px-1.5 py-0.5 text-xs text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
        >
          QR
        </button>
      </div>

      {/* QR modal */}
      {showQR && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-semibold text-zinc-800 text-center">Scan to join</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrSrc}
              alt={`QR code for join link ${joinUrl}`}
              width={200}
              height={200}
              className="rounded-lg"
            />
            <p className="text-xs text-zinc-500 text-center font-mono">{inviteCode}</p>
            <button
              onClick={() => setShowQR(false)}
              className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import type { Toast } from '@/hooks/useToasts';

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="bg-zinc-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg max-w-xs"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

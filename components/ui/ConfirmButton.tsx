"use client";

import { useTransition } from "react";

// Runs a (bound) server action only after the user confirms.
export function ConfirmButton({
  confirmText,
  action,
  className = "",
  children,
}: {
  confirmText: string;
  action: () => Promise<void>;
  className?: string;
  children: React.ReactNode;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(confirmText)) {
          startTransition(async () => {
            await action();
          });
        }
      }}
      className={`rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

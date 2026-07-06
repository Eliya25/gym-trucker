"use client";

import { useEffect, useRef } from "react";
import { useNowSeconds } from "./useNowSeconds";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function RestTimer({
  endsAt,
  onExtend,
  onDone,
}: {
  endsAt: number; // epoch ms
  onExtend: (extraSeconds: number) => void;
  onDone: () => void;
}) {
  const nowSeconds = useNowSeconds();
  const vibrated = useRef(false);

  const remaining =
    nowSeconds === null
      ? null
      : Math.max(0, Math.ceil(endsAt / 1000) - nowSeconds);

  useEffect(() => {
    if (remaining === 0 && !vibrated.current) {
      vibrated.current = true;
      if (typeof navigator !== "undefined") {
        navigator.vibrate?.([200, 100, 200]);
      }
      onDone();
    }
  }, [remaining, onDone]);

  if (remaining === null || remaining === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span
        dir="ltr"
        className="font-mono text-lg font-semibold tabular-nums text-amber-400"
      >
        ⏳ {Math.floor(remaining / 60)}:{pad(remaining % 60)}
      </span>
      <button
        type="button"
        onClick={() => onExtend(30)}
        className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-300 hover:border-zinc-500"
      >
        +30 שנ׳
      </button>
      <button
        type="button"
        onClick={onDone}
        className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400 hover:border-zinc-500"
      >
        דלג
      </button>
    </div>
  );
}

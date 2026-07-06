"use client";

import { useNowSeconds } from "./useNowSeconds";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function WorkoutTimer({
  startedAt,
  compact = false,
}: {
  startedAt: string;
  compact?: boolean;
}) {
  const nowSeconds = useNowSeconds();

  let display = "--:--";
  if (nowSeconds !== null) {
    const totalSeconds = Math.max(
      0,
      nowSeconds - Math.floor(new Date(startedAt).getTime() / 1000)
    );
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    display =
      hours > 0
        ? `${hours}:${pad(minutes)}:${pad(seconds)}`
        : `${pad(minutes)}:${pad(seconds)}`;
  }

  return (
    <span
      dir="ltr"
      className={`rounded-lg bg-zinc-900 font-mono font-semibold tabular-nums text-emerald-400 ${
        compact ? "px-2 py-0.5 text-lg" : "px-4 py-2 text-4xl"
      }`}
    >
      ⏱ {display}
    </span>
  );
}

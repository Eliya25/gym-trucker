"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const id = setInterval(callback, 1000);
  return () => clearInterval(id);
}

// Current time at second granularity; null during server render so timers
// only start ticking on the client (avoids hydration mismatch).
export function useNowSeconds() {
  return useSyncExternalStore<number | null>(
    subscribe,
    () => Math.floor(Date.now() / 1000),
    () => null
  );
}

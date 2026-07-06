"use client";

import { useRef, useTransition } from "react";
import { quickAddSet } from "@/lib/actions/workouts";
import type { PlannedSet } from "@/lib/types/domain";

const inputClasses =
  "w-16 rounded-md border border-zinc-800 bg-transparent px-1 py-0.5 text-sm tabular-nums text-zinc-400 transition-colors hover:border-zinc-600 focus:border-emerald-500 focus:bg-zinc-950 focus:text-zinc-100 focus:outline-none disabled:opacity-50";

// A planned set from the template: reps/weight are editable, and the
// checkbox logs the set with whatever values are currently in the inputs.
export function PlannedSetRow({
  planned,
  displayNumber,
  sessionExerciseId,
  sessionId,
  onSetSaved,
}: {
  planned: PlannedSet;
  displayNumber: number;
  sessionExerciseId: string;
  sessionId: string;
  onSetSaved?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const repsRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);

  function logSet() {
    const reps = Number(repsRef.current?.value);
    const weightKg = Number(weightRef.current?.value || 0);
    if (!Number.isInteger(reps) || reps < 0 || weightKg < 0) return;
    startTransition(async () => {
      await quickAddSet(sessionExerciseId, sessionId, reps, weightKg);
      onSetSaved?.();
    });
  }

  return (
    <tr className="border-t border-zinc-800 text-zinc-500">
      <td className="py-1.5">{displayNumber}</td>
      <td className="py-1">
        <input
          ref={repsRef}
          type="number"
          inputMode="numeric"
          min={0}
          max={1000}
          dir="ltr"
          defaultValue={planned.reps}
          disabled={isPending}
          className={inputClasses}
          aria-label="חזרות מתוכננות"
        />
      </td>
      <td className="py-1">
        <input
          ref={weightRef}
          type="number"
          inputMode="decimal"
          min={0}
          max={2000}
          step={0.5}
          dir="ltr"
          defaultValue={
            Number(planned.weight_kg) > 0 ? Number(planned.weight_kg) : undefined
          }
          placeholder="גוף"
          disabled={isPending}
          className={inputClasses}
          aria-label="משקל מתוכנן בקילוגרמים"
        />
      </td>
      <td className="py-1.5 text-left">
        <button
          type="button"
          disabled={isPending}
          onClick={logSet}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md border-2 border-zinc-600 text-sm font-bold text-transparent transition-colors hover:border-emerald-500 hover:bg-emerald-950 hover:text-emerald-400 disabled:opacity-50"
          title="סמן שביצעת את הסט (עם הערכים שבשדות)"
        >
          ✓
        </button>
      </td>
    </tr>
  );
}

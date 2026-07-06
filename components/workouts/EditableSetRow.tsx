"use client";

import { useRef, useTransition } from "react";
import type { WorkoutSet } from "@/lib/types/domain";
import { deleteSet, updateSet } from "@/lib/actions/workouts";

const inputClasses =
  "w-16 rounded-md border border-transparent bg-transparent px-1 py-0.5 text-sm tabular-nums transition-colors hover:border-zinc-700 focus:border-emerald-500 focus:bg-zinc-950 focus:outline-none disabled:opacity-50";

// A logged set whose reps/weight can be edited in place; saves on blur.
export function EditableSetRow({
  set,
  sessionId,
}: {
  set: WorkoutSet;
  sessionId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const repsRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);

  function save() {
    const reps = Number(repsRef.current?.value);
    const weightKg = Number(weightRef.current?.value || 0);
    if (!Number.isInteger(reps) || reps < 0 || weightKg < 0) return;
    if (reps === set.reps && weightKg === Number(set.weight_kg)) return;
    startTransition(async () => {
      await updateSet(set.id, sessionId, reps, weightKg);
    });
  }

  return (
    <tr className="border-t border-zinc-800">
      <td className="py-1.5">{set.set_number}</td>
      <td className="py-1">
        <input
          ref={repsRef}
          type="number"
          inputMode="numeric"
          min={0}
          max={1000}
          dir="ltr"
          defaultValue={set.reps}
          onBlur={save}
          disabled={isPending}
          className={inputClasses}
          aria-label="חזרות"
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
            Number(set.weight_kg) > 0 ? Number(set.weight_kg) : undefined
          }
          placeholder="גוף"
          onBlur={save}
          disabled={isPending}
          className={inputClasses}
          aria-label="משקל בקילוגרמים"
        />
      </td>
      <td className="py-1.5 text-left">
        <form action={deleteSet.bind(null, set.id, sessionId)}>
          <button
            type="submit"
            className="text-xs text-zinc-400 hover:text-red-600"
            title="מחק סט"
          >
            ✕
          </button>
        </form>
      </td>
    </tr>
  );
}

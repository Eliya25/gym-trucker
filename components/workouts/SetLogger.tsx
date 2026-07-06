"use client";

import { useActionState, useRef, useEffect } from "react";
import { addSet, type SetFormState } from "@/lib/actions/workouts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: SetFormState = { error: null };

export function SetLogger({
  sessionExerciseId,
  sessionId,
  weightOptional = false,
  defaultReps,
  defaultWeightKg,
  onSetSaved,
}: {
  sessionExerciseId: string;
  sessionId: string;
  weightOptional?: boolean;
  defaultReps?: number;
  defaultWeightKg?: number;
  onSetSaved?: () => void;
}) {
  const [state, formAction, pending] = useActionState(addSet, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      formRef.current?.reset();
      onSetSaved?.();
    }
    wasPending.current = pending;
  }, [pending, state, onSetSaved]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="sessionExerciseId" value={sessionExerciseId} />
      <input type="hidden" name="sessionId" value={sessionId} />
      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs text-zinc-500">חזרות</label>
          <Input
            name="reps"
            type="number"
            inputMode="numeric"
            min={0}
            max={1000}
            dir="ltr"
            defaultValue={defaultReps}
            required
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs text-zinc-500">
            {weightOptional ? "משקל (ק”ג) — לא חובה" : "משקל (ק”ג)"}
          </label>
          <Input
            name="weightKg"
            type="number"
            inputMode="decimal"
            min={0}
            max={2000}
            step={0.5}
            dir="ltr"
            defaultValue={
              defaultWeightKg !== undefined && defaultWeightKg > 0
                ? defaultWeightKg
                : undefined
            }
            placeholder={weightOptional ? "משקל גוף" : undefined}
            required={!weightOptional}
          />
        </div>
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "..." : "+ סט"}
        </Button>
      </div>
      {state.error && (
        <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </form>
  );
}

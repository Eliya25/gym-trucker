"use client";

import type { SessionExerciseWithSets } from "@/lib/types/domain";
import {
  removeExerciseFromSession,
  toggleSuperset,
} from "@/lib/actions/workouts";
import { Card } from "@/components/ui/Card";
import { EditableSetRow } from "./EditableSetRow";
import { PlannedSetRow } from "./PlannedSetRow";
import { SetLogger } from "./SetLogger";

export type PreviousSet = { reps: number; weight_kg: number };

export function SessionExerciseCard({
  sessionExercise,
  sessionId,
  readOnly,
  showSupersetToggle = false,
  linkedWithPrevious = false,
  previousSets,
  plannedSets,
  onSetSaved,
}: {
  sessionExercise: SessionExerciseWithSets;
  sessionId: string;
  readOnly: boolean;
  showSupersetToggle?: boolean;
  linkedWithPrevious?: boolean;
  previousSets?: PreviousSet[];
  plannedSets?: PreviousSet[];
  onSetSaved?: () => void;
}) {
  const { exercise, workout_sets } = sessionExercise;
  const lastSet = workout_sets[workout_sets.length - 1];
  const lastPrevSet = previousSets?.[previousSets.length - 1];

  // planned sets from the template that haven't been logged yet
  const remainingPlanned = (plannedSets ?? []).slice(workout_sets.length);
  const nextPlanned = remainingPlanned[0];

  const defaultReps = nextPlanned?.reps ?? lastSet?.reps ?? lastPrevSet?.reps;
  const defaultWeightKg = Number(
    nextPlanned?.weight_kg ?? lastSet?.weight_kg ?? lastPrevSet?.weight_kg ?? 0
  );


  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{exercise.name}</h3>
          {exercise.muscle_group && (
            <span className="text-xs text-zinc-400">
              {exercise.muscle_group}
            </span>
          )}
          {!readOnly && previousSets && previousSets.length > 0 && (
            <p className="mt-0.5 text-xs text-zinc-500">
              אימון קודם:{" "}
              <span dir="ltr">
                {previousSets
                  .map((s) =>
                    Number(s.weight_kg) > 0
                      ? `${Number(s.weight_kg)}kg×${s.reps}`
                      : `×${s.reps}`
                  )
                  .join(", ")}
              </span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!readOnly && showSupersetToggle && (
            <form
              action={toggleSuperset.bind(null, sessionExercise.id, sessionId)}
            >
              <button
                type="submit"
                className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  linkedWithPrevious
                    ? "border-amber-500/60 text-amber-400 hover:border-red-500/60 hover:text-red-400"
                    : "border-zinc-700 text-zinc-400 hover:border-amber-500/60 hover:text-amber-400"
                }`}
                title={
                  linkedWithPrevious
                    ? "נתק מהסופר-סט"
                    : "צרף לסופר-סט עם התרגיל הקודם"
                }
              >
                {linkedWithPrevious ? "✂ נתק סופר-סט" : "🔗 סופר-סט"}
              </button>
            </form>
          )}
          {!readOnly && workout_sets.length === 0 && (
            <form
              action={removeExerciseFromSession.bind(
                null,
                sessionExercise.id,
                sessionId
              )}
            >
              <button
                type="submit"
                className="text-sm text-zinc-400 hover:text-red-600"
                title="הסר תרגיל"
              >
                ✕
              </button>
            </form>
          )}
        </div>
      </div>

      {(workout_sets.length > 0 ||
        (!readOnly && remainingPlanned.length > 0)) && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-right text-xs text-zinc-500">
              <th className="py-1 font-medium">סט</th>
              <th className="py-1 font-medium">חזרות</th>
              <th className="py-1 font-medium">משקל (ק&quot;ג)</th>
              {!readOnly && <th className="py-1" />}
            </tr>
          </thead>
          <tbody>
            {workout_sets.map((set) =>
              readOnly ? (
                <tr key={set.id} className="border-t border-zinc-800">
                  <td className="py-1.5">{set.set_number}</td>
                  <td className="py-1.5">{set.reps}</td>
                  <td className="py-1.5">
                    {Number(set.weight_kg) > 0 ? (
                      Number(set.weight_kg)
                    ) : (
                      <span className="text-zinc-500">משקל גוף</span>
                    )}
                  </td>
                </tr>
              ) : (
                <EditableSetRow key={set.id} set={set} sessionId={sessionId} />
              )
            )}
            {!readOnly &&
              remainingPlanned.map((planned, i) => (
                <PlannedSetRow
                  key={`planned-${workout_sets.length + i}`}
                  planned={planned}
                  displayNumber={workout_sets.length + i + 1}
                  sessionExerciseId={sessionExercise.id}
                  sessionId={sessionId}
                  onSetSaved={onSetSaved}
                />
              ))}
          </tbody>
        </table>
      )}

      {!readOnly && (
        <SetLogger
          sessionExerciseId={sessionExercise.id}
          sessionId={sessionId}
          weightOptional={exercise.muscle_group === "בטן"}
          defaultReps={defaultReps}
          defaultWeightKg={defaultWeightKg}
          onSetSaved={onSetSaved}
        />
      )}
    </Card>
  );
}

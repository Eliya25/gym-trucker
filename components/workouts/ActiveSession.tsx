"use client";

import { useCallback, useState, useTransition } from "react";
import type { Exercise, SessionDetail } from "@/lib/types/domain";
import {
  addExerciseToSession,
  deleteWorkoutSession,
} from "@/lib/actions/workouts";
import { groupBySuperset } from "@/lib/superset";
import { ExercisePicker } from "./ExercisePicker";
import { SessionExerciseCard, type PreviousSet } from "./SessionExerciseCard";
import { WorkoutFeedbackForm } from "./WorkoutFeedbackForm";
import { WorkoutTimer } from "./WorkoutTimer";
import { RestTimer } from "./RestTimer";
import { Button } from "@/components/ui/Button";

const REST_SECONDS = 90;

export function ActiveSession({
  session,
  allExercises,
  previousSets,
  plannedSets,
}: {
  session: SessionDetail;
  allExercises: Exercise[];
  previousSets: Record<string, PreviousSet[]>;
  plannedSets: Record<string, PreviousSet[]>;
}) {
  const [finishing, setFinishing] = useState(false);
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
  const [isCancelling, startCancelTransition] = useTransition();
  const hasSets = session.session_exercises.some(
    (se) => se.workout_sets.length > 0
  );

  const startRest = useCallback(() => {
    setRestEndsAt(Date.now() + REST_SECONDS * 1000);
  }, []);
  const clearRest = useCallback(() => setRestEndsAt(null), []);
  const extendRest = useCallback((extraSeconds: number) => {
    setRestEndsAt((prev) =>
      prev === null ? null : prev + extraSeconds * 1000
    );
  }, []);

  function cancelWorkout() {
    if (
      confirm("לבטל את האימון? כל מה שתועד באימון הזה יימחק לצמיתות.")
    ) {
      startCancelTransition(async () => {
        await deleteWorkoutSession(session.id);
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">אימון פעיל 💪</h1>
          <p className="text-sm text-zinc-500">
            התחיל ב-
            {new Date(session.started_at).toLocaleTimeString("he-IL", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <WorkoutTimer startedAt={session.started_at} />
      </div>

      {finishing ? (
        <WorkoutFeedbackForm
          sessionId={session.id}
          onCancel={() => setFinishing(false)}
        />
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {groupBySuperset(session.session_exercises).map((group) =>
              group.isSuperset ? (
                <div
                  key={group.items[0].id}
                  className="flex flex-col gap-2 rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 p-2"
                >
                  <span className="px-2 pt-1 text-xs font-semibold text-amber-400">
                    🔁 סופר-סט
                  </span>
                  {group.items.map((se, i) => (
                    <SessionExerciseCard
                      key={se.id}
                      sessionExercise={se}
                      sessionId={session.id}
                      readOnly={false}
                      showSupersetToggle={
                        session.session_exercises[0].id !== se.id
                      }
                      linkedWithPrevious={i > 0}
                      previousSets={previousSets[se.exercise_id]}
                      plannedSets={plannedSets[se.exercise_id]}
                      onSetSaved={startRest}
                    />
                  ))}
                </div>
              ) : (
                <SessionExerciseCard
                  key={group.items[0].id}
                  sessionExercise={group.items[0]}
                  sessionId={session.id}
                  readOnly={false}
                  showSupersetToggle={
                    session.session_exercises[0].id !== group.items[0].id
                  }
                  linkedWithPrevious={false}
                  previousSets={previousSets[group.items[0].exercise_id]}
                  plannedSets={plannedSets[group.items[0].exercise_id]}
                  onSetSaved={startRest}
                />
              )
            )}
          </div>

          <ExercisePicker
            allExercises={allExercises}
            alreadyAddedIds={session.session_exercises.map(
              (se) => se.exercise_id
            )}
            onPick={(exerciseId) =>
              addExerciseToSession(session.id, exerciseId)
            }
          />

          {/* sticky action bar */}
          <div className="fixed inset-x-0 bottom-0 z-10 border-t border-zinc-800 bg-zinc-950/90 backdrop-blur">
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                {restEndsAt !== null ? (
                  <RestTimer
                    endsAt={restEndsAt}
                    onExtend={extendRest}
                    onDone={clearRest}
                  />
                ) : (
                  <>
                    <WorkoutTimer startedAt={session.started_at} compact />
                    {!hasSets && (
                      <span className="hidden truncate text-xs text-zinc-500 sm:inline">
                        תעד סט ראשון כדי לסיים אימון
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={cancelWorkout}
                  disabled={isCancelling}
                >
                  בטל
                </Button>
                <Button
                  onClick={() => setFinishing(true)}
                  disabled={!hasSets}
                  title={!hasSets ? "תעד לפחות סט אחד" : undefined}
                >
                  סיים אימון ✔
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

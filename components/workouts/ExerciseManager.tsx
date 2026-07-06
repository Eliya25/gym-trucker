"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Exercise } from "@/lib/types/domain";
import {
  createExercise,
  deleteExercise,
  type ExerciseFormState,
} from "@/lib/actions/exercises";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: ExerciseFormState = { error: null };

export function ExerciseManager({
  exercises,
  currentUserId,
}: {
  exercises: Exercise[];
  currentUserId: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    createExercise,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error && state.createdId) {
      formRef.current?.reset();
    }
  }, [pending, state]);

  const myExercises = exercises.filter((e) => e.user_id === currentUserId);
  const globalExercises = exercises.filter((e) => e.user_id === null);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">תרגילים</h1>

      <Card className="flex flex-col gap-3">
        <h2 className="font-semibold">הוסף תרגיל אישי</h2>
        <form
          ref={formRef}
          action={formAction}
          className="flex flex-col gap-2 sm:flex-row sm:items-end"
        >
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="name" className="text-xs text-zinc-500">
              שם התרגיל
            </label>
            <Input id="name" name="name" maxLength={100} required />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="muscleGroup" className="text-xs text-zinc-500">
              קבוצת שרירים (לא חובה)
            </label>
            <Input id="muscleGroup" name="muscleGroup" maxLength={100} />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "מוסיף..." : "+ הוסף"}
          </Button>
        </form>
        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">התרגילים שלי ({myExercises.length})</h2>
        {myExercises.length === 0 ? (
          <p className="text-sm text-zinc-500">
            עדיין אין תרגילים אישיים. הוסף תרגיל למעלה.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {myExercises.map((exercise) => (
              <li key={exercise.id}>
                <Card className="flex items-center justify-between py-3">
                  <div>
                    <span className="font-medium">{exercise.name}</span>
                    {exercise.muscle_group && (
                      <span className="mr-2 text-xs text-zinc-400">
                        {exercise.muscle_group}
                      </span>
                    )}
                  </div>
                  <form action={deleteExercise.bind(null, exercise.id)}>
                    <button
                      type="submit"
                      className="text-sm text-zinc-400 hover:text-red-600"
                      title="מחק תרגיל"
                    >
                      ✕
                    </button>
                  </form>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">
          תרגילים כלליים ({globalExercises.length})
        </h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {globalExercises.map((exercise) => (
            <li key={exercise.id}>
              <Card className="flex items-center justify-between py-3">
                <span className="text-sm font-medium">{exercise.name}</span>
                <span className="text-xs text-zinc-400">
                  {exercise.muscle_group}
                </span>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

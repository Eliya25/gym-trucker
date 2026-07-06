"use client";

import { useState, useTransition } from "react";
import type { Exercise } from "@/lib/types/domain";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export function ExercisePicker({
  allExercises,
  alreadyAddedIds,
  onPick,
}: {
  allExercises: Exercise[];
  alreadyAddedIds: string[];
  onPick: (exerciseId: string) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const available = allExercises.filter(
    (e) => !alreadyAddedIds.includes(e.id)
  );
  const filtered = query.trim()
    ? available.filter((e) =>
        `${e.name} ${e.muscle_group ?? ""}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      )
    : available;

  function add(exerciseId: string) {
    startTransition(async () => {
      await onPick(exerciseId);
      setQuery("");
    });
  }

  return (
    <Card className="flex flex-col gap-3">
      <h2 className="font-semibold">הוסף תרגיל</h2>
      <Input
        placeholder="חפש תרגיל..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
        {filtered.map((exercise) => (
          <li key={exercise.id}>
            <button
              type="button"
              disabled={isPending}
              onClick={() => add(exercise.id)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-right text-sm transition-colors hover:bg-emerald-950 disabled:opacity-50"
            >
              <span>{exercise.name}</span>
              <span className="text-xs text-zinc-400">
                {exercise.muscle_group}
              </span>
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="px-3 py-2 text-sm text-zinc-500">
            לא נמצאו תרגילים.{" "}
            <a href="/exercises" className="text-emerald-600 hover:underline">
              הוסף תרגיל חדש
            </a>
          </li>
        )}
      </ul>
    </Card>
  );
}

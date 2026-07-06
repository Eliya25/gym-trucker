"use client";

import { useActionState, useState } from "react";
import {
  finishWorkoutSession,
  type FeedbackFormState,
} from "@/lib/actions/workouts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const initialState: FeedbackFormState = { error: null };

const ratings = [
  { value: 1, label: "קל מאוד", emoji: "😄" },
  { value: 2, label: "קל", emoji: "🙂" },
  { value: 3, label: "בינוני", emoji: "😐" },
  { value: 4, label: "קשה", emoji: "😅" },
  { value: 5, label: "קשה מאוד", emoji: "🥵" },
];

export function WorkoutFeedbackForm({
  sessionId,
  onCancel,
}: {
  sessionId: string;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    finishWorkoutSession,
    initialState
  );
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">איך היה האימון?</h2>
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="sessionId" value={sessionId} />
        <input
          type="hidden"
          name="difficultyRating"
          value={selected ?? ""}
        />

        <div className="flex justify-between gap-2">
          {ratings.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setSelected(r.value)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl border p-3 text-sm transition-colors ${
                selected === r.value
                  ? "border-emerald-500 bg-emerald-950"
                  : "border-zinc-700 hover:border-zinc-500"
              }`}
            >
              <span className="text-2xl">{r.emoji}</span>
              <span className="text-xs">{r.label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="notes" className="text-sm font-medium">
            הערות (לא חובה)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={2000}
            placeholder="איך הרגשת? מה כדאי לשפר בפעם הבאה?"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={pending || selected === null}>
            {pending ? "שומר..." : "סיים ושמור אימון"}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            חזרה לאימון
          </Button>
        </div>
      </form>
    </Card>
  );
}

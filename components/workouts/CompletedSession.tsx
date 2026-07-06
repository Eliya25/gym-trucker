import Link from "next/link";
import type { SessionDetail } from "@/lib/types/domain";
import { groupBySuperset } from "@/lib/superset";
import { createTemplateFromSession } from "@/lib/actions/templates";
import { deleteWorkoutSession } from "@/lib/actions/workouts";
import { durationMinutes, formatDuration } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { SessionExerciseCard } from "./SessionExerciseCard";

const difficultyLabels: Record<number, string> = {
  1: "קל מאוד 😄",
  2: "קל 🙂",
  3: "בינוני 😐",
  4: "קשה 😅",
  5: "קשה מאוד 🥵",
};

export function CompletedSession({ session }: { session: SessionDetail }) {
  const date = new Date(session.started_at);
  const totalSets = session.session_exercises.reduce(
    (sum, se) => sum + se.workout_sets.length,
    0
  );
  const totalVolume = session.session_exercises.reduce(
    (sum, se) =>
      sum +
      se.workout_sets.reduce(
        (s, set) => s + set.reps * Number(set.weight_kg),
        0
      ),
    0
  );
  const duration = session.completed_at
    ? formatDuration(durationMinutes(session.started_at, session.completed_at))
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/workouts"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          → חזרה להיסטוריה
        </Link>
        <h1 className="mt-2 text-2xl font-bold">
          {date.toLocaleDateString("he-IL", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="text-center">
          <div className="text-2xl font-bold">
            {session.session_exercises.length}
          </div>
          <div className="text-xs text-zinc-500">תרגילים</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold">{totalSets}</div>
          <div className="text-xs text-zinc-500">סטים</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold">
            {totalVolume.toLocaleString("he-IL")}
          </div>
          <div className="text-xs text-zinc-500">נפח כולל (ק&quot;ג)</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold">{duration}</div>
          <div className="text-xs text-zinc-500">משך האימון</div>
        </Card>
      </div>

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
              {group.items.map((se) => (
                <SessionExerciseCard
                  key={se.id}
                  sessionExercise={se}
                  sessionId={session.id}
                  readOnly
                />
              ))}
            </div>
          ) : (
            <SessionExerciseCard
              key={group.items[0].id}
              sessionExercise={group.items[0]}
              sessionId={session.id}
              readOnly
            />
          )
        )}
      </div>

      <Card className="flex flex-col gap-3">
        <h2 className="font-semibold">שמור כתוכנית אימון 📋</h2>
        <p className="text-sm text-zinc-400">
          שמור את רשימת התרגילים של האימון הזה כתוכנית, ובפעם הבאה תתחיל אותו
          בלחיצה אחת.
        </p>
        <form
          action={createTemplateFromSession}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <input type="hidden" name="sessionId" value={session.id} />
          <Input
            name="name"
            maxLength={100}
            placeholder="שם התוכנית (למשל: חזה + יד אחורית)"
            required
            className="sm:flex-1"
          />
          <Button type="submit" variant="secondary">
            שמור כתוכנית
          </Button>
        </form>
      </Card>

      {session.workout_feedback && (
        <Card className="flex flex-col gap-2">
          <h2 className="font-semibold">פידבק</h2>
          <p>
            רמת קושי:{" "}
            <span className="font-medium">
              {difficultyLabels[session.workout_feedback.difficulty_rating] ??
                session.workout_feedback.difficulty_rating}
            </span>
          </p>
          {session.workout_feedback.notes && (
            <p className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
              {session.workout_feedback.notes}
            </p>
          )}
        </Card>
      )}

      <ConfirmButton
        confirmText="למחוק את האימון הזה? כל הסטים והפידבק שלו יימחקו לצמיתות."
        action={deleteWorkoutSession.bind(null, session.id)}
        className="self-center"
      >
        🗑 מחק אימון
      </ConfirmButton>
    </div>
  );
}

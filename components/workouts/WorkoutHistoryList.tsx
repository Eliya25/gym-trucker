import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { durationMinutes, formatDuration } from "@/lib/format";
import type { SessionListItem } from "@/lib/types/domain";

const difficultyLabels: Record<number, string> = {
  1: "קל מאוד",
  2: "קל",
  3: "בינוני",
  4: "קשה",
  5: "קשה מאוד",
};

export function WorkoutHistoryList({
  sessions,
}: {
  sessions: SessionListItem[];
}) {
  if (sessions.length === 0) {
    return (
      <Card className="text-center text-zinc-500">
        עדיין אין אימונים. לחץ על &quot;התחל אימון חדש&quot; כדי לתעד את האימון
        הראשון שלך!
      </Card>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {sessions.map((session) => {
        const date = new Date(session.started_at);
        const rating = session.workout_feedback?.difficulty_rating;
        const duration = session.completed_at
          ? formatDuration(
              durationMinutes(session.started_at, session.completed_at)
            )
          : null;
        return (
          <li key={session.id}>
            <Link href={`/workouts/${session.id}`}>
              <Card className="flex items-center justify-between transition-colors hover:border-emerald-500/60">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">
                    {date.toLocaleDateString("he-IL", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-sm text-zinc-500">
                    {session.session_exercises.length} תרגילים ·{" "}
                    {date.toLocaleTimeString("he-IL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {duration !== null && <> · {duration}</>}
                  </span>
                </div>
                {rating && (
                  <span className="rounded-full bg-emerald-900 px-3 py-1 text-sm font-medium text-emerald-100">
                    {difficultyLabels[rating] ?? rating}
                  </span>
                )}
              </Card>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

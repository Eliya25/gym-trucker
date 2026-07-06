import { createClient } from "@/lib/supabase/server";
import {
  ProgressDashboard,
  type ExerciseSeries,
  type PersonalRecord,
  type WeeklyVolume,
} from "@/components/progress/ProgressDashboard";

type Row = {
  id: string;
  started_at: string;
  session_exercises: {
    exercise_id: string;
    exercise: { name: string } | null;
    workout_sets: { reps: number; weight_kg: number }[];
  }[];
};

function weekStartISO(date: Date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // Sunday-based week
  return d.toLocaleDateString("sv-SE");
}

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workout_sessions")
    .select(
      "id, started_at, session_exercises(exercise_id, exercise:exercises(name), workout_sets(reps, weight_kg))"
    )
    .not("completed_at", "is", null)
    .order("started_at");

  const sessions = (data ?? []) as unknown as Row[];

  const seriesMap = new Map<string, ExerciseSeries>();
  const prMap = new Map<string, PersonalRecord>();
  const weeklyMap = new Map<string, number>();

  for (const session of sessions) {
    const date = session.started_at.slice(0, 10);
    for (const se of session.session_exercises) {
      const name = se.exercise?.name ?? "תרגיל";
      let top = 0;
      let topReps = 0;
      let volume = 0;
      for (const set of se.workout_sets) {
        const w = Number(set.weight_kg);
        volume += w * set.reps;
        if (w > top || (w === top && set.reps > topReps)) {
          top = w;
          topReps = set.reps;
        }
      }
      if (se.workout_sets.length === 0) continue;

      // per-exercise progression
      let series = seriesMap.get(se.exercise_id);
      if (!series) {
        series = { exerciseId: se.exercise_id, name, points: [] };
        seriesMap.set(se.exercise_id, series);
      }
      series.points.push({ date, top, volume });

      // personal records (heaviest set ever)
      const pr = prMap.get(se.exercise_id);
      if (!pr || top > pr.weight || (top === pr.weight && topReps > pr.reps)) {
        prMap.set(se.exercise_id, {
          exerciseId: se.exercise_id,
          name,
          weight: top,
          reps: topReps,
          date,
        });
      }

      // weekly volume
      const week = weekStartISO(new Date(session.started_at));
      weeklyMap.set(week, (weeklyMap.get(week) ?? 0) + volume);
    }
  }

  const exerciseSeries = [...seriesMap.values()]
    .filter((s) => s.points.length >= 1)
    .sort((a, b) => b.points.length - a.points.length);

  const personalRecords = [...prMap.values()]
    .filter((pr) => pr.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  const weeklyVolume: WeeklyVolume[] = [...weeklyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-10)
    .map(([week, volume]) => ({ week, volume: Math.round(volume) }));

  return (
    <ProgressDashboard
      exerciseSeries={exerciseSeries}
      personalRecords={personalRecords}
      weeklyVolume={weeklyVolume}
      totalWorkouts={sessions.length}
    />
  );
}

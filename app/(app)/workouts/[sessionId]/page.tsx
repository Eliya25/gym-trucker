import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Exercise, PlannedSet, SessionDetail } from "@/lib/types/domain";
import { ActiveSession } from "@/components/workouts/ActiveSession";
import { CompletedSession } from "@/components/workouts/CompletedSession";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const supabase = await createClient();

  const [{ data: session }, { data: exercises }] = await Promise.all([
    supabase
      .from("workout_sessions")
      .select(
        `*,
         session_exercises(
           *,
           exercise:exercises(*),
           workout_sets(*)
         ),
         workout_feedback(*)`
      )
      .eq("id", sessionId)
      .maybeSingle(),
    supabase.from("exercises").select("*").order("name"),
  ]);

  if (!session) notFound();

  const raw = session as unknown as Omit<SessionDetail, "workout_feedback"> & {
    workout_feedback:
      | SessionDetail["workout_feedback"]
      | SessionDetail["workout_feedback"][];
  };
  const detail: SessionDetail = {
    ...raw,
    // one-to-one joins can come back as an array from PostgREST
    workout_feedback: Array.isArray(raw.workout_feedback)
      ? (raw.workout_feedback[0] ?? null)
      : raw.workout_feedback,
    session_exercises: [...raw.session_exercises]
      .sort((a, b) => a.order_index - b.order_index)
      .map((se) => ({
        ...se,
        workout_sets: [...se.workout_sets].sort(
          (a, b) => a.set_number - b.set_number
        ),
      })),
  };

  const allExercises = (exercises ?? []) as Exercise[];

  if (detail.completed_at) {
    return <CompletedSession session={detail} />;
  }

  // For each exercise in this session, find the sets from the most recent
  // completed session, to show "last time" hints while logging.
  const exerciseIds = detail.session_exercises.map((se) => se.exercise_id);
  const previousSets: Record<string, { reps: number; weight_kg: number }[]> =
    {};
  if (exerciseIds.length > 0) {
    const { data: prevRows } = await supabase
      .from("session_exercises")
      .select(
        "exercise_id, workout_sets(set_number, reps, weight_kg), workout_sessions!inner(started_at, completed_at)"
      )
      .in("exercise_id", exerciseIds)
      .neq("session_id", sessionId)
      .not("workout_sessions.completed_at", "is", null);

    type PrevRow = {
      exercise_id: string;
      workout_sets: { set_number: number; reps: number; weight_kg: number }[];
      workout_sessions: { started_at: string };
    };
    const latestPerExercise = new Map<string, PrevRow>();
    for (const row of (prevRows ?? []) as unknown as PrevRow[]) {
      if (row.workout_sets.length === 0) continue;
      const current = latestPerExercise.get(row.exercise_id);
      if (
        !current ||
        row.workout_sessions.started_at > current.workout_sessions.started_at
      ) {
        latestPerExercise.set(row.exercise_id, row);
      }
    }
    for (const [exerciseId, row] of latestPerExercise) {
      previousSets[exerciseId] = [...row.workout_sets]
        .sort((a, b) => a.set_number - b.set_number)
        .map(({ reps, weight_kg }) => ({ reps, weight_kg }));
    }
  }

  // If the workout was started from a template, load its planned sets so
  // each remaining set can be logged with a single tap.
  const plannedSets: Record<string, PlannedSet[]> = {};
  if (detail.template_id) {
    const { data: templateExercises } = await supabase
      .from("template_exercises")
      .select("exercise_id, template_sets(set_number, reps, weight_kg)")
      .eq("template_id", detail.template_id);

    for (const te of templateExercises ?? []) {
      if (te.template_sets.length > 0) {
        plannedSets[te.exercise_id] = [...te.template_sets]
          .sort((a, b) => a.set_number - b.set_number)
          .map(({ reps, weight_kg }) => ({ reps, weight_kg }));
      }
    }
  }

  return (
    <ActiveSession
      session={detail}
      allExercises={allExercises}
      previousSets={previousSets}
      plannedSets={plannedSets}
    />
  );
}

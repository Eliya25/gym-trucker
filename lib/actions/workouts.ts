"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export async function createWorkoutSession() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_sessions")
    .insert({})
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("יצירת האימון נכשלה: " + error?.message);
  }

  redirect(`/workouts/${data.id}`);
}

export async function addExerciseToSession(
  sessionId: string,
  exerciseId: string
) {
  const parsed = z
    .object({ sessionId: z.string().uuid(), exerciseId: z.string().uuid() })
    .safeParse({ sessionId, exerciseId });
  if (!parsed.success) throw new Error("קלט לא תקין");

  const supabase = await createClient();

  const { count } = await supabase
    .from("session_exercises")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId);

  const { error } = await supabase.from("session_exercises").insert({
    session_id: sessionId,
    exercise_id: exerciseId,
    order_index: count ?? 0,
  });
  if (error) throw new Error("הוספת התרגיל נכשלה: " + error.message);

  revalidatePath(`/workouts/${sessionId}`);
}

// Link/unlink an exercise into a superset with the exercise before it.
export async function toggleSuperset(
  sessionExerciseId: string,
  sessionId: string
) {
  const supabase = await createClient();
  const { data: list, error } = await supabase
    .from("session_exercises")
    .select("id, order_index, superset_group")
    .eq("session_id", sessionId)
    .order("order_index");
  if (error || !list) {
    throw new Error("טעינת התרגילים נכשלה: " + error?.message);
  }

  const index = list.findIndex((se) => se.id === sessionExerciseId);
  if (index <= 0) return;
  const target = list[index];
  const prev = list[index - 1];

  if (
    target.superset_group !== null &&
    target.superset_group === prev.superset_group
  ) {
    // unlink from the group; dissolve the group if only one member remains
    await supabase
      .from("session_exercises")
      .update({ superset_group: null })
      .eq("id", target.id);
    const remaining = list.filter(
      (se) => se.id !== target.id && se.superset_group === target.superset_group
    );
    if (remaining.length === 1) {
      await supabase
        .from("session_exercises")
        .update({ superset_group: null })
        .eq("id", remaining[0].id);
    }
  } else {
    let group = prev.superset_group;
    if (group === null) {
      group = Math.max(0, ...list.map((se) => se.superset_group ?? 0)) + 1;
      await supabase
        .from("session_exercises")
        .update({ superset_group: group })
        .eq("id", prev.id);
    }
    await supabase
      .from("session_exercises")
      .update({ superset_group: group })
      .eq("id", target.id);
  }

  revalidatePath(`/workouts/${sessionId}`);
}

export async function removeExerciseFromSession(
  sessionExerciseId: string,
  sessionId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("session_exercises")
    .delete()
    .eq("id", sessionExerciseId);
  if (error) throw new Error("הסרת התרגיל נכשלה: " + error.message);

  revalidatePath(`/workouts/${sessionId}`);
}

const addSetSchema = z.object({
  sessionExerciseId: z.string().uuid(),
  sessionId: z.string().uuid(),
  reps: z.coerce.number().int().min(0).max(1000),
  // empty input = bodyweight set, stored as 0
  weightKg: z.preprocess(
    (v) => (v === "" || v === null ? 0 : v),
    z.coerce.number().min(0).max(2000)
  ),
});

export type SetFormState = { error: string | null };

export async function addSet(
  _prevState: SetFormState,
  formData: FormData
): Promise<SetFormState> {
  const parsed = addSetSchema.safeParse({
    sessionExerciseId: formData.get("sessionExerciseId"),
    sessionId: formData.get("sessionId"),
    reps: formData.get("reps"),
    weightKg: formData.get("weightKg"),
  });
  if (!parsed.success) {
    return { error: "יש להזין חזרות ומשקל תקינים" };
  }
  const { sessionExerciseId, sessionId, reps, weightKg } = parsed.data;

  const supabase = await createClient();

  const { count } = await supabase
    .from("workout_sets")
    .select("id", { count: "exact", head: true })
    .eq("session_exercise_id", sessionExerciseId);

  const { error } = await supabase.from("workout_sets").insert({
    session_exercise_id: sessionExerciseId,
    set_number: (count ?? 0) + 1,
    reps,
    weight_kg: weightKg,
  });
  if (error) {
    return { error: "שמירת הסט נכשלה: " + error.message };
  }

  revalidatePath(`/workouts/${sessionId}`);
  return { error: null };
}

// One-tap logging of a planned set with known reps/weight.
export async function quickAddSet(
  sessionExerciseId: string,
  sessionId: string,
  reps: number,
  weightKg: number
) {
  const parsed = z
    .object({
      sessionExerciseId: z.string().uuid(),
      sessionId: z.string().uuid(),
      reps: z.number().int().min(0).max(1000),
      weightKg: z.number().min(0).max(2000),
    })
    .safeParse({ sessionExerciseId, sessionId, reps, weightKg });
  if (!parsed.success) throw new Error("קלט לא תקין");

  const supabase = await createClient();

  const { count } = await supabase
    .from("workout_sets")
    .select("id", { count: "exact", head: true })
    .eq("session_exercise_id", sessionExerciseId);

  const { error } = await supabase.from("workout_sets").insert({
    session_exercise_id: sessionExerciseId,
    set_number: (count ?? 0) + 1,
    reps,
    weight_kg: weightKg,
  });
  if (error) throw new Error("שמירת הסט נכשלה: " + error.message);

  revalidatePath(`/workouts/${sessionId}`);
}

// Inline edit of an existing set's reps/weight during a workout.
export async function updateSet(
  setId: string,
  sessionId: string,
  reps: number,
  weightKg: number
) {
  const parsed = z
    .object({
      setId: z.string().uuid(),
      sessionId: z.string().uuid(),
      reps: z.number().int().min(0).max(1000),
      weightKg: z.number().min(0).max(2000),
    })
    .safeParse({ setId, sessionId, reps, weightKg });
  if (!parsed.success) throw new Error("קלט לא תקין");

  const supabase = await createClient();
  const { error } = await supabase
    .from("workout_sets")
    .update({ reps, weight_kg: weightKg })
    .eq("id", setId);
  if (error) throw new Error("עדכון הסט נכשל: " + error.message);

  revalidatePath(`/workouts/${sessionId}`);
}

export async function deleteSet(setId: string, sessionId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("workout_sets").delete().eq("id", setId);
  if (error) throw new Error("מחיקת הסט נכשלה: " + error.message);

  revalidatePath(`/workouts/${sessionId}`);
}

const feedbackSchema = z.object({
  sessionId: z.string().uuid(),
  difficultyRating: z.coerce.number().int().min(1).max(5),
  notes: z
    .string()
    .max(2000)
    .transform((s) => s.trim() || null)
    .nullable(),
});

export type FeedbackFormState = { error: string | null };

export async function finishWorkoutSession(
  _prevState: FeedbackFormState,
  formData: FormData
): Promise<FeedbackFormState> {
  const parsed = feedbackSchema.safeParse({
    sessionId: formData.get("sessionId"),
    difficultyRating: formData.get("difficultyRating"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: "יש לבחור דירוג קושי (1-5)" };
  }
  const { sessionId, difficultyRating, notes } = parsed.data;

  const supabase = await createClient();

  const { error: feedbackError } = await supabase
    .from("workout_feedback")
    .insert({
      session_id: sessionId,
      difficulty_rating: difficultyRating,
      notes,
    });
  if (feedbackError) {
    return { error: "שמירת הפידבק נכשלה: " + feedbackError.message };
  }

  const { error: sessionError } = await supabase
    .from("workout_sessions")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (sessionError) {
    return { error: "סיום האימון נכשל: " + sessionError.message };
  }

  revalidatePath(`/workouts/${sessionId}`);
  revalidatePath("/workouts");
  return { error: null };
}

export async function deleteWorkoutSession(sessionId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workout_sessions")
    .delete()
    .eq("id", sessionId);
  if (error) throw new Error("מחיקת האימון נכשלה: " + error.message);

  revalidatePath("/workouts");
  redirect("/workouts");
}

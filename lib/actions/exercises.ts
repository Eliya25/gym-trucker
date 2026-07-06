"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ExerciseFormState = {
  error: string | null;
  createdId?: string;
};

const exerciseSchema = z.object({
  name: z.string().trim().min(1, "יש להזין שם תרגיל").max(100),
  muscleGroup: z
    .string()
    .trim()
    .max(100)
    .transform((s) => s || null)
    .nullable(),
});

export async function createExercise(
  _prevState: ExerciseFormState,
  formData: FormData
): Promise<ExerciseFormState> {
  const parsed = exerciseSchema.safeParse({
    name: formData.get("name"),
    muscleGroup: formData.get("muscleGroup"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "יש להתחבר מחדש" };

  const { data, error } = await supabase
    .from("exercises")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      muscle_group: parsed.data.muscleGroup,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "יצירת התרגיל נכשלה: " + error?.message };
  }

  revalidatePath("/exercises");
  return { error: null, createdId: data.id };
}

export async function deleteExercise(exerciseId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("exercises")
    .delete()
    .eq("id", exerciseId);
  if (error) {
    throw new Error("מחיקת התרגיל נכשלה: " + error.message);
  }
  revalidatePath("/exercises");
}

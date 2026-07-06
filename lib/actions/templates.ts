"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export async function createTemplate(formData: FormData) {
  const name =
    z.string().trim().min(1).max(100).safeParse(formData.get("name")).data ??
    "תוכנית חדשה";

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_templates")
    .insert({ name })
    .select("id")
    .single();
  if (error || !data) {
    throw new Error("יצירת התוכנית נכשלה: " + error?.message);
  }

  redirect(`/templates/${data.id}`);
}

export async function renameTemplate(templateId: string, formData: FormData) {
  const name = z
    .string()
    .trim()
    .min(1)
    .max(100)
    .safeParse(formData.get("name")).data;
  if (!name) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("workout_templates")
    .update({ name })
    .eq("id", templateId);
  if (error) throw new Error("שינוי השם נכשל: " + error.message);

  revalidatePath(`/templates/${templateId}`);
  revalidatePath("/templates");
}

export async function deleteTemplate(templateId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workout_templates")
    .delete()
    .eq("id", templateId);
  if (error) throw new Error("מחיקת התוכנית נכשלה: " + error.message);

  revalidatePath("/templates");
  revalidatePath("/workouts");
  redirect("/templates");
}

export async function addExerciseToTemplate(
  templateId: string,
  exerciseId: string
) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("template_exercises")
    .select("id", { count: "exact", head: true })
    .eq("template_id", templateId);

  const { error } = await supabase.from("template_exercises").insert({
    template_id: templateId,
    exercise_id: exerciseId,
    order_index: count ?? 0,
  });
  if (error) throw new Error("הוספת התרגיל נכשלה: " + error.message);

  revalidatePath(`/templates/${templateId}`);
}

export async function removeExerciseFromTemplate(
  templateExerciseId: string,
  templateId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("template_exercises")
    .delete()
    .eq("id", templateExerciseId);
  if (error) throw new Error("הסרת התרגיל נכשלה: " + error.message);

  revalidatePath(`/templates/${templateId}`);
}

// Link/unlink a template exercise into a superset with the exercise before it.
export async function toggleTemplateSuperset(
  templateExerciseId: string,
  templateId: string
) {
  const supabase = await createClient();
  const { data: list, error } = await supabase
    .from("template_exercises")
    .select("id, order_index, superset_group")
    .eq("template_id", templateId)
    .order("order_index");
  if (error || !list) {
    throw new Error("טעינת התרגילים נכשלה: " + error?.message);
  }

  const index = list.findIndex((te) => te.id === templateExerciseId);
  if (index <= 0) return;
  const target = list[index];
  const prev = list[index - 1];

  if (
    target.superset_group !== null &&
    target.superset_group === prev.superset_group
  ) {
    await supabase
      .from("template_exercises")
      .update({ superset_group: null })
      .eq("id", target.id);
    const remaining = list.filter(
      (te) => te.id !== target.id && te.superset_group === target.superset_group
    );
    if (remaining.length === 1) {
      await supabase
        .from("template_exercises")
        .update({ superset_group: null })
        .eq("id", remaining[0].id);
    }
  } else {
    let group = prev.superset_group;
    if (group === null) {
      group = Math.max(0, ...list.map((te) => te.superset_group ?? 0)) + 1;
      await supabase
        .from("template_exercises")
        .update({ superset_group: group })
        .eq("id", prev.id);
    }
    await supabase
      .from("template_exercises")
      .update({ superset_group: group })
      .eq("id", target.id);
  }

  revalidatePath(`/templates/${templateId}`);
}

// Start a workout session pre-filled with the template's exercises.
export async function startWorkoutFromTemplate(templateId: string) {
  const supabase = await createClient();

  const { data: templateExercises, error } = await supabase
    .from("template_exercises")
    .select("exercise_id, order_index, superset_group")
    .eq("template_id", templateId)
    .order("order_index");
  if (error) throw new Error("טעינת התוכנית נכשלה: " + error.message);

  const { data: session, error: sessionError } = await supabase
    .from("workout_sessions")
    .insert({ template_id: templateId })
    .select("id")
    .single();
  if (sessionError || !session) {
    throw new Error("יצירת האימון נכשלה: " + sessionError?.message);
  }

  if (templateExercises && templateExercises.length > 0) {
    const { error: insertError } = await supabase
      .from("session_exercises")
      .insert(
        templateExercises.map((te) => ({
          session_id: session.id,
          exercise_id: te.exercise_id,
          order_index: te.order_index,
          superset_group: te.superset_group,
        }))
      );
    if (insertError) {
      throw new Error("מילוי האימון מהתוכנית נכשל: " + insertError.message);
    }
  }

  redirect(`/workouts/${session.id}`);
}

// Save an existing session's exercise list as a reusable template.
export async function createTemplateFromSession(formData: FormData) {
  const sessionId = z
    .string()
    .uuid()
    .safeParse(formData.get("sessionId")).data;
  if (!sessionId) throw new Error("קלט לא תקין");
  const name =
    z.string().trim().min(1).max(100).safeParse(formData.get("name")).data ??
    "תוכנית חדשה";

  const supabase = await createClient();

  const { data: sessionExercises, error } = await supabase
    .from("session_exercises")
    .select(
      "exercise_id, order_index, superset_group, workout_sets(set_number, reps, weight_kg)"
    )
    .eq("session_id", sessionId)
    .order("order_index");
  if (error) throw new Error("טעינת האימון נכשלה: " + error.message);

  const { data: template, error: templateError } = await supabase
    .from("workout_templates")
    .insert({ name })
    .select("id")
    .single();
  if (templateError || !template) {
    throw new Error("יצירת התוכנית נכשלה: " + templateError?.message);
  }

  if (sessionExercises && sessionExercises.length > 0) {
    const { data: inserted, error: insertError } = await supabase
      .from("template_exercises")
      .insert(
        sessionExercises.map((se) => ({
          template_id: template.id,
          exercise_id: se.exercise_id,
          order_index: se.order_index,
          superset_group: se.superset_group,
        }))
      )
      .select("id, order_index");
    if (insertError || !inserted) {
      throw new Error("שמירת התוכנית נכשלה: " + insertError?.message);
    }

    // copy the logged sets as the template's planned sets
    const byOrderIndex = new Map(inserted.map((te) => [te.order_index, te.id]));
    const setRows = sessionExercises.flatMap((se) => {
      const templateExerciseId = byOrderIndex.get(se.order_index);
      if (!templateExerciseId) return [];
      return se.workout_sets.map((set) => ({
        template_exercise_id: templateExerciseId,
        set_number: set.set_number,
        reps: set.reps,
        weight_kg: set.weight_kg,
      }));
    });
    if (setRows.length > 0) {
      const { error: setsError } = await supabase
        .from("template_sets")
        .insert(setRows);
      if (setsError) {
        throw new Error("שמירת הסטים בתוכנית נכשלה: " + setsError.message);
      }
    }
  }

  redirect(`/templates/${template.id}`);
}

const templateSetSchema = z.object({
  reps: z.coerce.number().int().min(0).max(1000),
  weightKg: z.preprocess(
    (v) => (v === "" || v === null ? 0 : v),
    z.coerce.number().min(0).max(2000)
  ),
});

export async function addTemplateSet(
  templateExerciseId: string,
  templateId: string,
  formData: FormData
) {
  const parsed = templateSetSchema.safeParse({
    reps: formData.get("reps"),
    weightKg: formData.get("weightKg"),
  });
  if (!parsed.success) return;

  const supabase = await createClient();

  const { count } = await supabase
    .from("template_sets")
    .select("id", { count: "exact", head: true })
    .eq("template_exercise_id", templateExerciseId);

  const { error } = await supabase.from("template_sets").insert({
    template_exercise_id: templateExerciseId,
    set_number: (count ?? 0) + 1,
    reps: parsed.data.reps,
    weight_kg: parsed.data.weightKg,
  });
  if (error) throw new Error("הוספת הסט נכשלה: " + error.message);

  revalidatePath(`/templates/${templateId}`);
}

export async function deleteTemplateSet(
  templateSetId: string,
  templateId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("template_sets")
    .delete()
    .eq("id", templateSetId);
  if (error) throw new Error("מחיקת הסט נכשלה: " + error.message);

  revalidatePath(`/templates/${templateId}`);
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type WeightFormState = { error: string | null };

const weightSchema = z.object({
  weightKg: z.coerce.number().min(20, "משקל לא תקין").max(400, "משקל לא תקין"),
  loggedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "תאריך לא תקין"),
});

export async function addWeightLog(
  _prevState: WeightFormState,
  formData: FormData
): Promise<WeightFormState> {
  const parsed = weightSchema.safeParse({
    weightKg: formData.get("weightKg"),
    loggedOn: formData.get("loggedOn"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "יש להתחבר מחדש" };

  // one entry per day — logging again for the same date updates it
  const { error } = await supabase.from("body_weight_logs").upsert(
    {
      user_id: user.id,
      logged_on: parsed.data.loggedOn,
      weight_kg: parsed.data.weightKg,
    },
    { onConflict: "user_id,logged_on" }
  );
  if (error) return { error: "שמירת המשקל נכשלה: " + error.message };

  revalidatePath("/weight");
  return { error: null };
}

export async function deleteWeightLog(logId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("body_weight_logs")
    .delete()
    .eq("id", logId);
  if (error) throw new Error("מחיקת הרישום נכשלה: " + error.message);

  revalidatePath("/weight");
}

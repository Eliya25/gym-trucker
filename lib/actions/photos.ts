"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Called after the browser uploads the file to storage.
export async function recordPhoto(storagePath: string, takenOn: string) {
  const parsed = z
    .object({
      storagePath: z.string().min(1).max(500),
      takenOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    })
    .safeParse({ storagePath, takenOn });
  if (!parsed.success) throw new Error("קלט לא תקין");

  const supabase = await createClient();
  const { error } = await supabase.from("progress_photos").insert({
    storage_path: parsed.data.storagePath,
    taken_on: parsed.data.takenOn,
  });
  if (error) throw new Error("שמירת התמונה נכשלה: " + error.message);

  revalidatePath("/photos");
}

export async function deletePhoto(photoId: string, storagePath: string) {
  const supabase = await createClient();

  const { error: storageError } = await supabase.storage
    .from("progress-photos")
    .remove([storagePath]);
  if (storageError) {
    throw new Error("מחיקת הקובץ נכשלה: " + storageError.message);
  }

  const { error } = await supabase
    .from("progress_photos")
    .delete()
    .eq("id", photoId);
  if (error) throw new Error("מחיקת התמונה נכשלה: " + error.message);

  revalidatePath("/photos");
}

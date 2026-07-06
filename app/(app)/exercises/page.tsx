import { createClient } from "@/lib/supabase/server";
import type { Exercise } from "@/lib/types/domain";
import { ExerciseManager } from "@/components/workouts/ExerciseManager";

export default async function ExercisesPage() {
  const supabase = await createClient();

  const [{ data: exercises }, { data: userData }] = await Promise.all([
    supabase.from("exercises").select("*").order("name"),
    supabase.auth.getUser(),
  ]);

  return (
    <ExerciseManager
      exercises={(exercises ?? []) as Exercise[]}
      currentUserId={userData.user?.id ?? null}
    />
  );
}

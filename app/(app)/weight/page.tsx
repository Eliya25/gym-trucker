import { createClient } from "@/lib/supabase/server";
import type { BodyWeightLog } from "@/lib/types/domain";
import { WeightTracker } from "@/components/weight/WeightTracker";

export default async function WeightPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("body_weight_logs")
    .select("*")
    .order("logged_on", { ascending: false });

  return <WeightTracker logs={(data ?? []) as BodyWeightLog[]} />;
}

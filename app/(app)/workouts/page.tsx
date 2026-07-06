import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createWorkoutSession } from "@/lib/actions/workouts";
import { startWorkoutFromTemplate } from "@/lib/actions/templates";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { WorkoutHistoryList } from "@/components/workouts/WorkoutHistoryList";
import type { SessionListItem, TemplateListItem } from "@/lib/types/domain";

export default async function WorkoutsPage() {
  const supabase = await createClient();

  const [{ data: completed }, { data: active }, { data: templatesData }] =
    await Promise.all([
      supabase
        .from("workout_sessions")
        .select("*, workout_feedback(difficulty_rating), session_exercises(id)")
        .not("completed_at", "is", null)
        .order("started_at", { ascending: false }),
      supabase
        .from("workout_sessions")
        .select("id, started_at")
        .is("completed_at", null)
        .order("started_at", { ascending: false })
        .limit(1),
      supabase
        .from("workout_templates")
        .select("*, template_exercises(id, template_sets(id))")
        .order("created_at", { ascending: false }),
    ]);

  const activeSession = active?.[0] ?? null;
  const sessions = (completed ?? []) as unknown as SessionListItem[];
  const templates = (templatesData ?? []) as unknown as TemplateListItem[];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">האימונים שלי</h1>

      {activeSession ? (
        <Link
          href={`/workouts/${activeSession.id}`}
          className="block rounded-xl border-2 border-emerald-500 bg-emerald-950 p-4 text-emerald-100 transition-colors hover:bg-emerald-900"
        >
          <span className="font-semibold">יש לך אימון פעיל! </span>
          לחץ כאן כדי להמשיך אותו ←
        </Link>
      ) : (
        <Card className="flex flex-col gap-3">
          <h2 className="font-semibold">התחל אימון</h2>
          {templates.length > 0 && (
            <ul className="flex flex-col gap-2">
              {templates.map((template) => {
                const setCount = template.template_exercises.reduce(
                  (sum, te) => sum + te.template_sets.length,
                  0
                );
                return (
                <li
                  key={template.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{template.name}</span>
                    <span className="text-xs text-zinc-500">
                      {template.template_exercises.length} תרגילים · {setCount}{" "}
                      סטים מתוכננים
                    </span>
                  </div>
                  <form
                    action={startWorkoutFromTemplate.bind(null, template.id)}
                  >
                    <Button type="submit">התחל ▶</Button>
                  </form>
                </li>
                );
              })}
            </ul>
          )}
          <div className="flex items-center gap-3">
            <form action={createWorkoutSession}>
              <Button type="submit" variant="secondary">
                + אימון חופשי (בלי תוכנית)
              </Button>
            </form>
            <Link
              href="/templates"
              className="text-sm text-emerald-400 hover:underline"
            >
              ניהול תוכניות ←
            </Link>
          </div>
        </Card>
      )}

      <h2 className="font-semibold">היסטוריה</h2>
      <WorkoutHistoryList sessions={sessions} />
    </div>
  );
}

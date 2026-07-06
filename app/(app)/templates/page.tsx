import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  createTemplate,
  startWorkoutFromTemplate,
} from "@/lib/actions/templates";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { TemplateListItem } from "@/lib/types/domain";

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workout_templates")
    .select("*, template_exercises(id, template_sets(id))")
    .order("created_at", { ascending: false });

  const templates = (data ?? []) as unknown as TemplateListItem[];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">תוכניות אימון</h1>

      <Card className="flex flex-col gap-3">
        <h2 className="font-semibold">תוכנית חדשה</h2>
        <form action={createTemplate} className="flex flex-col gap-2 sm:flex-row">
          <Input
            name="name"
            maxLength={100}
            placeholder="שם התוכנית (למשל: אימון A — חזה + כתפיים)"
            required
            className="sm:flex-1"
          />
          <Button type="submit">+ צור תוכנית</Button>
        </form>
      </Card>

      {templates.length === 0 ? (
        <Card className="text-center text-zinc-500">
          עדיין אין תוכניות. צור תוכנית למעלה, או שמור אימון קיים כתוכנית מתוך
          מסך הסיכום שלו.
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {templates.map((template) => {
            const setCount = template.template_exercises.reduce(
              (sum, te) => sum + te.template_sets.length,
              0
            );
            return (
            <li key={template.id}>
              <Card className="flex items-center justify-between">
                <div className="flex flex-col">
                  <Link
                    href={`/templates/${template.id}`}
                    className="font-semibold hover:text-emerald-400"
                  >
                    {template.name}
                  </Link>
                  <span className="text-sm text-zinc-500">
                    {template.template_exercises.length} תרגילים · {setCount}{" "}
                    סטים מתוכננים
                    {setCount === 0 &&
                      template.template_exercises.length > 0 && (
                        <span className="text-amber-400">
                          {" "}
                          — הוסף סטים בעריכה כדי שיופיעו באימון
                        </span>
                      )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/templates/${template.id}`}
                    className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                  >
                    עריכה
                  </Link>
                  <form action={startWorkoutFromTemplate.bind(null, template.id)}>
                    <Button type="submit">התחל אימון ▶</Button>
                  </form>
                </div>
              </Card>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

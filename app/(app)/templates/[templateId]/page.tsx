import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Exercise, TemplateDetail } from "@/lib/types/domain";
import { TemplateEditor } from "@/components/workouts/TemplateEditor";

export default async function TemplatePage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const supabase = await createClient();

  const [{ data: template }, { data: exercises }] = await Promise.all([
    supabase
      .from("workout_templates")
      .select(
        "*, template_exercises(*, exercise:exercises(*), template_sets(*))"
      )
      .eq("id", templateId)
      .maybeSingle(),
    supabase.from("exercises").select("*").order("name"),
  ]);

  if (!template) notFound();

  const raw = template as unknown as TemplateDetail;
  const detail: TemplateDetail = {
    ...raw,
    template_exercises: [...raw.template_exercises]
      .sort((a, b) => a.order_index - b.order_index)
      .map((te) => ({
        ...te,
        template_sets: [...te.template_sets].sort(
          (a, b) => a.set_number - b.set_number
        ),
      })),
  };

  return (
    <TemplateEditor
      template={detail}
      allExercises={(exercises ?? []) as Exercise[]}
    />
  );
}

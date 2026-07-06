"use client";

import Link from "next/link";
import type { Exercise, TemplateDetail } from "@/lib/types/domain";
import {
  addExerciseToTemplate,
  addTemplateSet,
  deleteTemplate,
  deleteTemplateSet,
  removeExerciseFromTemplate,
  renameTemplate,
  startWorkoutFromTemplate,
  toggleTemplateSuperset,
} from "@/lib/actions/templates";
import { groupBySuperset } from "@/lib/superset";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { ExercisePicker } from "./ExercisePicker";

export function TemplateEditor({
  template,
  allExercises,
}: {
  template: TemplateDetail;
  allExercises: Exercise[];
}) {
  const firstId = template.template_exercises[0]?.id;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/templates"
          className="text-sm text-zinc-500 hover:text-white"
        >
          → חזרה לתוכניות
        </Link>
        <div className="mt-2 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">{template.name}</h1>
          <form action={startWorkoutFromTemplate.bind(null, template.id)}>
            <Button type="submit">התחל אימון ▶</Button>
          </form>
        </div>
      </div>

      <Card className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-zinc-400">שינוי שם</h2>
        <form
          action={renameTemplate.bind(null, template.id)}
          className="flex gap-2"
        >
          <Input
            name="name"
            defaultValue={template.name}
            maxLength={100}
            required
            className="flex-1"
          />
          <Button type="submit" variant="secondary">
            שמור שם
          </Button>
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">
          תרגילים בתוכנית ({template.template_exercises.length})
        </h2>
        {template.template_exercises.length === 0 && (
          <p className="text-sm text-zinc-500">
            התוכנית ריקה — הוסף תרגילים למטה.
          </p>
        )}
        {groupBySuperset(template.template_exercises).map((group) => (
          <div
            key={group.items[0].id}
            className={
              group.isSuperset
                ? "flex flex-col gap-2 rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 p-2"
                : "contents"
            }
          >
            {group.isSuperset && (
              <span className="px-2 pt-1 text-xs font-semibold text-amber-400">
                🔁 סופר-סט
              </span>
            )}
            {group.items.map((te, i) => {
              const linkedWithPrevious = group.isSuperset && i > 0;
              const isAbs = te.exercise.muscle_group === "בטן";
              return (
                <Card key={te.id} className="flex flex-col gap-3 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{te.exercise.name}</span>
                      {te.exercise.muscle_group && (
                        <span className="mr-2 text-xs text-zinc-400">
                          {te.exercise.muscle_group}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {te.id !== firstId && (
                        <form
                          action={toggleTemplateSuperset.bind(
                            null,
                            te.id,
                            template.id
                          )}
                        >
                          <button
                            type="submit"
                            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                              linkedWithPrevious
                                ? "border-amber-500/60 text-amber-400 hover:border-red-500/60 hover:text-red-400"
                                : "border-zinc-700 text-zinc-400 hover:border-amber-500/60 hover:text-amber-400"
                            }`}
                          >
                            {linkedWithPrevious
                              ? "✂ נתק סופר-סט"
                              : "🔗 סופר-סט"}
                          </button>
                        </form>
                      )}
                      <form
                        action={removeExerciseFromTemplate.bind(
                          null,
                          te.id,
                          template.id
                        )}
                      >
                        <button
                          type="submit"
                          className="text-sm text-zinc-400 hover:text-red-400"
                          title="הסר תרגיל"
                        >
                          ✕
                        </button>
                      </form>
                    </div>
                  </div>

                  {te.template_sets.length > 0 && (
                    <ul className="flex flex-col gap-1">
                      {te.template_sets.map((set, setIndex) => (
                        <li
                          key={set.id}
                          className="flex items-center justify-between rounded-lg bg-zinc-950 px-3 py-1.5 text-sm"
                        >
                          <span>
                            סט {setIndex + 1}:{" "}
                            <span dir="ltr">
                              {Number(set.weight_kg) > 0
                                ? `${Number(set.weight_kg)}kg × ${set.reps}`
                                : `× ${set.reps}`}
                            </span>
                          </span>
                          <form
                            action={deleteTemplateSet.bind(
                              null,
                              set.id,
                              template.id
                            )}
                          >
                            <button
                              type="submit"
                              className="text-xs text-zinc-500 hover:text-red-400"
                              title="מחק סט"
                            >
                              ✕
                            </button>
                          </form>
                        </li>
                      ))}
                    </ul>
                  )}

                  <form
                    action={addTemplateSet.bind(null, te.id, template.id)}
                    className="flex items-end gap-2"
                  >
                    <div className="flex flex-1 flex-col gap-1">
                      <label className="text-xs text-zinc-500">חזרות</label>
                      <Input
                        name="reps"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={1000}
                        dir="ltr"
                        required
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <label className="text-xs text-zinc-500">
                        {isAbs ? "משקל (ק”ג) — לא חובה" : "משקל (ק”ג)"}
                      </label>
                      <Input
                        name="weightKg"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        max={2000}
                        step={0.5}
                        dir="ltr"
                        placeholder={isAbs ? "משקל גוף" : undefined}
                        required={!isAbs}
                      />
                    </div>
                    <Button type="submit" variant="secondary">
                      + סט מתוכנן
                    </Button>
                  </form>
                </Card>
              );
            })}
          </div>
        ))}
      </div>

      <ExercisePicker
        allExercises={allExercises}
        alreadyAddedIds={template.template_exercises.map((te) => te.exercise_id)}
        onPick={(exerciseId) => addExerciseToTemplate(template.id, exerciseId)}
      />

      <ConfirmButton
        confirmText="למחוק את התוכנית? האימונים שכבר תועדו ממנה לא יימחקו."
        action={deleteTemplate.bind(null, template.id)}
        className="self-center"
      >
        🗑 מחק תוכנית
      </ConfirmButton>
    </div>
  );
}

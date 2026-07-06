import type { Database } from "./database.types";

export type Exercise = Database["public"]["Tables"]["exercises"]["Row"];
export type WorkoutSession =
  Database["public"]["Tables"]["workout_sessions"]["Row"];
export type SessionExercise =
  Database["public"]["Tables"]["session_exercises"]["Row"];
export type WorkoutSet = Database["public"]["Tables"]["workout_sets"]["Row"];
export type WorkoutFeedback =
  Database["public"]["Tables"]["workout_feedback"]["Row"];

export type SessionExerciseWithSets = SessionExercise & {
  exercise: Exercise;
  workout_sets: WorkoutSet[];
};

export type SessionDetail = WorkoutSession & {
  session_exercises: SessionExerciseWithSets[];
  workout_feedback: WorkoutFeedback | null;
};

export type SessionListItem = WorkoutSession & {
  workout_feedback: Pick<WorkoutFeedback, "difficulty_rating"> | null;
  session_exercises: { id: string }[];
};

export type WorkoutTemplate =
  Database["public"]["Tables"]["workout_templates"]["Row"];
export type TemplateExercise =
  Database["public"]["Tables"]["template_exercises"]["Row"];

export type TemplateSet =
  Database["public"]["Tables"]["template_sets"]["Row"];

export type TemplateExerciseWithExercise = TemplateExercise & {
  exercise: Exercise;
  template_sets: TemplateSet[];
};

export type PlannedSet = { reps: number; weight_kg: number };

export type BodyWeightLog =
  Database["public"]["Tables"]["body_weight_logs"]["Row"];
export type ProgressPhoto =
  Database["public"]["Tables"]["progress_photos"]["Row"];

export type TemplateDetail = WorkoutTemplate & {
  template_exercises: TemplateExerciseWithExercise[];
};

export type TemplateListItem = WorkoutTemplate & {
  template_exercises: { id: string; template_sets: { id: string }[] }[];
};

// Database types for the Supabase schema (supabase/migrations/0001_init.sql).
// After creating your Supabase project you can regenerate this file with:
//   npx supabase gen types typescript --project-id <ref> --schema public > lib/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      exercises: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          muscle_group: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          muscle_group?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          muscle_group?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      workout_sessions: {
        Row: {
          id: string;
          user_id: string;
          started_at: string;
          completed_at: string | null;
          template_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          started_at?: string;
          completed_at?: string | null;
          template_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          started_at?: string;
          completed_at?: string | null;
          template_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_sessions_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "workout_templates";
            referencedColumns: ["id"];
          },
        ];
      };
      session_exercises: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          exercise_id: string;
          order_index: number;
          superset_group: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          session_id: string;
          exercise_id: string;
          order_index?: number;
          superset_group?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string;
          exercise_id?: string;
          order_index?: number;
          superset_group?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_exercises_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "workout_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_exercises_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
        ];
      };
      workout_sets: {
        Row: {
          id: string;
          user_id: string;
          session_exercise_id: string;
          set_number: number;
          reps: number;
          weight_kg: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          session_exercise_id: string;
          set_number: number;
          reps: number;
          weight_kg: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_exercise_id?: string;
          set_number?: number;
          reps?: number;
          weight_kg?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_sets_session_exercise_id_fkey";
            columns: ["session_exercise_id"];
            isOneToOne: false;
            referencedRelation: "session_exercises";
            referencedColumns: ["id"];
          },
        ];
      };
      workout_feedback: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          difficulty_rating: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          session_id: string;
          difficulty_rating: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string;
          difficulty_rating?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_feedback_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: true;
            referencedRelation: "workout_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      workout_templates: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      template_sets: {
        Row: {
          id: string;
          user_id: string;
          template_exercise_id: string;
          set_number: number;
          reps: number;
          weight_kg: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          template_exercise_id: string;
          set_number: number;
          reps: number;
          weight_kg: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          template_exercise_id?: string;
          set_number?: number;
          reps?: number;
          weight_kg?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "template_sets_template_exercise_id_fkey";
            columns: ["template_exercise_id"];
            isOneToOne: false;
            referencedRelation: "template_exercises";
            referencedColumns: ["id"];
          },
        ];
      };
      template_exercises: {
        Row: {
          id: string;
          user_id: string;
          template_id: string;
          exercise_id: string;
          order_index: number;
          superset_group: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          template_id: string;
          exercise_id: string;
          order_index?: number;
          superset_group?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          template_id?: string;
          exercise_id?: string;
          order_index?: number;
          superset_group?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "template_exercises_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "workout_templates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "template_exercises_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

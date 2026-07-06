-- Phase 1 schema: workout logging + end-of-workout feedback
-- Exercises: NULL user_id = global/shared exercise, non-null = personal custom exercise

create table exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  muscle_group text,
  created_at timestamptz not null default now()
);
create index exercises_user_id_idx on exercises(user_id);

-- A single logged workout
create table workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz, -- null while the workout is in progress
  created_at timestamptz not null default now()
);
create index workout_sessions_user_started_idx on workout_sessions(user_id, started_at desc);

-- Which exercises were done in a session, and in what order
create table session_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  session_id uuid not null references workout_sessions(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);
create index session_exercises_session_idx on session_exercises(session_id);

-- Individual sets: reps + weight per exercise, in order
create table workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  session_exercise_id uuid not null references session_exercises(id) on delete cascade,
  set_number integer not null,
  reps integer not null check (reps >= 0),
  weight_kg numeric(6,2) not null check (weight_kg >= 0),
  created_at timestamptz not null default now()
);
create index workout_sets_session_exercise_idx on workout_sets(session_exercise_id);

-- End-of-workout feedback, one per session
create table workout_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  session_id uuid not null unique references workout_sessions(id) on delete cascade,
  difficulty_rating smallint not null check (difficulty_rating between 1 and 5),
  notes text,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table exercises enable row level security;
alter table workout_sessions enable row level security;
alter table session_exercises enable row level security;
alter table workout_sets enable row level security;
alter table workout_feedback enable row level security;

-- exercises: everyone can read global rows + their own; only own rows are writable
create policy "read own or global exercises" on exercises
  for select to authenticated using (user_id is null or user_id = auth.uid());
create policy "insert own exercises" on exercises
  for insert to authenticated with check (user_id = auth.uid());
create policy "update own exercises" on exercises
  for update to authenticated using (user_id = auth.uid());
create policy "delete own exercises" on exercises
  for delete to authenticated using (user_id = auth.uid());

-- remaining tables: simple "own rows only" policy
create policy "own rows only" on workout_sessions
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows only" on session_exercises
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows only" on workout_sets
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows only" on workout_feedback
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

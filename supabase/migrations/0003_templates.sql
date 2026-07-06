-- Workout templates: build a workout once, start it with one click every time.
create table workout_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
create index workout_templates_user_idx on workout_templates(user_id);

create table template_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  template_id uuid not null references workout_templates(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  order_index integer not null default 0,
  superset_group smallint,
  created_at timestamptz not null default now()
);
create index template_exercises_template_idx on template_exercises(template_id);

alter table workout_templates enable row level security;
alter table template_exercises enable row level security;

create policy "own rows only" on workout_templates
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows only" on template_exercises
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

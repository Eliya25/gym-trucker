-- Planned sets inside a template (reps + weight per set), and a link from a
-- session back to the template it was started from.

alter table workout_sessions
  add column template_id uuid references workout_templates(id) on delete set null;

create table template_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  template_exercise_id uuid not null references template_exercises(id) on delete cascade,
  set_number integer not null,
  reps integer not null check (reps >= 0),
  weight_kg numeric(6,2) not null check (weight_kg >= 0),
  created_at timestamptz not null default now()
);
create index template_sets_template_exercise_idx on template_sets(template_exercise_id);

alter table template_sets enable row level security;
create policy "own rows only" on template_sets
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

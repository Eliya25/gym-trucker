-- Body weight tracking + progress photos (incl. private storage bucket)

create table body_weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  logged_on date not null default current_date,
  weight_kg numeric(5,2) not null check (weight_kg > 0),
  created_at timestamptz not null default now(),
  unique (user_id, logged_on) -- one entry per day, re-logging updates it
);
create index body_weight_logs_user_date_idx on body_weight_logs(user_id, logged_on desc);

create table progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  taken_on date not null default current_date,
  storage_path text not null,
  note text,
  created_at timestamptz not null default now()
);
create index progress_photos_user_date_idx on progress_photos(user_id, taken_on desc);

alter table body_weight_logs enable row level security;
alter table progress_photos enable row level security;

create policy "own rows only" on body_weight_logs
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows only" on progress_photos
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Private storage bucket; each user's photos live under a folder named by
-- their user id, and the policies only allow access to your own folder.
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

create policy "own progress photos select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "own progress photos insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "own progress photos delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

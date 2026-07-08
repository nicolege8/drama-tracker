-- Drama Tracker MVP schema.
-- Run this in the Supabase project's SQL editor (SQL Editor > New query) after creating the project.

create type drama_status as enum ('watching', 'completed', 'plan_to_watch');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text not null unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table drama_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  tmdb_id integer not null,
  title text not null,
  poster_path text,
  status drama_status not null default 'plan_to_watch',
  rating smallint check (rating between 1 and 10),
  updated_at timestamptz not null default now(),
  unique (user_id, tmdb_id)
);

create table follows (
  follower_id uuid not null references profiles on delete cascade,
  following_id uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- Keep updated_at current on every edit; also drives the activity feed ordering.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger drama_entries_set_updated_at
  before update on drama_entries
  for each row execute function set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Row Level Security
alter table profiles enable row level security;
alter table drama_entries enable row level security;
alter table follows enable row level security;

create policy "profiles are viewable by everyone"
  on profiles for select using (true);

create policy "users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "drama entries are viewable by everyone"
  on drama_entries for select using (true);

create policy "users can insert own drama entries"
  on drama_entries for insert with check (auth.uid() = user_id);

create policy "users can update own drama entries"
  on drama_entries for update using (auth.uid() = user_id);

create policy "users can delete own drama entries"
  on drama_entries for delete using (auth.uid() = user_id);

create policy "follows are viewable by everyone"
  on follows for select using (true);

create policy "users can manage own follows"
  on follows for insert with check (auth.uid() = follower_id);

create policy "users can remove own follows"
  on follows for delete using (auth.uid() = follower_id);

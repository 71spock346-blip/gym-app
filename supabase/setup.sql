-- Stay Strong: run this once in Supabase → SQL Editor → New query → Run.
-- It makes two tables. Row Level Security means each signed-in person can only
-- ever see and change their own rows, which is why the app's public key is safe.

-- 1. Saved data: one row per setting (goal, sessions, sets, weights, coach chat...)
create table if not exists public.user_store (
  user_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  key        text not null,
  value      jsonb,
  stamp      bigint not null default 0,          -- when the phone changed it (ms)
  updated_at timestamptz not null default now(), -- when the cloud got it
  primary key (user_id, key)
);
create index if not exists user_store_updated on public.user_store (user_id, updated_at);

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at := clock_timestamp(); return new; end $$;
drop trigger if exists user_store_touch on public.user_store;
create trigger user_store_touch before insert or update on public.user_store
  for each row execute function public.touch_updated_at();

alter table public.user_store enable row level security;
drop policy if exists "own rows: read" on public.user_store;
drop policy if exists "own rows: add" on public.user_store;
drop policy if exists "own rows: change" on public.user_store;
drop policy if exists "own rows: remove" on public.user_store;
create policy "own rows: read"   on public.user_store for select using (auth.uid() = user_id);
create policy "own rows: add"    on public.user_store for insert with check (auth.uid() = user_id);
create policy "own rows: change" on public.user_store for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows: remove" on public.user_store for delete using (auth.uid() = user_id);

-- 2. Coach log: one row per coach question, for the daily limit.
-- People can add and count their own rows but not delete them.
create table if not exists public.coach_log (
  id      bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  at      timestamptz not null default now()
);
create index if not exists coach_log_user_at on public.coach_log (user_id, at);
alter table public.coach_log enable row level security;
drop policy if exists "own log: read" on public.coach_log;
drop policy if exists "own log: add" on public.coach_log;
create policy "own log: read" on public.coach_log for select using (auth.uid() = user_id);
create policy "own log: add"  on public.coach_log for insert with check (auth.uid() = user_id);

-- 3. Let signed-in people use the tables at all (row level security above still
-- limits them to their own rows). Newer Supabase projects no longer grant this
-- automatically. Signed-out visitors get nothing.
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.user_store to authenticated;
grant select, insert on public.coach_log to authenticated;

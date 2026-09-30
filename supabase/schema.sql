create table if not exists public.app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.app_state enable row level security;
drop policy if exists "read own state" on public.app_state;
drop policy if exists "insert own state" on public.app_state;
drop policy if exists "update own state" on public.app_state;
create policy "read own state" on public.app_state for select to authenticated using ((select auth.uid()) = user_id);
create policy "insert own state" on public.app_state for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "update own state" on public.app_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

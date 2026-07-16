-- Run this once in the Supabase SQL Editor (Dashboard → SQL → New query).
-- No login: anyone with your site URL can read and write board data.

create table if not exists boards (
  id text primary key,
  title text not null,
  columns jsonb not null,
  cards jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists app_preferences (
  id text primary key default 'shared',
  active_board_id text not null default 'sundance-renovations',
  dark_mode boolean not null default false,
  show_archived boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table boards enable row level security;
alter table app_preferences enable row level security;

drop policy if exists "Public boards access" on boards;
create policy "Public boards access"
  on boards
  for all
  using (true)
  with check (true);

drop policy if exists "Public preferences access" on app_preferences;
create policy "Public preferences access"
  on app_preferences
  for all
  using (true)
  with check (true);

-- Seed preference row (boards are seeded by the app on first load if empty)
insert into app_preferences (id, active_board_id, dark_mode, show_archived)
values ('shared', 'sundance-renovations', false, false)
on conflict (id) do nothing;

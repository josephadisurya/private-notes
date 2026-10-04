-- private-notes: tables for notes and login sessions.
-- Run once in Supabase → SQL Editor. Safe to re-run.
--
-- Only server-side code touches these tables, using the service-role key
-- (lib/supabase.js), which bypasses row-level security. RLS is turned ON
-- with no policies, so the public anon key can't read or write them at all.

create table if not exists public.notes_sessions (
  id         text primary key,
  ip         text,
  device     text,
  created_at timestamptz not null default now(),
  last_seen  timestamptz not null default now()
);

create table if not exists public.private_notes (
  id         uuid primary key,
  title      text not null default '',
  body       text not null default '',
  footer     text not null default '',
  version    integer not null default 1,   -- +1 on every save; detects edits from two devices
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists private_notes_updated_at_idx
  on public.private_notes (updated_at desc);

alter table public.notes_sessions enable row level security;
alter table public.private_notes  enable row level security;

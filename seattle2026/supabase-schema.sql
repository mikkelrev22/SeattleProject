-- ─────────────────────────────────────────────────
-- Seattle 2026 — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ─────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── User profiles ──────────────────────────────────
create table if not exists public.user_profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text unique not null,
  context         jsonb not null default '{}',
  interaction_count integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function update_updated_at();

-- ── Card votes ─────────────────────────────────────
create table if not exists public.card_votes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.user_profiles(id) on delete cascade,
  card_id     text not null,
  card_title  text not null,
  vote        text check (vote in ('up', 'down')) not null,
  created_at  timestamptz not null default now(),
  unique (user_id, card_id)
);

-- ── RLS policies ───────────────────────────────────
alter table public.user_profiles enable row level security;
alter table public.card_votes enable row level security;

-- Users can only read/write their own profile
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

-- Users can only view/write their own votes
create policy "Users can manage own votes"
  on public.card_votes for all
  using (auth.uid() = user_id);

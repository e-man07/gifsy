-- Gifsy launch schema: ownership, plans, published scenes, subscriptions.
-- Creation stays local/anonymous; these tables back publishing + billing only.

-- ── profiles: one row per auth user, carrying their plan ─────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro', 'studio')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── scenes: published 2.5D scenes (assets live in Blob; this is the index) ────
create table if not exists public.scenes (
  id text primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  config jsonb not null default '{}'::jsonb,
  image_url text,
  depth_url text,
  mask_url text,
  background_url text,
  watermark boolean not null default true,
  custom_domain text,
  view_count integer not null default 0
);

create index if not exists scenes_owner_idx on public.scenes (owner_id, created_at desc);

alter table public.scenes enable row level security;

-- Published scenes are public content: anyone can read (embeds, share pages).
drop policy if exists "scenes: public read" on public.scenes;
create policy "scenes: public read" on public.scenes
  for select using (true);

drop policy if exists "scenes: owner insert" on public.scenes;
create policy "scenes: owner insert" on public.scenes
  for insert with check (auth.uid() = owner_id);

drop policy if exists "scenes: owner update" on public.scenes;
create policy "scenes: owner update" on public.scenes
  for update using (auth.uid() = owner_id);

drop policy if exists "scenes: owner delete" on public.scenes;
create policy "scenes: owner delete" on public.scenes
  for delete using (auth.uid() = owner_id);

-- ── subscriptions: mirror of the Dodo Payments subscription state ────────────
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null default 'dodo',
  external_id text unique,
  plan text not null default 'free',
  status text not null default 'inactive',
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_idx on public.subscriptions (user_id);

alter table public.subscriptions enable row level security;

-- Users can read their own subscription; writes happen only via the service
-- role from the Dodo webhook (service role bypasses RLS), so no write policy.
drop policy if exists "subscriptions: read own" on public.subscriptions;
create policy "subscriptions: read own" on public.subscriptions
  for select using (auth.uid() = user_id);

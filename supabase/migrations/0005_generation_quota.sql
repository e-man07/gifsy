-- Move the free-tier cap from publishing to generation.
--
-- The 3 limit used to sit on published scenes (enforced in
-- app/api/scenes/route.ts). It now sits on 3D generations instead: free
-- accounts get 3 lifetime 3D generations and unlimited publishing of them,
-- because the expensive, valuable step is producing the depth + segmentation,
-- not storing the result.
--
-- One row per generation rather than a counter column on profiles: it keeps an
-- audit trail (when, what kind), and 0002 revoked UPDATE on profiles from
-- users, so a counter there would need the service role on a hot path.

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  /** Which creator mode produced this. Only '3d' is metered today; the column
      exists so metering GIF/sticker later needs no migration. */
  kind text not null default '3d' check (kind in ('3d', 'gif', 'sticker')),
  created_at timestamptz not null default now()
);

-- The quota check counts a user's own rows, so this index carries it.
create index if not exists generations_user_idx on public.generations (user_id, created_at desc);

alter table public.generations enable row level security;

drop policy if exists "generations: read own" on public.generations;
create policy "generations: read own" on public.generations
  for select using (auth.uid() = user_id);

-- A user may only ever record a generation as themselves. There is deliberately
-- no UPDATE or DELETE policy: the quota is lifetime, so a row must not be
-- editable or removable by the account it counts against.
drop policy if exists "generations: insert own" on public.generations;
create policy "generations: insert own" on public.generations
  for insert with check (auth.uid() = user_id);

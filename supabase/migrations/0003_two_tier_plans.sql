-- Collapse the plan catalogue to two tiers: free and pro.
--
-- 0001 created profiles.plan with `check (plan in ('free', 'pro', 'studio'))`.
-- Studio is gone from the product (it sold team seats, a shared gallery and
-- custom embed branding, none of which were ever implemented), so the database
-- should stop accepting it — otherwise 'studio' remains a writable value and a
-- future bug or manual edit can park an account on a tier the app no longer
-- understands. app/api/scenes/route.ts treats anything that isn't 'free' as
-- paid, so a stranded 'studio' row would silently get Pro for nothing.
--
-- Run AFTER 0002 (which revokes UPDATE on profiles from users).

-- Any account already on studio paid for the top tier — move it to pro rather
-- than demoting it. Expected to affect zero rows: studio was never sellable
-- (DODO_PRODUCT_STUDIO was never configured in production).
update public.profiles set plan = 'pro' where plan = 'studio';
update public.subscriptions set plan = 'pro' where plan = 'studio';

-- Postgres names an inline column CHECK "<table>_<column>_check".
alter table public.profiles drop constraint if exists profiles_plan_check;
alter table public.profiles
  add constraint profiles_plan_check check (plan in ('free', 'pro'));

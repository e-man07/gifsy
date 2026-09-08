-- Close the self-serve plan escalation on public.profiles.
--
-- 0001 created:
--   create policy "profiles: update own" on public.profiles
--     for update using (auth.uid() = id);
-- with no WITH CHECK and no column-level grants, while the CHECK constraint on
-- profiles.plan explicitly permits 'studio'. Any signed-in user could therefore
-- run, straight from the browser console with the public anon key:
--   await supabase.from('profiles').update({ plan: 'studio' }).eq('id', user.id)
-- and hold the top tier permanently. profiles.plan is the sole paywall input
-- (app/api/scenes/route.ts reads it to set the watermark flag and the free
-- scene limit), so this made every paid feature free.
--
-- profiles has exactly three columns — id, plan, created_at — and a user has no
-- business writing any of them. Rather than trying to express "you may update
-- yourself but never your plan" in a policy (WITH CHECK sees only the new row,
-- so it cannot tell that plan changed), we remove UPDATE from users entirely.
--
-- Nothing user-facing regresses:
--   * plan is written only by app/api/dodo/webhook/route.ts through the service
--     role client (lib/supabase/admin.ts), which bypasses RLS.
--   * the profile row is created by handle_new_user(), which is SECURITY
--     DEFINER and so runs as the function owner, unaffected by these grants.
--   * the only user-session read, app/api/scenes/route.ts:56, is a SELECT and
--     keeps its "profiles: read own" policy.

drop policy if exists "profiles: update own" on public.profiles;

revoke update on public.profiles from authenticated;
revoke update on public.profiles from anon;

-- Deliberately NOT added here: a BEFORE UPDATE trigger rejecting plan changes
-- from any role but service_role. It would be real defence in depth, but it
-- sits directly on the billing write path and its role check depends on
-- request.jwt.claims being populated as expected for the service role client.
-- Getting that wrong silently blocks every upgrade. Add it once a live test
-- purchase has been confirmed end to end, not before.

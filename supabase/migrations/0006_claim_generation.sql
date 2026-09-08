-- Atomic generation claim.
--
-- The quota check used to be "count rows, then insert", which is two
-- statements: two concurrent 3D requests from the same account can both read
-- 2 and both insert, spending a 3-generation allowance four times. Now that
-- the claim sits on the depth-head route — the request that performs the
-- billable work — it has to be exact.
--
-- This does the count and the insert under a per-user advisory lock held to
-- the end of the transaction, so claims for one account serialise while
-- different accounts never contend.
--
-- SECURITY DEFINER because `public.generations` intentionally has no UPDATE or
-- DELETE policy; the function only ever writes a row for auth.uid(), so a
-- caller still cannot claim on behalf of anyone else.

create or replace function public.claim_generation(p_kind text, p_limit int)
returns table (used int, allowed boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_count int;
begin
  if v_user is null then
    raise exception 'claim_generation requires an authenticated caller';
  end if;

  if p_kind not in ('3d', 'gif', 'sticker') then
    raise exception 'unknown generation kind: %', p_kind;
  end if;

  -- Serialise concurrent claims for this user only.
  perform pg_advisory_xact_lock(hashtext(v_user::text));

  select count(*) into v_count
    from public.generations
   where user_id = v_user and kind = p_kind;

  -- p_limit null = unlimited (a paid plan): still recorded, never refused.
  if p_limit is not null and v_count >= p_limit then
    return query select v_count, false;
    return;
  end if;

  insert into public.generations (user_id, kind) values (v_user, p_kind);
  return query select v_count + 1, true;
end;
$$;

-- Anonymous callers have no auth.uid(); only signed-in users may claim.
revoke all on function public.claim_generation(text, int) from public;
revoke all on function public.claim_generation(text, int) from anon;
grant execute on function public.claim_generation(text, int) to authenticated;

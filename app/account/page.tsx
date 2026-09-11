// "Account" — the signed-in user's profile: who they are, which plan they're
// on, what that plan allows, and how much of it they've used.
//
// Auth-gated the same way /scenes is: redirect to /login with a ?next so the
// user lands back here after signing in.
//
// Every read here is RLS-scoped to the caller (profiles/subscriptions both
// have "read own" policies from 0001_init.sql), so a missing row means "no
// row for me" rather than a permissions problem — hence the `free` fallbacks
// below rather than an error state.

import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { createClient } from "@/lib/supabase/server";
import { FREE_GENERATION_LIMIT, PLAN_DISPLAY, type PlanId } from "@/lib/billing/plans";

export const metadata = { title: "Account", robots: { index: false, follow: false } };

/** A plan value read from the database, narrowed to a PlanId we can render. */
function toPlanId(v: unknown): PlanId {
  return v === "pro" ? "pro" : "free";
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  // Plan, billing state, and scene usage. Independent reads — run them
  // together so the page costs one round trip instead of three.
  const [profileRes, subscriptionRes, sceneCountRes, genCountRes] = await Promise.all([
    supabase.from("profiles").select("plan,created_at").eq("id", user.id).maybeSingle(),
    supabase
      .from("subscriptions")
      .select("plan,status,current_period_end")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    // head:true asks for the count only — no rows come back over the wire.
    supabase.from("scenes").select("id", { count: "exact", head: true }).eq("owner_id", user.id),
    supabase
      .from("generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("kind", "3d"),
  ]);

  // profiles.plan is the value the app actually enforces (the Dodo webhook
  // writes it); the subscription row is the billing detail behind it.
  const plan = toPlanId(profileRes.data?.plan);
  const display = PLAN_DISPLAY[plan];
  const subscription = subscriptionRes.data;
  const renewsOn = formatDate(subscription?.current_period_end ?? null);
  const memberSince = formatDate(profileRes.data?.created_at ?? user.created_at);

  // Published scenes are unlimited on every plan now — this is just a total.
  const sceneCount = sceneCountRes.count ?? 0;
  // 3D generations are what's metered.
  const genCount = genCountRes.count ?? 0;
  const genLimit = plan === "free" ? FREE_GENERATION_LIMIT : null; // null = unlimited
  const atLimit = genLimit !== null && genCount >= genLimit;

  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null;
  const avatarUrl = (user.user_metadata?.avatar_url as string | undefined) ?? null;
  // Fallback avatar: first letter of the display name, else of the email.
  const initial = (name ?? user.email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-background">
      {/* Header band — the same chrome as pricing / gallery / the legal pages,
          so the wordmark always leads back to the landing page. */}
      <section className="border-b border-foreground/10 bg-panel">
        <SiteNav />

        <div className="mx-auto w-full max-w-3xl px-5 pb-10 pt-6 sm:px-8 sm:pb-12 sm:pt-8">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-sky-deep">
            Your account
          </p>
          <h1 className="mt-2 font-editorial text-4xl text-foreground sm:text-5xl">
            Profile
          </h1>
        </div>
      </section>

      <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-10">

      {/* ── Identity ─────────────────────────────────────────────────────── */}
      <section className="card rounded-2xl bg-panel p-5 sm:p-6">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-sky">
              <span className="font-display text-xl text-cloud">{initial}</span>
            </div>
          )}
          <div className="min-w-0">
            {name ? (
              <p className="truncate font-display text-lg text-foreground">{name}</p>
            ) : null}
            <p className="truncate text-sm text-muted">{user.email}</p>
            {memberSince ? (
              <p className="mt-0.5 text-xs text-muted">Member since {memberSince}</p>
            ) : null}
          </div>
        </div>
      </section>

      {/* ── Plan ─────────────────────────────────────────────────────────── */}
      <section className="card mt-4 rounded-2xl bg-panel p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.2em] text-muted">Plan</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span
                className={`btn rounded-lg ${display.accent} px-2.5 py-1 font-display text-xs uppercase tracking-wide text-ink`}
              >
                {display.name}
              </span>
              <span className="text-sm text-muted">
                <span className="num">{display.price}</span> · {display.cadence}
              </span>
            </div>
            {/* Billing state only when there's a real payment behind the plan —
                a free account has no Dodo row to describe. Pro is bought once,
                so it must never claim a renewal date. */}
            {subscription && plan !== "free" ? (
              <p className="mt-2 text-sm text-muted">
                {display.oneTime ? (
                  <>Paid once — yours for good.</>
                ) : (
                  <>
                    Status: <span className="text-foreground">{subscription.status}</span>
                    {renewsOn ? ` · renews ${renewsOn}` : null}
                  </>
                )}
              </p>
            ) : null}
          </div>
          <Link
            href="/pricing"
            className={`btn rounded-xl px-4 py-2 font-display text-sm ${
              plan === "free" ? "bg-grass text-ink" : "bg-panel text-foreground"
            }`}
          >
            {plan === "free" ? "Upgrade to Pro" : "Manage plan"}
          </Link>
        </div>

        <ul className="mt-4 grid gap-1.5 border-t border-foreground/10 pt-4 sm:grid-cols-2">
          {display.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-muted">
              <span className="text-grass">✓</span>
              {f}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Usage ────────────────────────────────────────────────────────── */}
      <section className="card mt-4 rounded-2xl bg-panel p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.2em] text-muted">
              3D generations
            </p>
            {/* .num for tabular, bold figures. */}
            <p className="num mt-1.5 text-2xl text-foreground">
              {genCount}
              {genLimit !== null ? <span className="text-muted"> / {genLimit}</span> : null}
            </p>
            <p className="mt-1 text-xs text-muted">
              {sceneCount} published · unlimited on every plan
            </p>
          </div>
          <Link
            href="/scenes"
            className="btn rounded-xl bg-panel px-4 py-2 font-display text-sm text-foreground"
          >
            My scenes
          </Link>
        </div>

        {genLimit !== null ? (
          <>
            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-foreground/10">
              <div
                className={`h-full rounded-full ${atLimit ? "bg-sun" : "bg-grass"}`}
                style={{ width: `${Math.min(100, (genCount / genLimit) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted">
              {atLimit ? (
                <>
                  You&apos;ve used all {genLimit} free 3D generations.{" "}
                  <Link href="/pricing" className="underline hover:text-foreground">
                    Pro is a one-time payment
                  </Link>{" "}
                  for unlimited 3D.
                </>
              ) : (
                `${genLimit - genCount} of ${genLimit} free 3D generations left.`
              )}
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted">
            Unlimited 3D generations on Pro. GIFs and stickers are always unlimited and need no
            account — they never leave your browser.
          </p>
        )}
      </section>

      {/* ── Session ──────────────────────────────────────────────────────── */}
      <section className="card mt-4 rounded-2xl bg-panel p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-sm text-foreground">Signed in as {user.email}</p>
            <p className="mt-0.5 text-xs text-muted">
              GIFs and stickers never need an account. 3D generations are tied to yours.
            </p>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="btn rounded-xl bg-panel px-4 py-2 font-display text-sm text-foreground"
            >
              Sign out
            </button>
          </form>
        </div>
      </section>
      </div>
    </main>
  );
}

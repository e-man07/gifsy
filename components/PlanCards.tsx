"use client";

// The Free / Pro cards and the checkout button behind them.
//
// Rendered on BOTH /pricing and the landing page (below the workshop, where
// someone who has just made a scene is deciding whether to keep going). It
// lives here rather than in either page so the two can't drift — the same
// reason the tier copy itself lives in lib/billing/plans.ts.
//
// Tier copy comes from that client-safe module, which is the same one the
// server reads for the enforced generation limit, so this can't advertise
// something the API doesn't do. The checkout call itself lives in
// lib/billing/checkout.ts, shared with components/UpgradeDialog.tsx.

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { startCheckout } from "@/lib/billing/checkout";
import { PLAN_DISPLAY, PLAN_ORDER, type PaidPlanId } from "@/lib/billing/plans";

const TIERS = PLAN_ORDER.map((id) => PLAN_DISPLAY[id]);

export function PlanCards({
  /** Where to send a signed-out visitor after they sign in. */
  next = "/pricing",
  /** The Free card's CTA target — the landing page, where every mode starts. */
  freeHref = "/",
  /** Hide the USD/merchant-of-record line when the surrounding page already
   *  carries it. */
  showFinePrint = true,
}: {
  next?: string;
  freeHref?: string;
  showFinePrint?: boolean;
}) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState<PaidPlanId | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => setSignedIn(!!data.user))
      .catch(() => setSignedIn(false));
  }, []);

  const upgrade = async (plan: PaidPlanId) => {
    setBusy(plan);
    setErr(null);
    try {
      await startCheckout(plan);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(null);
    }
  };

  return (
    <>
      {err && (
        <div className="card-sm mx-auto mb-6 max-w-xl rounded-lg bg-petal px-4 py-3 text-center text-sm font-semibold text-cloud">
          {err}
        </div>
      )}

      <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`card relative flex flex-col rounded-2xl bg-panel p-6 sm:p-7 ${
              tier.featured ? "md:-translate-y-2" : ""
            }`}
          >
            <h3 className="font-display text-xl uppercase tracking-wide text-foreground">
              {tier.name}
            </h3>
            <div className="mt-3 flex items-end gap-1">
                {/* .num, not font-display: tabular, bold figures for the price. */}
                <span className="num text-4xl text-foreground">{tier.price}</span>
                <span className="pb-1 text-sm font-semibold text-muted">{tier.cadence}</span>
            </div>
            <p className="mt-3 text-sm text-muted">{tier.tagline}</p>

            <ul className="mt-5 flex flex-1 flex-col gap-2.5">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-grass"
                    strokeWidth={3}
                    aria-hidden
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              {tier.id === "free" ? (
                <Link
                  href={freeHref}
                  className="btn flex w-full items-center justify-center gap-2 rounded-xl bg-grass py-3 font-display text-sm uppercase tracking-wide text-ink"
                >
                  Start free
                </Link>
              ) : signedIn === false ? (
                <Link
                  href={`/login?next=${encodeURIComponent(next)}`}
                  className={`btn flex w-full items-center justify-center gap-2 rounded-xl ${tier.accent} py-3 font-display text-sm uppercase tracking-wide text-ink`}
                >
                  Sign in to upgrade
                </Link>
              ) : (
                <button
                  type="button"
                  disabled={signedIn === null || busy !== null}
                  onClick={() => upgrade(tier.id as PaidPlanId)}
                  className={`btn flex w-full items-center justify-center gap-2 rounded-xl ${tier.accent} py-3 font-display text-sm uppercase tracking-wide text-ink disabled:opacity-50`}
                >
                  {busy === tier.id ? "Starting…" : "Get lifetime access"}
                  {busy !== tier.id && (
                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showFinePrint && (
        <p className="mt-10 text-center text-xs text-muted">
          Prices in USD. Billing is handled securely by Dodo Payments (our
          merchant of record). Pro is a single payment, not a subscription — see
          our{" "}
          <Link href="/refund" className="underline hover:text-foreground">
            refund policy
          </Link>
          ,{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            privacy policy
          </Link>
          .
        </p>
      )}
    </>
  );
}

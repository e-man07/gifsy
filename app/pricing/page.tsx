"use client";

// Pricing page. Display-only plan data lives here (it must not import the
// server-only billing module, which reads secret env). The Dodo product ids
// and real amounts live server-side; the "Upgrade" button POSTs to
// /api/dodo/checkout and redirects to the returned Dodo checkout URL.

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Play } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type PaidPlan = "pro" | "studio";

interface Tier {
  id: "free" | PaidPlan;
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  accent: string; // tailwind bg-* token for the CTA / badge
  featured?: boolean;
}

const TIERS: Tier[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    tagline: "Everything on-device. No account needed to make things.",
    features: [
      "Unlimited GIFs, stickers & 3D",
      "Runs entirely in your browser",
      "No watermark",
      "Publish up to 3 scenes",
    ],
    accent: "bg-grass",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$12",
    cadence: "/mo",
    tagline: "For creators who publish and embed a lot.",
    features: [
      "Everything in Free",
      "Unlimited published scenes",
      "Interactive 3D embeds",
      "Priority rendering",
    ],
    accent: "bg-sky",
    featured: true,
  },
  {
    id: "studio",
    name: "Studio",
    price: "$39",
    cadence: "/mo",
    tagline: "For teams and heavy commercial use.",
    features: [
      "Everything in Pro",
      "Team seats & shared gallery",
      "Custom embed branding",
      "Commercial license & support",
    ],
    accent: "bg-sun",
  },
];

export default function PricingPage() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState<PaidPlan | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => setSignedIn(!!data.user))
      .catch(() => setSignedIn(false));
  }, []);

  const upgrade = async (plan: PaidPlan) => {
    setBusy(plan);
    setErr(null);
    try {
      const res = await fetch("/api/dodo/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Could not start checkout.");
      }
      window.location.assign(data.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(null);
    }
  };

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-background">
      {/* Nav — mirrors the landing / gallery chrome. */}
      <section className="border-b-[3px] border-ink bg-ink text-cloud">
        <nav className="flex items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-1 font-pixel text-2xl text-cloud drop-shadow-[2px_2px_0_var(--ink)]"
          >
            GIFSY
            <Play className="h-5 w-5 fill-sun text-sun" strokeWidth={2.5} aria-hidden />
          </Link>
          <Link
            href="/#make"
            className="btn-pixel flex items-center gap-1.5 rounded-full bg-sky px-4 py-2 font-pixel text-sm text-cloud"
          >
            Make one
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </Link>
        </nav>

        <div className="mx-auto w-full max-w-6xl px-5 pb-12 pt-8 text-center sm:px-8 sm:pb-16 sm:pt-12">
          <p className="font-pixel text-xs uppercase tracking-[0.2em] text-sun drop-shadow-[1px_1px_0_var(--ink)]">
            Pricing
          </p>
          <h1 className="mx-auto mt-3 max-w-2xl font-pixel text-3xl leading-tight text-cloud drop-shadow-[2px_2px_0_var(--ink)] sm:text-4xl">
            Making things is free. Sharing them is where Pro shines.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-cloud/80 sm:text-base">
            GIFs, stickers and 3D always run on your device at no cost. Upgrade
            when you want to publish, embed and collaborate without limits.
          </p>
        </div>
      </section>

      {/* Plan cards. */}
      <section className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        {err && (
          <div className="hud-sm mx-auto mb-6 max-w-xl rounded-lg bg-petal px-4 py-3 text-center text-sm font-semibold text-cloud">
            {err}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`hud relative flex flex-col rounded-2xl bg-panel p-6 sm:p-7 ${
                tier.featured ? "md:-translate-y-2" : ""
              }`}
            >
              {tier.featured && (
                <span className="absolute -top-3 left-6 rounded-full bg-sky px-3 py-1 font-pixel text-[10px] uppercase tracking-wide text-cloud hud-sm">
                  Most popular
                </span>
              )}

              <h2 className="font-pixel text-xl uppercase tracking-wide text-foreground">
                {tier.name}
              </h2>
              <div className="mt-3 flex items-end gap-1">
                <span className="font-pixel text-4xl text-foreground">{tier.price}</span>
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
                    href="/#make"
                    className="btn-pixel flex w-full items-center justify-center gap-2 rounded-xl bg-grass py-3 font-pixel text-sm uppercase tracking-wide text-ink"
                  >
                    Start free
                  </Link>
                ) : signedIn === false ? (
                  <Link
                    href="/login?next=/pricing"
                    className={`btn-pixel flex w-full items-center justify-center gap-2 rounded-xl ${tier.accent} py-3 font-pixel text-sm uppercase tracking-wide text-ink`}
                  >
                    Sign in to upgrade
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled={signedIn === null || busy !== null}
                    onClick={() => upgrade(tier.id as PaidPlan)}
                    className={`btn-pixel flex w-full items-center justify-center gap-2 rounded-xl ${tier.accent} py-3 font-pixel text-sm uppercase tracking-wide text-ink disabled:opacity-50`}
                  >
                    {busy === tier.id ? "Starting…" : "Upgrade"}
                    {busy !== tier.id && (
                      <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted">
          Prices in USD. Billing is handled securely by Dodo Payments (our
          merchant of record). Cancel anytime.
        </p>
      </section>
    </main>
  );
}

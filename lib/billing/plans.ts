// Plan catalogue: the display copy AND the limits actually enforced server-side.
//
// Client-safe by design — no secrets here — so the pricing page imports this
// instead of keeping its own copy of the tier list. That duplicate literal is
// why the page once advertised "No watermark" and "Publish up to 3 scenes"
// while app/api/scenes/route.ts watermarked every free scene and allowed 5.
// Quoting FREE_GENERATION_LIMIT in the feature copy means the page and the
// check can no longer drift.
//
// Secret-bearing bits (Dodo product ids) live in ./dodo.ts, which layers them
// on top of this.

export type PlanId = "free" | "pro";
export type PaidPlanId = "pro";

/** Lifetime 3D generations a free account gets. Enforced in
 *  app/api/generations/route.ts and quoted verbatim in the Free feature list
 *  below.
 *
 *  This cap used to sit on *publishing*, which metered the cheap step (storing
 *  finished files) and left the expensive one (depth + segmentation) unlimited.
 *  Publishing is now unlimited on every plan; generating 3D is what's metered.
 *
 *  GIFs and stickers remain unlimited and unmetered on every plan — they run
 *  entirely in the browser and never touch a server. */
export const FREE_GENERATION_LIMIT = 3;

export interface PlanDisplay {
  id: PlanId;
  name: string;
  /** Human display price, e.g. "$0", "$9". */
  price: string;
  /** Billing cadence label, e.g. "forever", "one-time". */
  cadence: string;
  /** True when the plan is bought once and never renews. Pro is a lifetime
   *  purchase, so anything that talks about renewal, the next billing date or
   *  cancelling must stay off for these plans. */
  oneTime?: boolean;
  tagline: string;
  features: string[];
  /** Tailwind bg-* token for the CTA / badge. */
  accent: string;
  featured?: boolean;
}

export const PLAN_DISPLAY: Record<PlanId, PlanDisplay> = {
  free: {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    tagline: "GIFs and stickers with no account. 3D to try out.",
    features: [
      "Unlimited GIFs & stickers",
      "No account needed for GIFs & stickers",
      `${FREE_GENERATION_LIMIT} free 3D generations`,
      "Unlimited publishing & embeds",
      "Gifsy badge on published scenes",
    ],
    accent: "bg-grass",
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "$9",
    cadence: "one-time",
    oneTime: true,
    tagline: "Pay once. Yours forever, no subscription.",
    features: [
      "Everything in Free",
      "Unlimited 3D generations",
      "Runs fully on your device — works offline",
      "Unlimited published 3D scenes",
      "No Gifsy badge on your embeds",
      "Commercial use",
      "One payment — never renews",
    ],
    accent: "bg-sky",
    featured: true,
  },
};

/** The ordered tier list the pricing page renders. */
export const PLAN_ORDER: PlanId[] = ["free", "pro"];

export function isPaidPlan(v: unknown): v is PaidPlanId {
  return v === "pro";
}

// Dodo Payments (Merchant-of-Record) billing config + SDK client.
//
// Server-only. Never import this from a client component — it reads secret
// env vars (API key / webhook key) that must never reach the browser.
//
// Verified against `dodopayments` npm SDK v2.49.0:
//   - new DodoPayments({ bearerToken, environment, webhookKey })
//   - environment is 'test_mode' | 'live_mode' (base URLs test./live.dodopayments.com)
//   - client.checkoutSessions.create({ product_cart, customer, metadata, return_url })
//   - client.webhooks.unwrap(rawBody, { headers }) -> typed UnwrapWebhookEvent
// Docs: https://docs.dodopayments.com/developer-resources/subscription-integration-guide
//       https://docs.dodopayments.com/developer-resources/webhooks

import DodoPayments from "dodopayments";

export type PlanId = "free" | "pro" | "studio";
export type PaidPlanId = "pro" | "studio";

/** Map our friendly DODO_ENVIRONMENT (test|live) to the SDK's environment enum. */
function resolveEnvironment(): "test_mode" | "live_mode" {
  const raw = (process.env.DODO_ENVIRONMENT ?? "test").trim().toLowerCase();
  return raw === "live" || raw === "live_mode" ? "live_mode" : "test_mode";
}

export const DODO_ENVIRONMENT = resolveEnvironment();

/**
 * A configured Dodo Payments client. Throws a clear error if the API key is
 * missing so route handlers can turn it into a 500 with an actionable message.
 */
export function getDodoClient(): DodoPayments {
  const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
  if (!bearerToken) {
    throw new Error(
      "DODO_PAYMENTS_API_KEY is not set. Add it to .env.local and your Vercel project env.",
    );
  }
  return new DodoPayments({
    bearerToken,
    environment: DODO_ENVIRONMENT,
    // Used by client.webhooks.unwrap() to verify signatures. May be undefined
    // here (the webhook route reads/validates it explicitly); harmless for
    // checkout calls.
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY ?? null,
  });
}

export interface PlanDef {
  id: PlanId;
  name: string;
  /** Human display price, e.g. "$0", "$12". */
  price: string;
  /** Billing cadence label, e.g. "forever", "/mo". */
  cadence: string;
  tagline: string;
  features: string[];
  /**
   * The Dodo product id for this plan (from env). `null` for the free plan,
   * which has no Dodo product. May be undefined at runtime if the env var is
   * unset — checkout validates this and returns a clear 500.
   */
  dodoProductId: string | null;
}

/**
 * The plan catalogue. Prices here are display-only; the real amount is
 * configured on the Dodo product. `dodoProductId` links a plan to its Dodo
 * product created in the dashboard.
 */
export const PLANS: Record<PlanId, PlanDef> = {
  free: {
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
    dodoProductId: null,
  },
  pro: {
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
    dodoProductId: process.env.DODO_PRODUCT_PRO ?? null,
  },
  studio: {
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
    dodoProductId: process.env.DODO_PRODUCT_STUDIO ?? null,
  },
};

/** Resolve a Dodo product id back to our plan id (used in the webhook). */
export function planForProductId(productId: string | null | undefined): PaidPlanId | null {
  if (!productId) return null;
  if (PLANS.pro.dodoProductId && productId === PLANS.pro.dodoProductId) return "pro";
  if (PLANS.studio.dodoProductId && productId === PLANS.studio.dodoProductId) return "studio";
  return null;
}

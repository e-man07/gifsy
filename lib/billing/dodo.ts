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
import { PLAN_DISPLAY, type PlanId, type PaidPlanId } from "./plans";

// Re-exported so existing server-side imports keep working from one place.
export type { PlanId, PaidPlanId };
export { FREE_GENERATION_LIMIT, isPaidPlan } from "./plans";

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

/** A plan's shared display copy plus its server-only Dodo product id. */
export type PlanDef = (typeof PLAN_DISPLAY)[PlanId] & {
  /**
   * The Dodo product id for this plan (from env). `null` for the free plan,
   * which has no Dodo product, and null at runtime if the env var is unset —
   * checkout validates this and returns a clear 500.
   */
  dodoProductId: string | null;
};

/**
 * The plan catalogue: the client-safe copy from ./plans.ts, with the secret
 * product ids layered on. Display data lives in one place so the pricing page
 * and this module cannot disagree.
 */
export const PLANS: Record<PlanId, PlanDef> = {
  free: { ...PLAN_DISPLAY.free, dodoProductId: null },
  pro: {
    ...PLAN_DISPLAY.pro,
    dodoProductId: process.env.DODO_PRODUCT_PRO ?? null,
  },
};

/** Resolve a Dodo product id back to our plan id (used in the webhook). */
export function planForProductId(productId: string | null | undefined): PaidPlanId | null {
  if (!productId) return null;
  if (PLANS.pro.dodoProductId && productId === PLANS.pro.dodoProductId) return "pro";
  return null;
}

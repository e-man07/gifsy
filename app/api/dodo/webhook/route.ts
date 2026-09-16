// POST /api/dodo/webhook
// Receives Dodo Payments webhooks (Standard Webhooks spec), verifies the
// signature, and syncs plan state into Supabase using the service-role admin
// client (RLS bypass).
//
// Pro is a ONE-TIME $9 purchase, so the events that matter are
// `payment.succeeded` (grant Pro for good) and `refund.succeeded` (revoke it).
// The subscription.* handling below is kept for any legacy monthly subscription
// still running — those accounts must keep working until they lapse — but no
// new checkout creates one.
//
// Verification: client.webhooks.unwrap(rawBody, { headers }) uses the client's
// configured webhookKey (DODO_PAYMENTS_WEBHOOK_KEY) to check the
// webhook-id / webhook-signature / webhook-timestamp headers. It throws on a
// bad/expired signature -> we return 400. On any valid event we return 200
// quickly so Dodo doesn't retry.
//
// Docs: https://docs.dodopayments.com/developer-resources/webhooks

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getDodoClient,
  isPaidPlan,
  planForProductId,
  type PaidPlanId,
  type PlanId,
} from "@/lib/billing/dodo";

export const runtime = "nodejs";

// Statuses that mean the subscription is providing service -> grant the plan.
const ACTIVE_EVENTS = new Set<string>(["subscription.active", "subscription.renewed"]);
// Statuses that mean service has ended -> revert to free.
const ENDED_EVENTS = new Set<string>([
  "subscription.cancelled",
  "subscription.expired",
  "subscription.failed",
]);

export async function POST(req: Request) {
  const rawBody = await req.text();

  const headers = {
    "webhook-id": req.headers.get("webhook-id") ?? "",
    "webhook-signature": req.headers.get("webhook-signature") ?? "",
    "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
  };

  if (!process.env.DODO_PAYMENTS_WEBHOOK_KEY) {
    console.error("[dodo/webhook] DODO_PAYMENTS_WEBHOOK_KEY is not set");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  // 1. Verify + parse. unwrap() throws if the signature is invalid.
  let event;
  try {
    const dodo = getDodoClient();
    event = dodo.webhooks.unwrap(rawBody, { headers });
  } catch (e) {
    console.warn("[dodo/webhook] signature verification failed", e);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  // 2a. One-time purchase: the lifetime Pro path.
  if (event.type === "payment.succeeded") {
    return handleOneTimePayment(event.data as PaymentData);
  }

  // 2b. A refunded lifetime purchase revokes the plan.
  if (event.type === "refund.succeeded") {
    return handleRefund(event.data as RefundData);
  }

  // 2c. Legacy monthly subscriptions only.
  if (!event.type.startsWith("subscription.")) {
    return NextResponse.json({ received: true });
  }

  const isActive = ACTIVE_EVENTS.has(event.type);
  const isEnded = ENDED_EVENTS.has(event.type);
  if (!isActive && !isEnded) {
    // e.g. subscription.on_hold / past_due / paused / updated — acknowledge,
    // but don't flip the plan here.
    return NextResponse.json({ received: true });
  }

  // `data` extends the Subscription shape for every subscription.* event.
  const data = event.data as {
    subscription_id: string;
    product_id: string;
    status: string;
    next_billing_date: string | null;
    metadata: Record<string, string | number | boolean>;
  };

  // 3. Resolve the Supabase user from the metadata we set at checkout.
  const userId =
    typeof data.metadata?.supabase_user_id === "string"
      ? data.metadata.supabase_user_id
      : null;

  if (!userId) {
    // Nothing we can map this to — acknowledge so Dodo stops retrying, but log.
    console.error(
      "[dodo/webhook] no supabase_user_id in metadata for subscription",
      data.subscription_id,
    );
    return NextResponse.json({ received: true });
  }

  // Resolve the plan: prefer the product id (source of truth), fall back to
  // the plan we stamped into metadata at checkout.
  const planFromProduct = planForProductId(data.product_id);
  // Only ever trust a plan name the app still understands. An old checkout
  // session could still carry metadata.plan = "studio"; writing that would now
  // violate the profiles_plan_check constraint (migration 0003), 500 this
  // handler, and make Dodo retry the event forever.
  const planFromMeta = isPaidPlan(data.metadata?.plan)
    ? data.metadata.plan
    : null;
  const plan: PlanId = planFromProduct ?? planFromMeta ?? "free";

  const admin = createAdminClient();
  const nowIso = new Date().toISOString();
  const currentPeriodEnd = data.next_billing_date
    ? new Date(data.next_billing_date).toISOString()
    : null;

  try {
    // Upsert the subscription row (external_id is unique per subscription).
    const { error: subErr } = await admin.from("subscriptions").upsert(
      {
        user_id: userId,
        provider: "dodo",
        external_id: data.subscription_id,
        plan,
        status: data.status,
        current_period_end: currentPeriodEnd,
        updated_at: nowIso,
      },
      { onConflict: "external_id" },
    );
    if (subErr) throw subErr;

    // Flip the profile's plan.
    const { error: profErr } = await admin
      .from("profiles")
      .update({ plan: isActive ? plan : "free" })
      .eq("id", userId);
    if (profErr) throw profErr;
  } catch (e) {
    // Return 500 so Dodo retries a transient DB failure.
    console.error("[dodo/webhook] failed to sync subscription state", e);
    return NextResponse.json({ error: "Failed to persist." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/** `payment.succeeded` payload — the fields we use off PaymentsAPI.Payment. */
interface PaymentData {
  payment_id: string;
  /** Products bought in a one-time payment. */
  product_cart?: Array<{ product_id: string; quantity: number }> | null;
  /** Set when the payment belongs to a subscription; those are handled by the
   *  subscription.* branch instead, so we skip them here. */
  subscription_id?: string | null;
  metadata?: Record<string, string | number | boolean>;
}

/** `refund.succeeded` payload — the fields we use off RefundsAPI.Refund. */
interface RefundData {
  refund_id: string;
  payment_id: string;
  metadata?: Record<string, string | number | boolean>;
}

/** The Supabase user id we stamped into checkout metadata, if usable. */
function userIdFrom(metadata: Record<string, string | number | boolean> | undefined) {
  return typeof metadata?.supabase_user_id === "string" ? metadata.supabase_user_id : null;
}

/**
 * Grant the lifetime plan. Recorded in `subscriptions` for the audit trail with
 * `current_period_end: null` — it never expires, and the account page reads that
 * as "paid once" rather than printing a renewal date.
 */
async function handleOneTimePayment(data: PaymentData) {
  // A subscription's own invoices also arrive as payment.succeeded; let the
  // subscription.* branch own those so one payment isn't applied twice.
  if (data.subscription_id) return NextResponse.json({ received: true });

  const userId = userIdFrom(data.metadata);
  if (!userId) {
    console.error("[dodo/webhook] no supabase_user_id in metadata for payment", data.payment_id);
    return NextResponse.json({ received: true });
  }

  // Product id is the source of truth; metadata.plan is the fallback. Anything
  // we don't recognise is ignored rather than written (a stray product must not
  // hand out Pro).
  const fromCart = (data.product_cart ?? [])
    .map((item) => planForProductId(item.product_id))
    .find((plan): plan is PaidPlanId => plan !== null);
  const fromMeta = isPaidPlan(data.metadata?.plan) ? data.metadata.plan : null;
  const plan = fromCart ?? fromMeta;
  if (!plan) {
    console.error("[dodo/webhook] payment matched no known plan", data.payment_id);
    return NextResponse.json({ received: true });
  }

  const admin = createAdminClient();
  const nowIso = new Date().toISOString();
  try {
    const { error: subErr } = await admin.from("subscriptions").upsert(
      {
        user_id: userId,
        provider: "dodo",
        external_id: data.payment_id,
        plan,
        status: "active",
        current_period_end: null, // lifetime — never renews, never expires
        updated_at: nowIso,
      },
      { onConflict: "external_id" },
    );
    if (subErr) throw subErr;

    const { error: profErr } = await admin
      .from("profiles")
      .update({ plan })
      .eq("id", userId);
    if (profErr) throw profErr;
  } catch (e) {
    console.error("[dodo/webhook] failed to grant lifetime plan", e);
    return NextResponse.json({ error: "Failed to persist." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/**
 * Revoke the plan behind a refunded payment. The refund payload carries the
 * original `payment_id`, which is the `external_id` we stored, so the owner is
 * recoverable even when the refund itself has no metadata.
 */
async function handleRefund(data: RefundData) {
  const admin = createAdminClient();

  let userId = userIdFrom(data.metadata);
  if (!userId) {
    const { data: row } = await admin
      .from("subscriptions")
      .select("user_id")
      .eq("external_id", data.payment_id)
      .maybeSingle();
    userId = (row?.user_id as string | undefined) ?? null;
  }
  if (!userId) {
    console.error("[dodo/webhook] could not resolve a user for refund", data.refund_id);
    return NextResponse.json({ received: true });
  }

  try {
    const { error: subErr } = await admin
      .from("subscriptions")
      .update({ status: "refunded", plan: "free", updated_at: new Date().toISOString() })
      .eq("external_id", data.payment_id);
    if (subErr) throw subErr;

    const { error: profErr } = await admin
      .from("profiles")
      .update({ plan: "free" })
      .eq("id", userId);
    if (profErr) throw profErr;
  } catch (e) {
    console.error("[dodo/webhook] failed to revoke refunded plan", e);
    return NextResponse.json({ error: "Failed to persist." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

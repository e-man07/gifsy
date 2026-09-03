// POST /api/dodo/webhook
// Receives Dodo Payments webhooks (Standard Webhooks spec), verifies the
// signature, and syncs subscription state into Supabase using the service-role
// admin client (RLS bypass).
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
import { getDodoClient, planForProductId, type PlanId } from "@/lib/billing/dodo";

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

  // 2. Only subscription lifecycle events change plan state.
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
  const planFromMeta =
    data.metadata?.plan === "pro" || data.metadata?.plan === "studio"
      ? (data.metadata.plan as PlanId)
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

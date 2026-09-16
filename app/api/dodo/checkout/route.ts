// POST /api/dodo/checkout
// Creates a Dodo Payments checkout session for the signed-in user and returns
// { url } to redirect the browser to.
//
// Pro is a one-time lifetime purchase, so the Dodo product behind
// DODO_PRODUCT_PRO must be a ONE-TIME product, not a subscription. The call
// below is the same either way (product_cart + metadata); it's the product's
// type in Dodo that decides which webhook family fires.
//
// Auth: Supabase session (getUser). Body: { plan: "pro" }.
// The Supabase user id + email are attached so the webhook can resolve the
// account after payment: id goes into checkout metadata (echoed back on the
// payment.succeeded event) and email seeds/links the Dodo customer.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDodoClient, PLANS, isPaidPlan } from "@/lib/billing/dodo";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // 1. Authenticate the user.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // 2. Parse + validate the requested plan.
  let plan: unknown;
  try {
    const body = await req.json();
    plan = body?.plan;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isPaidPlan(plan)) {
    return NextResponse.json(
      { error: 'Body must be { plan: "pro" }.' },
      { status: 400 },
    );
  }

  // Lifetime means there is nothing to buy a second time. Without this, a
  // signed-in Pro user hitting the pricing page's CTA again would be walked
  // through a full $29 checkout for something they already own.
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.plan === plan) {
    return NextResponse.json(
      { error: "You already have lifetime Pro — nothing to pay." },
      { status: 409 },
    );
  }

  const productId = PLANS[plan].dodoProductId;
  if (!productId) {
    // Misconfiguration — the product id env var is missing.
    return NextResponse.json(
      {
        error: `No Dodo product configured for the "${plan}" plan. Set DODO_PRODUCT_PRO.`,
      },
      { status: 500 },
    );
  }

  // 3. Build the return URL from the incoming request origin.
  const origin =
    req.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    new URL(req.url).origin;
  const returnUrl = `${origin}/pricing?checkout=success`;

  // 4. Create the checkout session.
  let dodo;
  try {
    dodo = getDodoClient();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Dodo Payments is not configured." },
      { status: 500 },
    );
  }

  try {
    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email: user.email ?? "",
        name:
          (user.user_metadata?.full_name as string | undefined) ??
          (user.user_metadata?.name as string | undefined) ??
          null,
      },
      // Echoed back on every subscription.* webhook — this is how we map the
      // subscription to a Supabase account.
      metadata: {
        supabase_user_id: user.id,
        plan,
      },
      return_url: returnUrl,
    });

    if (!session.checkout_url) {
      return NextResponse.json(
        { error: "Dodo did not return a checkout URL." },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: session.checkout_url });
  } catch (e) {
    console.error("[dodo/checkout] failed to create checkout session", e);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 502 },
    );
  }
}

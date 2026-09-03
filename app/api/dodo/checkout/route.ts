// POST /api/dodo/checkout
// Creates a Dodo Payments subscription checkout session for the signed-in user
// and returns { url } to redirect the browser to.
//
// Auth: Supabase session (getUser). Body: { plan: "pro" | "studio" }.
// The Supabase user id + email are attached so the webhook can resolve the
// account after payment: id goes into checkout metadata (echoed back on every
// subscription.* event) and email seeds/links the Dodo customer.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDodoClient, PLANS, type PaidPlanId } from "@/lib/billing/dodo";

export const runtime = "nodejs";

function isPaidPlan(v: unknown): v is PaidPlanId {
  return v === "pro" || v === "studio";
}

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
      { error: 'Body must be { plan: "pro" | "studio" }.' },
      { status: 400 },
    );
  }

  const productId = PLANS[plan].dodoProductId;
  if (!productId) {
    // Misconfiguration — the product id env var is missing.
    return NextResponse.json(
      {
        error: `No Dodo product configured for the "${plan}" plan. Set ${
          plan === "pro" ? "DODO_PRODUCT_PRO" : "DODO_PRODUCT_STUDIO"
        }.`,
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

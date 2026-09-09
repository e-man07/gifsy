// Starting a Dodo checkout, from anywhere in the client.
//
// Extracted from components/PlanCards.tsx once the upgrade dialog needed the
// same call: two copies of "POST, read `url`, assign it" would have been two
// places to fix when the response shape or the error handling changes.
//
// Amounts and Dodo product ids stay server-side — this only knows the plan id
// and follows whatever URL the route hands back.

import type { PaidPlanId } from "./plans";

/**
 * Ask the server for a checkout URL and navigate to it. Resolves only if the
 * navigation didn't happen; throws with a message safe to show the user.
 */
export async function startCheckout(plan: PaidPlanId): Promise<void> {
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
}

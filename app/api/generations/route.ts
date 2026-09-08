// GET /api/generations — this account's plan and 3D generation usage.
//
// Read-only on purpose. This used to be a POST that *claimed* a generation,
// which was the wrong shape: the client could simply not call it and keep
// generating, because the whole depth model ran in the browser. The claim now
// happens inside POST /api/depth/head — the request that actually performs the
// second half of the inference — so it cannot be skipped.
//
// What's left here is a preflight: it lets the UI fail fast with a clear
// message before spending ~1s of the user's CPU on the encoder, and lets
// lib/depth.ts decide whether to run the head locally (Pro) or remotely (free).
// Being advisory is fine now, because skipping it doesn't grant anything.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FREE_GENERATION_LIMIT, isPaidPlan } from "@/lib/billing/plans";

export const runtime = "nodejs";

export interface GenerationUsage {
  /** null when signed out. */
  plan: "free" | "pro" | null;
  used: number;
  /** null = unlimited (paid plan) or signed out. */
  limit: number | null;
  remaining: number | null;
  /** Whether this account may run the depth head locally (Pro only). */
  localHead: boolean;
}

export async function GET(): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const body: GenerationUsage = {
      plan: null,
      used: 0,
      limit: FREE_GENERATION_LIMIT,
      remaining: null,
      localHead: false,
    };
    return NextResponse.json(body, { status: 200, headers: { "Cache-Control": "no-store" } });
  }

  const [profileRes, countRes] = await Promise.all([
    supabase.from("profiles").select("plan").eq("id", user.id).maybeSingle(),
    supabase
      .from("generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("kind", "3d"),
  ]);

  const paid = isPaidPlan(profileRes.data?.plan);
  const used = countRes.count ?? 0;

  const body: GenerationUsage = {
    plan: paid ? "pro" : "free",
    used,
    limit: paid ? null : FREE_GENERATION_LIMIT,
    remaining: paid ? null : Math.max(0, FREE_GENERATION_LIMIT - used),
    localHead: paid,
  };
  return NextResponse.json(body, { status: 200, headers: { "Cache-Control": "no-store" } });
}

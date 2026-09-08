// GET /api/models/depth-head — the head weights, for Pro accounts only.
//
// Pro is unlimited, so there is nothing to meter: handing Pro the second half
// of the model is a feature, not a leak. It restores the original pipeline —
// the whole model runs locally, so generation is fast, works offline, and no
// activation data ever leaves the device. That privacy difference is a genuine
// reason to buy, not an artificial gate.
//
// Free accounts get 403. They keep using /api/depth/head, which is metered.
//
// 5.4MB, immutable, and cached by the client in Cache Storage
// (lib/model-cache.ts), so a Pro user downloads it once.

import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@/lib/supabase/server";
import { isPaidPlan } from "@/lib/billing/plans";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Sign in required." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();

  if (!isPaidPlan(profile?.plan)) {
    return Response.json(
      { error: "Local 3D generation is a Pro feature." },
      { status: 403 },
    );
  }

  let bytes: Buffer;
  try {
    bytes = await fs.readFile(path.join(process.cwd(), "models", "depth-head.onnx"));
  } catch (e) {
    console.error("[models/depth-head] weights missing from the deployment", e);
    return Response.json({ error: "Model unavailable." }, { status: 500 });
  }

  return new Response(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      // Per-user authorised response: cache in the browser, never in a shared
      // cache that a free account could be served from.
      "Cache-Control": "private, max-age=31536000, immutable",
      "Content-Length": String(bytes.byteLength),
    },
  });
}

// POST /api/depth/head — run the second half of the depth model.
//
// THIS IS THE METER. A free account's browser holds the encoder only, so it
// physically cannot turn a photo into a depth map without this request. Quota
// is therefore enforced on the request that performs the work, which is the one
// thing a client cannot skip — unlike the old advisory "claim" call, which a
// user could patch out and keep generating.
//
// Pro accounts don't normally arrive here at all: they fetch the head weights
// from /api/models/depth-head and run the whole model locally (faster, offline,
// and the activations never leave their device). If a Pro client does call —
// first run before the weights are cached, or a local WASM failure — it is
// served without a limit.
//
// Body: multipart/form-data
//   meta  JSON  { height, width, tokens }   padded input dims + token count
//   f0..f3     raw little-endian fp16 activation planes (tokens * 384 each)
// Response: application/octet-stream — Float32 depth, row-major height*width.
//
// Endianness: every browser and every Vercel runtime is little-endian, so the
// Uint16/Float32 views are transferred as-is rather than byte-swapped.

import { createClient } from "@/lib/supabase/server";
import { FREE_GENERATION_LIMIT } from "@/lib/billing/plans";
import {
  FEATURE_DIM,
  FEATURE_INPUTS,
  runDepthHead,
  validateDims,
} from "@/lib/depth-split/head-runtime";

export const runtime = "nodejs";
// The head is ~0.9s of single-threaded WASM; leave room for a cold start.
export const maxDuration = 60;

/** Cap the body well above a legitimate 770x770 payload (9.29MB) but far below
 *  anything that could be used to burn CPU or memory. */
const MAX_BODY_BYTES = 16 * 1024 * 1024;

function bad(message: string, status = 400): Response {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request): Promise<Response> {
  // ── Auth ────────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return bad("Sign in to make a 3D scene.", 401);

  // ── Cheap size guard before buffering the body ──────────────────────────
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) return bad("Activation payload too large.", 413);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return bad("Expected multipart/form-data.");
  }

  // ── Parse + validate the shape before doing any work ───────────────────
  const metaRaw = form.get("meta");
  if (typeof metaRaw !== "string") return bad("Missing meta.");
  let height: number, width: number, tokens: number;
  try {
    const meta = JSON.parse(metaRaw) as { height: number; width: number; tokens: number };
    height = Number(meta.height);
    width = Number(meta.width);
    tokens = Number(meta.tokens);
  } catch {
    return bad("Malformed meta JSON.");
  }

  const dimError = validateDims(height, width, tokens);
  if (dimError) return bad(dimError);

  const expectedBytes = tokens * FEATURE_DIM * 2; // fp16
  const features: Uint16Array[] = [];
  for (let i = 0; i < FEATURE_INPUTS.length; i++) {
    const part = form.get(`f${i}`);
    if (!(part instanceof Blob)) return bad(`Missing activation plane f${i}.`);
    if (part.size !== expectedBytes) {
      return bad(
        `Activation plane f${i} is ${part.size} bytes, expected ${expectedBytes}.`,
      );
    }
    features.push(new Uint16Array(await part.arrayBuffer()));
  }

  // ── Quota: atomic claim, so two concurrent requests can't both pass ────
  //    (public.claim_generation, migration 0006). Free plans get a limit;
  //    paid plans pass null and are recorded but never refused.
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();
  const isFree = (profile?.plan ?? "free") === "free";

  const { data: claim, error: claimErr } = await supabase
    .rpc("claim_generation", {
      p_kind: "3d",
      p_limit: isFree ? FREE_GENERATION_LIMIT : null,
    })
    .maybeSingle<{ used: number; allowed: boolean }>();

  if (claimErr) {
    console.error("[depth/head] claim_generation failed", claimErr);
    return bad("Could not check your generation quota. Please try again.", 500);
  }

  if (claim && !claim.allowed) {
    return Response.json(
      {
        error: `You've used all ${FREE_GENERATION_LIMIT} free 3D generations. Pro is a one-time payment for unlimited 3D.`,
        used: claim.used,
        limit: FREE_GENERATION_LIMIT,
        remaining: 0,
      },
      { status: 402 },
    );
  }

  // ── Run the head ────────────────────────────────────────────────────────
  let depth: Float32Array;
  try {
    depth = await runDepthHead({ features, height, width });
  } catch (e) {
    // The generation was claimed but produced nothing. Refunding it needs the
    // service role (generations has no DELETE policy by design), so instead of
    // silently charging the user, log loudly and tell them it didn't count.
    console.error("[depth/head] inference failed after claiming a generation", e);
    return bad(
      "The depth model failed on our side. Please try again — if it keeps happening, contact us and we'll restore the generation.",
      502,
    );
  }

  const remaining =
    isFree && claim ? Math.max(0, FREE_GENERATION_LIMIT - claim.used) : -1;

  // Copy into its own ArrayBuffer: the runtime's tensor may be a view into a
  // larger (possibly shared) buffer, which isn't a valid response body.
  const body = new Uint8Array(
    new Uint8Array(depth.buffer, depth.byteOffset, depth.byteLength),
  );

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "no-store",
      // Surfaced in the UI as "N free 3D generations left"; -1 = unlimited.
      "X-Generations-Remaining": String(remaining),
      "X-Depth-Dims": `${height}x${width}`,
    },
  });
}

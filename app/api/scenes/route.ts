// POST /api/scenes — persist a published scene to Vercel Blob so it resolves on
// any device or third-party site (the IndexedDB store only sees the creating
// browser). Writes the three assets plus a public `scene.json` manifest under a
// deterministic `scenes/<id>/` prefix.
//
// No AI here: the creator's device already produced image/depth/mask; this route
// only moves those finished files into shared storage.

import { put } from "@vercel/blob";
import type { SceneConfig } from "@/lib/rendering/types";
import type { SceneManifest } from "@/lib/publish/types";
import { createClient } from "@/lib/supabase/server";

// @vercel/blob needs Node APIs — never the edge runtime (also Vercel's default).
export const runtime = "nodejs";

const ID_RE = /^[a-z0-9]{6,32}$/i;
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;
const MAX_ASSET_BYTES = 24 * 1024 * 1024; // per-asset guard (image/depth/mask)
const FREE_SCENE_LIMIT = 5; // published scenes a free account may keep

function bad(message: string, status = 400): Response {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request): Promise<Response> {
  // ── Auth: publishing requires an account (creation stays local/anonymous) ──
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return bad("Sign in to publish.", 401);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return bad("Expected multipart/form-data.");
  }

  const id = form.get("id");
  if (typeof id !== "string" || !ID_RE.test(id)) return bad("Invalid scene id.");

  // ── Ownership: a scene id belongs to whoever first published it. This closes
  //    the old overwrite hole (deterministic paths + allowOverwrite let anyone
  //    clobber a known id). A new id under the free cap is also enforced here. ──
  const { data: existing } = await supabase
    .from("scenes")
    .select("owner_id")
    .eq("id", id)
    .maybeSingle();
  if (existing && existing.owner_id !== user.id) {
    return bad("That scene belongs to another account.", 403);
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();
  const plan = (profile?.plan as string) ?? "free";
  const watermark = plan === "free";
  if (!existing && plan === "free") {
    const { count } = await supabase
      .from("scenes")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id);
    if ((count ?? 0) >= FREE_SCENE_LIMIT) {
      return bad("Free plan scene limit reached — upgrade to publish more.", 402);
    }
  }

  const configRaw = form.get("config");
  if (typeof configRaw !== "string") return bad("Missing config.");
  let config: SceneConfig;
  try {
    const parsed = JSON.parse(configRaw);
    if (!parsed || typeof parsed !== "object") return bad("Malformed config.");
    config = parsed as SceneConfig;
  } catch {
    return bad("Malformed config JSON.");
  }

  const createdAtRaw = form.get("createdAt");
  const createdAtNum = typeof createdAtRaw === "string" ? Number(createdAtRaw) : NaN;
  const createdAt = Number.isFinite(createdAtNum) ? createdAtNum : Date.now();

  const image = form.get("image");
  const depth = form.get("depth");
  const mask = form.get("mask");
  const background = form.get("background");
  if (!(image instanceof Blob) || !(depth instanceof Blob)) {
    return bad("Missing image or depth asset.");
  }
  if (mask !== null && !(mask instanceof Blob)) return bad("Malformed mask asset.");
  if (background !== null && !(background instanceof Blob)) return bad("Malformed background asset.");
  const tooBig =
    image.size > MAX_ASSET_BYTES ||
    depth.size > MAX_ASSET_BYTES ||
    (mask instanceof Blob && mask.size > MAX_ASSET_BYTES) ||
    (background instanceof Blob && background.size > MAX_ASSET_BYTES);
  if (tooBig) return bad("Asset exceeds size limit.", 413);

  const base = `scenes/${id}`;
  const putOpts = {
    access: "public" as const,
    addRandomSuffix: false, // deterministic pathnames: scenes/<id>/<file>
    allowOverwrite: true, // re-publishing the same id replaces cleanly
    cacheControlMaxAge: ONE_YEAR_SECONDS,
  };

  try {
    const [imageRes, depthRes, maskRes, backgroundRes] = await Promise.all([
      put(`${base}/image.webp`, image, { ...putOpts, contentType: "image/webp" }),
      put(`${base}/depth.png`, depth, { ...putOpts, contentType: "image/png" }),
      mask instanceof Blob
        ? put(`${base}/mask.png`, mask, { ...putOpts, contentType: "image/png" })
        : Promise.resolve(null),
      background instanceof Blob
        ? put(`${base}/background.webp`, background, { ...putOpts, contentType: "image/webp" })
        : Promise.resolve(null),
    ]);

    const manifest: SceneManifest = {
      id,
      version: 1,
      config,
      createdAt,
      watermark,
      assets: {
        image: { url: imageRes.url, mime: "image/webp" },
        depth: { url: depthRes.url, mime: "image/png" },
        mask: maskRes ? { url: maskRes.url, mime: "image/png" } : null,
        background: backgroundRes ? { url: backgroundRes.url, mime: "image/webp" } : null,
      },
    };

    await put(`${base}/scene.json`, JSON.stringify(manifest), {
      ...putOpts,
      contentType: "application/json",
    });

    // Record ownership + metadata (RLS enforces owner_id = auth.uid()).
    const { error: dbErr } = await supabase.from("scenes").upsert(
      {
        id,
        owner_id: user.id,
        config,
        image_url: imageRes.url,
        depth_url: depthRes.url,
        mask_url: maskRes ? maskRes.url : null,
        background_url: backgroundRes ? backgroundRes.url : null,
        watermark,
      },
      { onConflict: "id" },
    );
    if (dbErr) return Response.json({ error: dbErr.message }, { status: 500 });

    return Response.json({ id, watermark }, { status: 201 });
  } catch (err) {
    // Most likely a missing/invalid BLOB_READ_WRITE_TOKEN (store not provisioned
    // yet). 503 lets the client fall back to its local IndexedDB copy.
    const message = err instanceof Error ? err.message : "Upload failed.";
    return Response.json({ error: message }, { status: 503 });
  }
}

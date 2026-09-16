// POST /api/scenes — persist a published scene to Cloudflare R2 so it resolves
// on any device or third-party site (the IndexedDB store only sees the creating
// browser). Writes the assets plus a `scene.json` manifest under a deterministic
// `scenes/<id>/` prefix. The bucket is private; everything is read back through
// /api/scenes/[id] and /api/asset/[id]/[field].
//
// Asset refs in the manifest are `r2:<key>`, not URLs — there is no public URL
// to hand out, and the asset proxy knows how to read a key. Legacy manifests
// (Vercel Blob era) carry absolute URLs; the proxy handles both.
//
// No AI here: the creator's device already produced image/depth/mask; this route
// only moves those finished files into shared storage.

import type { SceneConfig } from "@/lib/rendering/types";
import type { SceneManifest } from "@/lib/publish/types";
import { putObject } from "@/lib/storage/r2";
import { createClient } from "@/lib/supabase/server";

// The S3 client needs Node APIs — never the edge runtime (also Vercel's default).
export const runtime = "nodejs";

const ID_RE = /^[a-z0-9]{6,32}$/i;
const MAX_ASSET_BYTES = 24 * 1024 * 1024; // per-asset guard (image/depth/mask)

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
  //    clobber a known id). ──
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
  // Publishing is unlimited on every plan — the free cap moved onto 3D
  // *generation* (app/api/generations/route.ts), which is the step that costs
  // something. The plan still decides the watermark.
  const watermark = plan === "free";

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
  const thumb = form.get("thumb");
  if (!(image instanceof Blob) || !(depth instanceof Blob)) {
    return bad("Missing image or depth asset.");
  }
  if (mask !== null && !(mask instanceof Blob)) return bad("Malformed mask asset.");
  if (background !== null && !(background instanceof Blob)) return bad("Malformed background asset.");
  if (thumb !== null && !(thumb instanceof Blob)) return bad("Malformed thumb asset.");
  const tooBig =
    image.size > MAX_ASSET_BYTES ||
    depth.size > MAX_ASSET_BYTES ||
    (mask instanceof Blob && mask.size > MAX_ASSET_BYTES) ||
    (background instanceof Blob && background.size > MAX_ASSET_BYTES) ||
    (thumb instanceof Blob && thumb.size > MAX_ASSET_BYTES);
  if (tooBig) return bad("Asset exceeds size limit.", 413);

  const base = `scenes/${id}`;
  // Store one asset and return its manifest ref, or null when absent.
  const store = async (
    field: string,
    file: FormDataEntryValue | null,
    ext: string,
    mime: string,
  ): Promise<{ url: string; mime: string } | null> => {
    if (!(file instanceof Blob)) return null;
    const key = `${base}/${field}.${ext}`;
    await putObject(key, file, mime);
    return { url: `r2:${key}`, mime };
  };

  try {
    const [imageRef, depthRef, maskRef, backgroundRef, thumbRef] = await Promise.all([
      store("image", image, "webp", "image/webp"),
      store("depth", depth, "png", "image/png"),
      store("mask", mask, "png", "image/png"),
      store("background", background, "webp", "image/webp"),
      store("thumb", thumb, "webp", "image/webp"),
    ]);
    // image/depth were validated as Blobs above, so these are never null.
    if (!imageRef || !depthRef) return bad("Missing image or depth asset.");

    const manifest: SceneManifest = {
      id,
      version: 1,
      config,
      createdAt,
      watermark,
      assets: {
        image: imageRef,
        depth: depthRef,
        mask: maskRef,
        background: backgroundRef,
        thumb: thumbRef,
      },
    };

    await putObject(`${base}/scene.json`, JSON.stringify(manifest), "application/json");

    // The DB keeps proxy paths, not storage locations: they're what the
    // /scenes grid renders, and they stay valid if the store moves again.
    const proxy = (field: string) => `/api/asset/${id}/${field}`;

    // Record ownership + metadata (RLS enforces owner_id = auth.uid()).
    const { error: dbErr } = await supabase.from("scenes").upsert(
      {
        id,
        owner_id: user.id,
        config,
        image_url: proxy("image"),
        depth_url: proxy("depth"),
        mask_url: maskRef ? proxy("mask") : null,
        background_url: backgroundRef ? proxy("background") : null,
        thumb_url: thumbRef ? proxy("thumb") : null,
        watermark,
      },
      { onConflict: "id" },
    );
    if (dbErr) return Response.json({ error: dbErr.message }, { status: 500 });

    return Response.json({ id, watermark }, { status: 201 });
  } catch (err) {
    // Most likely missing/invalid R2_* env (store not provisioned yet). 503
    // lets the client fall back to its local IndexedDB copy.
    const message = err instanceof Error ? err.message : "Upload failed.";
    return Response.json({ error: message }, { status: 503 });
  }
}

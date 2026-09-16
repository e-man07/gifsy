// GET /api/scenes/[id] — resolve a published scene's manifest by id. Returns
// `scene.json` (config + asset URLs) so a viewer on any site can then fetch the
// assets. CORS-open + long immutable cache so embeds on third-party pages load
// fast.
//
// Asset URLs are rewritten to our own `/api/asset/[id]/[field]` proxy rather
// than handed out as storage URLs — the store is private (R2) or was getting
// burst-blocked (legacy Blob); see that route. Third-party consumers still get
// absolute, fetch-ready URLs; they just resolve to our domain.

import { loadSceneManifest } from "@/lib/publish/manifest";
import type { SceneAssetRef } from "@/lib/publish/types";

export const runtime = "nodejs";

const ASSET_FIELDS = ["image", "depth", "mask", "background", "thumb"] as const;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const lookup = await loadSceneManifest(id);
  if (lookup.status === "missing") {
    return Response.json({ error: "Scene not found." }, { status: 404 });
  }
  if (lookup.status === "error") {
    return Response.json({ error: lookup.error }, { status: 502 });
  }

  const manifest = lookup.manifest;
  const origin = new URL(request.url).origin;
  for (const field of ASSET_FIELDS) {
    const ref = manifest.assets?.[field] as SceneAssetRef | null | undefined;
    if (ref) ref.url = `${origin}/api/asset/${id}/${field}`;
  }
  return Response.json(manifest, {
    status: 200,
    headers: {
      // Immutable per id. `s-maxage` is what makes Vercel's edge actually
      // cache a function response — `max-age` alone only instructs the
      // browser, so every viewer was a fresh storage read.
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

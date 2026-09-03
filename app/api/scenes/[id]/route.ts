// GET /api/scenes/[id] — resolve a published scene's manifest by id. Returns the
// public `scene.json` (config + public asset URLs) so a viewer on any site can
// then fetch the assets directly. CORS-open + long immutable cache so embeds on
// third-party pages load fast.

import { head, BlobNotFoundError } from "@vercel/blob";

export const runtime = "nodejs";

const ID_RE = /^[a-z0-9]{6,32}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  if (!ID_RE.test(id)) {
    return Response.json({ error: "Invalid scene id." }, { status: 400 });
  }

  try {
    const meta = await head(`scenes/${id}/scene.json`);
    const res = await fetch(meta.url, { cache: "no-store" });
    if (!res.ok) {
      return Response.json({ error: "Manifest unavailable." }, { status: 502 });
    }
    const manifest = await res.json();
    return Response.json(manifest, {
      status: 200,
      headers: {
        // Manifest is immutable per id (re-publish overwrites in place, but the
        // asset URLs it points at carry their own long cache too).
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    if (err instanceof BlobNotFoundError) {
      return Response.json({ error: "Scene not found." }, { status: 404 });
    }
    const message = err instanceof Error ? err.message : "Lookup failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}

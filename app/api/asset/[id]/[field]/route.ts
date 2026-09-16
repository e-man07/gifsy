// GET /api/asset/[id]/[field] — serves one published scene's asset through our
// own domain. Viewers never talk to the store directly.
//
// Originally this existed because a page embedding many scenes at once (the
// homepage marquee, ~32 iframes) was bursting Blob's CDN and tripping its
// firewall. It's now load-bearing for a second reason: scene assets live in a
// PRIVATE R2 bucket, so this route is the only public path to them. Manifest
// asset refs are either an `r2:<key>` (read from the bucket) or an absolute URL
// (a legacy Blob scene, fetched as before).
//
// The edge cache does the heavy lifting: `s-maxage` means one request per
// asset per region warms Vercel's cache and every later viewer is served from
// it without touching storage at all.

import { loadSceneManifest } from "@/lib/publish/manifest";
import { getObject } from "@/lib/storage/r2";

export const runtime = "nodejs";

const FIELDS = ["image", "depth", "mask", "background", "thumb"] as const;
type Field = (typeof FIELDS)[number];

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
  "Access-Control-Allow-Origin": "*",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; field: string }> },
): Promise<Response> {
  const { id, field } = await params;
  if (!FIELDS.includes(field as Field)) {
    return Response.json({ error: "Unknown asset." }, { status: 400 });
  }

  const lookup = await loadSceneManifest(id);
  if (lookup.status === "error") {
    return Response.json({ error: lookup.error }, { status: 502 });
  }
  const ref = lookup.status === "ok" ? lookup.manifest.assets[field as Field] : null;
  if (!ref) {
    return Response.json({ error: "Asset not found." }, { status: 404 });
  }

  if (ref.url.startsWith("r2:")) {
    const obj = await getObject(ref.url.slice(3));
    if (!obj) return Response.json({ error: "Asset not found." }, { status: 404 });
    return new Response(obj.body, {
      status: 200,
      headers: {
        ...CACHE_HEADERS,
        "Content-Type": ref.mime,
        ...(obj.size ? { "Content-Length": String(obj.size) } : {}),
      },
    });
  }

  const upstream = await fetch(ref.url);
  if (!upstream.ok || !upstream.body) {
    return Response.json({ error: "Asset unavailable." }, { status: 502 });
  }
  return new Response(upstream.body, {
    status: 200,
    headers: { ...CACHE_HEADERS, "Content-Type": ref.mime },
  });
}

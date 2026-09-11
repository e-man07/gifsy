// GET /api/asset/[id]/[field] — proxies one published scene's asset through our
// own domain instead of letting the browser hit Blob storage directly.
//
// A page embedding many scenes at once (e.g. the homepage's community
// marquee, ~32 iframes on one load) was firing near-simultaneous identical
// requests at *.public.blob.vercel-storage.com. Vercel's firewall reads that
// burst from one visitor as an attack pattern and answers with an HTML
// "Security Checkpoint" challenge page instead of the image — which a plain
// <img>/texture fetch can't parse, so it shows up as a broken-image icon.
// Routing through our own cached route means repeat/concurrent requests for
// the same asset are served from our edge cache, never re-bursting Blob.

import { fetchSceneManifest } from "@/lib/publish/manifest";

export const runtime = "nodejs";

const FIELDS = ["image", "depth", "mask", "background", "thumb"] as const;
type Field = (typeof FIELDS)[number];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; field: string }> },
): Promise<Response> {
  const { id, field } = await params;
  if (!FIELDS.includes(field as Field)) {
    return Response.json({ error: "Unknown asset." }, { status: 400 });
  }

  const manifest = await fetchSceneManifest(id);
  const ref = manifest?.assets[field as Field];
  if (!ref) {
    return Response.json({ error: "Asset not found." }, { status: 404 });
  }

  const upstream = await fetch(ref.url);
  if (!upstream.ok || !upstream.body) {
    return Response.json({ error: "Asset unavailable." }, { status: 502 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": ref.mime,
      // Published assets never change under an id — safe to cache hard, both
      // in the browser and at Vercel's edge. That edge cache is the actual
      // fix: once one request warms it, every other viewer (and every
      // duplicate marquee card in the same burst) is served from cache
      // instead of re-hitting Blob storage.
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

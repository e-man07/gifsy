// Server-side manifest lookup used by the share page's generateMetadata.
//
// Intentionally NOT shared with app/api/scenes/[id]/route.ts. That route needs
// to tell 400 / 404 / 502 / 500 apart so a viewer gets an accurate status code;
// metadata generation needs the opposite — it must never throw, because a
// failure there takes down the whole page render for a scene that would
// otherwise display fine. So this collapses every failure to null on purpose.

import { head, BlobNotFoundError } from "@vercel/blob";
import type { SceneManifest } from "./types";

const ID_RE = /^[a-z0-9]{6,32}$/i;

/** Resolve a published scene's manifest, or null if it is missing, malformed
 *  or unreachable. Never throws. */
export async function fetchSceneManifest(
  id: string,
): Promise<SceneManifest | null> {
  if (!ID_RE.test(id)) return null;
  try {
    const meta = await head(`scenes/${id}/scene.json`);
    const res = await fetch(meta.url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as SceneManifest;
  } catch (err) {
    if (!(err instanceof BlobNotFoundError)) {
      console.warn(`[manifest] lookup failed for scene ${id}`, err);
    }
    return null;
  }
}

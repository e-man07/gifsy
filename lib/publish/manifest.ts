// Server-side manifest lookup, shared by the manifest route, the asset proxy
// and the share page's generateMetadata.
//
// Resolution order:
//   1. R2 — `scenes/<id>/scene.json` (everything published since the move).
//   2. Legacy Vercel Blob — scenes published before R2. Looked up by its
//      DETERMINISTIC public URL (pathnames were written with
//      addRandomSuffix:false), never via `head()`: on the Hobby plan every
//      head() + fetch pair was two metered operations, and that metering is
//      what got the store blocked. One GET is the floor.
//
// Once scripts/migrate-blob-to-r2.mjs has copied the legacy scenes over, step
// 2 never matches and LEGACY_BLOB_BASE_URL can be dropped.

import type { SceneManifest } from "@/lib/publish/types";
import { getObjectText, r2Configured } from "@/lib/storage/r2";

const ID_RE = /^[a-z0-9]{6,32}$/i;

/** Public base of the old Blob store. Override if the store is ever recreated. */
const LEGACY_BLOB_BASE_URL =
  process.env.LEGACY_BLOB_BASE_URL?.replace(/\/$/, "") ??
  "https://jihaaklzhpgvaczi.public.blob.vercel-storage.com";

export type ManifestLookup =
  | { status: "ok"; manifest: SceneManifest; source: "r2" | "blob" }
  | { status: "missing" }
  | { status: "error"; error: string };

/** Resolve a published scene's manifest with a status the caller can map to
 *  an HTTP code (404 vs 502). Throws never. */
export async function loadSceneManifest(id: string): Promise<ManifestLookup> {
  if (!ID_RE.test(id)) return { status: "missing" };

  if (r2Configured()) {
    try {
      const text = await getObjectText(`scenes/${id}/scene.json`);
      if (text !== null) {
        return { status: "ok", manifest: JSON.parse(text) as SceneManifest, source: "r2" };
      }
    } catch (err) {
      console.warn(`[manifest] R2 lookup failed for scene ${id}`, err);
      return { status: "error", error: "Manifest store unavailable." };
    }
  }

  try {
    const res = await fetch(`${LEGACY_BLOB_BASE_URL}/scenes/${id}/scene.json`, {
      cache: "no-store",
    });
    if (res.status === 404) return { status: "missing" };
    if (!res.ok) {
      // 403 here means the Blob store is blocked/over quota — the scene exists
      // but can't be read until the store is unblocked or migrated.
      return { status: "error", error: `Legacy store returned ${res.status}.` };
    }
    return { status: "ok", manifest: (await res.json()) as SceneManifest, source: "blob" };
  } catch (err) {
    console.warn(`[manifest] legacy lookup failed for scene ${id}`, err);
    return { status: "error", error: "Manifest lookup failed." };
  }
}

/** Convenience for callers that must never fail the render (metadata): the
 *  manifest, or null for missing/malformed/unreachable alike. */
export async function fetchSceneManifest(id: string): Promise<SceneManifest | null> {
  const r = await loadSceneManifest(id);
  return r.status === "ok" ? r.manifest : null;
}

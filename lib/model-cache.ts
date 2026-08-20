// Model downloads persisted in the Cache Storage API so they survive page
// reloads. The plain HTTP cache can't be relied on: Hugging Face serves the
// depth model with Cache-Control: no-store, which makes browsers re-download
// the full ~50MB file on every visit.

const CACHE_NAME = "gif-models-v1";

/**
 * Fetch `url` once, store the response, and serve it from the cache on later
 * visits. Falls back to plain fetch when the Cache API is unavailable
 * (private mode, quota, non-secure contexts) or a fetch fails.
 */
export async function cachedFetch(url: string): Promise<Response> {
  let cache: Cache | null = null;
  if (typeof caches !== "undefined") {
    try {
      cache = await caches.open(CACHE_NAME);
      const hit = await cache.match(url);
      if (hit) return hit;
    } catch {
      cache = null;
    }
  }
  const res = await fetch(url);
  if (cache && res.ok) {
    try {
      await cache.put(url, res.clone());
    } catch {
      // Storage quota or similar — the response is still returned un-cached.
    }
  }
  return res;
}

/** Drop a cached entry (used when a stored model fails to load). */
export async function evictCached(url: string): Promise<void> {
  if (typeof caches === "undefined") return;
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.delete(url);
  } catch {
    // Nothing to recover here.
  }
}
// Canonical absolute origin for the site.
//
// Needed by metadata (metadataBase, canonical + OG urls) because Open Graph and
// Twitter cards require absolute URLs — a relative og:image is silently dropped
// by every crawler, which is the failure mode this exists to prevent.
//
// Resolution order: an explicit NEXT_PUBLIC_SITE_URL wins (set this on a custom
// domain); otherwise Vercel's production URL for the project; otherwise local
// dev. VERCEL_PROJECT_PRODUCTION_URL is deliberately preferred over VERCEL_URL —
// the latter is the per-deployment URL, which would point cards at a preview.

const FALLBACK = "http://localhost:3000";

export function siteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return explicit.startsWith("http") ? explicit : `https://${explicit}`;
  }
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return FALLBACK;
}

export function siteUrl(): URL {
  return new URL(siteOrigin());
}

/**
 * Origin to bake into things a user copies away: share links and embed
 * snippets.
 *
 * These used `window.location.origin`, which hardcodes whatever domain the
 * user happened to be on. Copy an embed from a preview deployment and the
 * customer's site ends up pointing at `gifsy-<hash>.vercel.app/embed/...`,
 * which stops resolving the moment that deployment is cleaned up — a broken
 * embed on someone else's website, caused by us.
 *
 * So prefer the canonical domain when one is configured, and fall back to the
 * current origin when it isn't (local dev, or before NEXT_PUBLIC_SITE_URL is
 * set) so nothing regresses. Client-safe: NEXT_PUBLIC_* is inlined at build
 * time, unlike the VERCEL_* vars siteOrigin() also consults.
 */
export function embedOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return explicit.startsWith("http") ? explicit : `https://${explicit}`;
  }
  return typeof window !== "undefined" ? window.location.origin : FALLBACK;
}

/**
 * The embed snippet users copy. One place so the workshop, the share page and
 * the guides quote the same thing. `title` names the frame for screen readers
 * (every how-to guide tells people to keep it).
 */
export function embedSnippet(id: string, origin = embedOrigin()): string {
  return `<iframe src="${origin}/embed/${id}" title="Interactive 3D photo" style="width:100%;height:500px;border:0" loading="lazy"></iframe>`;
}

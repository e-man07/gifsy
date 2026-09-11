import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-url";

// Static marketing/tool pages only. Published scenes (/s/[id]) are
// user-generated and unbounded — whether to list them publicly for discovery
// vs. keep them un-indexed by default is a moderation/SEO tradeoff worth a
// deliberate call, not something to bake in here silently.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteOrigin();
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/gallery`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/create`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/tools/gif`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/tools/sticker`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/refund`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}

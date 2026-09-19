// Per-page metadata with the pieces every indexable route needs and kept
// forgetting: a self-referencing canonical, and an og:url/og:title that point
// at THIS page rather than inheriting the homepage's from the root layout.
//
// `title` must not include the brand — app/layout.tsx applies "%s · Gifsy".

import type { Metadata } from "next";
import { siteOrigin } from "@/lib/site-url";

export function pageMetadata(opts: {
  /** Route path starting with "/", e.g. "/tools/gif". */
  path: string;
  title: string;
  description: string;
  /** og:title, when the tab title reads badly as a share card. */
  ogTitle?: string;
  noindex?: boolean;
}): Metadata {
  const url = `${siteOrigin()}${opts.path}`;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: opts.ogTitle ?? `${opts.title} · Gifsy`,
      description: opts.description,
    },
    twitter: {
      card: "summary_large_image",
      title: opts.ogTitle ?? `${opts.title} · Gifsy`,
      description: opts.description,
    },
    robots: opts.noindex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

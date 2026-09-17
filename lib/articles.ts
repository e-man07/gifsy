// Registry for long-form pages: guides, alternatives, (later) blog. One entry
// per article; the page components read their own metadata from here so the
// index list, the article header, the sitemap and the JSON-LD never disagree.
//
// `date` is the first-publish date; `updated` moves when facts are re-checked
// (the alternatives pages promise a quarterly price re-check).

export type ArticleSection = "guides" | "alternatives";

export interface Article {
  slug: string;
  section: ArticleSection;
  title: string;
  /** Tab title, when the H1 is too long for 60 chars. */
  shortTitle?: string;
  description: string;
  date: string; // ISO yyyy-mm-dd
  updated?: string;
  tags: string[];
  /** Approximate body word count, for the "N min read" label. */
  words: number;
}

export const SECTION_LABEL: Record<ArticleSection, { eyebrow: string; title: string; intro: string }> = {
  guides: {
    eyebrow: "Guides",
    title: "Guides",
    intro: "How interactive 3D photos work, and how to put one on a real website.",
  },
  alternatives: {
    eyebrow: "Alternatives",
    title: "Alternatives",
    intro: "Honest comparisons of 3D photo tools, with Gifsy as one entry among the rest.",
  },
};

export const ARTICLES: Article[] = [
  {
    slug: "3d-photo-webflow",
    section: "guides",
    title: "How to add an interactive 3D photo to Webflow (one photo, no layers)",
    shortTitle: "Add an Interactive 3D Photo to Webflow",
    description:
      "Every \"interactive image Webflow\" tutorial wants Photoshop-cut layers and an Interactions rig. This one starts from a single photo and uses Webflow's Embed element — about ten minutes, no code beyond one iframe.",
    date: "2026-09-17",
    tags: ["webflow", "embed", "how-to"],
    words: 1660,
  },
  {
    slug: "embed-3d-photo-on-website",
    section: "guides",
    title: "How to embed a 3D photo on any website (iframe guide)",
    shortTitle: "Embed a 3D Photo on Any Website",
    description:
      "The universal iframe snippet, every attribute explained, what the frame actually loads, and the exact menu path for Webflow, Framer, Squarespace, WordPress, Wix, Carrd, Notion and Shopify — plus the troubleshooting table.",
    date: "2026-09-17",
    tags: ["embed", "iframe", "reference"],
    words: 1750,
  },
  {
    slug: "how-3d-photos-work",
    section: "guides",
    title: "How do 3D photos work? Depth maps, mattes and two planes, explained",
    shortTitle: "How 3D Photos Work",
    description:
      "One photo becomes a scene with depth in five steps: a depth map, a subject matte, an inpainted backdrop, two displaced planes, and a camera orbit that stops at 23° for a reason. The models, the numbers, and what a 3D photo can't do.",
    date: "2026-09-17",
    tags: ["explainer", "depth-map", "3d-photo"],
    words: 2400,
  },
  {
    slug: "3d-photo-framer",
    section: "guides",
    title: "How to add a 3D photo to Framer with the Embed component",
    shortTitle: "Add a 3D Photo to Framer",
    description:
      "Framer's Embed component takes raw HTML, so an interactive 3D photo is one iframe away. Where the component lives, how to size it per breakpoint, how to use it as a hero, and what to check before publishing.",
    date: "2026-09-17",
    tags: ["framer", "embed", "how-to"],
    words: 870,
  },
  {
    slug: "immersity-ai",
    section: "alternatives",
    title: "Immersity AI (LeiaPix) alternatives in 2026: 8 tools compared",
    shortTitle: "Immersity AI Alternatives (2026): 8 Tools Compared",
    description:
      "Immersity for Web now watermarks free exports and sells monthly credits — and no plan gives you a web embed. Eight alternatives, split by what you actually get: interactive embed, video file, or 3D mesh.",
    date: "2026-09-17",
    updated: "2026-09-17",
    tags: ["immersity", "leiapix", "comparison", "3d-photo"],
    words: 2580,
  },
];

export const articlePath = (a: Article) => `/${a.section}/${a.slug}`;
export const readTime = (words: number) => `${Math.max(1, Math.round(words / 220))} min read`;
export const articlesIn = (section: ArticleSection) =>
  ARTICLES.filter((a) => a.section === section).sort((a, b) => (a.date < b.date ? 1 : -1));
export const findArticle = (section: ArticleSection, slug: string) =>
  ARTICLES.find((a) => a.section === section && a.slug === slug);

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

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

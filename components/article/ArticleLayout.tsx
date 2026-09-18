// Article page layout per the approved reference: mono breadcrumb, mono
// uppercase tags, bold sans H1, dek, byline "Author · date · read time",
// generous body, and a right rail "On this page" that is sticky on desktop.
// Server component. Body typography comes from the `.article` styles in
// globals.css; sections pass their headings in so the rail and the H2 ids
// come from one list.

import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import type { NavLink } from "@/components/AccountMenu";
import { SiteFooter } from "@/components/SiteFooter";
import { Toc } from "@/components/article/Toc";
import { AUTHOR } from "@/lib/founders";
import { articlePath, formatDate, readTime, SECTION_LABEL, type Article } from "@/lib/articles";
import { JsonLd, breadcrumbNode, ORG_ID } from "@/lib/seo/json-ld";
import { siteOrigin } from "@/lib/site-url";

/** Nav links for every content page (articles and their indexes), so a
 *  reader can move between the sections without going back to the homepage. */
export const CONTENT_NAV: NavLink[] = [
  { href: "/guides", label: "Guides" },
  { href: "/compare", label: "Compare" },
  { href: "/gallery", label: "Gallery" },
];

export interface TocItem {
  id: string;
  title: string;
}

export function ArticleLayout({
  article,
  toc,
  extraGraph = [],
  children,
}: {
  article: Article;
  toc: TocItem[];
  /** Page-specific JSON-LD nodes (FAQPage, ItemList…). */
  extraGraph?: Record<string, unknown>[];
  children: React.ReactNode;
}) {
  const section = SECTION_LABEL[article.section];
  const url = `${siteOrigin()}${articlePath(article)}`;
  const graph = [
    breadcrumbNode([
      { name: "Home", path: "/" },
      { name: section.title, path: `/${article.section}` },
      { name: article.title, path: articlePath(article) },
    ]),
    {
      "@type": "Article",
      "@id": `${url}#article`,
      headline: article.title,
      description: article.description,
      datePublished: article.date,
      dateModified: article.updated ?? article.date,
      author: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.x },
      publisher: { "@id": ORG_ID() },
      mainEntityOfPage: url,
    },
    ...extraGraph,
  ];

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-background">
      <JsonLd graph={graph} />
      <SiteNav links={CONTENT_NAV} />
      {/* The article column is centred on the page by itself; the rail lives
          in the right-hand margin, not in the centred block. Symmetric outer
          columns keep the text centred whatever the rail's width. */}
      <div className="mx-auto w-full max-w-[1440px] flex-1 px-5 pb-20 pt-6 sm:px-8 sm:pt-10 lg:grid lg:grid-cols-[1fr_minmax(0,780px)_1fr] lg:gap-x-10">
        <article className="min-w-0 lg:col-start-2">
          <nav aria-label="Breadcrumb" className="font-mono text-xs text-muted">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">›</span>
            <Link href={`/${article.section}`} className="hover:text-foreground">{section.title}</Link>
            <span className="mx-2">›</span>
            <span className="text-foreground">{article.shortTitle ?? article.title}</span>
          </nav>

          <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-muted">
            {article.tags.join("  ")}
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[2.6rem]">
            {article.title}
          </h1>
          <p className="mt-5 max-w-[65ch] text-lg leading-relaxed text-muted">{article.description}</p>
          <p className="mt-5 text-sm text-muted">
            <a href={AUTHOR.x} rel="me noopener" target="_blank" className="text-foreground underline underline-offset-4">
              {AUTHOR.name}
            </a>
            <span className="mx-2">·</span>
            {formatDate(article.date)}
            {article.updated && article.updated !== article.date && (
              <>
                <span className="mx-2">·</span>updated {formatDate(article.updated)}
              </>
            )}
            <span className="mx-2">·</span>
            {readTime(article.words)}
          </p>

          <div className="article mt-12">{children}</div>
        </article>

        <aside className="hidden lg:block lg:col-start-3">
          <div className="sticky top-24 max-w-[240px]">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">On this page</p>
            <Toc items={toc} />
          </div>
        </aside>
      </div>
      <SiteFooter />
    </main>
  );
}

/** A section heading whose id matches the rail. */
export function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24">
      {children}
    </h2>
  );
}

// Index page for a section of articles (/guides, /alternatives). Layout per
// the approved reference: mono eyebrow, bold sans title, one intro line, then
// a vertical list — mono "date · N min read", bold title, description, mono
// tag pills — with a hairline between entries. Single column, left-aligned.

import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { CONTENT_NAV } from "@/components/article/ArticleLayout";
import { SiteFooter } from "@/components/SiteFooter";
import { articlePath, articlesIn, formatDate, readTime, SECTION_LABEL, type ArticleSection } from "@/lib/articles";

export function ArticleIndex({ section }: { section: ArticleSection }) {
  const meta = SECTION_LABEL[section];
  const items = articlesIn(section);
  return (
    <main className="flex min-h-screen flex-1 flex-col bg-background">
      <SiteNav links={CONTENT_NAV} />
      <div className="mx-auto w-full max-w-[860px] flex-1 px-5 pb-20 pt-8 sm:px-8 sm:pt-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{meta.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{meta.title}</h1>
        <p className="mt-4 text-base text-muted">{meta.intro}</p>

        <ul className="mt-12">
          {items.map((a) => (
            <li key={a.slug} className="border-t border-foreground/15 py-9 first:border-t-0 first:pt-0">
              <p className="font-mono text-xs text-muted">
                {formatDate(a.date)} · {readTime(a.words)}
              </p>
              <h2 className="mt-3 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                <Link href={articlePath(a)} className="hover:underline hover:underline-offset-4">
                  {a.title}
                </Link>
              </h2>
              <p className="mt-3 max-w-[70ch] text-base leading-relaxed text-muted">{a.description}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {a.tags.map((t) => (
                  <li key={t} className="rounded-full border border-foreground/40 px-3 py-0.5 font-mono text-xs text-muted">
                    {t}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
      <SiteFooter />
    </main>
  );
}

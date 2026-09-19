// Building blocks for the server-rendered copy under each tool. Server
// components: no hooks, no handlers — the FAQ accordion is a native
// <details>, so it works with scripting off and the answers stay crawlable.
//
// Keep these the only way the tool pages lay copy out, so /tools/gif,
// /tools/sticker and /create read as one family and a fix lands everywhere.

import type { CSSProperties } from "react";
import { Check, ChevronDown, X, type LucideIcon } from "lucide-react";
import type { Faq } from "@/lib/seo/json-ld";

export const inlineLink = "text-sky-deep underline underline-offset-2";

/** Page-width wrapper for everything below the tool card. */
export function CopyPage({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-4xl px-5 pb-20 sm:px-8">{children}</div>;
}

/** One section: heading, optional one-paragraph intro, then its block. */
export function Section({
  title,
  intro,
  children,
  id,
}: {
  title: string;
  intro?: React.ReactNode;
  children?: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="mt-14 first:mt-10 sm:mt-16">
      <div className="max-w-2xl">
        <h2 className="font-editorial text-2xl text-foreground sm:text-3xl">{title}</h2>
        {intro && <div className="mt-2 text-sm text-muted sm:text-base">{intro}</div>}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </section>
  );
}

/** A real sequence: numbered tiles, one per step. */
export function Steps({
  steps,
}: {
  steps: { name: string; text: string; Icon?: LucideIcon }[];
}) {
  return (
    <ol className="grid gap-4 sm:grid-cols-3">
      {steps.map((s, i) => (
        <li key={s.name} className="card flex flex-col gap-2 rounded-2xl bg-panel p-5">
          <div className="flex items-center gap-2.5">
            <span className="num text-sm text-sky-deep">{i + 1}</span>
            {s.Icon && <s.Icon className="h-4.5 w-4.5 text-sky" strokeWidth={1.75} aria-hidden />}
          </div>
          <h3 className="font-display text-sm text-foreground">{s.name}</h3>
          <p className="text-sm text-muted">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}

/** One list of a ProsCons pair. */
function MarkList({ title, items, yes }: { title: string; items: string[]; yes: boolean }) {
  return (
    <ul className="card space-y-2.5 rounded-2xl bg-panel p-5 text-sm">
      <li className="font-display text-foreground">{title}</li>
      {items.map((t) => (
        <li key={t} className="flex gap-2.5 text-muted">
          {yes ? (
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-grass" strokeWidth={2.5} aria-hidden />
          ) : (
            <X className="mt-0.5 h-4 w-4 shrink-0 text-petal" strokeWidth={2.5} aria-hidden />
          )}
          {t}
        </li>
      ))}
    </ul>
  );
}

/** Two cards: what works (✓) and what doesn't (✗). */
export function ProsCons({
  goodTitle = "Works best",
  badTitle = "Works worst",
  good,
  bad,
}: {
  goodTitle?: string;
  badTitle?: string;
  good: string[];
  bad: string[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <MarkList title={goodTitle} items={good} yes />
      <MarkList title={badTitle} items={bad} yes={false} />
    </div>
  );
}

/** Small labelled tiles — for specs, facts, formats. */
export function Facts({ items }: { items: { label: string; value: string; note?: string }[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((f) => (
        <li key={f.label} className="rounded-xl border border-foreground/10 px-4 py-3">
          <p className="text-xs text-muted">{f.label}</p>
          <p className="mt-0.5 font-display text-sm text-foreground">{f.value}</p>
          {f.note && <p className="mt-1 text-xs text-muted">{f.note}</p>}
        </li>
      ))}
    </ul>
  );
}

/**
 * Comparison grid. `cols` are the columns after the row label; the first is
 * ours and gets the tint. Cells are either a plain string or [yes, text].
 */
export type CompareCell = string | [boolean, string];
export function Compare({
  cols,
  rows,
}: {
  cols: string[];
  rows: { label: string; cells: CompareCell[] }[];
}) {
  const grid = { gridTemplateColumns: `1.2fr repeat(${cols.length}, 1fr)` } as CSSProperties;
  const cell = (c: CompareCell) =>
    typeof c === "string" ? (
      <span>{c}</span>
    ) : (
      <>
        {c[0] ? (
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-grass" strokeWidth={2.5} aria-hidden />
        ) : (
          <X className="mt-0.5 h-4 w-4 shrink-0 text-petal" strokeWidth={2.5} aria-hidden />
        )}
        <span>{c[1]}</span>
      </>
    );
  return (
    <div className="card overflow-x-auto rounded-2xl bg-panel">
      <div className="min-w-[560px]">
        <div className="grid border-b border-foreground/10 text-xs font-semibold text-foreground sm:text-sm" style={grid}>
          <div className="px-3 py-3" />
          {cols.map((c, i) => (
            <div key={c} className={`px-3 py-3 ${i === 0 ? "bg-sky/10 text-sky-deep" : ""}`}>
              {c}
            </div>
          ))}
        </div>
        {rows.map((r, ri) => (
          <div
            key={r.label}
            className={`grid text-xs sm:text-sm ${ri > 0 ? "border-t border-foreground/10" : ""}`}
            style={grid}
          >
            <div className="px-3 py-2.5 font-semibold text-foreground">{r.label}</div>
            {r.cells.map((c, i) => (
              <div key={i} className={`flex items-start gap-1.5 px-3 py-2.5 text-muted ${i === 0 ? "bg-sky/5" : ""}`}>
                {cell(c)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Native accordion. Answers are in the DOM whether open or not. */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="card divide-y divide-foreground/10 rounded-2xl bg-panel">
      {faqs.map((f) => (
        <details key={f.q} className="group px-5 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
            <h3 className="font-display text-sm text-foreground sm:text-base">{f.q}</h3>
            <ChevronDown
              className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180"
              strokeWidth={2.5}
              aria-hidden
            />
          </summary>
          <p className="mt-3 text-sm text-muted sm:text-base">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

/** A one-line "next" strip with two or three links. */
export function NextLinks({ links }: { links: { href: string; label: string; note: string }[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {links.map((l) => (
        <li key={l.href}>
          <a
            href={l.href}
            className="card-sm block rounded-xl bg-panel px-4 py-3 transition hover:-translate-y-0.5"
          >
            <span className="block font-display text-sm text-foreground">{l.label}</span>
            <span className="mt-0.5 block text-xs text-muted">{l.note}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

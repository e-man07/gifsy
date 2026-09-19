"use client";

// The "On this page" rail. Tracks the section under the reader: the active
// entry is the last H2 whose top has crossed a line a little below the sticky
// nav, so it flips as each heading scrolls under it rather than when the
// heading leaves the viewport. Hash clicks scroll with the same offset.

import { useEffect, useState } from "react";
import type { TocItem } from "./ArticleLayout";

const OFFSET = 120; // px below the viewport top; clears the sticky nav pill

export function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const headings = items
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      let current: string | null = null;
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= OFFSET) current = h.id;
        else break;
      }
      // Past the last heading with the page bottomed out → keep the last one.
      if (
        current === null &&
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      ) {
        current = headings[headings.length - 1].id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  return (
    <ol className="mt-4 space-y-3 border-l border-foreground/10">
      {items.map((t) => {
        const on = t.id === active;
        return (
          <li key={t.id} className="-ml-px">
            <a
              href={`#${t.id}`}
              aria-current={on ? "location" : undefined}
              className={`block border-l pl-4 text-sm leading-snug transition-colors ${
                on
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {t.title}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

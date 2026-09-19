"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AccountMenu } from "@/components/AccountMenu";
import { Wordmark } from "@/components/Wordmark";
import { ToolsMenu } from "@/components/ToolsMenu";
import { TOOL_LINKS } from "@/lib/nav";

// The landing page's fixed nav pill. Split out of app/page.tsx so the page
// itself can be a server component (all the SEO prose must be in the HTML,
// not hydrated in); this is one of the two pieces that genuinely need state.
//
// The pill crosses the hero photo AND the white panels below it as the page
// scrolls underneath. It stays frosted glass throughout — only the type flips
// from white to ink, since that is what actually decides legibility. The tint
// firms up from 15% to 70% when scrolled so it still reads as a pill on white.
export function HomeNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkCls = `hidden font-display text-sm transition-colors sm:block ${
    scrolled ? "text-ink hover:text-sky-deep" : "text-cloud hover:text-white"
  }`;

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex flex-col">
      <nav className="flex justify-center px-5 pt-4 sm:px-8 sm:pt-6">
        <div
          className={`flex w-full max-w-5xl items-center justify-between gap-3 rounded-full px-5 py-3 shadow-[0_8px_32px_rgba(4,16,29,0.18)] ring-1 backdrop-blur-xl transition-colors duration-300 sm:px-7 ${
            scrolled ? "bg-white/70 ring-ink/10" : "bg-white/15 ring-white/25"
          }`}
        >
          <Wordmark href="#top" className={scrolled ? "text-ink" : "text-cloud"} />
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Hidden on phones — the bar fits the wordmark, sign-in and the
                CTA and no more; the hamburger lists the tools and Gallery. */}
            <ToolsMenu tone={scrolled ? "dark" : "light"} />
            <Link href="/gallery" className={linkCls}>
              Gallery
            </Link>
            <AccountMenu
              tone={scrolled ? "dark" : "light"}
              signIn="button"
              links={[...TOOL_LINKS, { href: "/gallery", label: "Gallery" }]}
            />
          </div>
        </div>
      </nav>
    </div>
  );
}

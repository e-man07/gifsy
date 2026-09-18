// The shared page header: wordmark on the left, a "Make one" CTA on the right,
// on the white band every non-landing page opens with.
//
// This markup was copy-pasted into the pricing page, the legal pages and the
// gallery (which adds a "How it works" link); /account and /scenes shipped
// without it and so had no way back to the landing page. One component means
// a header fix lands everywhere instead of in three of five places.
//
// `links` are the page's own nav destinations. They render inline on desktop
// and move into AccountMenu's hamburger on phones — passing them as data
// rather than as `children` is what lets one array feed both. Account-shaped
// links belong in the AccountMenu dropdown, not here.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { AccountMenu, type NavLink } from "@/components/AccountMenu";

/** Shared styling for a plain text link sitting in this nav. */
export const navLinkCls =
  "font-display text-sm text-foreground transition-colors hover:text-sky-deep";

export function SiteNav({ links = [] }: { links?: NavLink[] }) {
  // Same pill as the landing page's HomeNav in its scrolled state — centred,
  // frosted, ringed — so the site has one header, not two. It is sticky in
  // flow (no fixed positioning, no spacer): pages keep their layout and the
  // bar simply stays at the top as they scroll.
  return (
    <div className="sticky top-0 z-50 flex justify-center px-5 pt-4 sm:px-8 sm:pt-6">
      <nav className="flex w-full max-w-5xl items-center justify-between gap-3 rounded-full bg-white/70 px-5 py-3 shadow-[0_8px_32px_rgba(4,16,29,0.18)] ring-1 ring-ink/10 backdrop-blur-xl sm:px-7">
        <Wordmark className="text-foreground" />
        <div className="flex items-center gap-3 sm:gap-5">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`hidden sm:block ${navLinkCls}`}>
              {l.label}
            </Link>
          ))}
          <Link
            href="/"
            className="btn order-1 flex shrink-0 items-center gap-1.5 rounded-full bg-sky px-4 py-2 font-display text-sm text-cloud"
          >
            Make one
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </Link>
          <AccountMenu links={links} tone="dark" />
        </div>
      </nav>
    </div>
  );
}

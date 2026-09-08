// The shared page header: wordmark on the left, a "Make one" CTA on the right,
// on the dark ink band every non-landing page opens with.
//
// This markup was copy-pasted into the pricing page, the legal pages and the
// gallery (which adds a "How it works" link); /account and /scenes shipped
// without it and so had no way back to the landing page. One component means
// a header fix lands everywhere instead of in three of five places.
//
// `children` renders to the LEFT of the account control, for pages that want
// extra links (the gallery's "How it works"). Account-shaped links belong in
// the AccountMenu dropdown, not here.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { AccountMenu } from "@/components/AccountMenu";

/** Shared styling for a plain text link sitting in this nav. */
export const navLinkCls =
  "font-pixel text-sm text-cloud drop-shadow-[1px_1px_0_var(--ink)] hover:text-sun";

export function SiteNav({ children }: { children?: React.ReactNode }) {
  return (
    <nav className="flex items-center justify-between px-5 py-4 sm:px-8">
      <Wordmark />
      <div className="flex items-center gap-2 sm:gap-3">
        {children}
        <Link
          href="/#make"
          className="btn-pixel order-1 flex items-center gap-1.5 rounded-full bg-sky px-4 py-2 font-pixel text-sm text-cloud"
        >
          Make one
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
        </Link>
        <AccountMenu />
      </div>
    </nav>
  );
}

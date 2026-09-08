// Shared chrome for the three policy pages, so they can't drift in look or
// navigation. Server component — these pages are static text.

import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { POLICY_LAST_UPDATED } from "@/lib/legal";

export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  /** One plain-language sentence above the fold, before the formal text. */
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-1 flex-col bg-background">
      <section className="border-b-[3px] border-ink bg-ink text-cloud">
        <SiteNav />

        <div className="mx-auto w-full max-w-3xl px-5 pb-10 pt-6 sm:px-8 sm:pb-14 sm:pt-10">
          <h1 className="font-pixel text-3xl text-cloud drop-shadow-[2px_2px_0_var(--ink)] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-cloud/80 sm:text-base">
            {intro}
          </p>
          <p className="mt-4 font-pixel text-[11px] uppercase tracking-wide text-cloud/60">
            Last updated {POLICY_LAST_UPDATED}
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        <div className="legal">{children}</div>
      </section>

      <LegalFooter />
    </main>
  );
}

export function LegalFooter() {
  return (
    <footer className="mt-auto border-t-[3px] border-ink bg-panel py-5 text-center font-pixel text-xs uppercase tracking-wide text-muted">
      <nav className="flex flex-wrap items-center justify-center gap-4">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <Link href="/pricing" className="hover:text-foreground">
          Pricing
        </Link>
        <Link href="/privacy" className="hover:text-foreground">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-foreground">
          Terms
        </Link>
        <Link href="/refund" className="hover:text-foreground">
          Refunds
        </Link>
      </nav>
    </footer>
  );
}

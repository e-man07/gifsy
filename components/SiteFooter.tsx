// The one footer every page renders. Server component.
//
// Three jobs beyond navigation: (1) give the tool pages real, keyword-anchored
// inbound links — until this existed nothing on the site linked to /create,
// /tools/gif or /tools/sticker with an <a>, so they were reachable only via the
// sitemap; (2) link the project's other public homes (GitHub, Product Hunt, the
// founders' X profiles) so the site's identity is corroborated off-site; (3)
// state where the humans are (/about) on every page.

import Link from "next/link";
import { FOUNDERS, GITHUB_URL, PRODUCT_HUNT_URL } from "@/lib/founders";

const linkCls = "hover:text-foreground";

function Column({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-display text-[11px] uppercase tracking-[0.2em] text-sky-deep">
        {heading}
      </p>
      <nav className="flex flex-col gap-1.5">{children}</nav>
    </div>
  );
}

export function SiteFooter({
  /** One plain sentence above the columns, e.g. the privacy one-liner. */
  note,
}: {
  note?: string;
}) {
  return (
    <footer className="mt-auto border-t border-foreground/10 bg-panel py-10 text-sm text-muted">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        {note && (
          <p className="mb-8 text-center font-display text-xs uppercase tracking-wide">
            {note}
          </p>
        )}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <Column heading="Make">
            <Link href="/create" className={linkCls}>
              3D photo maker
            </Link>
            <Link href="/tools/gif" className={linkCls}>
              Animate a photo into a GIF
            </Link>
            <Link href="/tools/sticker" className={linkCls}>
              Telegram sticker maker
            </Link>
            <Link href="/gallery" className={linkCls}>
              3D gallery
            </Link>
          </Column>
          <Column heading="Gifsy">
            <Link href="/pricing" className={linkCls}>
              Pricing
            </Link>
            <Link href="/about" className={linkCls}>
              About
            </Link>
            <a href={GITHUB_URL} className={linkCls} rel="me noopener" target="_blank">
              GitHub
            </a>
            <a href={PRODUCT_HUNT_URL} className={linkCls} rel="noopener" target="_blank">
              Product Hunt
            </a>
          </Column>
          <Column heading="People">
            {FOUNDERS.map((f) => (
              <a key={f.x} href={f.x} className={linkCls} rel="me noopener" target="_blank">
                {f.name} on X
              </a>
            ))}
          </Column>
          <Column heading="Legal">
            <Link href="/privacy" className={linkCls}>
              Privacy
            </Link>
            <Link href="/terms" className={linkCls}>
              Terms
            </Link>
            <Link href="/refund" className={linkCls}>
              Refunds
            </Link>
          </Column>
        </div>
        <p className="mt-8 text-xs">
          © {new Date().getFullYear()} Gifsy · operated by{" "}
          {FOUNDERS.map((f) => f.name).join(" and ")}.
        </p>
      </div>
    </footer>
  );
}

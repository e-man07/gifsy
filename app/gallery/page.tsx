import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GalleryGrid } from "@/components/GalleryGrid";
import { GALLERY_COUNT } from "@/lib/gallery";
import { SiteNav, navLinkCls } from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "3D Gallery",
  description:
    "See what Gifsy's 3D mode does to a single photo — real depth, in motion, rendered in your browser. No modeling, and your photo is never uploaded.",
  openGraph: {
    // Standalone: the "%s · Gifsy" template applies to `title`, not to og:title.
    title: "Gifsy 3D Gallery",
    description:
      "Every scene started as one still photo. Gifsy gives it real depth — in your browser.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function GalleryPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="relative isolate overflow-hidden border-b-[3px] border-ink bg-ink text-cloud">
        <div
          className="checkerboard absolute inset-0 -z-10 opacity-[0.06]"
          aria-hidden
        />

        {/* Nav — mirrors the landing chrome (cloud-on-ink) */}
        <SiteNav>
          <Link href="/#how" className={`hidden sm:block ${navLinkCls}`}>
            How it works
          </Link>
        </SiteNav>

        {/* Hero content */}
        <div className="mx-auto w-full max-w-6xl px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-16">
          <p className="font-pixel text-xs uppercase tracking-[0.2em] text-sun drop-shadow-[1px_1px_0_var(--ink)]">
            The 3D mode · in motion
          </p>
          <h1 className="mt-3 max-w-2xl font-pixel text-4xl leading-[1.08] text-cloud drop-shadow-[3px_3px_0_var(--ink)] sm:text-5xl md:text-6xl">
            One photo. <span className="text-sun">Real depth.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base font-semibold text-cloud/95 drop-shadow-[1px_1px_0_rgba(4,16,29,0.9)] sm:text-lg">
            Every one of these {GALLERY_COUNT} scenes started as a single still
            image. Gifsy&apos;s 3D mode gives it genuine depth and motion —
            locally, in seconds, with nothing uploaded. Here&apos;s how it looks.
          </p>
          <Link
            href="/#make"
            className="btn-pixel mt-6 inline-flex items-center gap-2 rounded-full bg-sun px-6 py-3 font-pixel text-base text-ink"
          >
            Make yours
            <ArrowRight className="h-5 w-5" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>
      </section>

      {/* ─────────────────────────── GALLERY ─────────────────────────── */}
      <div className="bg-background">
        <GalleryGrid />
      </div>

      {/* ─────────────────────────── CTA ─────────────────────────── */}
      <section className="border-t-[3px] border-ink bg-sky">
        <div className="mx-auto max-w-3xl px-5 py-14 text-center sm:px-8">
          <h2 className="font-pixel text-3xl text-cloud drop-shadow-[3px_3px_0_var(--ink)] sm:text-4xl">
            Your photo, in 3D.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base font-semibold text-cloud/95 drop-shadow-[1px_1px_0_rgba(4,16,29,0.9)]">
            Free to try, private, and instant. Drop a photo and watch it lift
            off the page — your photo is never uploaded. 3D needs a free
            account; GIFs and stickers don&apos;t.
          </p>
          <Link
            href="/#make"
            className="btn-pixel mt-6 inline-flex items-center gap-2 rounded-full bg-sun px-6 py-3 font-pixel text-base text-ink"
          >
            Make yours
            <ArrowRight className="h-5 w-5" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>
      </section>

      <footer className="mt-auto border-t-[3px] border-ink bg-panel py-5 text-center font-pixel text-xs uppercase tracking-wide text-muted">
        Made in your browser · your photo is never uploaded
      </footer>
    </main>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GalleryGrid } from "@/components/GalleryGrid";
import { GALLERY_COUNT } from "@/lib/gallery";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { pageMetadata } from "@/lib/seo/metadata";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata = pageMetadata({
  path: "/gallery",
  title: "3D Photo Gallery — Interactive Depth From One Photo",
  ogTitle: "Gifsy 3D Gallery",
  description:
    "See what Gifsy's 3D mode does to a single photo — real depth, in motion, rendered in your browser. Every scene started as one still image.",
});

export default function GalleryPage() {
  return (
    <main className="flex flex-1 flex-col">
      <ScrollReveal />
      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="relative isolate overflow-hidden border-b border-foreground/10 bg-panel">
        <div
          className="checkerboard absolute inset-0 -z-10 opacity-[0.06]"
          aria-hidden
        />

        {/* Nav — shared chrome, dark type on the white band */}
        <SiteNav links={[{ href: "/#how", label: "How it works" }]} />

        {/* Hero content */}
        <div className="mx-auto w-full max-w-6xl px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-16">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-sky-deep">
            The 3D mode · in motion
          </p>
          <h1 className="mt-3 max-w-2xl font-editorial text-5xl leading-[1.05] text-foreground sm:text-6xl md:text-7xl">
            One photo. <span className="text-sky-deep">Real depth.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base font-semibold text-muted sm:text-lg">
            Every one of these {GALLERY_COUNT} scenes started as a single still
            image. Gifsy&apos;s 3D mode gives it genuine depth and motion, in
            seconds, without uploading your photo. Here&apos;s how it looks.
          </p>
          <Link
            href="/"
            className="btn mt-6 inline-flex items-center gap-2 rounded-full bg-sun px-6 py-3 font-display text-base text-ink"
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
      <section className="border-t border-foreground/10 bg-panel">
        <div className="mx-auto max-w-3xl px-5 py-14 text-center sm:px-8">
          <h2 className="font-editorial text-4xl text-foreground sm:text-5xl">
            Your photo, in 3D.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base font-semibold text-muted">
            Free to try and instant. Drop a photo and watch it lift off the
            page — your photo itself isn&apos;t uploaded to make one. 3D needs a
            free account; GIFs and stickers don&apos;t.
          </p>
          <Link
            href="/"
            className="btn mt-6 inline-flex items-center gap-2 rounded-full bg-sun px-6 py-3 font-display text-base text-ink"
          >
            Make yours
            <ArrowRight className="h-5 w-5" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

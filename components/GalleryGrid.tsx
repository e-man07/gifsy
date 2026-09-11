"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Box, Pause, Play } from "lucide-react";
import {
  GALLERY,
  GALLERY_H,
  GALLERY_W,
  SHOWCASE,
  type Accent,
  type FeaturedItem,
} from "@/lib/gallery";

// A card's box is reserved up front from the known clip aspect ratio, so the
// grid never reflows as the .webm files stream in behind their posters.
const ASPECT = `${GALLERY_W} / ${GALLERY_H}`;

// Masonry wants cards of differing heights, but every clip is authored at the
// same 578×420 — so the variety has to come from the crop, not the source.
// Cycling three ratios by index gives a stagger that repeats predictably
// (reads as designed rather than random) while object-cover keeps each
// subject centred in whatever box it lands in.
const MASONRY_ASPECTS = ["4 / 3", "1 / 1", "4 / 5"] as const;
const aspectFor = (i: number) => MASONRY_ASPECTS[i % MASONRY_ASPECTS.length];

// Multi-column is what actually staggers the cards: each flows under the one
// above it in its column rather than onto a shared row baseline.
// `break-inside-avoid` stops a card being split across a column boundary.
const MASONRY = "gap-5 [column-fill:_balance] sm:columns-2 lg:columns-3";
const MASONRY_ITEM = "mb-5 break-inside-avoid";

function setSrc(v: HTMLVideoElement) {
  if (!v.src && v.dataset.src) v.src = v.dataset.src;
}

/**
 * Shared playback plumbing for both the full gallery and the landing strip.
 *
 * Clips are `preload="none"` with their real URL parked in `data-src`, so a
 * page carrying several of these downloads nothing until a card actually
 * scrolls into view — which is what makes it safe to put a strip of these
 * above the fold on the landing page.
 */
function useGalleryPlayback() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  // ids whose clip is currently playing — drives the play/pause overlay only.
  const [playing, setPlaying] = useState<Set<string>>(new Set());

  // Track the reduced-motion preference live (a viewer can toggle it mid-visit).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Autoplay clips as they scroll into view, pause them as they leave. Skipped
  // entirely under reduced motion — there, nothing loads or plays until a click.
  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    if (!root) return;
    const vids = Array.from(root.querySelectorAll<HTMLVideoElement>("video"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) {
            setSrc(v);
            void v.play().catch(() => {});
          } else {
            v.pause();
          }
        }
      },
      { rootMargin: "200px 0px", threshold: 0.25 },
    );
    vids.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, [reduced]);

  const toggle = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const v = e.currentTarget.querySelector("video");
    if (!v) return;
    setSrc(v);
    if (v.paused) void v.play().catch(() => {});
    else v.pause();
  }, []);

  const mark = useCallback((id: string, on: boolean) => {
    setPlaying((prev) => {
      if (prev.has(id) === on) return prev;
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  return { rootRef, playing, toggle, mark };
}

export function GalleryGrid() {
  const { rootRef, playing, toggle, mark } = useGalleryPlayback();

  return (
    <div ref={rootRef} className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      {GALLERY.map((cat) => (
        <section key={cat.key} className="mb-14 last:mb-0 scroll-mt-24" id={cat.key}>
          <header className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2
                className="font-display text-2xl text-ink sm:text-3xl"
                style={{ filter: `drop-shadow(3px 3px 0 var(--${cat.accent}))` }}
              >
                {cat.label}
              </h2>
              <p className="mt-1 text-sm font-semibold text-muted">{cat.blurb}</p>
            </div>
            <span className="hidden shrink-0 font-display text-xs uppercase tracking-wide text-muted sm:block">
              {cat.items.length} {cat.items.length === 1 ? "scene" : "scenes"}
            </span>
          </header>

          <div className={MASONRY}>
            {cat.items.map((it, i) => (
              <div
                key={it.id}
                className={MASONRY_ITEM}
                data-reveal
                style={{ "--reveal-delay": `${(i % 3) * 90}ms` } as CSSProperties}
              >
                <Card
                  id={it.id}
                  title={it.title}
                  accent={cat.accent}
                  aspect={aspectFor(i)}
                  playing={playing.has(it.id)}
                  onToggle={toggle}
                  onPlay={() => mark(it.id, true)}
                  onPause={() => mark(it.id, false)}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/**
 * Landing-page version: every curated clip, streaming past in two rows that
 * move opposite ways — the same "screening room" strip as CommunityShowcase,
 * so the two sections read as one visual language. Shares the playback hook
 * with the full gallery, so autoplay/lazy-load behaviour can't drift.
 */
const SHOWCASE_ROWS = [
  SHOWCASE.filter((_, i) => i % 2 === 0),
  SHOWCASE.filter((_, i) => i % 2 === 1),
];

export function GalleryStrip() {
  const { rootRef, playing, toggle, mark } = useGalleryPlayback();

  // One half of a row's track. The list is rendered twice and the CSS
  // translates the track by -50%, so the copy arrives exactly where the first
  // began and the strip never visibly restarts.
  const half = (items: FeaturedItem[], clone: boolean) => (
    <div className="flex gap-5 pr-5" aria-hidden={clone || undefined}>
      {items.map((it) => (
        <ScreenCard
          key={`${clone ? "clone-" : ""}${it.id}`}
          id={it.id}
          title={it.title}
          playing={playing.has(it.id)}
          onToggle={toggle}
          onPlay={() => mark(it.id, true)}
          onPause={() => mark(it.id, false)}
        />
      ))}
    </div>
  );

  // The clones are inside rootRef too, so the playback hook loads and plays
  // whichever copy is actually on screen — the video elements in the copy
  // that's off-screen never fetch anything (preload=none + data-src).
  return (
    <div ref={rootRef} className="space-y-5">
      {SHOWCASE_ROWS.map((items, r) => (
        <div
          key={r}
          className="marquee overflow-hidden motion-reduce:overflow-x-auto"
          style={{ "--marquee-duration": r === 0 ? "170s" : "150s" } as CSSProperties}
        >
          <div className={`marquee-track flex w-max${r === 0 ? " marquee-track-reverse" : ""}`}>
            {half(items, false)}
            {/* Hidden under reduced motion: with no animation the copy is just
                duplicate cards in a scroller. */}
            <div className="flex motion-reduce:hidden">{half(items, true)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * A clip in the CommunityShowcase's "screening room" box: a dark elevated
 * stage with a vignette, a letterbox bar, corner marks and a caption sitting
 * on the bar. The bar is drawn over the video regardless of what it's
 * showing, so the caption always has a guaranteed-dark strip under it even
 * before the poster paints.
 */
function ScreenCard({
  id,
  title,
  playing,
  onToggle,
  onPlay,
  onPause,
}: {
  id: string;
  title: string;
  playing: boolean;
  onToggle: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onPlay: () => void;
  onPause: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`${playing ? "Pause" : "Play"} ${title} — 3D preview`}
      className="relative block h-[320px] w-[240px] shrink-0 overflow-hidden rounded-xl bg-black text-left shadow-[0_20px_45px_rgba(14,36,56,0.25)] ring-1 ring-inset ring-white/10 sm:h-[380px] sm:w-[300px]"
    >
      <video
        data-src={`/gallery/${id}.webm`}
        poster={`/gallery/${id}.jpg`}
        muted
        loop
        playsInline
        preload="none"
        onPlay={onPlay}
        onPause={onPause}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Vignette: darkens the corners so the frame reads as a stage the
          subject sits inside, not a flat rectangle. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.45)_100%)]"
      />

      {/* Letterbox bar — see comment above for why this is load-bearing. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/90 to-transparent"
      />

      <span
        aria-hidden
        className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-white/50"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-white/50"
      />

      {/* play affordance — only while the clip is stopped (reduced motion, or
          a click paused it), so a running card is nothing but the scene */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity ${
          playing ? "opacity-0" : "opacity-100"
        }`}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white ring-1 ring-white/50 backdrop-blur-sm">
          <Play className="ml-0.5 h-4 w-4 fill-white" strokeWidth={2} aria-hidden />
        </span>
      </span>

      <span
        aria-hidden
        className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-[8px] uppercase tracking-[0.25em] text-white/80 sm:text-[9px]"
      >
        {title}
      </span>
    </button>
  );
}

function Card({
  id,
  title,
  accent,
  aspect = ASPECT,
  playing,
  onToggle,
  onPlay,
  onPause,
}: {
  id: string;
  title: string;
  accent: Accent;
  /** Crop for this card's box. Defaults to the clip's own ratio; the masonry
   *  layouts pass a cycled one to vary card heights. */
  aspect?: string;
  playing: boolean;
  onToggle: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onPlay: () => void;
  onPause: () => void;
}) {
  return (
    <figure className="card group flex flex-col overflow-hidden rounded-xl bg-cloud transition-transform hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none">
      <button
        type="button"
        onClick={onToggle}
        aria-label={`${playing ? "Pause" : "Play"} ${title} — 3D preview`}
        className="relative block w-full border-b border-foreground/10 bg-ink"
        style={{ aspectRatio: aspect }}
      >
        <video
          data-src={`/gallery/${id}.webm`}
          poster={`/gallery/${id}.jpg`}
          muted
          loop
          playsInline
          preload="none"
          onPlay={onPlay}
          onPause={onPause}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* corner badge: signals these are 3D scenes */}
        <span
          className="absolute left-2 top-2 flex items-center gap-1 rounded px-1.5 py-0.5 font-display text-[10px] uppercase leading-none text-ink shadow-[0_1px_4px_rgba(14,36,56,0.25)]"
          style={{ backgroundColor: `var(--${accent})` }}
        >
          <Box className="h-3 w-3" strokeWidth={2.5} aria-hidden />
          3D
        </span>

        {/* play/pause affordance — fades out while the clip is running */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity ${
            playing ? "opacity-0" : "opacity-100"
          }`}
        >
          <span className="card-sm flex h-12 w-12 items-center justify-center rounded-full bg-cloud/95 text-ink">
            {playing ? (
              <Pause className="h-5 w-5 fill-ink" strokeWidth={2} aria-hidden />
            ) : (
              <Play className="ml-0.5 h-5 w-5 fill-ink" strokeWidth={2} aria-hidden />
            )}
          </span>
        </span>
      </button>

      <figcaption className="px-3 py-2 font-display text-sm text-ink">{title}</figcaption>
    </figure>
  );
}

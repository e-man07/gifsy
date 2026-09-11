"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Box, Pause, Play } from "lucide-react";
import {
  FEATURED,
  GALLERY,
  GALLERY_H,
  GALLERY_W,
  type Accent,
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
 * Compact, flat version for the landing page: six curated clips, no category
 * headers. Shares Card and the playback hook with the full gallery, so the
 * two can't drift in look or behaviour.
 */
export function GalleryStrip() {
  const { rootRef, playing, toggle, mark } = useGalleryPlayback();

  const card = (id: string, title: string, accent: Accent, aspect?: string) => (
    <Card
      id={id}
      title={title}
      accent={accent}
      aspect={aspect}
      playing={playing.has(id)}
      onToggle={toggle}
      onPlay={() => mark(id, true)}
      onPause={() => mark(id, false)}
    />
  );

  // One half of the marquee. The list is rendered twice and the CSS translates
  // the track by -50%, so the copy arrives exactly where the first began and
  // the strip never visibly restarts.
  const half = (clone: boolean) => (
    <div className="flex gap-5 pr-5" aria-hidden={clone || undefined}>
      {FEATURED.map((it) => (
        <div key={`${clone ? "clone-" : ""}${it.id}`} className="w-[260px] shrink-0">
          {card(it.id, it.title, it.accent)}
        </div>
      ))}
    </div>
  );

  // Both layouts live in the DOM and CSS picks one. The extra <video> elements
  // in the hidden layout cost nothing: they are display:none, so they never
  // intersect the viewport, and the playback hook only ever loads (preload=none
  // + data-src) and plays what is actually on screen.
  return (
    <div ref={rootRef}>
      {/* Phones: a single continuously scrolling row. Stacking six of these
          full-width turned the section into six screens of scrolling.
          motion-reduce stops the animation (globals.css) and turns this into an
          ordinary swipeable scroller so the clips stay reachable. */}
      <div className="marquee overflow-hidden motion-reduce:overflow-x-auto sm:hidden">
        <div className="marquee-track flex w-max">
          {half(false)}
          {/* Hidden under reduced motion: with no animation the copy is just
              duplicate cards in a scroller. */}
          <div className="flex motion-reduce:hidden">{half(true)}</div>
        </div>
      </div>

      {/* Tablet and up: a masonry of the same six — there is room for it, and a
          moving strip is a worse way to browse when six cards already fit. */}
      <div className={`hidden sm:block ${MASONRY}`}>
        {FEATURED.map((it, i) => (
          <div
            key={it.id}
            className={MASONRY_ITEM}
            data-reveal
            style={{ "--reveal-delay": `${(i % 3) * 90}ms` } as CSSProperties}
          >
            {card(it.id, it.title, it.accent, aspectFor(i))}
          </div>
        ))}
      </div>
    </div>
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

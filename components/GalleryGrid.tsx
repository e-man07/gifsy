"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Pause, Play } from "lucide-react";
import { GALLERY, GALLERY_H, GALLERY_W, type Accent } from "@/lib/gallery";

// A card's box is reserved up front from the known clip aspect ratio, so the
// masonry never reflows as the .webm files stream in behind their posters.
const ASPECT = `${GALLERY_W} / ${GALLERY_H}`;

function setSrc(v: HTMLVideoElement) {
  if (!v.src && v.dataset.src) v.src = v.dataset.src;
}

export function GalleryGrid() {
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

  return (
    <div ref={rootRef} className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      {GALLERY.map((cat) => (
        <section key={cat.key} className="mb-14 last:mb-0 scroll-mt-24" id={cat.key}>
          <header className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2
                className="font-pixel text-2xl text-ink sm:text-3xl"
                style={{ filter: `drop-shadow(3px 3px 0 var(--${cat.accent}))` }}
              >
                {cat.label}
              </h2>
              <p className="mt-1 text-sm font-semibold text-muted">{cat.blurb}</p>
            </div>
            <span className="hidden shrink-0 font-pixel text-xs uppercase tracking-wide text-muted sm:block">
              {cat.items.length} {cat.items.length === 1 ? "scene" : "scenes"}
            </span>
          </header>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cat.items.map((it) => (
              <Card
                key={it.id}
                id={it.id}
                title={it.title}
                accent={cat.accent}
                playing={playing.has(it.id)}
                onToggle={toggle}
                onPlay={() => mark(it.id, true)}
                onPause={() => mark(it.id, false)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Card({
  id,
  title,
  accent,
  playing,
  onToggle,
  onPlay,
  onPause,
}: {
  id: string;
  title: string;
  accent: Accent;
  playing: boolean;
  onToggle: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onPlay: () => void;
  onPause: () => void;
}) {
  return (
    <figure className="hud group flex flex-col overflow-hidden rounded-xl bg-cloud transition-transform hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none">
      <button
        type="button"
        onClick={onToggle}
        aria-label={`${playing ? "Pause" : "Play"} ${title} — 3D preview`}
        className="relative block w-full border-b-[3px] border-ink bg-ink"
        style={{ aspectRatio: ASPECT }}
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
          className="absolute left-2 top-2 flex items-center gap-1 border-2 border-ink px-1.5 py-0.5 font-pixel text-[10px] uppercase leading-none text-ink"
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
          <span className="hud-sm flex h-12 w-12 items-center justify-center rounded-full bg-cloud/95 text-ink">
            {playing ? (
              <Pause className="h-5 w-5 fill-ink" strokeWidth={2} aria-hidden />
            ) : (
              <Play className="ml-0.5 h-5 w-5 fill-ink" strokeWidth={2} aria-hidden />
            )}
          </span>
        </span>
      </button>

      <figcaption className="px-3 py-2 font-pixel text-sm text-ink">{title}</figcaption>
    </figure>
  );
}

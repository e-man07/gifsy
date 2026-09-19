"use client";

// Scroll-pinned text fill for the homepage definition.
//
// The section sticks to the viewport while the visitor scrolls through a
// track taller than the screen; that scroll distance is mapped to a 0→1
// progress and each word fades from grey to the foreground colour in reading
// order, so the paragraph "inks in" left to right, line by line. Only once
// every word is black does the page carry on past it.
//
// The words are rendered on the server too (this is a client component, not
// a client-only one), so crawlers and the search snippet see the plain
// sentence in the HTML. Under prefers-reduced-motion the pin is dropped and
// the text is simply shown in full.

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

// How many words are mid-fade at once. Higher reads as a softer sweep.
const SPREAD = 4;
// Grey the words start at, as a share of the foreground colour.
const REST_ALPHA = 22;

type Props = {
  text: string;
  className?: string;
  /** Rendered beside the paragraph inside the pinned frame. */
  aside?: ReactNode;
};

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

export function ScrollFillText({ text, className, aside }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = track.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      if (distance <= 0) {
        setProgress(1);
        return;
      }
      const p = Math.min(1, Math.max(0, -rect.top / distance));
      setProgress(p);
    };
    const schedule = () => {
      if (raf === 0) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const words = text.split(/\s+/).filter(Boolean);
  const head = progress * (words.length + SPREAD);
  // The caret sits after the last word that is at least half inked, so it
  // rides the grey/black edge; -1 parks it before the first word.
  const caretAfter = reduced
    ? words.length - 1
    : Math.min(words.length - 1, Math.floor(head - SPREAD / 2));
  const caret = <span className="scroll-fill-caret" aria-hidden />;

  const paragraph = (
    <p className={className} aria-label={text}>
      {caretAfter < 0 ? caret : null}
      {words.map((word, i) => {
        const t = reduced ? 1 : Math.min(1, Math.max(0, (head - i) / SPREAD));
        const alpha = REST_ALPHA + (100 - REST_ALPHA) * t;
        return (
          <span
            key={i}
            aria-hidden
            style={{
              color: `color-mix(in srgb, var(--foreground) ${alpha.toFixed(1)}%, transparent)`,
            }}
          >
            {word}
            {i === caretAfter ? caret : null}
            {i < words.length - 1 ? " " : null}
          </span>
        );
      })}
    </p>
  );

  const frame = (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
      <div>{paragraph}</div>
      {aside}
    </div>
  );

  if (reduced) {
    return <div className="py-14 sm:py-20">{frame}</div>;
  }

  return (
    // Track = one viewport of pinned reading plus one viewport of scroll to
    // drive the fill. The inner frame sticks for the whole of it.
    <div ref={trackRef} className="relative" style={{ height: "200vh" }}>
      <div className="sticky top-0 flex h-screen items-center">
        <div className="w-full">{frame}</div>
      </div>
    </div>
  );
}

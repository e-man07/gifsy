"use client";

// "What leaves your browser", dealt like a hand of cards.
//
// The section pins to the viewport while the visitor scrolls through a track
// taller than the screen. That scroll distance drives a 0→1 progress:
//
//   0.00–0.25  the stack settles: the middle card scales up to full size
//   0.25–0.60  the first card slides out from behind it to the left
//   0.50–0.85  the third card slides out to the right
//
// Nothing fades. The stack is fully drawn from the first frame — the two
// outer cards peek out behind the middle one — so the pinned viewport is
// never empty while the visitor waits for the deal.
//
// Only once every card has been dealt does the page carry on past the
// section. On small screens, and under prefers-reduced-motion, the pin is
// dropped and the cards are simply laid out — the copy is server-rendered
// either way, so crawlers see the full text.
//
// The pinned and the flat layouts share one DOM: the track height and the
// sticky frame are breakpoint classes, not a JS branch. The server used to
// assume desktop and render the 260vh track, so on a phone hydration swapped
// it for the flat layout and everything below the section jumped — a CLS of
// 1.0 on mobile. Now the server can't get the layout wrong; only the card
// transforms wait for the client, and transforms don't shift layout.
//
// Card positions are expressed as percentages of the card's own width, so
// the deal works at any column width without measuring.

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Laptop, Server, X } from "lucide-react";

export type DealCard = {
  title: string;
  /** What leaves the browser. */
  out: string;
  note: string;
  /** True when something is actually sent to the server. */
  sends: boolean;
};

type Props = {
  cards: DealCard[];
  heading: ReactNode;
  footer: ReactNode;
};

const REDUCED = "(prefers-reduced-motion: reduce)";
const DESKTOP = "(min-width: 768px)";

function useMedia(query: string, serverValue: boolean) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
/** Progress of `p` through the window [a, b], eased. */
const phase = (p: number, a: number, b: number) => easeOut(clamp01((p - a) / (b - a)));

export function DealCards({ cards, heading, footer }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const reduced = useMedia(REDUCED, false);
  // Server value false: the HTML ships the cards dealt out, and the client
  // tucks them in once it knows it is a desktop. The other way round, a
  // phone would paint the three cards flung off to the sides until
  // hydration.
  const desktop = useMedia(DESKTOP, false);
  const animate = desktop && !reduced;

  useEffect(() => {
    if (!animate) return;
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = track.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      setProgress(distance <= 0 ? 1 : clamp01(-rect.top / distance));
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
  }, [animate]);

  const p = animate ? progress : 1;
  const rise = phase(p, 0, 0.25);
  const dealLeft = phase(p, 0.25, 0.6);
  const dealRight = phase(p, 0.5, 0.85);

  // Per-card transform. Index 1 is the anchor in the middle column; 0 and 2
  // start tucked behind it (one column over, in their own coordinate space)
  // and slide home. `--gap` is the grid gap so the offset lands exactly.
  const styleFor = (i: number): React.CSSProperties => {
    if (!animate) return {};
    if (i === 1) {
      return {
        transform: `translateY(${((1 - rise) * 16).toFixed(1)}px) scale(${(0.94 + rise * 0.06).toFixed(3)})`,
        zIndex: 2,
      };
    }
    const t = i === 0 ? dealLeft : dealRight;
    const dir = i === 0 ? 1 : -1; // which way the card has to travel to reach the middle
    const tucked = 1 - t;
    return {
      transform: [
        `translateX(calc(${(dir * tucked * 100).toFixed(2)}% + ${(dir * tucked).toFixed(3)} * var(--gap)))`,
        `translateY(${(tucked * 14).toFixed(1)}px)`,
        `rotate(${(-dir * tucked * 7).toFixed(2)}deg)`,
        `scale(${(0.94 + t * 0.06).toFixed(3)})`,
      ].join(" "),
      zIndex: 1,
    };
  };

  const frame = (
    <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
      {heading}
      <div className="mt-8 grid gap-4 md:grid-cols-3 [--gap:1rem]">
        {cards.map((c, i) => (
          <div
            key={c.title}
            className="deal-card card relative flex flex-col rounded-2xl bg-panel p-6 will-change-transform"
            style={styleFor(i)}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-base text-foreground">{c.title}</h3>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  c.sends ? "bg-sky/10 text-sky-deep" : "bg-grass/15 text-grass-deep"
                }`}
              >
                {c.sends ? "Partial" : "Local"}
              </span>
            </div>

            {/* Device → server flow. The wire is dashed and animates when data
                actually travels; otherwise it is cut with a small cross. */}
            <div className="mt-5 flex items-center gap-2 text-muted" aria-hidden>
              <span className="deal-node flex h-9 w-9 items-center justify-center rounded-xl bg-foreground/[0.06] text-foreground">
                <Laptop className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="relative flex h-px flex-1 items-center">
                {c.sends ? (
                  // The live wire is one dash-period wider than its box and
                  // slides left by that period, so the dashes appear to
                  // flow. A transform keeps it on the compositor; animating
                  // background-position repaints every frame.
                  <span className="absolute inset-0 overflow-hidden">
                    <span className="deal-wire deal-wire-live absolute inset-y-0 left-0 w-[calc(100%+12px)]" />
                  </span>
                ) : (
                  <span className="deal-wire absolute inset-0" />
                )}
                {!c.sends && (
                  <span className="deal-cut relative z-10 mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-panel text-petal ring-1 ring-foreground/10">
                    <X className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
              </span>
              <span
                className={`deal-node flex h-9 w-9 items-center justify-center rounded-xl ${
                  c.sends ? "bg-sky/10 text-sky-deep" : "bg-foreground/[0.04] text-muted/60"
                }`}
              >
                <Server className="h-4 w-4" strokeWidth={1.75} />
              </span>
            </div>

            <p className="mt-5 text-xs text-muted">Leaves the browser</p>
            <p className={`font-display text-lg ${c.sends ? "text-foreground" : "text-grass-deep"}`}>{c.out}</p>
            <p className="mt-3 text-sm text-muted">{c.note}</p>
          </div>
        ))}
      </div>
      <div className="mt-6">{footer}</div>
    </div>
  );

  return (
    // Track = one viewport pinned plus 1.6 viewports of scroll to deal the
    // cards. The page can't move past the section until the deal is done.
    // Below md, and under reduced motion, the same elements are just a
    // padded block — see the note at the top of the file.
    <div ref={trackRef} className="relative md:motion-safe:h-[260vh]">
      <div className="py-14 sm:py-20 md:motion-safe:sticky md:motion-safe:top-0 md:motion-safe:flex md:motion-safe:h-screen md:motion-safe:items-center md:motion-safe:overflow-hidden md:motion-safe:py-0">
        {frame}
      </div>
    </div>
  );
}

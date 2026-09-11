"use client";

import { useEffect, useState } from "react";

// Live embeds of scenes people actually published, streaming past in two
// rows moving opposite directions — proof the product works on more than our
// own curated shots. Each row holds the same five embeds repeated (there
// aren't more yet) at a different offset so the two rows don't mirror each
// other, then doubled so the CSS -50% translate loops seamlessly.
const EMBED_IDS = [
  "ae14f65c7f",
  "0f0fbe28ea",
  "326d47ec42",
  "22ea7b1548",
  "0fce93464c",
];

const ROW_LENGTH = 8;

// All ~32 cards mount at once on page load, and each independently fetches
// its scene's assets from the same handful of Blob-storage URLs — a burst of
// near-simultaneous requests to one host that Vercel's firewall reads as an
// attack pattern, serving an HTML challenge page instead of the image (shows
// up as a broken-image icon on roughly whichever half loses the race).
// Staggering when each iframe's `src` gets set spreads that burst out so it
// never crosses the threshold.
const MOUNT_STAGGER_MS = 120;

function fillRow(offset: number) {
  return Array.from(
    { length: ROW_LENGTH },
    (_, i) => EMBED_IDS[(i + offset) % EMBED_IDS.length],
  );
}

function Embed({ id, mountDelay }: { id: string; mountDelay: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), mountDelay);
    return () => clearTimeout(timer);
  }, [mountDelay]);

  return (
    // A scaled-down "screening room" box, same family as the big EMBEDDED
    // SCENE section further down the page: a dark elevated stage rather than
    // a flat bordered card, with a letterbox bar guaranteeing a dark strip
    // for the caption to sit on. That last part matters beyond looks — a
    // card whose iframe hasn't rendered yet (or failed to) shows the
    // browser's plain white document, and light text/marks drawn straight
    // on top of that were unreadable. The letterbox bar is ours, drawn over
    // the iframe regardless of what it's showing, so the caption always has
    // a guaranteed-dark strip under it.
    <div className="relative w-[240px] shrink-0 overflow-hidden rounded-xl bg-black shadow-[0_20px_45px_rgba(14,36,56,0.25)] ring-1 ring-inset ring-white/10 sm:w-[300px]">
      {mounted && (
        <iframe
          src={`https://www.gifsy.fun/embed/${id}`}
          title={`Community scene ${id}`}
          loading="lazy"
          className="block h-[320px] w-full border-0 bg-black sm:h-[380px]"
        />
      )}

      {/* Vignette: darkens the corners so the frame reads as a stage the
          subject sits inside, not a flat rectangle. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.45)_100%)]"
      />

      {/* Letterbox bar — see comment above for why this is load-bearing, not
          just decorative. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/90 to-transparent"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-white/50"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-white/50"
      />
      <p
        aria-hidden
        className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 font-display text-[8px] uppercase tracking-[0.25em] text-white/80 sm:text-[9px]"
      >
        Drag to explore
      </p>
    </div>
  );
}

function Row({
  ids,
  reverse,
  duration,
  startIndex,
}: {
  ids: string[];
  reverse?: boolean;
  duration: string;
  startIndex: number;
}) {
  const half = (clone: boolean) => (
    <div className="flex gap-5 pr-5" aria-hidden={clone || undefined}>
      {ids.map((id, i) => (
        <Embed
          key={`${clone ? "clone-" : ""}${id}-${i}`}
          id={id}
          mountDelay={(startIndex + i) * MOUNT_STAGGER_MS}
        />
      ))}
    </div>
  );

  return (
    <div
      className="marquee overflow-hidden motion-reduce:overflow-x-auto"
      style={{ "--marquee-duration": duration } as React.CSSProperties}
    >
      <div
        className={`marquee-track flex w-max${reverse ? " marquee-track-reverse" : ""}`}
      >
        {half(false)}
        {/* Hidden under reduced motion: with no animation the copy is just
            duplicate cards in a scroller. */}
        <div className="flex motion-reduce:hidden">{half(true)}</div>
      </div>
    </div>
  );
}

export function CommunityShowcase() {
  return (
    <div className="space-y-5">
      <Row ids={fillRow(0)} reverse duration="200s" startIndex={0} />
      <Row ids={fillRow(2)} duration="180s" startIndex={ROW_LENGTH} />
    </div>
  );
}

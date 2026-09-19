"use client";

import { useEffect, useState } from "react";

// Four scenes, four jobs — lets a visitor find themselves before reading a
// pitch. Each card is a real published embed, not a mockup — and unlike the
// community marquee (which plays recordings), these stay LIVE on purpose:
// four cards is few enough to keep interactive, and a visitor should be able
// to grab one and spin it before reading a pitch about what it's for.
//
// One subject per niche, cut out on transparency (subjectOnly) so the card
// reads as an object you can grab: a red director's chair for the agency hero, a mosaic
// sculpture for portfolios, a floating sneaker for products, a portrait for
// creators. Sources are Unsplash-licensed photos, baked with the same models
// the app runs (scripts/make-demo-assets.py) and published to R2.
//
// Staggered mount: even 4 cards loading at once fire ~20 near-simultaneous
// requests at storage (4 scenes x ~5 assets each), which was enough in
// practice to trip Vercel's firewall challenge and show broken/white cards.
// `loading="lazy"` alone wasn't enough here since all 4 enter the viewport
// together. Now that the ~32-card marquee above no longer embeds live, these
// four plus the cinema embed are the only viewers on the page, which keeps
// the burst well under that threshold.
const PERSONAS = [
  {
    id: "d556cd5c57",
    eyebrow: "Webflow & Framer builders",
    pitch: "A client hero that moves, without hiring a WebGL developer.",
    detail: "Paste an Embed element and ship. Commercial use on client sites comes with Pro.",
  },
  {
    id: "1edb4523e4",
    eyebrow: "Portfolio creators",
    pitch: "One self-portrait or key project shot that responds to the visitor.",
    detail: "Stays interactive on a phone — a finger drag does what the mouse does.",
  },
  {
    id: "8a68552608",
    eyebrow: "Product pages",
    pitch: "A flagship shot with real depth, not a flat product photo.",
    detail: "One angle with parallax, not a 360° turntable — pick a shot where the product stands clear of its background.",
  },
  {
    id: "f4c3e9bef8",
    eyebrow: "Creators & streamers",
    pitch: "A bio page that feels alive, not static.",
    detail: "Capture the same scene as a looping GIF or WebM for socials.",
  },
];

const MOUNT_STAGGER_MS = 350;

function PersonaCard({
  id,
  eyebrow,
  pitch,
  detail,
  mountDelay,
}: {
  id: string;
  eyebrow: string;
  pitch: string;
  detail: string;
  mountDelay: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), mountDelay);
    return () => clearTimeout(timer);
  }, [mountDelay]);

  return (
    <div className="flex flex-col gap-3">
      {/* Same "screening room" box as the community marquee's cards, for one
          consistent visual language across the site. */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-black shadow-[0_20px_45px_rgba(14,36,56,0.25)] ring-1 ring-inset ring-white/10">
        {/* Same-origin rather than www.gifsy.fun, so the cards work on
            localhost and preview deployments too. */}
        {mounted && (
          <iframe
            src={`/embed/${id}`}
            title={eyebrow}
            loading="lazy"
            className="block h-full w-full border-0 bg-black"
          />
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.45)_100%)]"
        />
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
          className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 font-display text-[9px] uppercase tracking-[0.25em] text-white/80"
        >
          Drag to explore
        </p>
      </div>
      <div>
        <h3 className="font-display text-sm text-foreground">{eyebrow}</h3>
        <p className="mt-1 text-sm text-muted">{pitch}</p>
        <p className="mt-1.5 text-xs text-muted/80">{detail}</p>
      </div>
    </div>
  );
}

export function PersonaShowcase() {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {PERSONAS.map((p, i) => (
        <PersonaCard key={p.id} {...p} mountDelay={i * MOUNT_STAGGER_MS} />
      ))}
    </div>
  );
}

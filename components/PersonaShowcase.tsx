// Four scenes, four jobs — lets a visitor find themselves before reading a
// pitch. Each card is a recording of a real published scene (same set-up as
// the community marquee), not a mockup.
//
// Recordings rather than live embeds for the reason spelled out in
// CommunityShowcase: even 4 iframes loading at once fired ~20 simultaneous
// requests at Blob storage, enough to trip Vercel's firewall challenge and
// show broken/white cards. Clips live at /public/showcase/<id>.{mp4,jpg},
// captured at 600×800 (2× the card, 3:4) with
// `SIZE=600x800 node scripts/capture-showcase.mjs <ids>`.
const PERSONAS = [
  {
    id: "edb9be6b58",
    eyebrow: "Web agencies & Webflow/Framer builders",
    pitch: "A scroll-stopping hero without hiring a WebGL developer.",
  },
  {
    id: "d6d28b0238",
    eyebrow: "Portfolio creators",
    pitch: "Give your best piece the presentation it deserves.",
  },
  {
    id: "24d12531b7",
    eyebrow: "Solo brands & products",
    pitch: "One flagship shot with real depth — not a flat product photo.",
  },
  {
    id: "97d7eff307",
    eyebrow: "Personal brands & creators",
    pitch: "A bio page that feels alive, not static.",
  },
];

function PersonaCard({
  id,
  eyebrow,
  pitch,
}: {
  id: string;
  eyebrow: string;
  pitch: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Same "screening room" box as the community marquee's cards, for one
          consistent visual language across the site. */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-black shadow-[0_20px_45px_rgba(14,36,56,0.25)] ring-1 ring-inset ring-white/10">
        <video
          src={`/showcase/${id}.mp4`}
          poster={`/showcase/${id}.jpg`}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={eyebrow}
          className="block h-full w-full bg-black object-cover"
        />
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
          3D · Made with Gifsy
        </p>
      </div>
      <div>
        <p className="font-display text-xs uppercase tracking-[0.15em] text-sky-deep">
          {eyebrow}
        </p>
        <p className="mt-1 text-sm text-muted">{pitch}</p>
      </div>
    </div>
  );
}

export function PersonaShowcase() {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {PERSONAS.map((p) => (
        <PersonaCard key={p.id} {...p} />
      ))}
    </div>
  );
}

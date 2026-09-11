"use client";

// Recordings of scenes people actually published, streaming past in two
// rows moving opposite directions — proof the product works on more than our
// own curated shots. Each row holds the same five clips repeated (there
// aren't more yet) at a different offset so the two rows don't mirror each
// other, then doubled so the CSS -50% translate loops seamlessly.
//
// These are pre-rendered clips, not live <iframe> embeds of gifsy.fun. The
// live version mounted ~32 WebGL viewers on page load, each fetching its
// assets from Blob storage — a burst Vercel's firewall reads as an attack,
// so it served a challenge page instead of the image and roughly half the
// cards came up as a broken-image icon (staggering the mounts only lowered
// the odds). A local clip can't fail that way, costs no WebGL, and the
// browser downloads each of the five files once for all of its copies.
//
// Each clip under /public/showcase/<id>.mp4 is the embed's own auto-orbit
// self-demo, captured off the canvas at 600×760 (2× the card) and played
// forward then backward so the loop point is invisible. <id>.jpg is its
// first frame, painted immediately so the card never shows a blank box.
// Re-record with scripts/capture-showcase.mjs when the set changes.
const CLIP_IDS = [
  "ae14f65c7f",
  "0f0fbe28ea",
  "326d47ec42",
  "22ea7b1548",
  "0fce93464c",
];

const ROW_LENGTH = 8;

function fillRow(offset: number) {
  return Array.from(
    { length: ROW_LENGTH },
    (_, i) => CLIP_IDS[(i + offset) % CLIP_IDS.length],
  );
}

function Clip({ id }: { id: string }) {
  return (
    // A scaled-down "screening room" box, same family as the big EMBEDDED
    // SCENE section further down the page: a dark elevated stage rather than
    // a flat bordered card, with a letterbox bar guaranteeing a dark strip
    // for the caption to sit on. The poster paints before the clip has a
    // frame, so there is never a white document showing through, but the
    // bar still earns its place: it keeps the caption legible over whatever
    // the clip's bottom edge happens to be.
    <div className="relative w-[240px] shrink-0 overflow-hidden rounded-xl bg-black shadow-[0_20px_45px_rgba(14,36,56,0.25)] ring-1 ring-inset ring-white/10 sm:w-[300px]">
      <video
        src={`/showcase/${id}.mp4`}
        poster={`/showcase/${id}.jpg`}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={`Community scene ${id}`}
        className="block h-[320px] w-full bg-black object-cover sm:h-[380px]"
      />

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
        3D · Made with Gifsy
      </p>
    </div>
  );
}

function Row({
  ids,
  reverse,
  duration,
}: {
  ids: string[];
  reverse?: boolean;
  duration: string;
}) {
  const half = (clone: boolean) => (
    <div className="flex gap-5 pr-5" aria-hidden={clone || undefined}>
      {ids.map((id, i) => (
        <Clip key={`${clone ? "clone-" : ""}${id}-${i}`} id={id} />
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
      <Row ids={fillRow(0)} reverse duration="200s" />
      <Row ids={fillRow(2)} duration="180s" />
    </div>
  );
}

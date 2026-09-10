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

function fillRow(offset: number) {
  return Array.from(
    { length: ROW_LENGTH },
    (_, i) => EMBED_IDS[(i + offset) % EMBED_IDS.length],
  );
}

function Embed({ id }: { id: string }) {
  return (
    <div className="card w-[240px] shrink-0 overflow-hidden rounded-xl bg-black sm:w-[300px]">
      <iframe
        src={`https://www.gifsy.fun/embed/${id}`}
        title={`Community scene ${id}`}
        loading="lazy"
        className="block h-[320px] w-full border-0 bg-black sm:h-[380px]"
      />
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
        <Embed key={`${clone ? "clone-" : ""}${id}-${i}`} id={id} />
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
      <Row ids={fillRow(0)} reverse duration="130s" />
      <Row ids={fillRow(2)} duration="115s" />
    </div>
  );
}

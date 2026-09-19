// The "Now showing" screening-room stage: the live embed with lightning,
// grain and letterboxing over it. Pure markup (no hooks), moved out of the
// landing page so that file can stay readable. Every overlay is
// pointer-events-none — the scene itself has to stay draggable.
//
// The iframe is mounted on intersection (LazyIframe) rather than at page
// load: same-origin, it would otherwise boot the WebGL viewer on this
// page's main thread while the hero is still painting.

import { LazyIframe } from "./LazyIframe";

// Lightning geometry for the cinema section, in a 1000x500 viewBox scaled
// with "slice" so nothing is stretched — the centre of the box stays the
// centre of the frame, which is where both bolts land: (500, 250), on the
// subject. They enter from above rather than side-on; a bolt that travels
// horizontally in a straight-ish line reads as a laser, not weather. Many
// short segments with alternating overshoot is what makes it look struck.
const BOLT_LEFT =
  "M120 -30 L168 62 L138 88 L214 150 L182 168 L262 214 L236 230 L318 250 L300 264 L392 256 L376 268 L470 252 L500 250";
const BOLT_LEFT_FORKS =
  "M214 150 L160 198 M318 250 L296 322 M392 256 L436 208";
const BOLT_RIGHT =
  "M880 -30 L836 70 L866 96 L790 152 L822 172 L742 216 L768 232 L688 252 L706 266 L614 258 L630 270 L534 254 L500 250";
const BOLT_RIGHT_FORKS =
  "M790 152 L844 202 M688 252 L710 324 M614 258 L572 212";


export function CinemaEmbed() {
  return (
    <>
    {/* Held to a 5xl stage rather than run edge to edge: the embed keeps
        the subject centred at its own scale, so every extra pixel of
        width is just more empty black either side of him. */}
    <div className="relative mx-auto w-full max-w-5xl px-4 sm:px-8">
      {/* Elevation, not glow: the old blue bloom only read as light
          because the room behind it was near-black. */}
      <div className="relative z-10 h-[52vh] min-h-[320px] w-full overflow-hidden rounded-xl border border-foreground/10 bg-black sm:h-[clamp(420px,68vh,760px)] shadow-[0_24px_60px_rgba(14,36,56,0.28)]">
        {/* Oversized on purpose. The embed sizes its subject to its own
            viewport, and cross-origin we cannot zoom it — so we give the
            iframe a box a bit over twice the size of the window it shows
            through and centre it. The cut-out lands correspondingly
            bigger; all that gets cropped is black margin. On a phone the
            frame is already narrow enough to fill, so it stays 1:1 —
            zooming there pushes him off both edges. */}
        <LazyIframe
          src="https://www.gifsy.fun/embed/03ed4c7605"
          title="A 3D scene made with Gifsy"
          className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 sm:h-[210%] sm:w-[210%]"
        />

        {/* ── Lightning ─────────────────────────────────────────────
            Both bolts terminate on the subject at the centre of the
            viewBox, so the strike reads as hitting him rather than
            flickering off in the wings. Fitted, not cropped, so a narrow
            phone frame still shows both bolts whole instead of just the
            last few centimetres of each. Stroke widths are non-scaling,
            so the bolt stays hairline at any frame size. */}
        <svg
          aria-hidden
          viewBox="0 0 1000 500"
          preserveAspectRatio="xMidYMid meet"
          className="bolt pointer-events-none absolute inset-0 z-30 h-full w-full"
          style={{ ["--bolt-cycle" as string]: "8s" }}
        >
          <g
            fill="none"
            stroke="#eaf6ff"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={BOLT_LEFT} strokeWidth="7" opacity="0.22" vectorEffect="non-scaling-stroke" />
            <path d={BOLT_LEFT} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <path d={BOLT_LEFT_FORKS} strokeWidth="1.25" opacity="0.75" vectorEffect="non-scaling-stroke" />
          </g>
        </svg>

        <svg
          aria-hidden
          viewBox="0 0 1000 500"
          preserveAspectRatio="xMidYMid meet"
          className="bolt pointer-events-none absolute inset-0 z-30 h-full w-full"
          style={{
            ["--bolt-cycle" as string]: "6.4s",
            ["--bolt-delay" as string]: "2.3s",
          }}
        >
          <g
            fill="none"
            stroke="#fff0f6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={BOLT_RIGHT} strokeWidth="7" opacity="0.2" vectorEffect="non-scaling-stroke" />
            <path d={BOLT_RIGHT} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <path d={BOLT_RIGHT_FORKS} strokeWidth="1.25" opacity="0.75" vectorEffect="non-scaling-stroke" />
          </g>
        </svg>

        {/* Impact bloom where the bolts land, plus the room lighting up
            from that side. Screen-blended so it brightens the subject
            instead of fogging a grey rectangle over him. */}
        <div
          aria-hidden
          className="bolt-flash pointer-events-none absolute left-1/2 top-1/2 z-20 h-[55%] w-[38%] -translate-x-1/2 -translate-y-1/2 mix-blend-screen bg-[radial-gradient(50%_50%_at_50%_50%,rgba(214,238,255,0.85),rgba(140,200,255,0.25)_45%,rgba(140,200,255,0))]"
          style={{ ["--bolt-cycle" as string]: "8s" }}
        />
        <div
          aria-hidden
          className="bolt-flash pointer-events-none absolute inset-y-0 left-0 z-20 w-2/3 mix-blend-screen bg-[radial-gradient(55%_65%_at_0%_40%,rgba(150,205,255,0.35),rgba(150,205,255,0))]"
          style={{ ["--bolt-cycle" as string]: "8s" }}
        />
        <div
          aria-hidden
          className="bolt-flash pointer-events-none absolute inset-y-0 right-0 z-20 w-2/3 mix-blend-screen bg-[radial-gradient(55%_65%_at_100%_55%,rgba(255,185,215,0.3),rgba(255,185,215,0))]"
          style={{
            ["--bolt-cycle" as string]: "6.4s",
            ["--bolt-delay" as string]: "2.3s",
          }}
        />

        {/* Film treatment over the top — never intercepting a drag. */}
        <div
          aria-hidden
          className="cinema-vignette pointer-events-none absolute inset-0 z-40"
        />
        <div
          aria-hidden
          className="cinema-grain pointer-events-none absolute -inset-8 z-40"
        />

        {/* Letterbox bars, thin enough to frame without cropping. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-40 h-6 bg-gradient-to-b from-black/85 to-transparent sm:h-10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-6 bg-gradient-to-t from-black/85 to-transparent sm:h-10"
        />

        {/* Framing marks, the way a viewfinder brackets a shot. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-4 top-4 z-50 h-7 w-7 border-l-2 border-t-2 border-cloud/40 sm:left-7 sm:top-7 sm:h-10 sm:w-10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-4 top-4 z-50 h-7 w-7 border-r-2 border-t-2 border-cloud/40 sm:right-7 sm:top-7 sm:h-10 sm:w-10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-4 left-4 z-50 h-7 w-7 border-b-2 border-l-2 border-cloud/40 sm:bottom-7 sm:left-7 sm:h-10 sm:w-10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-4 right-4 z-50 h-7 w-7 border-b-2 border-r-2 border-cloud/40 sm:bottom-7 sm:right-7 sm:h-10 sm:w-10"
        />

        {/* Slate line, like a burned-in timecode. */}
        <p
          aria-hidden
          className="pointer-events-none absolute bottom-5 left-1/2 z-50 -translate-x-1/2 font-display text-[10px] uppercase tracking-[0.3em] text-cloud/50 sm:bottom-8 sm:text-xs"
        >
          Drag to look around
        </p>
      </div>
    </div>
    </>
  );
}

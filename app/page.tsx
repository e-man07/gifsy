"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import { Uploader } from "@/components/Uploader";
import { ScrollReveal } from "@/components/ScrollReveal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AccountMenu } from "@/components/AccountMenu";
import { Wordmark } from "@/components/Wordmark";
import { GalleryStrip } from "@/components/GalleryGrid";
import { CommunityShowcase } from "@/components/CommunityShowcase";
import { OfferBanner } from "@/components/OfferBanner";
import { PersonaShowcase } from "@/components/PersonaShowcase";
import { PlanCards } from "@/components/PlanCards";
import { GALLERY_COUNT } from "@/lib/gallery";
// Quoted in the hero badges so the landing page can't drift from /pricing.
import { FREE_GENERATION_LIMIT, PLAN_DISPLAY } from "@/lib/billing/plans";
import { OFFER_ENDS_AT, OFFER_PRICE } from "@/lib/billing/offer";
import { useCountdown } from "@/lib/use-countdown";

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

import {
  ArrowDown,
  ArrowRight,
  Box,
  Check,
  ChevronDown,
  Clapperboard,
  Code,
  Film,
  Images,
  type LucideIcon,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react";
import { setPendingUpload } from "@/lib/pending-upload";

type Mode = "gif" | "sticker" | "3d";
type GifMode = "animate" | "combine";

export default function Home() {
  const router = useRouter();
  // Opens in 3D: it's the product being sold, and the app's default state is
  // the loudest positioning signal on the page. GIF/sticker stay one click away.
  const [mode, setMode] = useState<Mode>("3d");
  const [gifMode, setGifMode] = useState<GifMode>("animate");
  // Drives the "Keep going for $X" heading below — kept in sync with the
  // OfferBanner and PlanCards' Pro card so this page never shows two
  // different prices for the same offer at once.
  const offer = useCountdown(OFFER_ENDS_AT);

  // The nav is fixed, so it crosses from the hero photo onto the white panels
  // below. The glass treatment stays put the whole way; only the type flips
  // from white to ink, which is what actually decides legibility.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const multiple = mode === "gif" && gifMode === "combine";

  // Every mode now creates on its own page — 3D on /create, GIF on
  // /tools/gif, sticker on /tools/sticker — so there is nothing left to
  // scroll to on the homepage itself; "Start" and the scroll cue just bring
  // the hero uploader back into view.
  const scrollToUploader = useCallback(() => {
    document.getElementById("top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const addFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      // Hand the file(s) off in memory and navigate to the dedicated
      // creation page instead of staging them on the homepage.
      setPendingUpload(files);
      if (mode === "3d") {
        router.push("/create");
      } else if (mode === "gif") {
        router.push(gifMode === "combine" ? "/tools/gif?mode=combine" : "/tools/gif");
      } else {
        router.push("/tools/sticker");
      }
    },
    [mode, gifMode, router],
  );

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
  };

  return (
    <main className="flex flex-1 flex-col">
      <ScrollReveal />

      {/* Fixed header stack: the offer banner (when live) sits above the nav
          pill, both pinned to the real viewport top. Stacking them inside one
          `fixed` wrapper means the pill always sits right under the banner's
          actual rendered height — including when the banner wraps to two
          lines on a phone — with no manual offset to keep in sync. */}
      <div className="fixed inset-x-0 top-0 z-50 flex flex-col">
        <OfferBanner />

        {/* Nav: a frosted pill pinned to the viewport, so it stays reachable
            the whole way down the page. It lives outside the hero
            deliberately — sitting inside a section with `overflow-hidden`
            invites clipping the moment any ancestor grows a transform or
            filter. */}
        <nav className="flex justify-center px-5 pt-4 sm:px-8 sm:pt-6">
          {/* The pill crosses the hero photo AND the white panels below it as
              the page scrolls underneath this fixed header. It stays frosted
              glass throughout — only the type flips from white to ink, since
              that is what actually decides legibility. The tint firms up
              from 15% to 70% when scrolled so the pill still reads as a pill
              against a plain white page. */}
          <div
            className={`flex w-full max-w-5xl items-center justify-between gap-3 rounded-full px-5 py-3 shadow-[0_8px_32px_rgba(4,16,29,0.18)] ring-1 backdrop-blur-xl transition-colors duration-300 sm:px-7 ${
              scrolled
                ? "bg-white/70 ring-ink/10"
                : "bg-white/15 ring-white/25"
            }`}
          >
            <Wordmark href="#top" className={scrolled ? "text-ink" : "text-cloud"} />
            <div className="flex items-center gap-3 sm:gap-5">
              {/* Hidden on phones alongside "How it works" — the bar fits the
                  wordmark, sign-in and the CTA and no more. Both routes stay
                  reachable from the sections below and the footer. */}
              <Link
                href="/gallery"
                className={`hidden font-display text-sm transition-colors sm:block ${
                  scrolled ? "text-ink hover:text-sky-deep" : "text-cloud hover:text-white"
                }`}
              >
                Gallery
              </Link>
              <a
                href="#how"
                className={`hidden font-display text-sm transition-colors sm:block ${
                  scrolled ? "text-ink hover:text-sky-deep" : "text-cloud hover:text-white"
                }`}
              >
                How it works
              </a>
              {/* The CTA inverts too: a white button vanishes into the frosted
                  white pill once scrolled, so it goes solid sky there. */}
              <button
                onClick={scrollToUploader}
                className={`order-1 flex items-center gap-1.5 rounded-full px-4 py-2 font-display text-sm font-semibold shadow-sm transition ${
                  scrolled
                    ? "bg-sky text-white hover:bg-sky-deep"
                    : "bg-white text-sky-deep hover:bg-white/90"
                }`}
              >
                Start
                <ArrowDown className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              </button>
              {/* Same two links as above, for the phone hamburger — the inline
                  copies are hidden below sm. */}
              <AccountMenu
                tone={scrolled ? "dark" : "light"}
                links={[
                  { href: "/gallery", label: "Gallery" },
                  { href: "#how", label: "How it works" },
                ]}
              />
            </div>
          </div>
        </nav>
      </div>

      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section
        id="top"
        className="relative isolate flex min-h-[92vh] flex-col justify-center overflow-hidden"
      >
        <Image
          src="/hero-bg.png"
          alt=""
          fill
          priority
          aria-hidden
          className="absolute inset-0 -z-20 object-cover"
        />
        {/* Legibility scrim: a soft top-down fade keeps the floating nav and
            the headline readable over open sky, without flattening the
            meadow the card sits on further down. The `via` stop sits right
            where the headline/subtext block lands, so it carries most of the
            darkening — without the blurred backdrop, bright cloud there was
            washing the white subtext out. */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/50 via-ink/30 to-ink/25" />

        {/* Hero content: centered, single column, matching the reference —
            one message in the middle of the frame instead of text pinned
            against an empty second column.
            Extra top clearance while the offer banner is live: it adds a row
            to the fixed header sitting above this section, and without the
            bump the badge text right below crowds into the nav pill. Reverts
            to the original spacing on its own once the offer expires. */}
        <div
          className={`relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-5 pb-20 text-center sm:px-8 ${
            offer.active ? "pt-40 sm:pt-44" : "pt-36 sm:pt-40"
          }`}
        >
          <p className="font-display text-xs uppercase tracking-[0.22em] text-white/70 drop-shadow-[0_1px_8px_rgba(4,16,29,0.5)]">
            For portfolios, product pages & hero sections
          </p>
          {/* One colour. The old yellow/blue accent spans fought the sky —
              the blue phrase in particular all but vanished into it.
              `max-w-4xl` keeps this to two roomy lines on a desktop; at 2xl it
              broke into three cramped ones. */}
          <h1 className="mt-5 max-w-4xl text-balance font-editorial text-4xl leading-[1.1] text-white drop-shadow-[0_4px_20px_rgba(4,16,29,0.45)] sm:text-5xl md:text-6xl">
            Turn any photo into a live 3D photo you can embed anywhere.
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-base font-medium leading-relaxed text-white/85 drop-shadow-[0_2px_10px_rgba(4,16,29,0.5)] sm:text-lg">
            Upload one image. Gifsy gives it real depth right here in your
            browser, then hands you an embed you can paste into any site.
          </p>

          {/* Upload card — a prompt box, not a file input: the drop target is
              the whole card, with the mode switch riding in its control row.
              Colours are explicit white/ink rather than panel tokens so the
              card stays light when the OS is in dark mode. */}
          <div className="mt-11 w-full max-w-2xl">
            <Uploader
              multiple={multiple}
              sources={[]}
              onAdd={addFiles}
              onRemove={() => {}}
              onClear={() => {}}
              controls={
                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="inline-flex gap-0.5 rounded-full bg-ink/[0.06] p-0.5">
                    {(["3d", "gif", "sticker"] as Mode[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => switchMode(m)}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-xs transition ${
                          mode === m
                            ? "bg-white text-ink shadow-sm"
                            : "text-ink/55 hover:text-ink"
                        }`}
                      >
                        {m === "gif" ? (
                          <Film className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                        ) : m === "sticker" ? (
                          <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                        ) : (
                          <Box className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                        )}
                        {m === "gif" ? "GIF" : m === "sticker" ? "Sticker" : "3D"}
                      </button>
                    ))}
                  </div>

                  {mode === "gif" && (
                    <div className="inline-flex gap-0.5 rounded-full bg-ink/[0.06] p-0.5">
                      {(
                        [
                          { gm: "animate", label: "Animate one", Icon: Clapperboard },
                          { gm: "combine", label: "Combine several", Icon: Images },
                        ] as { gm: GifMode; label: string; Icon: LucideIcon }[]
                      ).map(({ gm, label, Icon }) => (
                        <button
                          key={gm}
                          onClick={() => setGifMode(gm)}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-xs transition ${
                            gifMode === gm
                              ? "bg-white text-ink shadow-sm"
                              : "text-ink/55 hover:text-ink"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              }
            />
          </div>

          {/* Full white and a tight, dark halo rather than the wide diffuse
              one these had: at 11px over a bright photo a soft 8px shadow
              spreads too thin to separate the strokes from the sky. */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-display text-xs font-semibold uppercase tracking-wide text-white [text-shadow:0_1px_3px_rgba(4,16,29,0.95),0_2px_12px_rgba(4,16,29,0.7)]">
            {[
              { figure: String(FREE_GENERATION_LIMIT), rest: "free 3D generations" },
              { figure: null, rest: "GIFs & stickers always free" },
              { figure: PLAN_DISPLAY.pro.price, rest: "once for unlimited 3D" },
            ].map(({ figure, rest }) => (
              <span key={rest} className="flex items-center gap-1.5">
                <Check
                  className="h-4 w-4 text-white"
                  strokeWidth={3.5}
                  aria-hidden
                />
                {/* Digits get .num for tabular, bold figures. */}
                {figure ? <span className="num normal-case">{figure}</span> : null}
                {rest}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <button
          onClick={scrollToUploader}
          className="absolute bottom-4 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1 font-display text-xs uppercase tracking-widest text-cloud/80 drop-shadow-[0_1px_8px_rgba(4,16,29,0.6)] hover:text-sun"
        >
          <ChevronDown className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          Customize
        </button>
      </section>

      {/* ─────────────────── COMMUNITY SHOWCASE ────────────────────── */}
      {/* Two rows of real published embeds, streaming past in opposite
          directions — social proof before the pitch, not after it. */}
      <section className="overflow-hidden border-t border-ink/10 bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8" data-reveal>
          <p className="font-display text-xl text-ink sm:text-2xl">
            See what people are building 👀
          </p>
          <p className="mb-6 mt-1.5 text-sm text-muted">
            Every card below is live and draggable — real embeds, the same
            snippet you&rsquo;d paste into your own site.
          </p>
        </div>
        <div data-reveal style={{ "--reveal-delay": "100ms" } as CSSProperties}>
          <CommunityShowcase />
        </div>
      </section>

      {/* ───────────────────── EMBEDDED SCENE ─────────────────────── */}
      {/* The one stretch of the page where a visitor watches instead of clicks.
          The room around the screen is white like the rest of the site; the
          screening stays inside the frame, where the strikes, vignette and
          grain still play against the scene. Every overlay in there is
          pointer-events-none — the scene itself still has to be draggable. */}
      <section className="relative overflow-hidden border-y border-foreground/10 bg-panel">
        <div className="relative py-10 sm:py-16">
          <div className="mx-auto mb-6 max-w-6xl px-5 text-center sm:mb-9 sm:px-8" data-reveal>
            <p className="font-display text-xs uppercase tracking-[0.35em] text-sky-deep">
              Now showing
            </p>
            <h2 className="mt-3 font-editorial text-3xl text-foreground sm:text-4xl">
              One photo. Shot in three dimensions.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted sm:text-base">
              Live in the frame below — drag it. This is an embed, the same
              snippet you can paste into your own site.
            </p>
          </div>

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
              <iframe
                src="https://www.gifsy.fun/embed/d41ee2f645"
                title="A 3D scene made with Gifsy"
                loading="lazy"
                className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 border-0 sm:h-[210%] sm:w-[210%]"
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
        </div>
      </section>

      {/* ──────────────────────── PERSONAS ─────────────────────────── */}
      {/* Lets a visitor place themselves before reading a pitch — the same
          effect, framed against four different jobs it's actually good for. */}
      <section className="border-t border-foreground/10 bg-background">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16" data-reveal>
          <p className="font-display text-xs uppercase tracking-[0.2em] text-sky-deep">
            For your work
          </p>
          <h2 className="mt-2 font-editorial text-3xl text-foreground sm:text-4xl">
            Find your fit.
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
            Same effect, four different jobs — see which one looks like
            yours.
          </p>
          <div className="mt-8">
            <PersonaShowcase />
          </div>
        </div>
      </section>

      {/* ──────────────────────── SHOWCASE ────────────────────────── */}
      {/* Directly under the hero on purpose: a first-time visitor should see
          the 3D effect working on real photos BEFORE being asked for one of
          their own. These are recorded clips, so this costs no model download —
          and each card only fetches its video once it scrolls into view. */}
      <section className="border-t border-foreground/10 bg-background">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="flex items-end justify-between gap-4" data-reveal>
            <div>
              <p className="font-display text-xs uppercase tracking-[0.2em] text-sky-deep">
                Made with Gifsy
              </p>
              <h2 className="mt-2 font-editorial text-3xl text-foreground sm:text-4xl">
                Every one of these was a flat photo.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
                One image in, real depth out — no modeling, no plugins. Hit play
                on any of them, then drop in your own.
              </p>
            </div>
            <Link
              href="/gallery"
              className="hidden shrink-0 items-center gap-1.5 font-display text-sm text-sky-deep hover:text-sky sm:flex"
            >
              All {GALLERY_COUNT} scenes
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </Link>
          </div>

          <div className="mt-7">
            <GalleryStrip />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3" data-reveal>
            <button
              onClick={scrollToUploader}
              className="btn inline-flex items-center gap-2 rounded-full bg-sky px-6 py-3 font-display text-base text-cloud"
            >
              Try it with your photo
              <ArrowDown className="h-5 w-5" strokeWidth={2.5} aria-hidden />
            </button>
            <Link
              href="/gallery"
              className="font-display text-sm text-sky-deep hover:text-sky sm:hidden"
            >
              See all {GALLERY_COUNT} scenes →
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── STEPS ─────────────────────────── */}
      <section id="how" className="scroll-mt-24 border-y border-foreground/10 bg-panel">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 sm:py-20">
          <h2 className="font-editorial text-3xl text-foreground sm:text-4xl" data-reveal>
            How it works
          </h2>
          <div className="mt-10 divide-y divide-foreground/10 sm:mt-14 sm:flex sm:divide-x sm:divide-y-0">
            {(
              [
                {
                  icon: Upload,
                  title: "Upload",
                  desc: "Drop in a photo. GIFs and stickers stay in your browser.",
                },
                {
                  icon: Wand2,
                  title: "Customize",
                  desc: "Pick 3D, GIF or sticker, then tune the depth and motion live.",
                },
                {
                  icon: Code,
                  title: "Publish",
                  desc: "Paste the 3D embed into any site — or download the GIF or sticker.",
                },
              ] satisfies { icon: LucideIcon; title: string; desc: string }[]
            ).map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                data-reveal
                style={{ "--reveal-delay": `${i * 110}ms` } as CSSProperties}
                className="flex flex-1 flex-col items-center gap-2 py-6 sm:py-0 sm:px-8"
              >
                <Icon className="h-7 w-7 text-sky" strokeWidth={1.75} aria-hidden />
                <h3 className="mt-1 font-display text-base text-foreground">{title}</h3>
                <p className="max-w-[240px] text-sm text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── PLANS ─────────────────────────── */}
      {/* Directly under the workshop on purpose: someone who has just made a
          scene — and watched the "N free 3D generations left" counter — is at
          the moment where the price is a real question. Same <PlanCards /> the
          /pricing page renders, so the two can never disagree. */}
      <section id="plans" className="scroll-mt-24 border-t border-foreground/10 bg-panel">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto mb-9 max-w-2xl text-center" data-reveal>
            <p className="font-display text-xs uppercase tracking-[0.2em] text-sky-deep">
              Plans
            </p>
            <h2 className="mt-2 font-editorial text-3xl text-foreground sm:text-4xl">
              {offer.active ? (
                <>
                  Keep going for {OFFER_PRICE}, once.{" "}
                  <span className="num text-2xl text-muted line-through sm:text-3xl">
                    {PLAN_DISPLAY.pro.price}
                  </span>
                </>
              ) : (
                <>Keep going for {PLAN_DISPLAY.pro.price}, once.</>
              )}
            </h2>
            <p className="mt-2 text-sm text-muted sm:text-base">
              GIFs and stickers stay free and unlimited, no account needed. Pro
              lifts the {FREE_GENERATION_LIMIT}-generation limit on 3D, drops the
              badge, and runs the whole model on your own device.
            </p>
          </div>
          <div data-reveal style={{ "--reveal-delay": "120ms" } as CSSProperties}>
            <PlanCards next="/#plans" freeHref="#top" />
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-foreground/10 bg-panel py-5 text-center font-display text-xs uppercase tracking-wide text-muted">
        <p>Made in your browser · your photo is only uploaded when you publish</p>
        <nav className="mt-2 flex flex-wrap items-center justify-center gap-4">
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/gallery" className="hover:text-foreground">
            Gallery
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/refund" className="hover:text-foreground">
            Refunds
          </Link>
        </nav>
      </footer>
    </main>
  );
}

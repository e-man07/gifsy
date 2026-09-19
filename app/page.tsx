// Landing page. A server component on purpose: everything a searcher or a
// crawler needs to read is in the HTML, not hydrated in. The two pieces that
// need state — the fixed nav pill and the hero's drop card — are client
// components (components/home/). Copy and structure follow
// docs/seo/runs/09-brief-homepage.md; the honesty rules are in
// docs/seo/runs/_brief-context.md (no "works offline" for the whole product,
// no "never leaves your device" for 3D, no stats not in the repo).

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Check, ChevronDown, Code, Layers, type LucideIcon, Upload, X } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SiteFooter } from "@/components/SiteFooter";
import { GalleryStrip } from "@/components/GalleryGrid";
import { CommunityShowcase } from "@/components/CommunityShowcase";
import { PersonaShowcase } from "@/components/PersonaShowcase";
import { PlanCards } from "@/components/PlanCards";
import { HomeNav } from "@/components/home/HomeNav";
import { HeroUploader } from "@/components/home/HeroUploader";
import { CinemaEmbed } from "@/components/home/CinemaEmbed";
import { ScrollFillText } from "@/components/home/ScrollFillText";
import { EmbedSnippet } from "@/components/home/EmbedSnippet";
import { ParallaxDrift } from "@/components/home/ParallaxDrift";
import { DealCards } from "@/components/home/DealCards";
import { HOME_FAQ } from "@/components/home/home-faq";
import { GALLERY_COUNT } from "@/lib/gallery";
import { FREE_GENERATION_LIMIT, PLAN_DISPLAY } from "@/lib/billing/plans";
import { REFUND_WINDOW_DAYS } from "@/lib/legal";
import { FOUNDERS, GITHUB_URL } from "@/lib/founders";
import { JsonLd, faqPageNode, howToNode } from "@/lib/seo/json-ld";
import { embedSnippet } from "@/lib/site-url";

const EMBED_SNIPPET = embedSnippet("<scene-id>", "https://www.gifsy.fun");

// The definition a search snippet will quote. Kept as one string so the
// scroll-fill component can split it into words without losing the copy.
const DEFINITION =
  "A 3D photo maker turns a single flat photo into a scene with real depth. Gifsy does it " +
  "with two AI models that run in your browser: one estimates a depth map, one cuts the " +
  "subject out. The result isn't a video — it's an interactive embed that responds to the " +
  "visitor's mouse or touch.";

const HOW_STEPS = [
  {
    name: "Upload one photo",
    text: "PNG, JPG or WebP with one clear subject; around 640 px or more on the long edge. 3D needs a free account.",
  },
  {
    name: "Depth, matte, backdrop — in your browser",
    text: "Depth Anything V2 estimates a depth map, ISNet lifts the subject off the background, and a LaMa inpaint fills what was behind it.",
  },
  {
    name: "Publish and paste the embed",
    text: "Tune depth and motion live, publish, and paste the iframe into any site. The viewer runs graphics only — no AI.",
  },
];

/** Section eyebrow + editorial heading, the pattern the page repeats. */
function Heading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl" data-reveal>
      {eyebrow && (
        <p className="font-display text-xs uppercase tracking-[0.2em] text-sky-deep">{eyebrow}</p>
      )}
      <h2 className="mt-2 font-editorial text-3xl text-foreground sm:text-4xl">{title}</h2>
      {children && <div className="mt-3 text-sm text-muted sm:text-base">{children}</div>}
    </div>
  );
}

const inlineLink = "text-sky-deep underline underline-offset-2";

/** "https://x.com/WhyParabola" → "@WhyParabola". */
const xHandle = (url: string) => "@" + url.replace(/\/$/, "").split("/").pop();

/** The sign-off under the founder letter: monograms, names set like a
 *  signature, each linking to its X profile. */
function FounderSignoff() {
  const tints = ["bg-sky", "bg-ink"];
  return (
    <div
      className="mt-10 flex flex-col gap-6 border-t border-foreground/10 pt-6 sm:flex-row sm:items-end sm:justify-between"
      data-reveal
      style={{ "--reveal-delay": "160ms" } as CSSProperties}
    >
      <div className="flex items-center gap-4">
        <div className="flex shrink-0 -space-x-2.5" aria-hidden>
          {FOUNDERS.map((f, i) => (
            <span
              key={f.x}
              className={`flex h-11 w-11 items-center justify-center rounded-full ${tints[i]} font-display text-base text-cloud ring-[3px] ring-background`}
            >
              {f.name[0]}
            </span>
          ))}
        </div>
        <div>
          <p className="font-editorial text-xl italic leading-tight text-foreground sm:text-2xl">
            {FOUNDERS.map((f, i) => (
              <span key={f.x}>
                {i > 0 && <span className="not-italic text-muted"> &amp; </span>}
                <a
                  href={f.x}
                  rel="me noopener"
                  target="_blank"
                  className="whitespace-nowrap decoration-foreground/30 underline-offset-4 transition hover:underline"
                >
                  {f.name}
                </a>
              </span>
            ))}
          </p>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            {FOUNDERS.map((f, i) => (
              <span key={f.x}>
                {i > 0 && " · "}
                <span className="whitespace-nowrap">
                  {f.role}{" "}
                  <a href={f.x} rel="me noopener" target="_blank" className="inline-flex items-center gap-1 hover:text-foreground">
                    <XMark />
                    {xHandle(f.x)}
                  </a>
                </span>
              </span>
            ))}
          </p>
        </div>
      </div>
      <Link
        href="/about"
        className="group inline-flex items-center gap-1.5 font-display text-sm text-foreground sm:pb-1"
      >
        More about Gifsy
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} aria-hidden />
      </Link>
    </div>
  );
}

/** The X (Twitter) wordmark, inline so the sign-off doesn't ship an icon asset. */
function XMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-label="on X">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/* Platform marks for the embed section: simple monograms in the brand's own
   tile, so the row reads at a glance without shipping four logo assets. */
const markTile = "tool-mark flex h-12 w-12 shrink-0 items-center justify-center rounded-xl";

function WebflowMark() {
  return (
    <span className={`${markTile} bg-ink font-display text-lg text-white`} aria-hidden>
      W
    </span>
  );
}

function FramerMark() {
  return (
    <span className={`${markTile} bg-foreground/5`} aria-hidden>
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-foreground">
        <path d="M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z" />
      </svg>
    </span>
  );
}

function SquarespaceMark() {
  return (
    <span className={`${markTile} bg-ink font-display text-lg text-white`} aria-hidden>
      S
    </span>
  );
}

function WordPressMark() {
  return (
    <span className={`${markTile} bg-foreground/5`} aria-hidden>
      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#21759b] font-display text-sm text-[#21759b]">
        W
      </span>
    </span>
  );
}

/** One cell of the video-vs-embed comparison: a mark plus a short phrase. */
function Cell({ yes, children }: { yes: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 px-1 text-muted">
      {yes ? (
        <Check className="mt-1 h-5 w-5 shrink-0 text-grass" strokeWidth={2.5} aria-hidden />
      ) : (
        <X className="mt-1 h-5 w-5 shrink-0 text-petal" strokeWidth={2.5} aria-hidden />
      )}
      <span>{children}</span>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <ScrollReveal />
      <JsonLd
        graph={[
          howToNode({
            name: "How to turn a photo into an interactive 3D photo you can embed",
            description:
              "Upload one photo, let two AI models add depth and lift the subject in your browser, then publish and paste the iframe into any website.",
            steps: HOW_STEPS,
          }),
          faqPageNode(HOME_FAQ),
        ]}
      />
      <HomeNav />

      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section
        id="top"
        className="relative isolate flex min-h-[92vh] flex-col justify-center overflow-hidden"
      >
        <Image src="/hero-bg.png" alt="" fill priority aria-hidden className="absolute inset-0 -z-20 object-cover" />
        {/* Legibility scrim: the `via` stop sits where the headline lands. */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/50 via-ink/30 to-ink/25" />

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-5 pb-20 pt-36 text-center sm:px-8 sm:pt-40">
          {/* Product Hunt featured badge — a remote SVG PH regenerates, so a
              plain <img> at 180×39 (PH's 250×54 ratio). */}
          <a
            href="https://www.producthunt.com/products/gifsy?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-gifsy"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-5 inline-block drop-shadow-[0_4px_16px_rgba(4,16,29,0.45)] transition hover:-translate-y-0.5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Gifsy - Turn any photo into an interactive 3D scene you can embed. | Product Hunt"
              width={180}
              height={39}
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1251694&theme=light&t=1789548480433"
            />
          </a>
          <p className="font-display text-xs uppercase tracking-[0.22em] text-white/70 drop-shadow-[0_1px_8px_rgba(4,16,29,0.5)]">
            For portfolios, product pages &amp; hero sections
          </p>
          <h1 className="mt-5 max-w-4xl text-balance font-editorial text-4xl leading-[1.1] text-white drop-shadow-[0_4px_20px_rgba(4,16,29,0.45)] sm:text-5xl md:text-6xl">
            The interactive 3D photo maker you can embed on any site.
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-base font-medium leading-relaxed text-white/85 drop-shadow-[0_2px_10px_rgba(4,16,29,0.5)] sm:text-lg">
            Drop in one photo. Gifsy estimates a depth map and lifts the subject off the
            background in your browser, then hands you an iframe your visitors can drag — no
            video export, no WebGL developer, no plugin.
          </p>

          <HeroUploader />

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-display text-xs font-semibold uppercase tracking-wide text-white [text-shadow:0_1px_3px_rgba(4,16,29,0.95),0_2px_12px_rgba(4,16,29,0.7)]">
            {[
              { figure: String(FREE_GENERATION_LIMIT), rest: "free 3D generations" },
              { figure: null, rest: "GIFs & stickers always free" },
              { figure: PLAN_DISPLAY.pro.price, rest: "once for unlimited 3D" },
            ].map(({ figure, rest }) => (
              <span key={rest} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-white" strokeWidth={3.5} aria-hidden />
                {figure ? <span className="num normal-case">{figure}</span> : null}
                {rest}
              </span>
            ))}
          </div>

          {/* Real <a> links to the three tool pages — the mode switch above is
              buttons + router.push, which a crawler can't follow. */}
          <p className="mt-4 text-xs text-white/85 [text-shadow:0_1px_3px_rgba(4,16,29,0.9)]">
            Or open a tool directly:{" "}
            <Link href="/create" className="underline underline-offset-2 hover:text-white">
              3D photo maker
            </Link>
            {" · "}
            <Link href="/tools/gif" className="underline underline-offset-2 hover:text-white">
              animate a photo into a GIF
            </Link>
            {" · "}
            <Link href="/tools/sticker" className="underline underline-offset-2 hover:text-white">
              Telegram sticker maker
            </Link>
          </p>
        </div>

        <a
          href="#how"
          className="absolute bottom-4 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1 font-display text-xs uppercase tracking-widest text-cloud/80 drop-shadow-[0_1px_8px_rgba(4,16,29,0.6)] hover:text-sun"
        >
          <ChevronDown className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          How it works
        </a>
      </section>

      {/* ─────────────────── COMMUNITY SHOWCASE ────────────────────── */}
      <section className="overflow-hidden bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8" data-reveal>
          <h2 className="font-editorial text-2xl text-ink sm:text-3xl">
            Interactive 3D photos published on Gifsy
          </h2>
          <p className="mb-6 mt-2 max-w-2xl text-sm text-muted">
            Playing back as clips — 32 live scenes at once tripped our host&apos;s firewall, so
            these are recordings. The live, draggable one is next.
          </p>
        </div>
        <div data-reveal style={{ "--reveal-delay": "100ms" } as CSSProperties}>
          <CommunityShowcase />
        </div>
      </section>

      {/* ───────────────────── EMBEDDED SCENE ─────────────────────── */}
      <section className="relative overflow-hidden bg-panel">
        <div className="relative py-10 sm:py-16">
          <div className="mx-auto mb-6 max-w-6xl px-5 text-center sm:mb-9 sm:px-8" data-reveal>
            <p className="font-display text-xs uppercase tracking-[0.35em] text-sky-deep">Now showing</p>
            <h2 className="mt-3 font-editorial text-3xl text-foreground sm:text-4xl">
              Drag it: this is the embed, not a video.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted sm:text-base">
              Live in the frame below — click and drag. It&apos;s the same{" "}
              <code>&lt;iframe&gt;</code> snippet you paste into your own site. The visitor&apos;s
              page loads image, depth and mask files only; no AI runs for them, and it&apos;s on
              screen in a couple of seconds.
            </p>
          </div>
          <CinemaEmbed />
        </div>
      </section>

      {/* ───────────────────────── DEFINITION ──────────────────────── */}
      {/* One statement set large — it's the definition a search snippet will
          quote — with the scope caveat as a quiet aside beside it. */}
      <section className="bg-background">
        <h2 className="sr-only">What a 3D photo maker does</h2>
        <ScrollFillText
          text={DEFINITION}
          className="font-editorial text-2xl leading-snug sm:text-3xl lg:text-[2.1rem]"
          aside={
            <aside className="self-center border-l-2 border-sky/40 pl-5 text-sm text-muted sm:text-base">
              <p className="font-display text-foreground">Not a 3D model.</p>
              <p className="mt-1.5">
                This is a 2.5D parallax scene: you look around the photo, about ±23°, not behind
                it. Need something you can spin 360° or print? Use a mesh generator like Meshy or
                Tripo. Gifsy is for photos on web pages.
              </p>
            </aside>
          }
        />
      </section>

      {/* ─────────────────────────── HOW ───────────────────────────── */}
      <section id="how" className="flex scroll-mt-24 flex-col justify-center bg-panel md:min-h-[80vh]">
        <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <Heading eyebrow="How it works" title="One photo in. A scene you can drag out." />
          <ol className="mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
            {(
              [
                {
                  Icon: Upload,
                  title: "Upload one photo",
                  lines: [
                    "PNG, JPG or WebP; 640 px or more on the long edge reads crisper.",
                    "One clear subject with some background behind it works best.",
                  ],
                },
                {
                  Icon: Layers,
                  title: "Depth, matte, backdrop",
                  lines: [
                    "Depth Anything V2 estimates a depth map; ISNet lifts the subject off the background.",
                    "At publish, a LaMa inpaint fills what was behind it so nothing tears when you look around.",
                  ],
                },
                {
                  Icon: Code,
                  title: "Publish and paste the embed",
                  lines: [
                    "Tune depth and motion live, then publish for a share page and an iframe.",
                    "From there it's WebGL at 60 fps — no model download for your visitors.",
                  ],
                },
              ] satisfies { Icon: LucideIcon; title: string; lines: string[] }[]
            ).map(({ Icon, title, lines }, i) => (
              <li
                key={title}
                className="card how-card flex min-h-[20rem] flex-col rounded-2xl bg-background p-8 sm:p-10"
                data-reveal
                style={{ "--reveal-delay": `${i * 140}ms` } as CSSProperties}
              >
                <div className="flex items-center gap-4">
                  <span className="num how-num text-base text-sky-deep">{i + 1}</span>
                  <span className="how-tile flex h-11 w-11 items-center justify-center rounded-xl bg-sky/10">
                    <Icon className="h-5 w-5 text-sky" strokeWidth={1.75} aria-hidden />
                  </span>
                </div>
                <h3 className="mt-7 font-display text-lg text-foreground sm:text-xl">{title}</h3>
                <div className="mt-4 space-y-3">
                  {lines.map((l) => (
                    <p key={l} className="text-[15px] leading-relaxed text-muted">
                      {l}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-sm text-muted" data-reveal>
            Each model runs once, on your device. The viewer never runs AI.{" "}
            <Link href="/guides/how-3d-photos-work" className={inlineLink}>
              How it works, in detail
            </Link>
            {" · "}
            <Link href="/create" className={inlineLink}>
              Make your 3D photo
            </Link>
          </p>
        </div>
      </section>

      {/* ───────────────────────── EMBED ───────────────────────────── */}
      <section className="flex flex-col justify-center bg-background md:min-h-[70vh]">
        <div className="mx-auto w-full max-w-7xl px-5 py-14 text-center sm:px-8 sm:py-24">
          <div className="mx-auto max-w-3xl">
            <p className="font-display text-xs uppercase tracking-[0.2em] text-sky-deep" data-reveal>
              Embed
            </p>
            <h2 className="mt-2 font-editorial text-4xl leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
              <span className="block" data-reveal style={{ "--reveal-delay": "80ms" } as CSSProperties}>
                Your 3D photo.
              </span>
              <span className="block text-sky" data-reveal style={{ "--reveal-delay": "200ms" } as CSSProperties}>
                Anywhere on the web.
              </span>
            </h2>
            <p
              className="mx-auto mt-5 max-w-2xl text-base text-muted sm:text-lg"
              data-reveal
              style={{ "--reveal-delay": "320ms" } as CSSProperties}
            >
              After publishing, this is the whole snippet. Full width, 500 px tall by default, and{" "}
              <code>loading=&quot;lazy&quot;</code> so it stays off your page&apos;s critical path.
              Free embeds carry a small &ldquo;Made with Gifsy&rdquo; badge; Pro removes it.
            </p>
          </div>

          <div
            className="embed-window mx-auto mt-10 max-w-5xl rounded-2xl text-left"
            data-reveal
            style={{ "--reveal-delay": "160ms" } as CSSProperties}
          >
            <EmbedSnippet snippet={EMBED_SNIPPET} />
          </div>

          <div className="mt-12">
            <h3 className="font-display text-base text-foreground sm:text-lg" data-reveal>
              Works with your favorite tools
            </h3>
            <ul className="mt-5 grid grid-cols-2 gap-3 text-left sm:gap-4 lg:grid-cols-4">
              {(
                [
                  { name: "Webflow", href: "/guides/3d-photo-webflow", Mark: WebflowMark },
                  { name: "Framer", href: "/guides/3d-photo-framer", Mark: FramerMark },
                  { name: "Squarespace", href: "/guides/3d-photo-squarespace", Mark: SquarespaceMark },
                  { name: "WordPress", href: "/guides/3d-photo-wordpress", Mark: WordPressMark },
                ] satisfies { name: string; href: string; Mark: () => React.ReactElement }[]
              ).map(({ name, href, Mark }, i) => (
                <li
                  key={name}
                  className="tool-card"
                  data-reveal
                  style={{ "--reveal-delay": `${120 + i * 110}ms` } as CSSProperties}
                >
                  <Link
                    href={href}
                    className="card-sm group flex h-full items-center gap-4 rounded-2xl bg-background px-4 py-4 sm:px-5"
                  >
                    <Mark />
                    <span className="min-w-0">
                      <span className="block truncate font-display text-base text-foreground">{name}</span>
                      <span className="mt-0.5 flex items-center gap-1 text-sm text-muted transition group-hover:text-sky-deep">
                        Guide <ArrowRight className="tool-arrow h-3.5 w-3.5" aria-hidden />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-muted" data-reveal style={{ "--reveal-delay": "560ms" } as CSSProperties}>
              Carrd, Notion, Shopify, or anything with a custom-HTML block:{" "}
              <Link href="/guides/embed-3d-photo-on-website" className={inlineLink}>
                the general embed guide
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* ────────────────── VIDEO VS INTERACTIVE ───────────────────── */}
      <section className="bg-panel">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <Heading title="A video export, or an embed that stays live?">
            <p>
              Immersity for Web, png3D, Upsampler and Media.io hand you a video. Gifsy gives you
              the embed, plus a GIF, WebM or PNG capture when you want a file too.{" "}
              <Link href="/alternatives/immersity-ai" className={inlineLink}>
                See how the tools compare
              </Link>
              .
            </p>
          </Heading>
          <div className="card-soft mt-8 rounded-2xl bg-background px-6 py-7 sm:px-8 sm:py-9" data-reveal>
            <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-x-6 text-base font-semibold text-foreground sm:text-lg">
              <div />
              <div className="px-1">Video / GIF export</div>
              <div className="px-1">
                <span className="inline-block rounded-full bg-sky/10 px-3.5 py-1 text-sky-deep">Interactive embed</span>
              </div>
            </div>
            <div className="mt-7 flex flex-col gap-6 sm:gap-7">
              {[
                { k: "Visitor control", v: [false, "None — it plays"], e: [true, "Drag, tilt, spin"] },
                { k: "File weight", v: [false, "A video per placement"], e: [true, "Image + depth + mask, once"] },
                { k: "Battery", v: [false, "Decodes video constantly"], e: [true, "GPU idles until the pointer moves"] },
                { k: "Edits after publishing", v: [false, "Re-export and replace"], e: [true, "Re-publish; same iframe"] },
                { k: "Email and social feeds", v: [true, "Works"], e: [false, "Use a GIF there"] },
              ].map((row) => (
                <div key={row.k} className="grid grid-cols-[1.3fr_1fr_1fr] gap-x-6 text-base sm:text-lg">
                  <div className="font-semibold text-foreground">{row.k}</div>
                  <Cell yes={row.v[0] as boolean}>{row.v[1] as string}</Cell>
                  <Cell yes={row.e[0] as boolean}>{row.e[1] as string}</Cell>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs text-muted" data-reveal>
            For email and feeds,{" "}
            <Link href="/tools/gif" className={inlineLink}>
              make a GIF from the photo
            </Link>{" "}
            instead.
          </p>
        </div>
      </section>

      {/* ──────────────────────── PERSONAS ─────────────────────────── */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <Heading eyebrow="For your work" title="Built for the jobs a flat hero image can't do">
            <p>Same effect, four jobs. Every card is a live embed — grab one.</p>
          </Heading>
          <div className="mt-8" data-reveal>
            <PersonaShowcase />
          </div>
        </div>
      </section>

      {/* ──────────────────────── SHOWCASE ────────────────────────── */}
      <section className="overflow-hidden bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex items-end justify-between gap-4" data-reveal>
            <div>
              <p className="font-display text-xs uppercase tracking-[0.2em] text-sky-deep">Made with Gifsy</p>
              <h2 className="mt-2 font-editorial text-3xl text-foreground sm:text-4xl">
                Every one of these was a flat photo.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
                One image in, real depth out. Hit play on any of them, then drop in your own.
              </p>
            </div>
            <Link
              href="/gallery"
              className="hidden shrink-0 items-center gap-1.5 font-display text-sm text-sky-deep hover:text-sky sm:flex"
            >
              See all {GALLERY_COUNT} 3D photo examples
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </Link>
          </div>
        </div>
        <div className="mt-7" data-reveal style={{ "--reveal-delay": "100ms" } as CSSProperties}>
          <GalleryStrip />
        </div>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3" data-reveal>
            <a
              href="#top"
              className="btn inline-flex items-center gap-2 rounded-full bg-sky px-6 py-3 font-display text-base text-cloud"
            >
              Try it with your photo
              <ArrowDown className="h-5 w-5" strokeWidth={2.5} aria-hidden />
            </a>
            <Link href="/gallery" className="font-display text-sm text-sky-deep hover:text-sky sm:hidden">
              See all {GALLERY_COUNT} scenes →
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────────────── LIMITS ──────────────────────────── */}
      <section className="flex flex-col justify-center bg-panel md:min-h-[70vh]">
        <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <Heading title="Which photos work — and which don't">
            <p>The honest list, learned by running the model on a lot of photos.</p>
          </Heading>
          {/* Staggered row: each card starts at a different height and drifts
              at a different rate as the section scrolls through, so the three
              slide past one another rather than sitting on one baseline. */}
          <ParallaxDrift className="mt-8 grid gap-6 md:grid-cols-[1fr_1fr_auto] md:items-start">
            <ul
              className="card space-y-2.5 rounded-2xl bg-background p-6 text-sm text-foreground md:mt-32"
              data-reveal
              data-drift="0.28"
            >
              <li className="font-display">Works best</li>
              {[
                "One clear subject with visible separation from the background",
                "640 px or more on the long edge",
                "Real depth behind the subject — a room, a street, a landscape",
              ].map((t) => (
                <li key={t} className="flex gap-2.5 text-muted">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-grass" strokeWidth={2.5} aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
            <ul
              className="card space-y-2.5 rounded-2xl bg-background p-6 text-sm text-foreground"
              data-reveal
              data-drift="-0.14"
              style={{ "--reveal-delay": "80ms" } as CSSProperties}
            >
              <li className="font-display">Works worst</li>
              {[
                "Frame-filling subjects — nothing behind them to parallax, so edges stretch",
                "Busy or low-contrast backgrounds the matte can't separate (you'll get a depth-only view)",
                "Flat illustrations and logos — no depth cues",
                "Glass, fur and fly-away hair at the silhouette",
                "Small screenshots and anything upscaled",
              ].map((t) => (
                <li key={t} className="flex gap-2.5 text-muted">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-petal" strokeWidth={2.5} aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
            <div
              className="flex flex-col justify-center rounded-2xl border border-foreground/10 px-6 py-5 text-sm text-muted md:mt-16 md:max-w-[220px]"
              data-reveal
              data-drift="0.42"
              style={{ "--reveal-delay": "160ms" } as CSSProperties}
            >
              <p className="num text-3xl text-foreground">±23°</p>
              <p className="mt-1 font-display text-foreground">Orbit, side to side</p>
              <p className="mt-2">
                ±13° up and down. That&apos;s the honest ceiling of depth from one image — at the
                edge you&apos;ll see a thin stretch at the silhouette. That&apos;s the height-field,
                not a bug.
              </p>
            </div>
          </ParallaxDrift>
        </div>
      </section>

      {/* ──────────────────────── DATA FLOW ────────────────────────── */}
      <section className="bg-background">
        <DealCards
          cards={[
            {
              title: "GIFs and stickers",
              out: "Nothing",
              note: "Encoded and downloaded in the tab. No account, no upload endpoint.",
              sends: false,
            },
            {
              title: "3D on Free",
              out: "Activations, for one step",
              note: "Your device runs the first half of the depth model. The second half runs on our server and receives intermediate numbers — not the photo. That step is what counts as a free generation.",
              sends: true,
            },
            {
              title: "3D on Pro",
              out: "Nothing",
              note: "Both halves run on your device, so depth generation works offline after the first ~50 MB model download.",
              sends: false,
            },
          ]}
          heading={
            <div className="max-w-2xl">
              <h2 className="font-editorial text-3xl text-foreground sm:text-4xl">What leaves your browser</h2>
              <p className="mt-3 text-sm text-muted sm:text-base">
                Made in your browser is a claim you can check. Here is exactly what goes where.
              </p>
            </div>
          }
          footer={
            <p className="max-w-3xl text-sm text-muted">
              <strong className="text-foreground">Publishing</strong> uploads the finished scene —
              image, depth, mask, backdrop — and it becomes public at its share link. Full account
              in the{" "}
              <Link href="/privacy" className={inlineLink}>
                privacy policy
              </Link>
              ; code is{" "}
              <a href={GITHUB_URL} className={inlineLink} rel="noopener" target="_blank">
                open on GitHub
              </a>
              .
            </p>
          }
        />
      </section>

      {/* ─────────────────────────── PLANS ─────────────────────────── */}
      <section id="plans" className="scroll-mt-24 bg-panel">
        <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto mb-9 max-w-2xl text-center" data-reveal>
            <p className="font-display text-xs uppercase tracking-[0.2em] text-sky-deep">Plans</p>
            <h2 className="mt-2 font-editorial text-3xl text-foreground sm:text-4xl">
              Free to try. {PLAN_DISPLAY.pro.price} once for unlimited.
            </h2>
            <p className="mt-3 text-sm text-muted sm:text-base">
              No credits and no monthly plan — the model running in your browser is what makes a
              one-time price possible. GIFs and stickers stay free with no account.
            </p>
          </div>
          <div data-reveal style={{ "--reveal-delay": "120ms" } as CSSProperties}>
            <PlanCards next="/#plans" freeHref="#top" />
          </div>
          <p className="mt-4 text-center text-xs text-muted" data-reveal>
            {REFUND_WINDOW_DAYS}-day no-questions refund ·{" "}
            <Link href="/pricing" className="underline underline-offset-2">
              Compare Free and Pro
            </Link>
          </p>
        </div>
      </section>

      {/* ──────────────────────── WHO BUILT THIS ───────────────────── */}
      {/* A founder letter, not a card: the hook is the headline, the copy
          runs in one narrow column, and the two of us sign it at the foot.
          Deliberately the one section on the page with no container, so it
          breaks the card rhythm between Plans and the FAQ. */}
      <section className="bg-background">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
          <div data-reveal>
            <p className="font-display text-xs uppercase tracking-[0.2em] text-sky-deep">Who built this</p>
            <h2 className="mt-3 font-editorial text-3xl leading-[1.15] text-foreground sm:text-[2.5rem]">
              We built Gifsy because every hero image on our own sites was flat.
            </h2>
          </div>
          <div
            className="mt-6 space-y-4 text-base leading-relaxed text-muted sm:text-lg"
            data-reveal
            style={{ "--reveal-delay": "80ms" } as CSSProperties}
          >
            <p>
              The first build ran the depth model on a server and would have had to charge
              credits. Moving the 44 MB encoder into the browser is what made a{" "}
              {PLAN_DISPLAY.pro.price} one-time price possible instead.
            </p>
            <p>
              The viewer is plain Three.js — the AI runs once, then it&apos;s just graphics. Two
              people, no company yet, made in India.
            </p>
          </div>
          <FounderSignoff />
        </div>
      </section>

      {/* ─────────────────────────── FAQ ───────────────────────────── */}
      {/* Native <details>: crawlable answers, keyboard-accessible, no JS. */}
      <section className="bg-panel">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
          <Heading title="Before you try it" />
          <div className="card mt-8 divide-y divide-foreground/10 rounded-2xl bg-background" data-reveal>
            {HOME_FAQ.map((f) => (
              <details key={f.q} className="group px-5 py-4 sm:px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-sm text-foreground sm:text-base [&::-webkit-details-marker]:hidden">
                  <h3 className="font-display text-sm sm:text-base">{f.q}</h3>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                </summary>
                <p className="mt-3 text-sm text-muted sm:text-base">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter note="Made in your browser · your photo is only uploaded when you publish" />
    </main>
  );
}

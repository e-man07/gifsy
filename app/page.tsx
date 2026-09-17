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
import { HOME_FAQ } from "@/components/home/home-faq";
import { GALLERY_COUNT } from "@/lib/gallery";
import { FREE_GENERATION_LIMIT, PLAN_DISPLAY } from "@/lib/billing/plans";
import { REFUND_WINDOW_DAYS } from "@/lib/legal";
import { FOUNDERS, GITHUB_URL } from "@/lib/founders";
import { JsonLd, faqPageNode, howToNode } from "@/lib/seo/json-ld";

const EMBED_SNIPPET =
  '<iframe src="https://www.gifsy.fun/embed/<scene-id>" style="width:100%;height:500px;border:0" loading="lazy"></iframe>';

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

/** One cell of the video-vs-embed comparison: a mark plus a short phrase. */
function Cell({ yes, highlight, children }: { yes: boolean; highlight?: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex items-start gap-2 px-4 py-3 text-muted ${highlight ? "bg-sky/5" : ""}`}>
      {yes ? (
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-grass" strokeWidth={2.5} aria-hidden />
      ) : (
        <X className="mt-0.5 h-4 w-4 shrink-0 text-petal" strokeWidth={2.5} aria-hidden />
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
      <section className="overflow-hidden border-t border-ink/10 bg-white py-12 sm:py-16">
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
      <section className="relative overflow-hidden border-y border-foreground/10 bg-panel">
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
      <section className="border-b border-foreground/10 bg-background">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div data-reveal>
            <h2 className="sr-only">What a 3D photo maker does</h2>
            <p className="font-editorial text-2xl leading-snug text-foreground sm:text-3xl lg:text-[2.1rem]">
              A 3D photo maker turns a single flat photo into a scene with real depth. Gifsy
              does it with two AI models that run in your browser: one estimates a depth map,
              one cuts the subject out. The result isn&apos;t a video — it&apos;s an interactive
              embed that responds to the visitor&apos;s mouse or touch.
            </p>
          </div>
          <aside
            className="self-center border-l-2 border-sky/40 pl-5 text-sm text-muted sm:text-base"
            data-reveal
            style={{ "--reveal-delay": "100ms" } as CSSProperties}
          >
            <p className="font-display text-foreground">Not a 3D model.</p>
            <p className="mt-1.5">
              This is a 2.5D parallax scene: you look around the photo, about ±23°, not behind
              it. Need something you can spin 360° or print? Use a mesh generator like Meshy or
              Tripo. Gifsy is for photos on web pages.
            </p>
          </aside>
        </div>
      </section>

      {/* ─────────────────────────── HOW ───────────────────────────── */}
      <section id="how" className="scroll-mt-24 border-b border-foreground/10 bg-panel">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <Heading eyebrow="How it works" title="One photo in. A scene you can drag out." />
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
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
                className="card flex flex-col gap-3 rounded-2xl bg-background p-6"
                data-reveal
                style={{ "--reveal-delay": `${i * 90}ms` } as CSSProperties}
              >
                <div className="flex items-center gap-3">
                  <span className="num text-sm text-sky-deep">{i + 1}</span>
                  <Icon className="h-5 w-5 text-sky" strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="font-display text-base text-foreground">{title}</h3>
                {lines.map((l) => (
                  <p key={l} className="text-sm text-muted">
                    {l}
                  </p>
                ))}
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-muted" data-reveal>
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
      <section className="border-b border-foreground/10 bg-background">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
            <Heading eyebrow="Embed" title="Paste it into any site">
              <p>
                After publishing, this is the whole snippet. Full width, 500 px tall by default,
                and <code>loading=&quot;lazy&quot;</code> so it stays off your page&apos;s critical
                path. Free embeds carry a small &ldquo;Made with Gifsy&rdquo; badge; Pro removes it.
              </p>
            </Heading>
            <div className="min-w-0" data-reveal style={{ "--reveal-delay": "100ms" } as CSSProperties}>
              <pre className="card-sm whitespace-pre-wrap break-all rounded-xl bg-ink p-4 text-xs leading-relaxed text-cloud sm:text-sm">
                <code>{EMBED_SNIPPET}</code>
              </pre>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { name: "Webflow", how: "Embed element", href: "/guides/3d-photo-webflow" },
                  { name: "Framer", how: "Embed component, HTML", href: "/guides/3d-photo-framer" },
                  { name: "Squarespace, WordPress, Carrd, Notion", how: "Code or custom-HTML block", href: "/guides/embed-3d-photo-on-website" },
                ].map((p) => (
                  <li key={p.name}>
                    <Link href={p.href} className="block rounded-xl border border-foreground/10 px-4 py-3 transition hover:border-sky/50">
                      <span className="block font-display text-sm text-foreground">{p.name}</span>
                      <span className="mt-0.5 block text-xs text-muted">{p.how} — guide</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── VIDEO VS INTERACTIVE ───────────────────── */}
      <section className="border-b border-foreground/10 bg-panel">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
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
          <div className="card mt-8 overflow-hidden rounded-2xl bg-background" data-reveal>
            <div className="grid grid-cols-[1.3fr_1fr_1fr] border-b border-foreground/10 text-sm font-semibold text-foreground">
              <div className="px-4 py-3" />
              <div className="px-4 py-3">Video / GIF export</div>
              <div className="bg-sky/10 px-4 py-3 text-sky-deep">Interactive embed</div>
            </div>
            {[
              { k: "Visitor control", v: [false, "None — it plays"], e: [true, "Drag, tilt, spin"] },
              { k: "File weight", v: [false, "A video per placement"], e: [true, "Image + depth + mask, once"] },
              { k: "Battery", v: [false, "Decodes video constantly"], e: [true, "GPU idles until the pointer moves"] },
              { k: "Edits after publishing", v: [false, "Re-export and replace"], e: [true, "Re-publish; same iframe"] },
              { k: "Email and social feeds", v: [true, "Works"], e: [false, "Use a GIF there"] },
            ].map((row, i) => (
              <div
                key={row.k}
                className={`grid grid-cols-[1.3fr_1fr_1fr] text-sm ${i > 0 ? "border-t border-foreground/10" : ""}`}
              >
                <div className="px-4 py-3 font-semibold text-foreground">{row.k}</div>
                <Cell yes={row.v[0] as boolean}>{row.v[1] as string}</Cell>
                <Cell yes={row.e[0] as boolean} highlight>
                  {row.e[1] as string}
                </Cell>
              </div>
            ))}
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
      <section className="border-b border-foreground/10 bg-background">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <Heading eyebrow="For your work" title="Built for the jobs a flat hero image can't do">
            <p>Same effect, four jobs. Every card is a live embed — grab one.</p>
          </Heading>
          <div className="mt-8" data-reveal>
            <PersonaShowcase />
          </div>
        </div>
      </section>

      {/* ──────────────────────── SHOWCASE ────────────────────────── */}
      <section className="overflow-hidden border-b border-foreground/10 bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
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
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
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
      <section className="border-b border-foreground/10 bg-panel">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <Heading title="Which photos work — and which don't">
            <p>The honest list, learned by running the model on a lot of photos.</p>
          </Heading>
          <div className="mt-8 grid gap-6 md:grid-cols-[1fr_1fr_auto]">
            <ul className="card space-y-2.5 rounded-2xl bg-background p-6 text-sm text-foreground" data-reveal>
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
              className="flex flex-col justify-center rounded-2xl border border-foreground/10 px-6 py-5 text-sm text-muted md:max-w-[220px]"
              data-reveal
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
          </div>
        </div>
      </section>

      {/* ──────────────────────── DATA FLOW ────────────────────────── */}
      <section className="border-b border-foreground/10 bg-background">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <Heading title="What leaves your browser">
            <p>Made in your browser is a claim you can check. Here is exactly what goes where.</p>
          </Heading>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "GIFs and stickers",
                out: "Nothing",
                note: "Encoded and downloaded in the tab. No account, no upload endpoint.",
              },
              {
                title: "3D on Free",
                out: "Activations, for one step",
                note: "Your device runs the first half of the depth model. The second half runs on our server and receives intermediate numbers — not the photo. That step is what counts as a free generation.",
              },
              {
                title: "3D on Pro",
                out: "Nothing",
                note: "Both halves run on your device, so depth generation works offline after the first ~50 MB model download.",
              },
            ].map((c, i) => (
              <div
                key={c.title}
                className="card rounded-2xl bg-panel p-6"
                data-reveal
                style={{ "--reveal-delay": `${i * 80}ms` } as CSSProperties}
              >
                <h3 className="font-display text-base text-foreground">{c.title}</h3>
                <p className="mt-3 text-xs text-muted">Leaves the browser</p>
                <p className="font-display text-lg text-foreground">{c.out}</p>
                <p className="mt-3 text-sm text-muted">{c.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 max-w-3xl text-sm text-muted" data-reveal>
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
        </div>
      </section>

      {/* ─────────────────────────── PLANS ─────────────────────────── */}
      <section id="plans" className="scroll-mt-24 border-b border-foreground/10 bg-panel">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
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
      <section className="border-b border-foreground/10 bg-background">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="card grid gap-6 rounded-2xl bg-panel p-6 sm:p-8 md:grid-cols-[auto_1fr] md:items-center" data-reveal>
            <div className="flex flex-col gap-2">
              {FOUNDERS.map((f) => (
                <a
                  key={f.x}
                  href={f.x}
                  rel="me noopener"
                  target="_blank"
                  className="card-sm flex items-center gap-3 rounded-full bg-background py-2 pl-2 pr-4 transition hover:-translate-y-0.5"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky font-display text-sm text-cloud">
                    {f.name[0]}
                  </span>
                  <span>
                    <span className="block font-display text-sm text-foreground">{f.name}</span>
                    <span className="block text-xs text-muted">{f.role} · on X</span>
                  </span>
                </a>
              ))}
            </div>
            <div>
              <h2 className="font-editorial text-2xl text-foreground sm:text-3xl">Who built this</h2>
              <p className="mt-2 text-sm text-muted sm:text-base">
                We built Gifsy because every hero image on our own sites was flat. The first build
                ran the depth model on a server; moving the 44 MB encoder into the browser is what
                made a {PLAN_DISPLAY.pro.price} one-time price possible instead of credits. The
                viewer is plain Three.js — the AI runs once, then it&apos;s graphics. Made in India.{" "}
                <Link href="/about" className={inlineLink}>
                  About Gifsy
                </Link>
              </p>
            </div>
          </div>
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

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
import { ArrowDown, ArrowRight, Check, ChevronDown } from "lucide-react";
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
            Scenes published on Gifsy, playing back as clips. The first version of this strip
            mounted 32 live WebGL scenes at once and tripped our host&apos;s firewall — so these
            are recordings. The live, draggable one is next.
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
      <section className="border-b border-foreground/10 bg-background">
        <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
          <Heading title="What a 3D photo maker does — and what this one isn't">
            <p>
              A 3D photo maker turns a single flat photo into a scene with real depth. Gifsy does
              it with two AI models that run in your browser: one estimates a depth map, one cuts
              the subject out. The result isn&apos;t a video — it&apos;s an interactive embed that
              responds to the visitor&apos;s mouse or touch.
            </p>
            <p className="mt-3">
              This is a 2.5D parallax scene, not a 3D mesh. You can look around the photo —
              roughly ±23° left to right — not walk behind it. If you need a model you can rotate
              360° or print, use a mesh generator such as Meshy or Tripo. Gifsy is for photos on
              web pages.
            </p>
          </Heading>
        </div>
      </section>

      {/* ─────────────────────────── HOW ───────────────────────────── */}
      <section id="how" className="scroll-mt-24 border-b border-foreground/10 bg-panel">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
          <Heading eyebrow="How it works" title="One photo in. A scene you can drag out." />
          <ol className="mt-8 space-y-8">
            <li data-reveal>
              <h3 className="font-display text-base text-foreground">1. Upload one photo</h3>
              <p className="mt-2 text-sm text-muted sm:text-base">
                PNG, JPG or WebP. Around 640 px or more on the long edge reads crisper, and one
                clear subject with some background behind it gives the depth model the most to
                work with. GIFs and stickers never leave the browser; 3D needs a free account so
                the {FREE_GENERATION_LIMIT} free generations can be counted.
              </p>
            </li>
            <li data-reveal style={{ "--reveal-delay": "80ms" } as CSSProperties}>
              <h3 className="font-display text-base text-foreground">
                2. Depth, matte, backdrop — in your browser
              </h3>
              <p className="mt-2 text-sm text-muted sm:text-base">
                Depth Anything V2 (small) estimates a depth map: how far every pixel is from the
                camera. ISNet lifts the subject off the background as a clean matte. At publish, a
                LaMa inpaint fills in what was behind the subject, so the backdrop doesn&apos;t
                tear when a visitor looks around. The depth model is split in two: your device
                always runs the first, larger half; on the Free plan the second half runs on our
                server, fed with activations rather than the photo; on Pro it runs on your device
                too. Each model runs once. The viewer never runs AI.
              </p>
            </li>
            <li data-reveal style={{ "--reveal-delay": "160ms" } as CSSProperties}>
              <h3 className="font-display text-base text-foreground">3. Publish and paste the embed</h3>
              <p className="mt-2 text-sm text-muted sm:text-base">
                Tune depth, motion and the Spin orbit live, then publish. You get a share page and
                an <code>&lt;iframe&gt;</code>; the finished scene — image, depth, mask, backdrop —
                is uploaded and public. Everything after that is WebGL at 60 fps: two displaced
                planes rendered with Three.js, no model download for your visitors.{" "}
                <Link href="/create" className={inlineLink}>
                  Make your 3D photo →
                </Link>
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* ───────────────────────── EMBED ───────────────────────────── */}
      <section className="border-b border-foreground/10 bg-background">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
          <Heading eyebrow="Embed" title="Embed the 3D photo on your site">
            <p>
              After publishing, this is the whole snippet. It defaults to full width and 500 px
              tall — change the height to fit your layout — and <code>loading=&quot;lazy&quot;</code>{" "}
              keeps it off your page&apos;s critical path.
            </p>
          </Heading>
          <pre
            className="card-sm mt-6 overflow-x-auto rounded-xl bg-surface p-4 text-xs text-foreground sm:text-sm"
            data-reveal
          >
            <code>{EMBED_SNIPPET}</code>
          </pre>
          <ul className="mt-6 space-y-2 text-sm text-muted sm:text-base" data-reveal>
            <li>
              <strong className="text-foreground">Webflow:</strong> drop an Embed element, paste,
              publish.
            </li>
            <li>
              <strong className="text-foreground">Framer:</strong> add an Embed component, choose
              HTML, paste.
            </li>
            <li>
              <strong className="text-foreground">Squarespace, WordPress, Carrd, Notion</strong> and
              anything else that takes an iframe: a code block or custom-HTML block does it.
            </li>
          </ul>
          <p className="mt-4 text-sm text-muted sm:text-base" data-reveal>
            Free embeds carry a small &ldquo;Made with Gifsy&rdquo; badge; Pro removes it.
          </p>
        </div>
      </section>

      {/* ────────────────── VIDEO VS INTERACTIVE ───────────────────── */}
      <section className="border-b border-foreground/10 bg-panel">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
          <Heading title="Video export vs an interactive embed">
            <p>
              Immersity for Web, png3D, Upsampler and Media.io all hand you a video. Gifsy&apos;s
              outputs are the embed <em>and</em> a GIF, WebM or PNG capture if you want a file
              too. Here is where each one wins — and video does win one row.
            </p>
          </Heading>
          <div className="legal mt-6" data-reveal>
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Video / GIF export</th>
                  <th>Interactive embed</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Visitor control</td>
                  <td>None — it plays</td>
                  <td>Drag, tilt, spin</td>
                </tr>
                <tr>
                  <td>File weight</td>
                  <td>A video file per placement</td>
                  <td>Image + depth + mask, once</td>
                </tr>
                <tr>
                  <td>Autoplay &amp; battery</td>
                  <td>Looping video decodes constantly</td>
                  <td>GPU idles until the pointer moves</td>
                </tr>
                <tr>
                  <td>Edits after publishing</td>
                  <td>Re-export, re-upload, replace</td>
                  <td>Re-publish; the iframe stays the same</td>
                </tr>
                <tr>
                  <td>Works in email and social feeds</td>
                  <td>Yes</td>
                  <td>
                    No — use a GIF there (<Link href="/tools/gif">make a GIF from a photo</Link>)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ──────────────────────── PERSONAS ─────────────────────────── */}
      <section className="border-b border-foreground/10 bg-background">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <Heading eyebrow="For your work" title="Built for the jobs a flat hero image can't do">
            <p>Same effect, four different jobs — each card below is a live embed you can grab.</p>
          </Heading>
          <div className="mt-8" data-reveal>
            <PersonaShowcase />
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2" data-reveal>
            <div>
              <h3 className="font-display text-base text-foreground">Webflow and Framer builders</h3>
              <p className="mt-1.5 text-sm text-muted">
                A client hero section that moves, without hiring a WebGL developer: paste an Embed
                element and ship. Commercial use on client sites is included with Pro.
              </p>
            </div>
            <div>
              <h3 className="font-display text-base text-foreground">Portfolio creators</h3>
              <p className="mt-1.5 text-sm text-muted">
                One self-portrait or key project shot that responds to the visitor — and stays
                interactive on a phone, where a finger drag does what the mouse does.
              </p>
            </div>
            <div>
              <h3 className="font-display text-base text-foreground">Product pages</h3>
              <p className="mt-1.5 text-sm text-muted">
                A flagship shot with depth. Honestly: one angle with parallax, not a 360° turntable
                — pick the photo where the product stands clear of its background.
              </p>
            </div>
            <div>
              <h3 className="font-display text-base text-foreground">Creators and streamers</h3>
              <p className="mt-1.5 text-sm text-muted">
                The same scene captured as a looping GIF or WebM for socials, straight from the
                capture button.{" "}
                <Link href="/gallery" className={inlineLink}>
                  Browse 3D photo examples
                </Link>
                .
              </p>
            </div>
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
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
          <Heading title="Which photos work best (and which don't)">
            <p>
              <strong className="text-foreground">Works best:</strong> one clear subject with
              visible separation from what&apos;s behind it, at least 640 px on the long edge, and
              some real depth in the background — a room, a street, a landscape.
            </p>
          </Heading>
          <p className="mt-5 text-sm font-semibold text-foreground" data-reveal>
            Works worst — each of these is something you only learn by running the model:
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted sm:text-base" data-reveal>
            <li>Frame-filling subjects: nothing behind them to parallax against, so the edges stretch.</li>
            <li>
              Busy or low-contrast backgrounds the matte can&apos;t separate — the app will tell
              you &ldquo;this photo&apos;s background couldn&apos;t be separated&rdquo; and fall
              back to a depth-only view.
            </li>
            <li>Flat illustrations and logos: no depth cues to estimate from.</li>
            <li>Glass, fur and fly-away hair at the silhouette.</li>
            <li>Small phone screenshots and anything upscaled.</li>
          </ul>
          <p className="mt-5 text-sm text-muted sm:text-base" data-reveal>
            The orbit is about ±23° horizontally and ±13° vertically — the honest ceiling of depth
            from one image. Drag to the edge of that cone and you&apos;ll see a thin stretch at the
            silhouette; that&apos;s the height-field, not a bug.
          </p>
        </div>
      </section>

      {/* ──────────────────────── DATA FLOW ────────────────────────── */}
      <section className="border-b border-foreground/10 bg-background">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
          <Heading title="Made in your browser — what that actually means">
            <p>
              Your photo stays in your browser. On the Free plan the intermediate numbers from the
              depth model — activations, not the photo — go to our server for one step, and that
              step is what we count as a free generation. On Pro that step runs on your device
              too, so depth generation works offline after the first model download (about 50
              MB). Publishing uploads the finished scene — image, depth, mask, backdrop — to our
              storage, and it becomes public at its share link. GIFs and stickers never leave your
              browser at all.
            </p>
            <p className="mt-3">
              The exact account is in the{" "}
              <Link href="/privacy" className={inlineLink}>
                privacy policy
              </Link>
              , and the code is{" "}
              <a href={GITHUB_URL} className={inlineLink} rel="noopener" target="_blank">
                source on GitHub
              </a>
              .
            </p>
          </Heading>
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
              Free is {FREE_GENERATION_LIMIT} lifetime 3D generations, unlimited publishing and
              embeds, and a Gifsy badge on embeds. Pro is {PLAN_DISPLAY.pro.price} one time — it
              never renews — for unlimited generations, no badge, commercial use, and the depth
              model running fully on your device. No credits and no monthly plan: the model
              running in your browser is what makes a one-time price possible. GIFs and stickers
              stay free and unlimited with no account.
            </p>
            <p className="mt-2 text-xs text-muted">
              {REFUND_WINDOW_DAYS}-day no-questions refund; payments handled by Dodo Payments as
              merchant of record.{" "}
              <Link href="/pricing" className="underline underline-offset-2">
                Compare Free and Pro
              </Link>{" "}
              ·{" "}
              <Link href="/refund" className="underline underline-offset-2">
                refund policy
              </Link>
            </p>
          </div>
          <div data-reveal style={{ "--reveal-delay": "120ms" } as CSSProperties}>
            <PlanCards next="/#plans" freeHref="#top" />
          </div>
        </div>
      </section>

      {/* ──────────────────────── WHO BUILT THIS ───────────────────── */}
      <section className="border-b border-foreground/10 bg-background">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
          <Heading title="Who built this">
            <p>
              We built Gifsy because every hero image on our own sites was flat. The first build
              ran the depth model on a server; moving the 44 MB encoder into the browser — cached
              after the first run — is what made a {PLAN_DISPLAY.pro.price} one-time price possible
              instead of credits. The viewer is plain Three.js: the AI runs once, then it&apos;s
              graphics. Gifsy is made in India by{" "}
              {FOUNDERS.map((f, i) => (
                <span key={f.x}>
                  {i > 0 && " and "}
                  <a href={f.x} className={inlineLink} rel="me noopener" target="_blank">
                    {f.name}
                  </a>
                </span>
              ))}
              .{" "}
              <Link href="/about" className={inlineLink}>
                About Gifsy →
              </Link>
            </p>
          </Heading>
        </div>
      </section>

      {/* ─────────────────────────── FAQ ───────────────────────────── */}
      <section className="bg-panel">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
          <Heading title="Questions people ask before they try it" />
          <div className="mt-8 space-y-7">
            {HOME_FAQ.map((f, i) => (
              <div key={f.q} data-reveal style={{ "--reveal-delay": `${Math.min(i, 4) * 60}ms` } as CSSProperties}>
                <h3 className="font-display text-base text-foreground">{f.q}</h3>
                <p className="mt-1.5 text-sm text-muted sm:text-base">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter note="Made in your browser · your photo is only uploaded when you publish" />
    </main>
  );
}

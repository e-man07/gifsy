// /guides/3d-photo-webflow — spoke 2 of the guides cluster (docs/seo/runs/11).
//
// Hands-on verified 2026-09-17 in a free Starter workspace + Starter site
// (test site: gifsy-embed-test.webflow.io): the element is "Code Embed", it
// is LOCKED on a free site (tooltip: "This element requires a paid site or
// account plan"), the star badge opens the site's Plans page, and the
// free-plan route is the Background Video element with Gifsy's WebM export —
// which Webflow transcodes to MP4 and which renders behind a section
// background unless the element gets its own z-index. Plan names/prices are
// from the Plans page shown to that account on that day.

import Link from "next/link";
import { ArticleLayout, H2 } from "@/components/article/ArticleLayout";
import { Figure } from "@/components/article/Figure";
import { findArticle } from "@/lib/articles";
import { FREE_GENERATION_LIMIT, PLAN_DISPLAY } from "@/lib/billing/plans";
import { faqPageNode, howToNode, type Faq } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

const article = findArticle("guides", "3d-photo-webflow")!;

export const metadata = pageMetadata({
  path: "/guides/3d-photo-webflow",
  title: article.shortTitle!,
  ogTitle: article.title,
  description: article.description,
});

const STEPS = [
  { name: "Make the 3D photo", text: "Upload one photo at gifsy.fun/create, generate, and click Publish." },
  { name: "Copy the embed snippet", text: "One iframe, copied from the publish panel." },
  { name: "Add a Code Embed in Webflow", text: "Add panel → Elements → search \"embed\" → Code Embed → paste → Save & Close. Needs a paid site or workspace plan." },
  { name: "Make it responsive", text: "Width 100% and an aspect ratio on a wrapper, instead of the fixed 500 px height." },
  { name: "Publish and check on a phone", text: "Drag sideways to orbit; swipe to scroll." },
];

const RESPONSIVE = `<style>
  .g3d { position: relative; width: 100%; aspect-ratio: 4 / 3; }
  .g3d iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
  @media (max-width: 767px) { .g3d { aspect-ratio: 4 / 5; } }
</style>
<div class="g3d">
  <iframe src="https://www.gifsy.fun/embed/<id>" title="Interactive 3D photo: …" loading="lazy"></iframe>
</div>`;

const TOC = [
  { id: "quick", title: "Quick answer: the 5 steps" },
  { id: "need", title: "What you need" },
  { id: "step1", title: "Step 1 — Make the photo, copy the code" },
  { id: "step2", title: "Step 2 — The Code Embed element" },
  { id: "free", title: "On the free plan: Background Video" },
  { id: "step3", title: "Step 3 — Make it responsive" },
  { id: "hero", title: "Using it as a hero" },
  { id: "performance", title: "Performance" },
  { id: "motion", title: "Reduced motion" },
  { id: "other", title: "The other ways to do it" },
  { id: "troubleshooting", title: "Troubleshooting" },
  { id: "faq", title: "FAQ" },
];

const FAQ: Faq[] = [
  {
    q: "Can I add an interactive image to Webflow on the free plan?",
    a: "Not the live, draggable version: on a free Starter site the Code Embed element is greyed out in the Add panel and can't even be dragged onto the canvas — Webflow's tooltip says it requires a paid site or account plan. What you can do on the free plan is show the same scene as a looping clip: export a WebM from Gifsy and drop it into Webflow's Background Video element, which is free.",
  },
  {
    q: "Does Webflow support 3D images natively?",
    a: "Webflow has 3D transforms and Interactions that can tilt separately cut layers, and it can host a model viewer. It cannot estimate depth from a single photo; that is what the Gifsy scene does before it reaches Webflow.",
  },
  {
    q: "How do I make an iframe responsive in Webflow?",
    a: "Wrap it in a Div Block with width 100% and an aspect ratio, and give the iframe position absolute, inset 0, width and height 100%. Set a different aspect ratio on the tablet and phone breakpoints so a landscape scene doesn't become a sliver on a phone.",
  },
  {
    q: "Will an embedded 3D photo slow down my Webflow site?",
    a: "The frame loads one WebP image, a small depth map, an optional mask and backdrop, and the viewer script — all edge-cached, no video, no AI. With loading=\"lazy\" nothing loads until the visitor scrolls near it. Drop lazy loading only for a hero.",
  },
  {
    q: "Does it work on mobile and touch?",
    a: "Yes. A finger drag orbits the scene sideways; a vertical swipe scrolls the page as normal. The viewer does not use the gyroscope.",
  },
  {
    q: "Can I use it in a Webflow CMS Collection page?",
    a: "Yes. Put the Code Embed in the Collection page template, click Edit code, place the cursor inside the iframe's src where the scene id goes, click the purple dot on that line to open the connect menu, and pick a plain-text CMS field that holds each item's Gifsy scene id. Save & Close. The embed has to be inside a Collection list or on a Collection page for the field to appear.",
  },
  {
    q: "Can I remove the \"Made with Gifsy\" badge?",
    a: `Yes, with Pro — ${PLAN_DISPLAY.pro.price} one-time, no subscription — which also includes commercial use for client sites. Free scenes keep the small badge inside the frame.`,
  },
  {
    q: "Is this the same as Webflow's parallax on scroll?",
    a: "No. Scroll parallax moves whole elements at different speeds as the page scrolls. A 3D photo has per-pixel depth estimated from one photo, and the visitor orbits it by dragging — the subject separates from its own background.",
  },
];

export default function WebflowGuide() {
  return (
    <ArticleLayout
      article={article}
      toc={TOC}
      extraGraph={[
        howToNode({
          name: "How to add an interactive 3D photo to Webflow",
          description: "Publish a 3D photo on Gifsy and place it in Webflow with the Code Embed element, sized with an aspect ratio.",
          steps: STEPS,
        }),
        faqPageNode(FAQ),
      ]}
    >
      <p className="lede">
        Every &ldquo;interactive image Webflow&rdquo; tutorial starts the same way: cut your
        photo into Photoshop layers, then build an Interactions rig that tilts them with the
        cursor. This guide skips both. You start from one photo, Gifsy estimates the depth and
        cuts the subject out, and Webflow gets a single Code Embed element. About ten minutes,
        no code beyond one iframe — and it is a photo, not a 3D model, so nothing needs
        modelling. One thing to know before you start: Code Embed is a paid-plan element; on a
        free site the route is a looping video instead (covered below).
        This is the Webflow chapter of the{" "}
        <Link href="/guides/interactive-3d-photos-for-websites">guide to interactive 3D photos for websites</Link>;
        the platform-agnostic version is the{" "}
        <Link href="/guides/embed-3d-photo-on-website">full iframe embed guide</Link>.
      </p>

      <H2 id="quick">Quick answer: the 5 steps</H2>
      <ol>
        {STEPS.map((s) => (
          <li key={s.name}>
            <strong>{s.name}.</strong> {s.text}
          </li>
        ))}
      </ol>

      <H2 id="need">What you need</H2>
      <ul>
        <li>
          <strong>A Webflow site on a paid plan — or a paid Workspace.</strong> Checked on a free
          Starter workspace on 17 September 2026: the Code Embed element is greyed out in the
          Add panel with the tooltip &ldquo;This element requires a paid site or account plan.
          Click the star icon to upgrade your plan.&rdquo; It can&apos;t be dragged onto the
          canvas at all. Clicking the star opens the site&apos;s Plans page, which listed
          <strong> Basic at $15/month</strong> and <strong>Premium at $25/month</strong> (both
          billed yearly) as the paid Site plans; the Workspace plans page listed{" "}
          <strong>Core at $19/month</strong> and <strong>Growth at $49/month</strong> with
          &ldquo;custom code on staged sites&rdquo;, so a paid Workspace also unlocks it on a{" "}
          <code>.webflow.io</code> staging site without a Site plan. Prices change; the lock does
          not.
          <Figure
            src="/guides/webflow-code-embed-locked.webp"
            alt="Webflow Add panel with 'embed' searched: the Code Embed tile is greyed out with an upgrade star and the tooltip 'This element requires a paid site or account plan. Click the star icon to upgrade your plan.'"
            caption="The Add panel on a free Starter site (19 September 2026). Code Embed is greyed out; hovering shows the plan tooltip."
            width={600}
            height={470}
          />
        </li>
        <li>
          <strong>A photo with one clear subject</strong>, at least 640 px on the long edge, with
          some background behind it. Frame-filling subjects and busy backgrounds separate poorly.
        </li>
        <li>
          <strong>A published Gifsy scene.</strong> Free gives {FREE_GENERATION_LIMIT} lifetime
          generations with a small badge on embeds; Pro is {PLAN_DISPLAY.pro.price} one-time, no
          badge, commercial use.
        </li>
      </ul>

      <H2 id="step1">Step 1 — Make the 3D photo and copy the embed code</H2>
      <p>
        Upload at <Link href="/create">gifsy.fun/create</Link>. Choose whether to keep the
        background or float the cut-out on transparency, adjust the depth if you like, and click
        Publish. The publish panel copies exactly this:
      </p>
      <pre className="overflow-x-auto rounded-xl bg-ink p-4 text-xs leading-relaxed text-cloud sm:text-sm"><code>{'<iframe src="https://www.gifsy.fun/embed/<id>" style="width:100%;height:500px;border:0" loading="lazy"></iframe>'}</code></pre>
      <ul>
        <li><code>src</code> — the bare viewer page for your scene. No chrome.</li>
        <li><code>style</code> — full width, a fixed 500 px tall. We replace the fixed height in step 3.</li>
        <li><code>loading=&quot;lazy&quot;</code> — defers loading until the visitor scrolls near. <strong>Remove it for a hero.</strong></li>
      </ul>
      <p>
        Add a <code>title=&quot;Interactive 3D photo of …&quot;</code> for screen readers. The copied
        snippet doesn&apos;t include one yet.
      </p>

      <H2 id="step2">Step 2 — Add a Code Embed in the Webflow Designer</H2>
      <ol>
        <li>Open the page. Open the Add panel (the <strong>+</strong> top-left, or ⌘/Ctrl + E).</li>
        <li>
          Type &ldquo;embed&rdquo; in the search box, or scroll to <strong>Advanced</strong>. The
          element is called <strong>Code Embed</strong> (icon: <code>&lt;/&gt;</code>). Click it to
          insert it into the selected element, or drag it into the Section or Container where the
          scene should sit.
        </li>
        <li>The <strong>Edit code</strong> modal opens (it also opens from the element&apos;s settings). Paste the iframe. Click <strong>Save &amp; Close</strong>.</li>
      </ol>
      <p>
        Webflow&apos;s own note applies here: scripts inside a Code Embed don&apos;t fully render
        until you publish, so preview on the staging address to see the scene running. The
        element takes up to 50,000 characters; the snippet is about 120.
      </p>
      <h3>Code Embed vs Page or Site custom code</h3>
      <p>
        Use the <em>element</em>: it has a position in the page flow. Page settings → Custom code
        → &ldquo;Before &lt;/body&gt;&rdquo; is for scripts, and an iframe pasted there has no
        layout position. Never paste it into Site settings custom code. The 50,000-character
        limit on Code Embeds is irrelevant here — the snippet is about 120 characters.
      </p>

      <H2 id="step3">Step 3 — Make it responsive (aspect ratio, not fixed height)</H2>
      <p>
        A fixed 500 px looks fine on a laptop and crops badly on a phone. Wrap the iframe and
        size the wrapper by aspect ratio instead. Paste this whole block into the Code Embed:
      </p>
      <pre className="overflow-x-auto rounded-xl bg-ink p-4 text-xs leading-relaxed text-cloud sm:text-sm"><code>{RESPONSIVE}</code></pre>
      <p>
        Match the ratio to the photo — 4/3 or 16/9 for landscape scenes, 3/4 for portrait — and
        change it at the phone breakpoint so the subject isn&apos;t a sliver. If you would rather do
        it in the Style panel: wrapper Div Block <code>position: relative</code> with an aspect
        ratio, iframe <code>position: absolute</code>, top/left 0, width and height 100%. On
        older builds without an aspect-ratio field, the classic trick is a wrapper with{" "}
        <code>height: 0; padding-top: 75%</code> (4/3) or <code>56.25%</code> (16/9).
      </p>

      <H2 id="free">On the free plan: the same scene as a looping video</H2>
      <p>
        If you&apos;re on a Starter site and not ready to pay, you can still show the scene —
        just not the draggable version. Export a <strong>WebM</strong> clip of the orbit from the
        Gifsy workshop and use Webflow&apos;s <strong>Background Video</strong> element, which is
        available on the free plan. We built a studio-portfolio demo this way on a Starter site
        from a free marketplace template, swapping every image for a Gifsy render and no custom
        code:{" "}
        <a href="https://fig-form.webflow.io/" rel="noopener" target="_blank">fig-form.webflow.io</a>
        .
      </p>
      <ol>
        <li>In Gifsy, open your scene and export <strong>WebM</strong> (GIF works too, via an Image element, but it&apos;s heavier).</li>
        <li>Add panel → search &ldquo;video&rdquo; → <strong>Background Video</strong> (under Media). Click it to insert into the selected container.</li>
        <li>In the Background Video settings, click <strong>Upload video</strong>. Accepted: <strong>webm, mp4, mov, ogg, under 30 MB</strong>. Leave <strong>Loop video</strong> and <strong>Autoplay video</strong> on; turn off &ldquo;Include play/pause button&rdquo; if you don&apos;t want the round icon.</li>
        <li>Give the element a <strong>height</strong> in the Style panel (it has no intrinsic height — inside a grid it collapses to nothing). 320 px worked for a card; a hero wants a vh value (ours is 85vh).</li>
      </ol>
      <p>
        Webflow re-encodes the upload to MP4 and WebM at 720 px tall (a 1600×1000 source became
        1152×720), so anything sharper than that is wasted bytes; 1–3 MB opaque H.264 uploads
        looked identical after transcoding. Two things to know: Webflow auto-generates the
        poster from frame 0 and it comes back a shade greyer than the video (a pure-white
        background turned into a light-grey box until autoplay started), and Background Videos
        below the fold don&apos;t play until they scroll into view. Transparency doesn&apos;t survive
        the transcode, so export the scene on the same colour as your section rather than on
        alpha.
      </p>
      <Figure
        src="/guides/webflow-background-video-settings.webp"
        alt="Webflow Designer with a Background Video element selected in the hero; the Settings panel shows Replace video, the uploaded char-pink-1600x1000-white.mp4 at 625 KB, Loop video and Autoplay video checked, and Include play/pause button unchecked"
        caption="Background Video settings on the free-plan demo site: the upload, Loop and Autoplay on, the play/pause button off. The element itself has an explicit height and z-index 1 in the Style panel."
        width={1240}
        height={800}
      />
      <p>Two things we hit that no tutorial mentions:</p>
      <ul>
        <li>
          <strong>Webflow transcodes the upload.</strong> WebM or MP4 in, MP4 + WebM out at 720 px
          tall, served from Webflow&apos;s CDN — fine for playback, but don&apos;t expect the exact
          file you uploaded.
        </li>
        <li>
          <strong>The video can be invisible on a coloured section.</strong> Webflow&apos;s
          Background Video puts the <code>&lt;video&gt;</code> at <code>z-index: -100</code>. If
          the element itself has no z-index, the section&apos;s background colour paints over
          the video and you get a blank box with a pause button — in the Designer and live. Fix:
          select the Background Video, Style panel → Position → set <strong>z-index to 1</strong>.
          The frame appears immediately.
        </li>
      </ul>

      <H2 id="hero">Using it as a hero image</H2>
      <ul>
        <li>Hero section <code>position: relative</code>, a min-height of around 80vh.</li>
        <li>Code Embed absolute, full-bleed, <code>z-index: 0</code>.</li>
        <li>Headline and CTA in a wrapper at <code>z-index: 1</code> with <code>pointer-events: none</code>, and <code>pointer-events: auto</code> back on the button — otherwise the copy blocks the drag.</li>
        <li><strong>Drop <code>loading=&quot;lazy&quot;</code></strong> — lazy loading is for frames below the viewport.</li>
        <li>Keep the copy off the subject: left-aligned text over a subject that sits right of centre, or the reverse.</li>
      </ul>

      <H2 id="performance">Performance — what the iframe actually loads</H2>
      <p>
        A server-rendered poster so something paints at once; a 1 KB manifest; the colour image
        as WebP (1440 px long edge, typically 150–350 KB); a lossless PNG depth map (tens of KB);
        the subject mask and inpainted backdrop when there is a subject; and the viewer script.
        All of it is edge-cached with a one-year immutable header. No video bytes, and the
        visitor never downloads an AI model — that ran once, when the scene was made. The scene
        runs in its own document, so it can&apos;t collide with your Webflow CSS.
      </p>

      <H2 id="motion">Respect reduced motion (and a static fallback)</H2>
      <p>
        The scene auto-orbits gently until the first pointer move — unless the visitor&apos;s
        OS has <code>prefers-reduced-motion</code> on, in which case the viewer holds still and
        only moves under their own drag. On a copy-heavy page you can go further with the
        host-side fallback from the{" "}
        <Link href="/guides/embed-3d-photo-on-website#a11y">embed guide</Link>: hide the frame and
        show the scene&apos;s still image when the OS asks for less motion.
      </p>

      <H2 id="other">The other ways to get an interactive image in Webflow</H2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Method</th>
              <th>Needs</th>
              <th>Interactive how</th>
              <th>Best for</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Interactions &ldquo;mouse move&rdquo; + PNG layers</td><td>Cutting layers per photo in Photoshop or GIMP</td><td>Tilts with the cursor; no touch drag</td><td>You already have layered art and want zero third-party code</td></tr>
            <tr><td>Webflow 2.5D with 3D transforms</td><td>Separated layers</td><td>Static unless you add Interactions</td><td>Illustration and UI compositions</td></tr>
            <tr><td>Spline, model-viewer, Vectary</td><td>An actual 3D model; some are paid</td><td>Orbit a real mesh</td><td>Products and objects, not photos</td></tr>
            <tr><td>Gifsy embed (Code Embed, paid plan)</td><td>One photo</td><td>Grab-to-orbit about ±23°, touch included</td><td>Portraits, hero photos, portfolio stills</td></tr>
            <tr><td>Gifsy WebM in Background Video (free plan)</td><td>One photo</td><td>Loops; not interactive</td><td>The same scene on a Starter site</td></tr>
          </tbody>
        </table>
      </div>
      <p>To be fair to the first row: Interactions come with any paid plan and keep everything first-party.</p>

      <H2 id="troubleshooting">Troubleshooting</H2>
      <h3>The Code Embed is greyed out and won&apos;t drag</h3>
      <p>The plan gate. On a free site it can&apos;t be added at all; the star badge on the tile opens the Plans page. Use the Background Video route above, or upgrade the site or workspace.</p>
      <h3>The Embed shows a placeholder in the Designer</h3>
      <p>Normal. Publish, or open the staging address.</p>
      <h3>A Background Video is a blank box with a pause button</h3>
      <p>Give the element a z-index (Style → Position → z-index 1) and a height. See the free-plan section.</p>
      <h3>It is a fixed 500 px and crops on mobile</h3>
      <p>Step 3 — size by aspect ratio and change it at the phone breakpoint.</p>
      <h3>I can&apos;t drag it — the hero text is in the way</h3>
      <p><code>pointer-events: none</code> on the text wrapper, <code>auto</code> on the button.</p>
      <h3>&ldquo;Refused to frame&rdquo; in the console</h3>
      <p>Your page&apos;s own Content-Security-Policy. Gifsy sets no framing restriction; add gifsy.fun to your <code>frame-src</code>.</p>
      <h3>The page feels slow</h3>
      <p>Lazy-load everything below the fold, keep one scene per screenful, and measure the transfer in DevTools.</p>

      <H2 id="faq">FAQ</H2>
      {FAQ.map((f) => (
        <div key={f.q}>
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}

      <hr />
      <p>
        <Link href="/create">Make a 3D photo from your own image</Link>. Related: the{" "}
        <Link href="/guides/embed-3d-photo-on-website">full iframe embed guide</Link> and{" "}
        <Link href="/guides/3d-photo-framer">the Framer version of this guide</Link>.
      </p>
    </ArticleLayout>
  );
}

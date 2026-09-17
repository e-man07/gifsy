// /guides/3d-photo-webflow — spoke 2 of the guides cluster (docs/seo/runs/11).
// The Webflow plan gate could not be verified by our tooling on 2026-09-17
// (help.webflow.com and webflow.com/pricing both refused the fetch), so the
// plan callout is worded as "check your plan" rather than quoting tiers.

import Link from "next/link";
import { ArticleLayout, H2 } from "@/components/article/ArticleLayout";
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
  { name: "Add an Embed element in Webflow", text: "Add panel → Components → Embed → paste → Save & Close." },
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
  { id: "step2", title: "Step 2 — The Embed element" },
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
    a: "You can add the Embed element in the Designer and preview it on your webflow.io staging address on any plan. Publishing custom code to a custom domain needs a paid Site plan — check Webflow's current pricing page for the exact tier before you commit a client to it.",
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
    a: "Yes. Put the Embed element in the Collection page template and insert a CMS field for the scene id inside the iframe's src — Webflow lets you add fields inside an Embed. Store each item's Gifsy scene id in a plain-text field.",
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
          description: "Publish a 3D photo on Gifsy and place it in Webflow with the Embed element, sized with an aspect ratio.",
          steps: STEPS,
        }),
        faqPageNode(FAQ),
      ]}
    >
      <p className="lede">
        Every &ldquo;interactive image Webflow&rdquo; tutorial starts the same way: cut your
        photo into Photoshop layers, then build an Interactions rig that tilts them with the
        cursor. This guide skips both. You start from one photo, Gifsy estimates the depth and
        cuts the subject out, and Webflow gets a single Embed element. About ten minutes, no
        code beyond one iframe — and it is a photo, not a 3D model, so nothing needs modelling.
        For the wider picture, see the{" "}
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
          <strong>A Webflow site where custom code publishes.</strong> The Embed element works in
          the Designer and on your <code>.webflow.io</code> staging address on every plan; publishing
          it to a custom domain needs a paid Site plan. We could not verify the exact tier names on
          the day this was written — check webflow.com/pricing before promising a client.
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

      <H2 id="step2">Step 2 — Add an Embed element in the Webflow Designer</H2>
      <ol>
        <li>Open the page. Open the Add panel (the <strong>+</strong> top-left, or ⌘/Ctrl + E).</li>
        <li>Scroll to <strong>Components</strong> and drag <strong>Embed</strong> into the Section or Container where the scene should sit.</li>
        <li>The <strong>Edit Code</strong> modal opens (it also opens from the element&apos;s settings gear). Paste the iframe. Click <strong>Save &amp; Close</strong>.</li>
      </ol>
      <p>
        The Designer may show a &ldquo;Custom code&rdquo; placeholder rather than the live scene;
        publish, or open the staging address, to see it running.
      </p>
      <h3>Embed element vs Page or Site custom code</h3>
      <p>
        Use the <em>element</em>: it has a position in the page flow. Page settings → Custom code
        → &ldquo;Before &lt;/body&gt;&rdquo; is for scripts, and an iframe pasted there has no
        layout position. Never paste it into Site settings custom code. The 50,000-character
        limit on Embed elements is irrelevant here — the snippet is about 120 characters.
      </p>

      <H2 id="step3">Step 3 — Make it responsive (aspect ratio, not fixed height)</H2>
      <p>
        A fixed 500 px looks fine on a laptop and crops badly on a phone. Wrap the iframe and
        size the wrapper by aspect ratio instead. Paste this whole block into the Embed element:
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

      <H2 id="hero">Using it as a hero image</H2>
      <ul>
        <li>Hero section <code>position: relative</code>, a min-height of around 80vh.</li>
        <li>Embed element absolute, full-bleed, <code>z-index: 0</code>.</li>
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
        The scene auto-orbits gently until the first pointer move. The viewer does not yet read
        the visitor&apos;s <code>prefers-reduced-motion</code> setting, so on a copy-heavy page
        either pick a subtler motion at creation or add the host-side fallback from the{" "}
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
            <tr><td>Gifsy embed</td><td>One photo</td><td>Grab-to-orbit about ±23°, touch included</td><td>Portraits, hero photos, portfolio stills</td></tr>
          </tbody>
        </table>
      </div>
      <p>To be fair to the first row: Interactions come with any paid plan and keep everything first-party.</p>

      <H2 id="troubleshooting">Troubleshooting</H2>
      <h3>The Embed shows a placeholder in the Designer</h3>
      <p>Normal. Publish, or open the staging address.</p>
      <h3>Nothing renders on my custom domain</h3>
      <p>The plan gate. Custom code needs a paid Site plan to publish to a custom domain.</p>
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

// /guides/embed-3d-photo-on-website — the iframe reference guide and the
// connective centre of the guides cluster (docs/seo/runs/12). Product facts
// verified in the repo: the copied snippet is exactly EMBED, the iframe loads
// a server-rendered poster + scene.json + image/depth/mask/background + a
// Three.js viewer, assets are edge-cached and CORS-open, no frame-ancestors
// restriction is set, the viewer handles touch but not prefers-reduced-motion,
// and the root layout's analytics scripts load on /embed too.

import Link from "next/link";
import { ArticleLayout, H2 } from "@/components/article/ArticleLayout";
import { findArticle } from "@/lib/articles";
import { PLAN_DISPLAY } from "@/lib/billing/plans";
import { faqPageNode, howToNode, type Faq } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

const article = findArticle("guides", "embed-3d-photo-on-website")!;

export const metadata = pageMetadata({
  path: "/guides/embed-3d-photo-on-website",
  title: article.shortTitle!,
  ogTitle: article.title,
  description: article.description,
});

const SNIPPET =
  '<iframe src="https://www.gifsy.fun/embed/<id>" style="width:100%;height:500px;border:0" loading="lazy"></iframe>';

const FULL_SNIPPET = `<div style="aspect-ratio:4/3;max-width:960px">
  <iframe
    src="https://www.gifsy.fun/embed/<id>"
    title="Interactive 3D photo: describe the picture"
    loading="lazy"
    style="width:100%;height:100%;border:0"
  ></iframe>
</div>`;

const FALLBACK = `<style>
  .g3d-fallback { display: none; }
  @media (prefers-reduced-motion: reduce) {
    .g3d { display: none; }
    .g3d-fallback { display: block; }
  }
</style>
<div class="g3d"><iframe src="https://www.gifsy.fun/embed/<id>" …></iframe></div>
<img class="g3d-fallback" src="https://www.gifsy.fun/api/asset/<id>/image" alt="…">`;

const STEPS = [
  { name: "Make and publish the 3D photo", text: "Upload one photo at gifsy.fun/create, generate, and click Publish. You get a share page and an embed snippet." },
  { name: "Copy the iframe", text: "From the publish panel, or from the share page under the scene." },
  { name: "Paste it and set a height", text: "Into your site's HTML or embed element. Give it a fixed height or an aspect-ratio wrapper." },
];

const TOC = [
  { id: "quick", title: "Quick answer: the snippet" },
  { id: "attributes", title: "Every attribute, explained" },
  { id: "why-iframe", title: "Why an iframe" },
  { id: "performance", title: "Does it slow my page?" },
  { id: "platforms", title: "Platform by platform" },
  { id: "a11y", title: "Accessibility and reduced motion" },
  { id: "troubleshooting", title: "Troubleshooting" },
  { id: "badge", title: "The Free-plan badge" },
  { id: "faq", title: "FAQ" },
];

const FAQ: Faq[] = [
  {
    q: "Can I embed a 3D photo on my website without any code?",
    a: "Yes. Paste the iframe into your builder's embed element — Webflow's Code Embed (paid plans only), Framer's Embed, a Squarespace Code block, WordPress's Custom HTML block, Wix's Embed HTML, Carrd's Embed — or paste the plain URL into Notion. The only thing you type is a height.",
  },
  {
    q: "Does the iframe slow my site down?",
    a: "The frame loads one WebP image, a small PNG depth map, an optional mask and backdrop, a 1 KB manifest and the viewer script, all from an edge cache with a year-long immutable cache header. With loading=\"lazy\" none of it is fetched until the frame is near the viewport. There is no video and no AI runs for the visitor.",
  },
  {
    q: "Does it work on phones?",
    a: "Yes. Drag sideways to orbit; swipe up or down to keep scrolling the page. It needs WebGL, which every modern mobile browser has.",
  },
  {
    q: "Do I need a portrait-mode or depth photo?",
    a: "No. Depth is estimated from an ordinary photo when you create the scene. The viewer only ever loads the finished files.",
  },
  {
    q: "Why is my embed blank?",
    a: "Almost always one of four things: the iframe's height collapsed (a percentage height inside an unsized parent), a sandbox attribute without allow-scripts and allow-same-origin, the host page's Content-Security-Policy not allowing frames from gifsy.fun, or WebGL turned off in the browser. The troubleshooting table covers each.",
  },
  {
    q: "Can I use it on a client's commercial site?",
    a: `Pro (${PLAN_DISPLAY.pro.price} one-time) includes commercial use and removes the badge. Free scenes are for personal use and carry the "Made with Gifsy" mark inside the frame.`,
  },
  {
    q: "Is it a video?",
    a: "No — it is a live WebGL scene the visitor can drag. That is why it can't go in an email or an Instagram post; for those, export a GIF or WebM from the same scene and use that instead.",
  },
  {
    q: "What does the visitor's browser send to Gifsy?",
    a: "Requests for the scene's files, and the same page-view analytics the rest of gifsy.fun loads. Nothing is uploaded from the visitor's device and no AI runs in the viewer.",
  },
];

export default function EmbedGuide() {
  return (
    <ArticleLayout
      article={article}
      toc={TOC}
      extraGraph={[
        howToNode({
          name: "How to embed a 3D photo on a website",
          description: "Publish a 3D photo on Gifsy, copy the iframe, paste it into any page that accepts HTML.",
          steps: STEPS,
        }),
        faqPageNode(FAQ),
      ]}
    >
      <p className="lede">
        To embed a 3D photo on a website you need one photo, a published Gifsy scene, and an{" "}
        <code>&lt;iframe&gt;</code>. The scene runs live in the frame — the visitor can drag it —
        and the snippet below works on any page that accepts HTML, from a hand-written site to
        Webflow, Framer, Squarespace, WordPress, Wix, Carrd, Notion and Shopify.
      </p>

      <H2 id="quick">Quick answer: the universal embed snippet</H2>
      <ol>
        {STEPS.map((s) => (
          <li key={s.name}>
            <strong>{s.name}.</strong> {s.text}
          </li>
        ))}
      </ol>
      <p>This is exactly what the publish panel copies:</p>
      <pre className="overflow-x-auto rounded-xl bg-ink p-4 text-xs leading-relaxed text-cloud sm:text-sm"><code>{SNIPPET}</code></pre>
      <p>
        And this is the version we recommend once it is in place — a sized wrapper instead of a
        fixed height, and a <code>title</code> for screen readers:
      </p>
      <pre className="overflow-x-auto rounded-xl bg-ink p-4 text-xs leading-relaxed text-cloud sm:text-sm"><code>{FULL_SNIPPET}</code></pre>

      <H2 id="attributes">Every attribute, explained</H2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Attribute</th>
              <th>What it does</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>src</code></td>
              <td>The bare viewer page, <code>/embed/&lt;id&gt;</code>. No chrome, no nav.</td>
              <td>Use <code>/s/&lt;id&gt;</code> for a share link, never inside an iframe — it has page chrome.</td>
            </tr>
            <tr>
              <td>width / height</td>
              <td>The viewer fills whatever box you give it.</td>
              <td>A percentage height needs a sized parent or it collapses to nothing. The copied 500 px is a safe fixed fallback; an <code>aspect-ratio</code> wrapper (4/3 landscape, 3/4 portrait, 16/9 hero) is better.</td>
            </tr>
            <tr>
              <td><code>loading=&quot;lazy&quot;</code></td>
              <td>Defers the frame until it is near the viewport.</td>
              <td>Supported in all current browsers. <strong>Remove it for a hero</strong> above the fold, or the first paint waits.</td>
            </tr>
            <tr>
              <td><code>title</code></td>
              <td>What screen readers announce.</td>
              <td>Without it the frame is read as &ldquo;frame&rdquo;. Describe the photo. Not in the copied snippet today — add it yourself.</td>
            </tr>
            <tr>
              <td><code>style=&quot;border:0&quot;</code></td>
              <td>No frame border.</td>
              <td>Replaces the deprecated <code>frameborder</code>.</td>
            </tr>
            <tr>
              <td><code>allow</code></td>
              <td>Permission delegation.</td>
              <td><strong>Not needed.</strong> The viewer uses no gyroscope, camera or fullscreen API.</td>
            </tr>
            <tr>
              <td><code>sandbox</code></td>
              <td>Restricts the frame.</td>
              <td>Don&apos;t add it blindly: without <code>allow-scripts allow-same-origin</code> the WebGL viewer can&apos;t run and you get the poster only.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <H2 id="why-iframe">Why an iframe (and not a script tag)</H2>
      <p>
        Isolation. The Three.js viewer, its WebGL context and its styles live inside the frame,
        so nothing lands in your page bundle, your CSS can&apos;t leak into the scene and the
        scene can&apos;t leak into your layout. Your page stays static and cacheable. The cost is
        a fixed box: you size the frame, but you can&apos;t restyle what&apos;s inside it. For
        what the viewer actually draws, see{" "}
        <Link href="/guides/how-3d-photos-work">how 3D photos work</Link>.
      </p>

      <H2 id="performance">Does an embedded 3D photo slow my page?</H2>
      <p>The frame requests, in order:</p>
      <ul>
        <li>A small poster image, rendered into the frame&apos;s HTML on the server, so something paints immediately.</li>
        <li><code>scene.json</code> — about 1 KB of settings and asset paths.</li>
        <li>The colour image as WebP, long edge 1440 px — typically 150–350 KB.</li>
        <li>The depth map as a lossless PNG — tens of KB; it is smooth greyscale, so it compresses well.</li>
        <li>The subject mask (PNG) and the inpainted backdrop (WebP), when the scene has a subject.</li>
        <li>The viewer script, which bundles Three.js.</li>
      </ul>
      <p>
        Every asset is served through gifsy.fun with a one-year immutable cache header and an open
        CORS policy, so once one visitor in a region has loaded a scene, the next is served from
        the edge. There is no video, so no autoplay policy applies, and no AI model is downloaded —
        the depth estimation happened once, when the scene was made. Lazy-load anything below the
        fold, keep one scene per screenful, and measure the real transfer in DevTools for your own
        scene before you quote a number.
      </p>

      <H2 id="platforms">Platform by platform</H2>
      <p>Each one opens with the exact menu path, then the one thing that trips people up.</p>
      <h3>Webflow</h3>
      <p>
        Add panel → search &ldquo;embed&rdquo; → <strong>Code Embed</strong> → paste → Save &amp;
        Close. Set the wrapper&apos;s aspect ratio at each breakpoint. Gotcha: Code Embed is
        locked on a free Starter site (it won&apos;t even drag onto the canvas) — it needs a paid
        Site plan or a paid Workspace. On the free plan, show the scene as a WebM in a Background
        Video element instead. Full walkthrough, tested on a free account:{" "}
        <Link href="/guides/3d-photo-webflow">add a 3D photo to Webflow</Link>.
      </p>
      <h3>Framer</h3>
      <p>
        Insert → <strong>Embed</strong> → type HTML → paste. Size it with the frame like any
        other layer. Gotcha: Framer warns that some sites refuse to be framed — Gifsy allows it.
        Full walkthrough: <Link href="/guides/3d-photo-framer">3D photo in Framer</Link>.
      </p>
      <h3>Squarespace</h3>
      <p>
        Add a <strong>Code</strong> block (not the Embed block, which expects an oEmbed URL) →
        paste → leave &ldquo;Display source&rdquo; off. Gotcha: code blocks that run scripts or
        iframes are available on Squarespace&apos;s paid plans — check the current plan list
        before you rely on it.
      </p>
      <h3>WordPress</h3>
      <p>
        Block editor → <strong>Custom HTML</strong> block → paste. In Elementor, the HTML widget.
        Gotcha: authors and contributors without the <code>unfiltered_html</code> capability get
        the iframe stripped on save — paste as an administrator or editor.
      </p>
      <h3>Wix</h3>
      <p>
        Add Elements → Embed Code → <strong>Embed HTML</strong> → paste. Gotcha: Wix wraps your
        code in its own iframe and doesn&apos;t make it responsive, so set the Wix element to the
        aspect ratio you want and use <code>width:100%;height:100%</code> on the inner iframe.
        HTTPS only — Gifsy is.
      </p>
      <h3>Carrd</h3>
      <p>
        Add an <strong>Embed</strong> element → Code → paste, then set the element&apos;s height in
        pixels; Carrd&apos;s column handles the width. Embed elements are a paid Carrd feature.
      </p>
      <h3>Notion</h3>
      <p>
        Type <code>/embed</code> and paste the <strong>URL</strong> —{" "}
        <code>https://www.gifsy.fun/embed/&lt;id&gt;</code> — not the HTML. Notion refuses raw
        iframes and embeds URLs through its own service; it works on published public pages. Drag
        the handles to resize.
      </p>
      <h3>Shopify</h3>
      <p>
        Theme editor → Add section → <strong>Custom Liquid</strong> → paste, with an explicit
        height. Gotcha: iframes inside Custom Liquid <em>blocks</em> nested in other sections
        sometimes don&apos;t render; use a section.
      </p>
      <h3>Ghost, Substack, plain HTML</h3>
      <p>An HTML card, or anywhere HTML is allowed. Paste the snippet; that&apos;s all.</p>

      <H2 id="a11y">Accessibility and reduced motion</H2>
      <p>
        Give the iframe a <code>title</code> and put a caption next to it describing the photo —
        the canvas inside has no alt text. Orbit is pointer- and touch-driven today; there is no
        keyboard control.
      </p>
      <p>
        The scene auto-orbits gently until the visitor moves the pointer. The viewer does not
        yet read the operating system&apos;s <code>prefers-reduced-motion</code> setting, so if
        that matters on your page, do it host-side: hide the frame and show the scene&apos;s own
        still image instead.
      </p>
      <pre className="overflow-x-auto rounded-xl bg-ink p-4 text-xs leading-relaxed text-cloud sm:text-sm"><code>{FALLBACK}</code></pre>

      <H2 id="troubleshooting">Troubleshooting</H2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Symptom</th>
              <th>Cause</th>
              <th>Fix</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Blank frame</td><td>Height collapsed — a percentage height in an unsized parent</td><td>Fixed pixel height, or an <code>aspect-ratio</code> wrapper</td></tr>
            <tr><td>Poster shows, never moves</td><td>WebGL disabled, or <code>sandbox</code> without <code>allow-scripts allow-same-origin</code></td><td>Enable hardware acceleration; remove <code>sandbox</code></td></tr>
            <tr><td>&ldquo;Refused to frame&rdquo; in the console</td><td>The <em>host</em> page&apos;s Content-Security-Policy doesn&apos;t allow frames from gifsy.fun</td><td>Add <code>https://www.gifsy.fun</code> to the host&apos;s <code>frame-src</code>. Gifsy sets no framing restriction of its own.</td></tr>
            <tr><td>Mixed-content warning</td><td>Host page on http://, frame on https:// — allowed; the reverse can&apos;t happen</td><td>Serve the host over HTTPS. Wix and Notion require it.</td></tr>
            <tr><td>Iframe disappears on save</td><td>WordPress stripping HTML for non-admins; Notion wants a URL; some Shopify blocks</td><td>Paste as admin; use the URL; use a Custom Liquid section</td></tr>
            <tr><td>Hard to scroll past on a phone</td><td>Expected: horizontal drag orbits, vertical drag scrolls</td><td>Don&apos;t make a tall scene full-width on phones</td></tr>
            <tr><td>Cropped on Wix</td><td>Double iframe plus a fixed element size</td><td>Resize the Wix element; 100%/100% inside</td></tr>
            <tr><td>Scene returns 404</td><td>The owner removed it</td><td>Republish and paste the new id</td></tr>
          </tbody>
        </table>
      </div>

      <H2 id="badge">The &ldquo;Made with Gifsy&rdquo; badge (Free plan)</H2>
      <p>
        Free scenes show a small &ldquo;Made with Gifsy&rdquo; link at the bottom of the frame. It
        lives inside the iframe, so the host page can&apos;t edit it.{" "}
        <Link href="/pricing">Pro is {PLAN_DISPLAY.pro.price} one-time</Link> — it removes the badge
        and adds commercial use. If you want to credit Gifsy on your own page anyway, a plain
        text link is welcome and entirely optional.
      </p>

      <H2 id="faq">FAQ</H2>
      {FAQ.map((f) => (
        <div key={f.q}>
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}

      <hr />
      <p>
        <Link href="/create">Make a 3D photo from your own image</Link>, or read{" "}
        <Link href="/guides/how-3d-photos-work">how the depth, matte and planes actually work</Link>.
        Data flow, in full: the <Link href="/privacy">privacy policy</Link>.
      </p>
    </ArticleLayout>
  );
}

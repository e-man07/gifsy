// /guides/interactive-3d-photos-for-websites — the editorial hub of the
// guides cluster (docs/seo/runs/06). Pillar + chapters: each H2 opens with a
// snippet-able paragraph and hands off to its spoke. It deliberately does NOT
// repeat the spokes' depth (platform steps, model internals, competitor
// tables). Honesty rules from docs/seo/runs/_brief-context.md apply.

import Link from "next/link";
import { ArticleLayout, H2 } from "@/components/article/ArticleLayout";
import { findArticle } from "@/lib/articles";
import { FREE_GENERATION_LIMIT, PLAN_DISPLAY } from "@/lib/billing/plans";
import { faqPageNode, type Faq } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

const article = findArticle("guides", "interactive-3d-photos-for-websites")!;

export const metadata = pageMetadata({
  path: "/guides/interactive-3d-photos-for-websites",
  title: article.shortTitle!,
  ogTitle: article.title,
  description:
    "Turn one photo into a 3D scene visitors can drag, then embed it in Webflow, Framer, Squarespace or WordPress. How it works, what to shoot, what it costs.",
});

const TOC = [
  { id: "what", title: "What an interactive 3D photo is" },
  { id: "why", title: "Why interactive beats a 3D video" },
  { id: "how", title: "How it works in 60 seconds" },
  { id: "photos", title: "Which photos work" },
  { id: "platforms", title: "Adding one, platform by platform" },
  { id: "uses", title: "Use cases" },
  { id: "perf", title: "Performance and privacy" },
  { id: "costs", title: "What it costs" },
  { id: "faq", title: "FAQ" },
  { id: "next", title: "Resources and next steps" },
];

const FAQ: Faq[] = [
  {
    q: "Does an interactive 3D photo work on mobile?",
    a: "Yes. Inside the iframe a visitor drags with a finger to orbit and swipes vertically to keep scrolling the page. The viewer needs WebGL, which every modern phone browser has, and it downloads only images and a small renderer — no AI model.",
  },
  {
    q: "Does the iframe slow my site down?",
    a: "The frame loads one WebP image, a small PNG depth map, an optional mask and backdrop, a 1 KB manifest and the viewer script, from an edge cache with a year-long immutable header. With loading=\"lazy\" nothing is fetched until the frame is near the viewport. There is no video decoding and no AI runs for the visitor.",
  },
  {
    q: "Do I need portrait mode or a special depth photo?",
    a: "No. Depth is estimated from an ordinary JPG, PNG or WebP when you create the scene. Facebook's 2018 3D photos needed a dual-camera depth map; today's depth models don't.",
  },
  {
    q: "Can I use it commercially, on a client site?",
    a: `On Gifsy Pro, yes — commercial use is part of the ${PLAN_DISPLAY.pro.price} one-time purchase, along with removing the badge. Free scenes are for personal, non-commercial use and carry a small "Made with Gifsy" badge.`,
  },
  {
    q: "Does it work on Wix, Carrd or Notion?",
    a: "Anywhere that accepts an iframe or an HTML embed. Wix has an Embed HTML element, Carrd an Embed element (paid tier), and Notion takes the embed URL rather than the HTML. The embed guide has the exact menu path for each.",
  },
  {
    q: "What if my photo has a busy background?",
    a: "The subject matte may not separate cleanly, and the scene falls back to a depth-only view that reads as a gently warping sheet rather than a subject in front of a background. Pick a photo with one clear subject and some real depth behind it; the best-photos chapter below lists what fails.",
  },
  {
    q: "Can I remove the \"Made with Gifsy\" badge?",
    a: `Yes, with Pro — ${PLAN_DISPLAY.pro.price} one-time, no subscription. It also lifts the ${FREE_GENERATION_LIMIT}-generation limit and includes commercial use.`,
  },
  {
    q: "Is an interactive 3D photo a video?",
    a: "No. It is a live WebGL scene — two displaced planes drawn from an image, a depth map and a subject cut-out — that responds to the pointer. That is exactly why it can't go in an email or an Instagram post; for those you export a GIF or WebM of the same scene.",
  },
  {
    q: "Is it a 3D model I can rotate 360°?",
    a: "No. One photo only contains one side of anything, so the scene is a 2.5D height-field with a shallow orbit of about ±23°. If you need a mesh you can spin all the way round, that is a different product (Meshy, Tripo).",
  },
];

export default function HubGuide() {
  return (
    <ArticleLayout article={article} toc={TOC} extraGraph={[faqPageNode(FAQ)]}>
      <p className="lede">
        An interactive 3D photo is a single photo that a visitor can drag on your web page: the
        subject separates from its background and the view shifts with the pointer, so the
        picture reads as having depth. It is made from one ordinary photo, it embeds as one
        iframe, and — unlike the 3D photo videos most tools export — it stays live on the page.
      </p>
      <p>
        This is the guide to the whole topic: what the term means, why the interactive version
        is worth choosing over a video on a website, how it works, which photos to shoot, how to
        put one on Webflow, Framer, Squarespace, WordPress or anything else, and what it costs.
        Each chapter hands off to a deeper guide. Try one first — drag the scene below.
      </p>

      <div className="my-8 overflow-hidden rounded-xl bg-black" style={{ aspectRatio: "16 / 10" }}>
        <iframe
          src="/embed/03ed4c7605"
          title="Interactive 3D photo — drag to orbit"
          loading="lazy"
          className="h-full w-full border-0"
        />
      </div>

      <H2 id="what">What an interactive 3D photo is — and the three things people mean by &ldquo;3D photo&rdquo;</H2>
      <p>
        Search for &ldquo;3D photo&rdquo; and you will find three different products under one
        name. Knowing which one you want saves a lot of wrong turns.
      </p>
      <ul>
        <li>
          <strong>A 360° spin.</strong> Dozens of photos of a product on a turntable, stitched so
          you can rotate it. Real all-round geometry, but it needs a rig and a photographer, and it
          is a product-photography tool, not something you make from one picture.
        </li>
        <li>
          <strong>A 3D mesh.</strong> Tools like Meshy and Tripo generate a GLB or OBJ model from
          an image. You can rotate it fully or 3D-print it. The output is a model file that needs a
          heavyweight viewer; it is the right choice for objects, and the wrong one for a
          photograph.
        </li>
        <li>
          <strong>A depth-parallax photo</strong> — this guide. Software estimates a depth map from
          one photo, cuts the subject out, and moves the layers by different amounts as the view
          shifts. Facebook&apos;s 3D Photos, Apple&apos;s spatial scenes and Gifsy all work this way.
          The difference is where it lives: inside an app, or on your own web page.
        </li>
      </ul>
      <p>
        &ldquo;Interactive&rdquo; is the other half of the phrase. A depth-parallax photo can be
        rendered once into an MP4 — that is what most 3D photo makers hand you — or rendered live
        so the visitor controls it. The full pipeline is in{" "}
        <Link href="/guides/how-3d-photos-work">how 3D photos work</Link>.
      </p>

      <H2 id="why">Why interactive beats a 3D video on a website</H2>
      <p>
        A video plays the same three seconds at everyone. An interactive scene responds to the
        person looking at it, weighs less than a video, never fights an autoplay policy, and can
        be re-published without touching the page. Video wins in exactly one place: anywhere an
        iframe can&apos;t run — email, social feeds, chat.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>3D photo video (MP4)</th>
              <th>Interactive embed</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Visitor control</td><td>None — it plays</td><td>Drag, tilt, spin</td></tr>
            <tr><td>Page weight</td><td>A video file per placement, decoded continuously</td><td>Image + depth + mask once; GPU idles until the pointer moves</td></tr>
            <tr><td>Editing later</td><td>Re-export, re-upload, replace</td><td>Re-publish; the iframe stays the same</td></tr>
            <tr><td>Email and social feeds</td><td>Works</td><td>No — export a GIF or WebM for those</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        On a website, then, the interactive version is the better default and video is the
        fallback. The comparison also explains why every &ldquo;alternatives&rdquo; list in this
        category mixes video tools and interactive tools:{" "}
        <Link href="/alternatives/immersity-ai">Immersity AI alternatives, sorted by output</Link>.
      </p>

      <H2 id="how">How it works in 60 seconds</H2>
      <p>
        Four steps, two of them AI, none of them run by your visitors. A depth model estimates how
        far every pixel is from the camera. A segmentation model cuts the subject out as a matte.
        An inpainting model paints a clean backdrop where the subject used to be, so moving it
        reveals scenery instead of a smear. Then a small WebGL renderer draws two displaced planes
        — backdrop and subject — plus a contact shadow, and a camera that orbits within a shallow
        cone.
      </p>
      <ol>
        <li><strong>Depth map</strong> — Depth Anything V2 (small), run in the browser.</li>
        <li><strong>Subject matte</strong> — ISNet, run in the browser.</li>
        <li><strong>Backdrop</strong> — LaMa inpainting, run once at publish.</li>
        <li><strong>Two planes in WebGL</strong> — Three.js, 60 fps, no AI for the viewer.</li>
      </ol>
      <p>
        The AI runs once, when the scene is made; a published scene ships only the finished
        files. That is what lets it load on a phone in a couple of seconds and sit above the fold.
        The numbers, the models and the honest limits are in{" "}
        <Link href="/guides/how-3d-photos-work">how 3D photos work</Link>.
      </p>

      <H2 id="photos">Which photos work (and which don&apos;t)</H2>
      <p>
        The effect depends on separation: a subject the matte can isolate, and something behind it
        for the parallax to reveal. The best photo is not the best photograph; it is the one with
        the clearest layers.
      </p>
      <ul>
        <li><strong>One clear subject</strong>, fully inside the frame, with a hard edge.</li>
        <li><strong>Real depth behind it</strong> — a room, a street, a landscape, not a wall.</li>
        <li><strong>640 px or more</strong> on the long edge; small sources come out soft.</li>
        <li><strong>Avoid</strong> frame-filling subjects (nothing to parallax against), busy or low-contrast backgrounds (the matte fails), flat illustrations and logos (no depth cues), and glass, fur or fly-away hair at the silhouette.</li>
        <li><strong>Expect</strong> a shallow orbit of about ±23° — one photo only holds one side of anything.</li>
      </ul>
      <p>
        When the matte can&apos;t separate a subject, Gifsy says so and falls back to a depth-only
        view; it is better to pick another photo than to publish the sheet.
      </p>

      <H2 id="platforms">Adding one to your site, platform by platform</H2>
      <p>
        Every published Gifsy scene is one <code>&lt;iframe&gt;</code>. Any site builder with an
        HTML or code element can take it; the differences are the element&apos;s name, its plan
        gate, and how you size it. The one-line gist for each, with the full walkthrough linked:
      </p>
      <ul>
        <li>
          <strong>Webflow</strong> — the element is <em>Code Embed</em>, and it is locked on a free
          Starter site (tested); on the free plan show the scene as a WebM in a Background Video
          instead. <Link href="/guides/3d-photo-webflow">Add a 3D photo to Webflow</Link>.
        </li>
        <li>
          <strong>Framer</strong> — Insert → <em>Embed</em> → HTML mode → paste; size it like a
          layer. <Link href="/guides/3d-photo-framer">3D photo in Framer</Link>.
        </li>
        <li>
          <strong>Squarespace</strong> — a <em>Code</em> block, not the Embed block (which expects
          an oEmbed URL); &ldquo;Display source&rdquo; off.{" "}
          <Link href="/guides/3d-photo-squarespace">Squarespace 3D photo guide</Link>.
        </li>
        <li>
          <strong>WordPress</strong> — a <em>Custom HTML</em> block in the block editor, no plugin;
          paste as an admin or the iframe is stripped.{" "}
          <Link href="/guides/3d-photo-wordpress">WordPress without a plugin</Link>.
        </li>
        <li>
          <strong>Wix, Carrd, Notion, Shopify, Ghost, plain HTML</strong> — the universal snippet,
          every attribute explained, per-platform menu paths and a troubleshooting table:{" "}
          <Link href="/guides/embed-3d-photo-on-website">embed a 3D photo on any website</Link>.
        </li>
      </ul>

      <H2 id="uses">Use cases: where a moving photo earns its place</H2>
      <p>
        A page needs one strong moment, not twelve. The two audiences that get the most from an
        interactive 3D photo are the ones whose pages live or die on a single image.
      </p>
      <h3>Hero sections for no-code builders</h3>
      <p>
        Agencies and freelancers building client sites in Webflow or Framer want a scroll-stopping
        hero without hiring a WebGL developer. A founder portrait, a product on a surface, a mood
        shot behind the headline: one embed element, sized with an aspect ratio, copy kept clear of
        the subject, lazy-loading turned off because it is above the fold. Commercial use on client
        sites comes with Pro.
      </p>
      <h3>Portfolios for photographers, illustrators and 3D artists</h3>
      <p>
        One self-portrait or one key project shot that responds to the visitor — and stays
        interactive on a phone, where a finger drag does what the mouse does. The rest of the
        portfolio stays still; that is what makes the one that moves land.
      </p>
      <p>
        Product photography that needs a true 360° or AR is the wrong fit: that is the mesh
        category, not this one.
      </p>

      <H2 id="perf">Performance and privacy</H2>
      <p>
        Two questions come up on every embed: will it slow the page, and where does the photo go.
      </p>
      <p>
        <strong>Performance.</strong> The iframe requests a small poster (server-rendered, so
        something paints immediately), a 1 KB manifest, the colour image as WebP, a lossless depth
        map that compresses to tens of KB, the mask and backdrop when there is a subject, and the
        viewer script. All of it is edge-cached and immutable. Use{" "}
        <code>loading=&quot;lazy&quot;</code> below the fold, drop it for a hero, and keep one scene per
        screenful. Details and the troubleshooting table are in the{" "}
        <Link href="/guides/embed-3d-photo-on-website">embed guide</Link>.
      </p>
      <p>
        <strong>Privacy.</strong> Your photo stays in your browser while the scene is made. On the
        free plan, the depth model&apos;s intermediate activations — not the photo — go to
        Gifsy&apos;s server for one step; on Pro both halves of the model run on your device.
        Publishing uploads the finished scene (image, depth map, mask, backdrop) and it becomes
        public at its share link. Visitors download those files and nothing else; no AI runs on
        their side. The full account is the <Link href="/privacy">privacy policy</Link>.
      </p>

      <H2 id="costs">What it costs: one-time vs credits vs subscription</H2>
      <p>
        The category prices three ways. Most video exporters sell monthly credits ($5–$100 a
        month, watermark on the free tier). Some are free and open source but need a GPU and a
        terminal. Gifsy prices the thing it is selling — a published, badge-free, commercially
        licensed embed — once: Free is {FREE_GENERATION_LIMIT} lifetime 3D generations with
        unlimited publishing and a small badge; Pro is {PLAN_DISPLAY.pro.price} one-time for
        unlimited generations, no badge, commercial use, and the depth model fully on your device.
        No credits and no renewal, because the model running in your browser is what makes a
        one-time price possible.
      </p>
      <p>
        <Link href="/pricing">Compare Free and Pro</Link>, or see how the category&apos;s tools
        line up on price, watermark and output in the{" "}
        <Link href="/alternatives/immersity-ai">Immersity AI alternatives comparison</Link>.
      </p>

      <H2 id="faq">FAQ</H2>
      {FAQ.map((f) => (
        <div key={f.q}>
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}

      <H2 id="next">Resources and next steps</H2>
      <p><strong>Understand it</strong></p>
      <ul>
        <li><Link href="/guides/how-3d-photos-work">How 3D photos work: depth maps, mattes and two planes</Link></li>
        <li><Link href="/alternatives/immersity-ai">Immersity AI (LeiaPix) alternatives, by output type</Link></li>
      </ul>
      <p><strong>Put it on a site</strong></p>
      <ul>
        <li><Link href="/guides/embed-3d-photo-on-website">Embed a 3D photo on any website (iframe guide)</Link></li>
        <li><Link href="/guides/3d-photo-webflow">Webflow</Link> · <Link href="/guides/3d-photo-framer">Framer</Link> · <Link href="/guides/3d-photo-squarespace">Squarespace</Link> · <Link href="/guides/3d-photo-wordpress">WordPress</Link></li>
      </ul>
      <p><strong>Make one</strong></p>
      <ul>
        <li><Link href="/create">Make a 3D photo from your own image</Link> — the AI runs in your browser; three free.</li>
        <li><Link href="/gallery">See what the effect looks like on different kinds of photos</Link></li>
      </ul>
    </ArticleLayout>
  );
}

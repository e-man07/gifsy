// /guides/3d-photo-framer — spoke 5 (run 06). No dedicated brief; follows the
// Webflow guide's shape with Framer's own Embed component. Framer's exact
// plan rules for embeds were not verified by our tooling on 2026-09-17, so the
// guide says "check your plan" rather than naming tiers.

import Link from "next/link";
import { ArticleLayout, H2 } from "@/components/article/ArticleLayout";
import { findArticle } from "@/lib/articles";
import { PLAN_DISPLAY } from "@/lib/billing/plans";
import { faqPageNode, howToNode, type Faq } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

const article = findArticle("guides", "3d-photo-framer")!;

export const metadata = pageMetadata({
  path: "/guides/3d-photo-framer",
  title: article.shortTitle!,
  ogTitle: article.title,
  description: article.description,
});

const STEPS = [
  { name: "Make the 3D photo", text: "Upload one photo at gifsy.fun/create, generate, and click Publish." },
  { name: "Copy the embed snippet", text: "One iframe, from the publish panel." },
  { name: "Insert an Embed in Framer", text: "Insert panel → Embed → set Type to HTML → paste." },
  { name: "Size it like a layer", text: "Set the Embed's width and height per breakpoint; give the iframe 100% of both." },
  { name: "Publish and try it on a phone", text: "Drag sideways to orbit; swipe to scroll." },
];

const SNIPPET = `<iframe
  src="https://www.gifsy.fun/embed/<id>"
  title="Interactive 3D photo: …"
  loading="lazy"
  style="width:100%;height:100%;border:0;display:block"
></iframe>`;

const TOC = [
  { id: "quick", title: "Quick answer: the 5 steps" },
  { id: "embed", title: "The Embed component" },
  { id: "size", title: "Sizing per breakpoint" },
  { id: "hero", title: "Using it as a hero" },
  { id: "cms", title: "In a CMS collection" },
  { id: "check", title: "Before you publish" },
  { id: "faq", title: "FAQ" },
];

const FAQ: Faq[] = [
  {
    q: "Can I add a 3D photo to Framer without code?",
    a: "Yes. Framer's Embed component accepts raw HTML, and the whole thing is one iframe you paste in. You never write code; you set the component's size like any other layer.",
  },
  {
    q: "Does the Embed work on Framer's free plan?",
    a: "The Embed component is available in the editor, but plan rules for what publishes change — check Framer's current pricing before relying on it for a client site.",
  },
  {
    q: "Why does Framer say some sites can't be embedded?",
    a: "Some sites send headers that forbid being placed in an iframe. Gifsy's embed pages are built to be framed and set no such restriction, so the warning doesn't apply.",
  },
  {
    q: "Does it work in Framer's preview and on mobile?",
    a: "Yes. The frame renders in Preview and on the published site, and on a phone a finger drag orbits the scene while a vertical swipe scrolls the page.",
  },
  {
    q: "Can I remove the \"Made with Gifsy\" badge?",
    a: `Yes, with Pro — ${PLAN_DISPLAY.pro.price} one-time, no subscription — which also includes commercial use. Free scenes keep a small badge inside the frame.`,
  },
  {
    q: "Is this different from Framer's own 3D transforms?",
    a: "Yes. Framer's 3D transforms rotate flat layers you already have. A Gifsy scene has per-pixel depth estimated from one photo, with the subject separated from its own background, and the visitor orbits it by dragging.",
  },
];

export default function FramerGuide() {
  return (
    <ArticleLayout
      article={article}
      toc={TOC}
      extraGraph={[
        howToNode({
          name: "How to add a 3D photo to Framer",
          description: "Publish a 3D photo on Gifsy and place it in Framer with the Embed component in HTML mode.",
          steps: STEPS,
        }),
        faqPageNode(FAQ),
      ]}
    >
      <p className="lede">
        Framer&apos;s Embed component takes raw HTML, so an interactive 3D photo in Framer is one
        iframe away: a photo goes into Gifsy, a scene with real depth comes out, and the visitor
        can drag it on your published site. This is the Framer chapter of the{" "}
        <Link href="/guides/interactive-3d-photos-for-websites">complete guide to interactive 3D photos for websites</Link>;
        the platform-agnostic version is the{" "}
        <Link href="/guides/embed-3d-photo-on-website">full iframe embed guide</Link>, and the
        Webflow one is <Link href="/guides/3d-photo-webflow">here</Link>.
      </p>

      <H2 id="quick">Quick answer: the 5 steps</H2>
      <ol>
        {STEPS.map((s) => (
          <li key={s.name}>
            <strong>{s.name}.</strong> {s.text}
          </li>
        ))}
      </ol>

      <H2 id="embed">The Embed component</H2>
      <ol>
        <li>Open the Insert panel (the <strong>+</strong> in the toolbar, or ⌘/Ctrl + I) and search for <strong>Embed</strong>.</li>
        <li>Drop it on the canvas where the scene should sit.</li>
        <li>In the properties panel on the right, set <strong>Type</strong> to <strong>HTML</strong> (the default is URL).</li>
        <li>Paste the snippet into the HTML field:</li>
      </ol>
      <pre className="overflow-x-auto rounded-xl bg-ink p-4 text-xs leading-relaxed text-cloud sm:text-sm"><code>{SNIPPET}</code></pre>
      <p>
        Two differences from the copied snippet: the height is <code>100%</code> rather than a
        fixed 500 px, because in Framer the component itself is the box you size; and there is a{" "}
        <code>title</code> for screen readers. Framer may warn that some sites can&apos;t be
        embedded — Gifsy&apos;s embed pages set no framing restriction, so it will render.
      </p>

      <H2 id="size">Sizing per breakpoint</H2>
      <p>
        Treat the Embed like an image layer. Give it a fixed height or a fixed aspect ratio in
        the properties panel — 4:3 or 16:9 for a landscape scene, 3:4 for a portrait — and set
        width to fill or relative. Then switch to the tablet and phone breakpoints and change
        the ratio there: a 16:9 hero on desktop is a sliver on a phone, so 4:5 or 1:1 reads
        better. Because the iframe inside is 100%/100%, it follows whatever box you give it.
      </p>

      <H2 id="hero">Using it as a hero</H2>
      <ul>
        <li>Put the Embed in the hero section, pinned to all four edges, behind the text stack.</li>
        <li>Remove <code>loading=&quot;lazy&quot;</code> from the snippet — it is above the fold.</li>
        <li>Keep the copy clear of the subject, and make sure the text stack doesn&apos;t sit on top of the whole frame or it will block the drag. In Framer, a text layer only intercepts the pointer where it has content, so a left-aligned headline over a right-of-centre subject works.</li>
      </ul>

      <H2 id="cms">In a CMS collection</H2>
      <p>
        Add a plain-text field to the collection for the Gifsy scene id, then in the collection
        page&apos;s Embed connect that field into the iframe&apos;s <code>src</code>. Each item then
        carries its own scene — one template, many 3D photos.
      </p>

      <H2 id="check">Before you publish</H2>
      <ul>
        <li>Preview on a phone: sideways drag orbits, vertical swipe scrolls.</li>
        <li>Check the frame has a <code>title</code>.</li>
        <li>If your page has a lot of copy, consider a subtler motion setting when you create the scene; the viewer does not yet honour the OS reduced-motion setting on its own.</li>
        <li>Free scenes show a small &ldquo;Made with Gifsy&rdquo; badge in the frame; <Link href="/pricing">Pro</Link> removes it and covers commercial use for client work.</li>
      </ul>

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
        <Link href="/guides/embed-3d-photo-on-website">full iframe embed guide</Link>,{" "}
        <Link href="/guides/3d-photo-webflow">the Webflow version</Link>, and{" "}
        <Link href="/guides/how-3d-photos-work">how 3D photos work</Link>.
      </p>
    </ArticleLayout>
  );
}

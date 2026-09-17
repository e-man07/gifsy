// /guides/3d-photo-squarespace — spoke 8 (docs/seo/runs/06). Not hands-on
// verified: Squarespace's block names and plan gate are from its help
// documentation as read in Sept 2026 and are worded accordingly. The Code
// block vs Embed block distinction is the load-bearing fact.

import Link from "next/link";
import { ArticleLayout, H2 } from "@/components/article/ArticleLayout";
import { findArticle } from "@/lib/articles";
import { PLAN_DISPLAY } from "@/lib/billing/plans";
import { faqPageNode, howToNode, type Faq } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

const article = findArticle("guides", "3d-photo-squarespace")!;

export const metadata = pageMetadata({
  path: "/guides/3d-photo-squarespace",
  title: article.shortTitle!,
  ogTitle: article.title,
  description: article.description,
});

const STEPS = [
  { name: "Make the 3D photo", text: "Upload one photo at gifsy.fun/create, generate, and click Publish. Copy the iframe." },
  { name: "Add a Code block", text: "Edit the page → click an insert point → Code. Not the Embed block." },
  { name: "Paste and set the type", text: "Paste the iframe; leave the type as HTML; keep 'Display source' off." },
  { name: "Size it", text: "Wrap the iframe in a div with an aspect ratio, or give it a fixed height, so it fills the block on every screen." },
  { name: "Save and check on a phone", text: "Drag sideways to orbit; swipe to scroll." },
];

const SNIPPET = `<div style="position:relative;width:100%;aspect-ratio:4/3">
  <iframe
    src="https://www.gifsy.fun/embed/<id>"
    title="Interactive 3D photo: …"
    loading="lazy"
    style="position:absolute;inset:0;width:100%;height:100%;border:0"
  ></iframe>
</div>`;

const TOC = [
  { id: "quick", title: "Quick answer: the 5 steps" },
  { id: "which", title: "Code block, not Embed block" },
  { id: "plan", title: "Plan requirement" },
  { id: "steps", title: "Step by step" },
  { id: "size", title: "Sizing on phones" },
  { id: "fallback", title: "If code blocks aren't available" },
  { id: "faq", title: "FAQ" },
];

const FAQ: Faq[] = [
  {
    q: "Why doesn't the Squarespace Embed block work with a 3D photo?",
    a: "The Embed block is built around oEmbed: you paste a URL to something like YouTube and Squarespace asks that service for the player. A Gifsy scene is an iframe you paste as HTML, which is what the Code block is for. The Embed block does have an 'embed data' code mode, but the Code block is the simpler, documented route.",
  },
  {
    q: "Do I need a paid Squarespace plan?",
    a: "Squarespace's help documents Code blocks that run scripts or iframes as a feature of its paid plans; the free trial shows them in the editor but the plan is what makes them render for visitors. Check Squarespace's current plan page for the exact tier before promising a client.",
  },
  {
    q: "The block shows my code as text instead of the scene.",
    a: "'Display source' is on. Edit the block and turn it off; that setting prints the HTML as a code listing instead of rendering it.",
  },
  {
    q: "Can I put it in a Squarespace hero or banner?",
    a: "Yes, in a section: add a Code block to a section with a full-width layout, size it with a 16/9 or 21/9 aspect ratio, and keep the headline in its own block above or beside it rather than layered over it — layered text blocks the drag.",
  },
  {
    q: "Does it work on the Squarespace mobile app?",
    a: "The published page works on any phone browser: a finger drag orbits, a vertical swipe scrolls. Editing the Code block itself is best done on desktop.",
  },
  {
    q: "Can I remove the \"Made with Gifsy\" badge?",
    a: `Yes, with Gifsy Pro — ${PLAN_DISPLAY.pro.price} one-time, no subscription — which also includes commercial use for client sites.`,
  },
];

export default function SquarespaceGuide() {
  return (
    <ArticleLayout
      article={article}
      toc={TOC}
      extraGraph={[
        howToNode({
          name: "How to add an interactive 3D photo to Squarespace",
          description: "Publish a 3D photo on Gifsy and place its iframe in a Squarespace Code block, sized with an aspect ratio.",
          steps: STEPS,
        }),
        faqPageNode(FAQ),
      ]}
    >
      <p className="lede">
        Squarespace has two blocks that look like the right one for an interactive 3D photo,
        and only one of them is. The <strong>Embed block</strong> wants a URL it can look up
        (YouTube, Vimeo, Spotify); a Gifsy scene is an <code>&lt;iframe&gt;</code> you paste as
        HTML, so it belongs in a <strong>Code block</strong>. Get that right and the rest is five
        minutes. This is the Squarespace chapter of the{" "}
        <Link href="/guides/interactive-3d-photos-for-websites">guide to interactive 3D photos for websites</Link>.
      </p>

      <H2 id="quick">Quick answer: the 5 steps</H2>
      <ol>
        {STEPS.map((s) => (
          <li key={s.name}>
            <strong>{s.name}.</strong> {s.text}
          </li>
        ))}
      </ol>

      <H2 id="which">Code block, not Embed block</H2>
      <p>
        The Embed block is an oEmbed client: you give it a link, Squarespace asks that site for
        an embeddable player, and drops the result in. That works for services that publish
        oEmbed endpoints. It does not know what to do with a raw iframe. The Code block simply
        renders whatever HTML you paste, which is exactly what the Gifsy snippet is. If you have
        already tried the Embed block and got a broken link or a &ldquo;can&apos;t embed this
        URL&rdquo; message, that is why.
      </p>

      <H2 id="plan">Plan requirement</H2>
      <p>
        Squarespace treats Code blocks that run scripts or iframes as a paid-plan feature. Its
        help centre lists them as available on the current paid tiers; older third-party guides
        still say &ldquo;Business plan and above&rdquo;, but Squarespace has renamed its plans
        since, so check the plan page you are actually on rather than trusting a screenshot from
        2023. On a free trial the block appears in the editor; the plan decides whether visitors
        see the scene.
      </p>

      <H2 id="steps">Step by step</H2>
      <ol>
        <li>
          Make and publish your scene at <Link href="/create">gifsy.fun/create</Link>. Copy the
          snippet from the publish panel.
        </li>
        <li>In Squarespace, open the page in the editor and hover where the scene should go until the insert point appears. Click it.</li>
        <li>Choose <strong>Code</strong> from the block menu (search &ldquo;code&rdquo; if the menu is long).</li>
        <li>Paste the snippet into the block. Leave the type set to <strong>HTML</strong>. Make sure <strong>Display source</strong> is off — on, it prints your code as text.</li>
        <li>Click outside the block, then <strong>Save</strong>. Preview the page; the scene renders on the live site even if the editor shows a placeholder.</li>
      </ol>
      <p>
        The copied snippet is a fixed 500 px tall. That is fine for a first look; the next
        section replaces it with something that fits phones.
      </p>

      <H2 id="size">Sizing on phones</H2>
      <p>
        Squarespace blocks are fluid-width, so a fixed 500 px iframe becomes a tall sliver on a
        phone. Paste this instead — a wrapper with an aspect ratio and an iframe that fills it:
      </p>
      <pre className="overflow-x-auto rounded-xl bg-ink p-4 text-xs leading-relaxed text-cloud sm:text-sm"><code>{SNIPPET}</code></pre>
      <p>
        Use <code>4/3</code> or <code>16/9</code> for a landscape scene and <code>3/4</code> for a
        portrait. If you want a different ratio on phones, add a{" "}
        <code>&lt;style&gt;</code> tag with a <code>@media (max-width: 640px)</code> rule inside the
        same Code block; Squarespace passes it through. Keep{" "}
        <code>loading=&quot;lazy&quot;</code> for anything below the fold and remove it for a
        scene that sits at the top of the page.
      </p>

      <H2 id="fallback">If code blocks aren&apos;t available on your plan</H2>
      <p>
        You can still show the scene, just not the draggable version. Export a GIF or WebM from
        the Gifsy workshop and use an Image block (GIF) or a Video block (upload the clip, set it
        to loop). Visitors see the orbit; they can&apos;t steer it. Link the image to the
        scene&apos;s share page on gifsy.fun so the live version is one click away.
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
        <Link href="/create">Make a 3D photo from your own image</Link>. Related: the{" "}
        <Link href="/guides/embed-3d-photo-on-website">full iframe embed guide</Link>,{" "}
        <Link href="/guides/3d-photo-wordpress">the WordPress version</Link>, and{" "}
        <Link href="/guides/how-3d-photos-work">how 3D photos work</Link>.
      </p>
    </ArticleLayout>
  );
}

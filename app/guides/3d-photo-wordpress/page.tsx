// /guides/3d-photo-wordpress — spoke 9 (docs/seo/runs/06). WordPress facts
// here are core, documented behaviour: the Custom HTML block, the classic
// editor's Text tab, Elementor's HTML widget, and wp_kses stripping iframes
// for roles without the unfiltered_html capability (and on every role in
// WordPress multisite by default).

import Link from "next/link";
import { ArticleLayout, H2 } from "@/components/article/ArticleLayout";
import { findArticle } from "@/lib/articles";
import { PLAN_DISPLAY } from "@/lib/billing/plans";
import { faqPageNode, howToNode, type Faq } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

const article = findArticle("guides", "3d-photo-wordpress")!;

export const metadata = pageMetadata({
  path: "/guides/3d-photo-wordpress",
  title: article.shortTitle!,
  ogTitle: article.title,
  description: article.description,
});

const STEPS = [
  { name: "Make the 3D photo", text: "Upload one photo at gifsy.fun/create, generate, and click Publish. Copy the iframe." },
  { name: "Add a Custom HTML block", text: "In the block editor, press / and type 'html' → Custom HTML. Paste." },
  { name: "Preview inside the editor", text: "The block's Preview tab renders the iframe so you can see it before saving." },
  { name: "Make it responsive", text: "Wrap the iframe in a div with an aspect ratio so the theme's content width can't squash it." },
  { name: "Publish as an editor or admin", text: "Contributors and authors have the iframe stripped on save." },
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
  { id: "why-no-plugin", title: "Why no plugin" },
  { id: "block", title: "Block editor: Custom HTML" },
  { id: "elementor", title: "Elementor and the classic editor" },
  { id: "kses", title: "The iframe disappears on save (wp_kses)" },
  { id: "size", title: "Responsive in a theme you don't control" },
  { id: "hero", title: "As a hero or featured image" },
  { id: "faq", title: "FAQ" },
];

const FAQ: Faq[] = [
  {
    q: "Do I need a plugin to add a 3D photo to WordPress?",
    a: "No. The scene is one iframe, and WordPress's Custom HTML block pastes it directly. The 3D parallax plugins on the market bundle a slider and expect you to supply Photoshop-cut layers; here the depth and cut-out were already made from one photo before it reached WordPress.",
  },
  {
    q: "My iframe vanished after I saved the post.",
    a: "You are logged in as a role without the unfiltered_html capability — Contributor or Author on a normal site, or any role on a multisite. WordPress's wp_kses filter strips iframes from those users' content on save. Paste it as an Administrator or Editor instead, or ask one to.",
  },
  {
    q: "Does it work with Elementor, Divi or Bricks?",
    a: "Yes — each has an HTML element (Elementor: the HTML widget; Divi: the Code module; Bricks: the Code element). Paste the same snippet. The same wp_kses rule applies to whoever saves it.",
  },
  {
    q: "Will it slow my WordPress site?",
    a: "The frame loads one WebP image, a small depth map, an optional mask and backdrop and the viewer script from an edge cache; with loading=\"lazy\" nothing loads until it's near the viewport. It runs in its own document, so it doesn't touch your theme's scripts or a caching plugin's output.",
  },
  {
    q: "Can I use it in the featured image slot?",
    a: "Not directly — featured images are image attachments. Put the Custom HTML block at the top of the post content, or in a template part if your theme is block-based (Appearance → Editor).",
  },
  {
    q: "Can I remove the \"Made with Gifsy\" badge?",
    a: `Yes, with Gifsy Pro — ${PLAN_DISPLAY.pro.price} one-time, no subscription — which also includes commercial use.`,
  },
];

export default function WordPressGuide() {
  return (
    <ArticleLayout
      article={article}
      toc={TOC}
      extraGraph={[
        howToNode({
          name: "How to add a 3D photo to WordPress without a plugin",
          description: "Publish a 3D photo on Gifsy and paste its iframe into a WordPress Custom HTML block, sized with an aspect ratio.",
          steps: STEPS,
        }),
        faqPageNode(FAQ),
      ]}
    >
      <p className="lede">
        Every &ldquo;3D photo WordPress&rdquo; result is a plugin: a parallax slider that wants
        you to supply separately cut layers, plus its own scripts on every page. You don&apos;t
        need one. A Gifsy scene is a single <code>&lt;iframe&gt;</code>, and WordPress has had a
        block for pasting HTML since 5.0. This is the WordPress chapter of the{" "}
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

      <H2 id="why-no-plugin">Why no plugin</H2>
      <p>
        The plugins solve a different problem: they animate layers you already have. You cut the
        subject out in Photoshop, export it as a PNG, hand the plugin the layers, and its slider
        moves them. Gifsy does the cutting and the depth estimation from one photo before it gets
        anywhere near WordPress, and the result is hosted; the page only needs the frame. No
        scripts in your theme, nothing to update, nothing that breaks when the theme changes.
      </p>

      <H2 id="block">Block editor: Custom HTML</H2>
      <ol>
        <li>Make and publish your scene at <Link href="/create">gifsy.fun/create</Link>; copy the snippet.</li>
        <li>In the post or page, click <strong>+</strong> or type <code>/html</code> and choose <strong>Custom HTML</strong>.</li>
        <li>Paste the snippet into the block.</li>
        <li>Click the block&apos;s <strong>Preview</strong> tab to see it render, then <strong>HTML</strong> to go back.</li>
        <li><strong>Update</strong> or <strong>Publish</strong>.</li>
      </ol>
      <p>
        Don&apos;t paste into a Paragraph block: it escapes the angle brackets and prints the
        code as text. And don&apos;t use the Embed block — like Squarespace&apos;s, it works
        from a URL via oEmbed and won&apos;t recognise a plain iframe.
      </p>

      <H2 id="elementor">Elementor, other builders, and the classic editor</H2>
      <ul>
        <li><strong>Elementor:</strong> drag the <strong>HTML</strong> widget into a column and paste. Size the column; the snippet below fills it.</li>
        <li><strong>Divi:</strong> the <strong>Code</strong> module. <strong>Bricks:</strong> the <strong>Code</strong> element (execution enabled). <strong>WPBakery:</strong> Raw HTML.</li>
        <li><strong>Classic editor:</strong> switch from <strong>Visual</strong> to the <strong>Text</strong> tab before pasting. The Visual tab will mangle it.</li>
        <li><strong>Widgets and templates:</strong> a Custom HTML block works in block-based widget areas and in Appearance → Editor template parts too.</li>
      </ul>

      <H2 id="kses">The iframe disappears on save (wp_kses)</H2>
      <p>
        This is the WordPress-specific trap, and it is silent. WordPress runs content through a
        filter called <code>wp_kses</code> for any user who lacks the{" "}
        <code>unfiltered_html</code> capability, and that filter removes <code>&lt;iframe&gt;</code>{" "}
        tags. On a normal single site, Administrators and Editors have the capability;
        Authors and Contributors don&apos;t. On a WordPress multisite, <em>nobody</em> has it by
        default — not even site admins — unless the network admin grants it or a plugin does.
      </p>
      <p>
        So: if you paste the snippet, save, and the block is empty or the preview is blank, check
        who saved it. Paste it as an Editor or Administrator, or have one do it. Nothing is wrong
        with the snippet.
      </p>

      <H2 id="size">Responsive in a theme you don&apos;t control</H2>
      <p>
        Themes set a content width and some clamp iframes; the copied snippet&apos;s fixed 500 px
        height then produces a letterboxed or squashed frame. Use an aspect-ratio wrapper so the
        frame follows the column&apos;s width whatever the theme does:
      </p>
      <pre className="overflow-x-auto rounded-xl bg-ink p-4 text-xs leading-relaxed text-cloud sm:text-sm"><code>{SNIPPET}</code></pre>
      <p>
        <code>4/3</code> or <code>16/9</code> for landscape scenes, <code>3/4</code> for portrait.
        If your theme has &ldquo;wide&rdquo; and &ldquo;full&rdquo; block alignments, set the
        Custom HTML block to wide for a bigger stage. Keep <code>loading=&quot;lazy&quot;</code>{" "}
        below the fold; remove it for a scene at the top of the page.
      </p>

      <H2 id="hero">As a hero or featured image</H2>
      <p>
        Featured images are attachments, so the scene can&apos;t go in that slot. For a hero,
        put the Custom HTML block first in the content with a <code>16/9</code> or{" "}
        <code>21/9</code> wrapper and the full alignment, and put the headline in its own block
        above or below it rather than layered on top — a block layered over the frame swallows the
        drag. On block themes, the same block works inside a header template part.
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
        <Link href="/guides/3d-photo-squarespace">the Squarespace version</Link>, and{" "}
        <Link href="/guides/how-3d-photos-work">how 3D photos work</Link>.
      </p>
    </ArticleLayout>
  );
}

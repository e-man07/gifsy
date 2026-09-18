// /guides/3d-hero-image — spoke 10 (docs/seo/runs/06), the no-code-builder
// use-case page. Patterns are drawn from the two demo sites built in runs/18
// (fig-form.webflow.io, figandform.framer.website); the performance numbers
// are what the embed actually ships (see /guides/embed-3d-photo-on-website).

import Link from "next/link";
import { ArticleLayout, H2 } from "@/components/article/ArticleLayout";
import { findArticle } from "@/lib/articles";
import { PLAN_DISPLAY } from "@/lib/billing/plans";
import { faqPageNode, type Faq } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

const article = findArticle("guides", "3d-hero-image")!;

export const metadata = pageMetadata({
  path: "/guides/3d-hero-image",
  title: article.shortTitle!,
  ogTitle: article.title,
  description: article.description,
});

const HERO_SNIPPET = `<!-- above the fold: no loading="lazy", and preconnect in <head> -->
<link rel="preconnect" href="https://www.gifsy.fun">

<div style="position:relative;width:100%;aspect-ratio:16/9">
  <iframe
    src="https://www.gifsy.fun/embed/<id>"
    title="Interactive 3D photo: …"
    style="position:absolute;inset:0;width:100%;height:100%;border:0"
  ></iframe>
</div>`;

const TOC = [
  { id: "why", title: "Why a hero wants one moving thing" },
  { id: "patterns", title: "Six hero patterns" },
  { id: "copy", title: "Copy over the scene without blocking the drag" },
  { id: "budget", title: "The performance budget" },
  { id: "mobile", title: "On a phone" },
  { id: "platforms", title: "Platform steps" },
  { id: "faq", title: "FAQ" },
];

const FAQ: Faq[] = [
  {
    q: "Will an iframe in the hero hurt my Lighthouse score?",
    a: "Less than a background video. The frame loads one WebP, a small depth PNG, a mask and a backdrop from an edge cache, plus the viewer script; it runs in its own document so it can't block your page's main thread or your fonts. Drop loading=\"lazy\" for a hero (it's above the fold) and add a preconnect. The one thing it can cost is Largest Contentful Paint if the scene is the largest element — a poster image in the frame's place until it's ready avoids that.",
  },
  {
    q: "Should the hero scene auto-orbit or wait for the visitor?",
    a: "It auto-orbits gently until the visitor moves the pointer, then follows them; on a phone it moves under a finger drag. Visitors with reduced motion turned on get a still scene that only moves when they drag. That default is right for a hero: motion draws the eye, and the handoff to the pointer is what tells people it's interactive.",
  },
  {
    q: "Can I put a headline on top of the scene?",
    a: "Yes, as long as the text block doesn't cover the whole frame — whatever sits on top of the iframe swallows the drag. Put the headline in a column beside the subject, or over a quiet part of the scene, and keep buttons outside the frame.",
  },
  {
    q: "Video or 3D photo for a hero?",
    a: "Video if you already have footage and want it to play everywhere including inside apps; a 3D photo if you have one great still and want the visitor to touch it. The 3D photo weighs a fraction of a 10-second 1080p loop and never shows a loop seam. See the comparison page for the full table.",
  },
  {
    q: "Does the badge show on a hero?",
    a: `On a Free scene, yes — a small "Made with Gifsy" mark inside the frame. Pro (${PLAN_DISPLAY.pro.price} one-time) removes it and covers commercial use, which you want for a client's site.`,
  },
];

export default function HeroGuide() {
  return (
    <ArticleLayout article={article} toc={TOC} extraGraph={[faqPageNode(FAQ)]}>
      <p className="lede">
        The hero is the one place on a site where motion is expected and a single image has to
        carry a message. Most teams reach for a looping video or a big static photo. An
        interactive 3D photo is the third option: one still, turned into a scene the visitor can
        drag, weighing less than the video and doing something the JPG can&apos;t. This page is
        about how to use one well — the patterns, the copy, the load budget, and the steps per
        platform.
      </p>

      <H2 id="why">Why a hero wants one moving thing</H2>
      <p>
        Webflow&apos;s and Framer&apos;s own showcases have made the point for years: a hero with
        one strong layered moment holds attention; a hero with six animated things is noise. A
        3D photo is a single moment by nature. It moves, but it is still one picture with one
        subject, so it reads at a glance and rewards a second look. The rest of the section can be
        as quiet as you like.
      </p>
      <p>
        The other thing a 3D photo does that a video doesn&apos;t is answer the pointer. That
        handoff — it moves on its own, then it moves because you moved — is the whole reason to
        use one. Design the section so the visitor&apos;s hand naturally lands on it.
      </p>

      <H2 id="patterns">Six hero patterns</H2>
      <ol>
        <li>
          <strong>Split hero.</strong> Headline and button in the left column, the scene in the
          right. The safest layout: nothing overlaps the frame, and on a phone the two stack. This
          is what the Webflow demo in the{" "}
          <Link href="/guides/3d-photo-webflow">Webflow guide</Link> uses.
        </li>
        <li>
          <strong>Subject beside the wordmark.</strong> A subject-only scene (background removed,
          rendered on transparency) sitting on the page&apos;s own background next to a large word.
          The character or product looks like it belongs to the type. The Framer demo in the{" "}
          <Link href="/guides/3d-photo-framer">Framer guide</Link> does this with a pink
          character over a scrolling ticker.
        </li>
        <li>
          <strong>Full-bleed scene, copy in a corner.</strong> The scene fills the hero (16:9 on
          desktop, 4:5 on a phone), the headline sits bottom-left over a quiet area. Works with a
          photo whose subject is right-of-centre so the copy has room.
        </li>
        <li>
          <strong>Founder portrait.</strong> A waist-up portrait of the person behind the product,
          two metres from a real room. Studios and solo consultants: this is the one that makes
          the page feel like a person. Photo advice in{" "}
          <Link href="/guides/best-photos-for-3d-effect">best photos for a 3D effect</Link>.
        </li>
        <li>
          <strong>Product on a surface.</strong> The product three-quarters on, on a table or
          plinth with something receding behind. The orbit reveals the side the camera didn&apos;t
          face. For a launch page this is the closest thing to picking the object up.
        </li>
        <li>
          <strong>Agency case-study hero.</strong> The client&apos;s key visual as a scene, with
          the study&apos;s title over it. Repeat per case study with a CMS field holding the scene
          id, one template for all of them.
        </li>
      </ol>

      <H2 id="copy">Copy over the scene without blocking the drag</H2>
      <p>
        Anything layered on top of the iframe takes the pointer. A full-width text container over
        the whole frame means nobody can drag the scene, even if the text itself is short. Three
        ways round it:
      </p>
      <ul>
        <li>Keep the text in its own column (pattern 1, 2). Nothing to solve.</li>
        <li>Size the text block to its content and place it over a quiet part of the frame. In Framer a text layer only intercepts where it has content; in Webflow, set the text block&apos;s width to auto rather than 100%.</li>
        <li>Put buttons below or beside the frame, never over it — a button over the scene both blocks the drag and competes with it.</li>
      </ul>
      <p>
        Leave the subject clear. If the headline has to cross the subject, the photo is the wrong
        one for this layout, not the other way round.
      </p>

      <H2 id="budget">The performance budget</H2>
      <p>
        An above-the-fold iframe is a different thing from one halfway down the page, so change
        two things in the copied snippet:
      </p>
      <pre className="overflow-x-auto rounded-xl bg-ink p-4 text-xs leading-relaxed text-cloud sm:text-sm"><code>{HERO_SNIPPET}</code></pre>
      <ul>
        <li><strong>No <code>loading=&quot;lazy&quot;</code>.</strong> It is above the fold; lazy-loading delays it until layout settles and the scene pops in late.</li>
        <li><strong>Preconnect.</strong> One line in the head opens the connection to the embed host while the HTML is still parsing.</li>
        <li><strong>Reserve the box.</strong> The aspect-ratio wrapper means the hero doesn&apos;t reflow when the frame arrives — that is what keeps your layout-shift score clean.</li>
        <li><strong>What it loads.</strong> The frame fetches the scene&apos;s colour image (WebP), a small greyscale depth map, a mask, a pre-painted backdrop and the viewer script, all from an edge cache. No AI runs on the visitor&apos;s device; the scene draws with WebGL at 60 fps. It is its own document, so your page&apos;s scripts, fonts and main thread are untouched.</li>
        <li><strong>One hero scene.</strong> Two or three scenes above the fold each start a WebGL context; keep the rest of the page&apos;s scenes lazy, which the default snippet already does.</li>
      </ul>

      <H2 id="mobile">On a phone</H2>
      <p>
        A 16:9 hero is a sliver on a phone; switch the wrapper to 4:5 or 1:1 at the phone
        breakpoint. In the scene, a sideways drag orbits and a vertical swipe scrolls the page, so
        it doesn&apos;t trap the visitor. Autoplay policies don&apos;t apply — it isn&apos;t a video —
        which is one reason a 3D photo is easier than a hero video on iOS. Visitors with
        reduced-motion on see a still scene that only moves when they drag it.
      </p>

      <H2 id="platforms">Platform steps</H2>
      <ul>
        <li><strong>Webflow:</strong> Code Embed element (paid site or Workspace plan) with the snippet above; on a free site, a Background Video of the scene&apos;s WebM instead. Full steps and the plan facts in the <Link href="/guides/3d-photo-webflow">Webflow guide</Link>.</li>
        <li><strong>Framer:</strong> Embed component, Type HTML — works on the free plan. Pin it to the hero&apos;s edges behind the text stack; re-set the pins per breakpoint. <Link href="/guides/3d-photo-framer">Framer guide</Link>.</li>
        <li><strong>Squarespace:</strong> Code block (not Embed block) in the top section. <Link href="/guides/3d-photo-squarespace">Squarespace guide</Link>.</li>
        <li><strong>WordPress:</strong> Custom HTML block first in the content, full alignment, or in a header template part. <Link href="/guides/3d-photo-wordpress">WordPress guide</Link>.</li>
        <li><strong>Anything else:</strong> the <Link href="/guides/embed-3d-photo-on-website">universal embed guide</Link>.</li>
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
        <Link href="/create">Make the hero scene</Link>. Related: the{" "}
        <Link href="/guides/interactive-3d-photos-for-websites">complete guide</Link>,{" "}
        <Link href="/guides/3d-photo-portfolio">3D photos in a portfolio</Link>, and{" "}
        <Link href="/compare/3d-photo-makers">the tool comparison</Link>.
      </p>
    </ArticleLayout>
  );
}

// /guides/3d-photo-portfolio — spoke 11 (docs/seo/runs/06), the ICP #2
// use-case page. Builder facts: Framer and Webflow are hands-on (runs/16–18);
// Squarespace and WordPress from their docs; Format/Adobe Portfolio/Cargo are
// worded as "check" because they were not tested.

import Link from "next/link";
import { ArticleLayout, H2 } from "@/components/article/ArticleLayout";
import { findArticle } from "@/lib/articles";
import { FREE_GENERATION_LIMIT, PLAN_DISPLAY } from "@/lib/billing/plans";
import { faqPageNode, type Faq } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

const article = findArticle("guides", "3d-photo-portfolio")!;

export const metadata = pageMetadata({
  path: "/guides/3d-photo-portfolio",
  title: article.shortTitle!,
  ogTitle: article.title,
  description: article.description,
});

const TOC = [
  { id: "when", title: "When a moving photo helps a portfolio, and when it hurts" },
  { id: "photographers", title: "Photographers" },
  { id: "illustrators", title: "Illustrators" },
  { id: "3d", title: "3D and motion artists" },
  { id: "placement", title: "Gallery or hero?" },
  { id: "badge", title: "The badge, and client work" },
  { id: "builders", title: "Portfolio builders that take an iframe" },
  { id: "faq", title: "FAQ" },
];

const FAQ: Faq[] = [
  {
    q: "Won't a 3D effect look gimmicky on a serious portfolio?",
    a: "It can, if every image moves. Used on one or two pieces — the ones with real depth — it reads as care, not a trick. The test: would you show this piece as a short clip if you had one? If yes, a 3D photo is the better version of that clip, because the visitor controls it.",
  },
  {
    q: "Does the 3D photo change my image?",
    a: "The colour image is your file, resized to fit. What changes is that it's displaced by an estimated depth map and its subject is matted. At rest it is your photo; the visitor's drag is what reveals the depth. If the estimate is wrong for a piece, don't use that piece — it is an interpretation of your work and should only be shown where it's a good one.",
  },
  {
    q: "Can a client see the Gifsy badge?",
    a: `On a Free scene, yes — a small mark inside the frame. Pro (${PLAN_DISPLAY.pro.price} one-time) removes it and includes commercial use, which is the right footing for client-facing work.`,
  },
  {
    q: "Does the photo stay private until I publish?",
    a: "The photo stays in your browser while the scene is made. On Free, the depth model's intermediate activations — not the photo — go to the server for one step; on Pro everything runs locally. Publishing uploads the finished scene and makes it public at its own URL, which is what the embed needs.",
  },
  {
    q: "What if my portfolio builder doesn't allow iframes?",
    a: "Export the orbit as a WebM (or GIF) from the workshop and use the builder's video or image slot. It loops instead of responding to the visitor, but it is still the same scene. Every builder takes a video.",
  },
  {
    q: "How many can I make?",
    a: `Free gives ${FREE_GENERATION_LIMIT} lifetime generations with the badge; Pro is ${PLAN_DISPLAY.pro.price} once, not a subscription. For a portfolio that is usually the whole decision: a handful of pieces, made once.`,
  },
];

export default function PortfolioGuide() {
  return (
    <ArticleLayout article={article} toc={TOC} extraGraph={[faqPageNode(FAQ)]}>
      <p className="lede">
        A portfolio has one job: make someone stop scrolling and look at a piece for longer than
        a second. A photo the visitor can turn does that, when the piece has depth to show. This
        is a guide to using interactive 3D photos in a portfolio without turning it into a
        gallery of effects — which pieces, which placement, what to do about the badge on client
        work, and which builders will take the embed.
      </p>

      <H2 id="when">When a moving photo helps a portfolio, and when it hurts</H2>
      <p>
        The rule from the <Link href="/guides/3d-hero-image">hero guide</Link> applies twice as
        hard here: one moving thing per view. A grid where every thumbnail orbits is a screensaver.
        The pieces that earn it are the ones where depth is part of the work — a portrait with a
        real room behind it, a product shot with a surface, a render with volume, a layered
        illustration. Flat work (typography, flat-lay, graphic design comps) should stay still; it
        has nothing to reveal.
      </p>
      <p>
        The other question is whether the depth estimate is <em>right</em> for the piece. A 3D
        photo is an interpretation: the model guesses distance from the picture. For most photos
        the guess is good; for some it isn&apos;t, and on a portfolio an off guess reads as your
        error. Make the scene, drag it to the extremes, and only publish the ones you would sign.
        What helps a photo work is in{" "}
        <Link href="/guides/best-photos-for-3d-effect">best photos for a 3D effect</Link>.
      </p>

      <H2 id="photographers">Photographers</H2>
      <ul>
        <li><strong>Portraits and editorial.</strong> The strongest case. A subject two metres from an environment, waist-up or three-quarter, is exactly what the depth model reads well, and the orbit gives a sitter presence a still can&apos;t. Studio portraits on seamless work in subject-only mode, rendered on the site&apos;s own background.</li>
        <li><strong>Product and still life.</strong> Three-quarter angles on a surface. The orbit shows the side face; clients get a sense of the object. Avoid glass and chrome (the matte can&apos;t separate reflections).</li>
        <li><strong>Travel and documentary.</strong> Scenes with a clear foreground, mid and far — a person on a street, a boat on a lake with a shore — are the most dramatic 3D photos there are. Wide empty landscapes have no parallax to show.</li>
        <li><strong>Weddings and events.</strong> The couple against a venue works; a crowd doesn&apos;t. One or two per gallery, on the portraits.</li>
      </ul>
      <p>
        One craft note: the depth estimate works from the photo, not from your camera&apos;s data,
        so RAW-to-JPEG choices matter only as they affect contrast at the subject&apos;s edge.
        Export at 1,500–3,000 px on the long edge; more adds nothing.
      </p>

      <H2 id="illustrators">Illustrators</H2>
      <p>
        Depth needs cues, and a drawing gives them or doesn&apos;t. Work with shading, overlapping
        forms, atmospheric perspective and a lit subject turns into a scene with real layers —
        painterly digital work, concept art, book covers with a character in a setting. Flat,
        outlined, single-tone work comes out as a tilting sheet, because there is no depth in it
        to find. That is not a flaw in the piece; it is the wrong tool for it.
      </p>
      <p>
        Two useful tricks. First, subject-only mode on a character drawn on a plain background:
        the character becomes an object that turns on the page, with no background to guess at.
        Second, if you paint in layers, the composite of all layers is the input — you don&apos;t
        supply the layers, and you don&apos;t need to. Tools that animate illustration by asking for
        pre-cut layers (the Photoshop-plus-plugin route) are a different workflow; here the
        separation is estimated from the flat image.
      </p>

      <H2 id="3d">3D and motion artists</H2>
      <p>
        Renders are the best input the models see: clean edges, controlled light, unambiguous
        volume. A still render becomes an interactive scene without shipping a WebGL build, a
        GLB, or a viewer — one iframe. For a reel of stills, that is the difference between a
        page of JPEGs and a page a studio lead will play with.
      </p>
      <ul>
        <li>Character renders on a plain backdrop → subject-only scenes on the site&apos;s background. The demo sites in the <Link href="/guides/3d-photo-framer">Framer</Link> and <Link href="/guides/3d-photo-webflow">Webflow</Link> guides are built entirely this way.</li>
        <li>Environment renders → full scenes; the estimated depth will roughly agree with your real Z-buffer for most shots, and be wrong for reflective surfaces and volumetrics.</li>
        <li>Motion designers: a frame from the piece, made orbitable, is a lighter teaser than an autoplaying MP4 and doesn&apos;t give the ending away.</li>
      </ul>

      <H2 id="placement">Gallery or hero?</H2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Hero / case-study opener</th>
              <th>Inside a gallery</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>How many</td><td>One, large</td><td>One or two per page, at the same size as the stills</td></tr>
            <tr><td>Loading</td><td>Eager, with a preconnect</td><td>Lazy (the default snippet)</td></tr>
            <tr><td>Motion</td><td>Auto-orbit until the pointer arrives</td><td>Same, but consider the subtler motion preset so the grid stays calm</td></tr>
            <tr><td>Best pieces</td><td>The single strongest scene you have</td><td>Pieces whose depth is the point — a portrait in a place, a product on a surface</td></tr>
            <tr><td>Caption</td><td>Headline beside, not over</td><td>A plain caption; the &ldquo;drag&rdquo; cue is the motion itself</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        On a case-study page the natural spot is the opener: the key visual as a scene, then the
        stills below. In a masonry or grid gallery, keep the scene the same size as its
        neighbours; a bigger tile that also moves is two emphases at once.
      </p>

      <H2 id="badge">The badge, and client work</H2>
      <p>
        Free scenes carry a small &ldquo;Made with Gifsy&rdquo; mark inside the frame. On your own
        portfolio that is a judgement call; on a client&apos;s site it usually isn&apos;t —{" "}
        <Link href="/pricing">Pro</Link> removes it and includes commercial use for{" "}
        {PLAN_DISPLAY.pro.price} once. Because Pro also runs the whole depth pass on your own
        machine, it is the setting for work you are under NDA on: the photo never leaves the
        browser until you choose to publish the finished scene.
      </p>

      <H2 id="builders">Portfolio builders that take an iframe</H2>
      <ul>
        <li><strong>Framer</strong> — Embed component, HTML type; publishes on the free plan. Verified. <Link href="/guides/3d-photo-framer">Guide.</Link></li>
        <li><strong>Webflow</strong> — Code Embed element on a paid site or Workspace plan; free sites can use the scene&apos;s WebM in a Background Video. Verified. <Link href="/guides/3d-photo-webflow">Guide.</Link></li>
        <li><strong>Squarespace</strong> — Code block on a paid plan. <Link href="/guides/3d-photo-squarespace">Guide.</Link></li>
        <li><strong>WordPress</strong> — Custom HTML block, as an editor or admin. <Link href="/guides/3d-photo-wordpress">Guide.</Link></li>
        <li><strong>Cargo, Adobe Portfolio, Format, Pixieset and similar</strong> — most have an HTML or embed block, some on paid tiers only; not tested here, so check the builder&apos;s help before you plan around it. If there is no HTML block, use the WebM export in the video slot.</li>
        <li><strong>Behance and Dribbble</strong> — no iframes. Upload the GIF or video export; link to the interactive share page in the description.</li>
      </ul>
      <p>
        The snippet and the sizing wrapper for any of these are in the{" "}
        <Link href="/guides/embed-3d-photo-on-website">embed guide</Link>.
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
        <Link href="/create">Make a scene from one of your pieces</Link>. Related:{" "}
        <Link href="/guides/best-photos-for-3d-effect">best photos for a 3D effect</Link>,{" "}
        <Link href="/guides/3d-hero-image">a 3D hero image</Link>, and{" "}
        <Link href="/guides/how-3d-photos-work">how 3D photos work</Link>.
      </p>
    </ArticleLayout>
  );
}

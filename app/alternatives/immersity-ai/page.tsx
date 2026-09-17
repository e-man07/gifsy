// /alternatives/immersity-ai — the comparison page from docs/seo/runs/10.
//
// Honesty rules that shaped it: Gifsy is one of eight entries, not the winner;
// the criteria come before any tool is named; where Gifsy loses is stated in
// the same table; Immersity is described as still sold, not dead; prices and
// limits carry the date they were checked; nothing claims a hands-on test we
// have not run (the brief's "tested on the same photo" is deferred — see the
// update log at the bottom).

import Link from "next/link";
import { ArticleLayout, H2 } from "@/components/article/ArticleLayout";
import { findArticle } from "@/lib/articles";
import { FREE_GENERATION_LIMIT, PLAN_DISPLAY } from "@/lib/billing/plans";
import { faqPageNode, type Faq } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

const article = findArticle("alternatives", "immersity-ai")!;
const VERIFIED = "17 September 2026";

export const metadata = pageMetadata({
  path: "/alternatives/immersity-ai",
  title: article.shortTitle!,
  ogTitle: article.title,
  description:
    "Immersity for Web watermarks free exports, caps them at 720p and sells monthly credits — and no plan offers a web embed. Eight alternatives compared by output type, free tier, price and where your photo goes.",
});

const TOC = [
  { id: "tldr", title: "Which alternative for which job" },
  { id: "criteria", title: "How we compared" },
  { id: "immersity", title: "What changed at Immersity AI" },
  { id: "kinds", title: "The three kinds of \"3D photo\" tool" },
  { id: "table", title: "Head-to-head table" },
  { id: "tools", title: "The 8 alternatives" },
  { id: "vs", title: "Gifsy vs Immersity AI" },
  { id: "embed", title: "Putting the result on your site" },
  { id: "faq", title: "FAQ" },
  { id: "method", title: "Methodology & update log" },
];

const FAQ: Faq[] = [
  {
    q: "Is the LeiaPix converter still free?",
    a: `Yes, as "Immersity for Web" Free: unlimited conversions, but every export is watermarked, capped at 720p and licensed for non-commercial use only. The unwatermarked tiers start at $4.99 a month (Image, 500 credits). Checked ${VERIFIED}.`,
  },
  {
    q: "Does Immersity AI put a watermark on exports?",
    a: "On the Free plan, yes — the pricing page lists \"Watermarked Export Only\". Every paid plan removes it.",
  },
  {
    q: "What is the difference between LeiaPix and Immersity AI?",
    a: "Same company, same converter, renamed. The web tool now lives at app.immersity.ai, the homepage sells Immersity's display hardware, and credits à la carte were discontinued in favour of monthly plans.",
  },
  {
    q: "Can I embed an Immersity AI animation on my website?",
    a: "Not as an interactive element. Every Immersity plan exports files — MP4, GIF, images — so the most you can do is drop the MP4 into a <video> tag. For a 3D photo a visitor can drag, you need a tool that hosts an embed for you (Gifsy) or a viewer you host yourself.",
  },
  {
    q: "Is there a free Immersity AI alternative without a watermark?",
    a: "DepthFlow is open source and unwatermarked but needs a GPU and a Python install. CapCut exports standard projects without a watermark, though some templates and Pro assets add one. Depthy is free and unwatermarked but GIF-only and unmaintained. Gifsy's free tier shows a small badge on embeds; Pro removes it for $9 once.",
  },
  {
    q: "Interactive embed or video export — which should I pick?",
    a: "Video for Instagram, YouTube, TikTok and email, where an iframe can't run. Interactive for a website hero, portfolio or product page, where the visitor can drag it. Video works everywhere; interactive needs a page that accepts an iframe.",
  },
  {
    q: "Is Meshy (or Tripo) an Immersity AI alternative?",
    a: "No. Meshy and Tripo generate 3D meshes — GLB or OBJ files — from an image. Immersity generates a depth-parallax animation from a photo. Different output, different use; they turn up in the same search results because both get called \"image to 3D\".",
  },
  {
    q: "Does Gifsy upload my photo?",
    a: "The photo stays in the browser while the scene is made. On the Free plan, intermediate depth-model activations — not the image — go to Gifsy's server for one step; on Pro the whole model runs locally. Publishing uploads the finished scene (image, depth, mask, backdrop) and makes it public at its share link.",
  },
];

/** One row of the head-to-head table. */
interface Row {
  tool: string;
  output: string;
  interactive: string;
  free: string;
  watermark: string;
  price: string;
  leaves: string;
  best: string;
}

const ROWS: Row[] = [
  {
    tool: "Immersity AI",
    output: "Video, GIF, images, spatial formats",
    interactive: "No",
    free: "Unlimited, 720p, non-commercial",
    watermark: "Free: yes · paid: no",
    price: "$4.99–$99.99/mo credits (from $60/yr)",
    leaves: "Yes — uploaded",
    best: "4K MP4, spatial/3D-display video",
  },
  {
    tool: "Gifsy",
    output: "Interactive iframe + share page; GIF/WebM/PNG capture",
    interactive: "Yes",
    free: `${FREE_GENERATION_LIMIT} lifetime generations, badge on embeds`,
    watermark: "Free: badge · Pro: no",
    price: `${PLAN_DISPLAY.pro.price} one-time`,
    leaves: "Free: activations for one step · Pro: no · publish: finished scene",
    best: "A draggable 3D photo on a website",
  },
  {
    tool: "Depthy",
    output: "In-browser viewer; GIF export",
    interactive: "In its own tab only",
    free: "Everything",
    watermark: "No",
    price: "Free",
    leaves: "No",
    best: "Viewing a photo you already have a depth map for",
  },
  {
    tool: "Media.io 3D Image Maker",
    output: "3D-styled image; video via a second image-to-video step",
    interactive: "No",
    free: "3 daily credits, 720p, up to 1 video",
    watermark: "Free: yes",
    price: "Monthly credits (Standard/Premium)",
    leaves: "Yes — uploaded",
    best: "One-off stylised clips inside a bigger toolkit",
  },
  {
    tool: "Animagen",
    output: "GIF + MP4, up to 4K 60 fps",
    interactive: "No",
    free: "2 videos, 1080p",
    watermark: "Free: yes",
    price: "$9.99 / 12 · $39.99 / 80, never expire",
    leaves: "Yes — uploaded",
    best: "Cheapest clean MP4/GIF without a subscription",
  },
  {
    tool: "CapCut 3D Zoom",
    output: "MP4 from a template",
    interactive: "No",
    free: "Standard projects export free",
    watermark: "Some templates / Pro assets add one",
    price: "Free; CapCut Pro optional",
    leaves: "Yes — uploaded",
    best: "Free video for social, if you already use CapCut",
  },
  {
    tool: "Motionleap",
    output: "Video from a phone app",
    interactive: "No",
    free: "Limited, watermarked",
    watermark: "Removal is paid",
    price: "Subscription, varies by store and region",
    leaves: "Yes — app",
    best: "Camera-move 2.5D clips on a phone",
  },
  {
    tool: "DepthFlow",
    output: "Video, up to 8K",
    interactive: "No",
    free: "Everything (AGPL-3.0)",
    watermark: "No",
    price: "Free; sponsors optional",
    leaves: "No — runs on your machine",
    best: "Unlimited clean renders, if you have a GPU and Python",
  },
  {
    tool: "Dzine",
    output: "Stylised 3D video",
    interactive: "No",
    free: "100 credits, 12 months",
    watermark: "Not stated on pricing",
    price: "$8.99–$149.99/mo credits",
    leaves: "Yes — uploaded",
    best: "Stylised AI video inside a design suite",
  },
];

export default function ImmersityAlternativesPage() {
  return (
    <ArticleLayout article={article} toc={TOC} extraGraph={[faqPageNode(FAQ)]}>
      <p className="lede">
        Immersity AI (formerly LeiaPix) turns a photo into a depth-parallax video; its free plan is
        watermarked, capped at 720p and non-commercial, and no plan offers a web embed. The closest
        alternatives split by output: Gifsy and Depthy give you something interactive, while
        Animagen, Media.io, CapCut, Motionleap, DepthFlow and Dzine export video or GIF.
      </p>
      <p>
        <strong>We make Gifsy.</strong> It is one of the eight entries below, judged on the same
        criteria as the rest, and the table says plainly where it loses — no MP4 export, a
        three-generation free tier, a badge on free embeds. If you need a video file, several
        tools here are a better fit.
      </p>

      <H2 id="tldr">Which alternative for which job</H2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>You want</th>
              <th>Pick</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>A 3D photo visitors can drag on your site</td>
              <td>Gifsy</td>
              <td>The only entry that hosts an interactive iframe; {PLAN_DISPLAY.pro.price} once for no badge and commercial use.</td>
            </tr>
            <tr>
              <td>A free video export, no account</td>
              <td>CapCut 3D Zoom · DepthFlow</td>
              <td>CapCut for a quick template on a phone; DepthFlow for unlimited clean renders on a GPU.</td>
            </tr>
            <tr>
              <td>The cheapest clean MP4/GIF</td>
              <td>Animagen</td>
              <td>$9.99 for 12 watermark-free videos, credits never expire.</td>
            </tr>
            <tr>
              <td>To stay on Immersity</td>
              <td>Immersity for Web, paid</td>
              <td>If you need 4K MP4 or spatial video for a Leia display or headset and can pay monthly.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <H2 id="criteria">How we compared</H2>
      <p>
        Every tool is judged on the same eight criteria, in the same order, and the head-to-head
        table below scores Immersity itself on them too:
      </p>
      <ol>
        <li><strong>Output type.</strong> What you actually get: an interactive embed, an MP4/GIF file, a 3D mesh, or something that only lives inside an app.</li>
        <li><strong>Free tier — what it really includes.</strong> Resolution cap, watermark or badge, how many you can make, commercial use.</li>
        <li><strong>Watermark or branding</strong> on free and on paid.</li>
        <li><strong>Price model.</strong> Subscription, credits, one-time or free.</li>
        <li><strong>Where processing happens.</strong> In your browser, or uploaded to a server.</li>
        <li><strong>Parallax quality.</strong> Edge halos, background stretch, subject separation. Not yet scored — see the update log.</li>
        <li><strong>Embed or share on a website.</strong> Iframe, share URL, or none.</li>
        <li><strong>Maintenance and risk.</strong> Last update, roadmap signals, how long it has existed.</li>
      </ol>
      <p>
        <strong>Excluded, and why:</strong> Meshy, Tripo and Alpha3D generate 3D meshes — a different
        product. Runway, Pika and Kaiber are general image-to-video; their motion is not depth
        parallax. PhotoMirage and PhotoVibrance are desktop cinemagraph tools. Owl3D makes stereo
        3D for headsets.
      </p>
      <p className="note">
        Prices, limits and formats were read from each tool&apos;s own pricing or documentation page
        on {VERIFIED}. Two could not be read by our tooling that day and are stated more
        cautiously: CapCut (its site blocked the fetch) and Motionleap (store listings only).
      </p>

      <H2 id="immersity">What changed at Immersity AI (and why people are looking)</H2>
      <p>
        LeiaPix became Immersity AI, and the converter most people knew is now &ldquo;Immersity for
        Web&rdquo; at app.immersity.ai. The company&apos;s homepage sells its switchable 3D displays;
        the converter is still sold, but the deal has changed:
      </p>
      <ul>
        <li><strong>Free:</strong> unlimited conversions, but &ldquo;2D|3D Conversion up to 720p&rdquo;, &ldquo;Watermarked Export Only&rdquo;, &ldquo;No Commercial Use&rdquo;.</li>
        <li><strong>Paid:</strong> Image $4.99/mo (500 credits), Image Pro $14.99 (1,700), Video $24.99 (3,300), Video Pro $49.99 (7,500), Video MAX $99.99 (20,000). All paid plans: 4K, no watermark, commercial use.</li>
        <li><strong>Gone:</strong> credits à la carte — the pricing page says they have been discontinued.</li>
        <li><strong>Outputs:</strong> JPG/PNG/HEIC/LIF images; MP4/MKV/MOV/GIF video; spatial, side-by-side and anaglyph formats; depth maps.</li>
        <li><strong>Not offered on any plan:</strong> a share page or iframe. Everything is a file you download.</li>
      </ul>
      <p>
        So the two reasons people search for an alternative are the watermark on the free tier and
        the monthly credits — and a third, less obvious one: there is no way to put an Immersity
        result on a website except as a video.
      </p>

      <H2 id="kinds">The three kinds of &ldquo;3D photo&rdquo; tool</H2>
      <p>
        Most &ldquo;alternatives&rdquo; lists mix three different products. Decide which one you need
        before comparing anything else.
      </p>
      <h3>Interactive embeds</h3>
      <p>
        The photo is turned into a depth map plus a subject cut-out and rendered live in the
        visitor&apos;s browser, so they can drag it. <strong>Gifsy</strong> hosts the result and gives you
        an iframe; <strong>Depthy</strong> renders in its own tab and exports only a GIF.
      </p>
      <h3>Video and GIF exporters</h3>
      <p>
        The tool renders a camera move once and hands you a file. <strong>Immersity, Media.io, Animagen,
        CapCut, Motionleap, DepthFlow, Dzine.</strong> Right for social feeds, email and anywhere an iframe
        can&apos;t run.
      </p>
      <h3>3D mesh generators</h3>
      <p>
        Meshy, Tripo and similar produce a GLB or OBJ model you can spin all the way round or print.
        A different product with a different price; if that is what you want, this is the wrong
        article.
      </p>

      <H2 id="table">Head-to-head table</H2>
      <p className="note">Scroll sideways on a narrow screen — eight columns, nine tools.</p>
      <div className="table-wrap wide">
        <table>
          <thead>
            <tr>
              <th>Tool</th>
              <th>Output</th>
              <th>Interactive on your site?</th>
              <th>Free tier</th>
              <th>Watermark</th>
              <th>Price</th>
              <th>Photo leaves browser?</th>
              <th>Best for</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.tool}>
                <td>{r.tool}</td>
                <td>{r.output}</td>
                <td>{r.interactive}</td>
                <td>{r.free}</td>
                <td>{r.watermark}</td>
                <td>{r.price}</td>
                <td>{r.leaves}</td>
                <td>{r.best}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="note">
        &ldquo;12-month cost&rdquo; for Immersity assumes the cheapest paid tier held for a year. Gifsy&apos;s
        one-time price is paid once and never renews.
      </p>

      <H2 id="tools">The 8 alternatives</H2>
      <p>
        Ordered by output type, then by how close each is to what an ex-LeiaPix user was after —
        not by a quality score.
      </p>

      <h3>1. Gifsy — interactive embed, {PLAN_DISPLAY.pro.price} one-time</h3>
      <p>
        <strong>What you get:</strong> a depth map, a subject cut-out and an inpainted backdrop, rendered
        live as a scene you can drag; a share page and an <code>&lt;iframe&gt;</code> for any site; a
        GIF, WebM or PNG capture if you also want a file.{" "}
        <strong>Free:</strong> {FREE_GENERATION_LIMIT} lifetime 3D generations, unlimited publishing, a
        small &ldquo;Made with Gifsy&rdquo; badge on embeds. <strong>Pro:</strong> {PLAN_DISPLAY.pro.price} once —
        unlimited, no badge, commercial use, depth model fully on your device.{" "}
        <strong>Where the photo goes:</strong> stays in the browser; Free sends intermediate model
        activations for one step; publishing uploads the finished scene and it is public.{" "}
        <strong>Honest limitation:</strong> no MP4 export; a shallow ±23° orbit from a single image, not
        360°; frame-filling subjects and busy backgrounds separate poorly; it is a young product.{" "}
        <strong>Best for:</strong> a hero, portfolio or product image on Webflow, Framer, Squarespace or
        WordPress. <Link href="/create">Try it</Link>.
      </p>

      <h3>2. Depthy — free viewer, GIF export, unmaintained</h3>
      <p>
        <strong>What you get:</strong> an open-source web viewer that displays a photo with parallax
        and exports an animated GIF. It was built around Google Camera&apos;s Lens Blur depth data and
        accepts a custom depth map. <strong>Free:</strong> everything; no watermark. <strong>Where the photo
        goes:</strong> nowhere. <strong>Honest limitation:</strong> no share page, no embed, no sign of recent
        maintenance, and a browser-support warning on load. <strong>Best for:</strong> looking at a photo you
        already have a depth map for.
      </p>

      <h3>3. Media.io 3D Image Maker — credits, video via a second step</h3>
      <p>
        <strong>What you get:</strong> a 3D-styled image; motion comes from Media.io&apos;s separate
        image-to-video tool. <strong>Free:</strong> three daily check-in credits, up to one video, 720p
        with a watermark. <strong>Paid:</strong> Standard and Premium monthly credit plans, 1080p without
        watermark (prices render per region — check in a browser). <strong>Where the photo goes:</strong>
        uploaded. <strong>Honest limitation:</strong> two tools and two credit spends to get one moving
        clip. <strong>Best for:</strong> one-off clips if you already use the rest of the Media.io suite.
      </p>

      <h3>4. Animagen — GIF and MP4 packs, credits never expire</h3>
      <p>
        <strong>What you get:</strong> GIF or MP4 up to 4K 60 fps. <strong>Free:</strong> two videos at 1080p,
        watermarked. <strong>Paid:</strong> Starter $9.99 for 12 clean videos, Pro $39.99 for 80; points
        never expire; 7-day refund if unused. <strong>Where the photo goes:</strong> uploaded.{" "}
        <strong>Honest limitation:</strong> nothing interactive, and the promo strike-through pricing
        changes. <strong>Best for:</strong> the cheapest clean MP4/GIF without a subscription.
      </p>

      <h3>5. CapCut 3D Zoom — free template video</h3>
      <p>
        <strong>What you get:</strong> an MP4 from a &ldquo;3D Zoom&rdquo; template on phone, desktop or
        web. <strong>Free:</strong> standard projects export without a watermark; some templates,
        effects and Pro assets add one — check on export. <strong>Where the photo goes:</strong> uploaded
        (CapCut is ByteDance-owned; read its privacy policy). <strong>Honest limitation:</strong> we could
        not verify the current template or Pro status from our tooling — test an export before you
        rely on it. <strong>Best for:</strong> free social video if CapCut is already on your phone.
      </p>

      <h3>6. Motionleap (Lightricks) — phone app, subscription</h3>
      <p>
        <strong>What you get:</strong> camera-move 2.5D video from a phone app. <strong>Free:</strong> limited,
        watermarked; removal is paid. <strong>Paid:</strong> subscription tiers vary by store and region.{" "}
        <strong>Honest limitation:</strong> support status is unclear — one 2026 review calls it sunset
        while the Play Store still shows an August 2026 release. Check the listing before buying.{" "}
        <strong>Best for:</strong> quick clips made entirely on a phone.
      </p>

      <h3>7. DepthFlow — open source, GPU, no watermark</h3>
      <p>
        <strong>What you get:</strong> a Python tool (AGPL-3.0) that renders parallax video up to 8K on
        an RTX 3060-class GPU. <strong>Free:</strong> everything, unlimited, commercial use encouraged;
        sponsors optional. <strong>Where the photo goes:</strong> nowhere — it runs on your machine.{" "}
        <strong>Honest limitation:</strong> you install Python and need a GPU; there is no web viewer
        or embed, only video out. <strong>Best for:</strong> unlimited clean renders for someone
        comfortable with a terminal.
      </p>

      <h3>8. Dzine — stylised 3D video inside a design suite</h3>
      <p>
        <strong>What you get:</strong> an image-to-3D-video generator among many AI design tools.{" "}
        <strong>Free:</strong> 100 credits valid 12 months. <strong>Paid:</strong> Beginner $8.99/mo (1,000
        credits) up to Master Pro $149.99/mo; commercial use on paid plans. <strong>Where the photo
        goes:</strong> uploaded. <strong>Honest limitation:</strong> the watermark policy isn&apos;t stated on the
        pricing page; Dzine&apos;s separate &ldquo;image to 3D model&rdquo; tool is a mesh generator and not
        what this article compares. <strong>Best for:</strong> stylised clips if you want the rest of the
        suite.
      </p>

      <H2 id="vs">Gifsy vs Immersity AI, side by side</H2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Immersity for Web</th>
              <th>Gifsy</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Output</td><td>Video, GIF, images, spatial formats</td><td>Interactive iframe + share page; GIF/WebM/PNG capture</td></tr>
            <tr><td>Free tier</td><td>Unlimited, 720p, watermarked, non-commercial</td><td>{FREE_GENERATION_LIMIT} generations, badge on embeds</td></tr>
            <tr><td>Paid</td><td>$4.99–$99.99 a month, credits</td><td>{PLAN_DISPLAY.pro.price} once, never renews</td></tr>
            <tr><td>Where the photo goes</td><td>Uploaded</td><td>Stays in the browser; Free sends activations for one step; publishing uploads the scene</td></tr>
            <tr><td>On a website</td><td>As a video file</td><td>As a draggable embed</td></tr>
            <tr><td>Range of motion</td><td>Whatever the export renders</td><td>About ±23° of orbit, live</td></tr>
            <tr><td>Maturity</td><td>Years, large company</td><td>Months, two people</td></tr>
          </tbody>
        </table>
      </div>
      <p><strong>Choose Immersity if</strong> you need 4K MP4, spatial or side-by-side video for a Leia display or a headset, unlimited watermarked freebies, or video-to-3D.</p>
      <p><strong>Choose Gifsy if</strong> a visitor should be able to drag it on your site, you want a one-time price, you want the photo to stay in the browser (Pro), or you are pasting it into Webflow or Framer.</p>

      <H2 id="embed">Putting the result on a Webflow, Framer or Squarespace site</H2>
      <p>
        A Gifsy scene goes in as a single iframe — full width, 500 px tall by default, lazy-loaded —
        through Webflow&apos;s Embed element, Framer&apos;s Embed component, or a code block anywhere
        else. An Immersity, Media.io or Animagen export goes in as a <code>&lt;video&gt;</code> file
        instead: it plays, but the visitor can&apos;t move it. Both are fine choices; they are
        different things. The platform-by-platform steps are in the{" "}
        <Link href="/guides/interactive-3d-photos-for-websites">guide to interactive 3D photos for websites</Link>.
      </p>

      <H2 id="faq">FAQ</H2>
      {FAQ.map((f) => (
        <div key={f.q}>
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}

      <H2 id="method">Methodology, sources &amp; update log</H2>
      <p>
        Facts above were read from each tool&apos;s own pricing, documentation or store page on{" "}
        {VERIFIED}: immersity.ai/pricing, 3dpicmaker.com/pricing, media.io/pricing, dzine.ai/pricing,
        the DepthFlow repository and docs, depthy.stamina.pl, and the Motionleap store listings. CapCut&apos;s
        site refused our fetch; its row is from published reviews and should be re-checked before
        you rely on it. We re-check prices quarterly; the next check is due December 2026.
      </p>
      <ul>
        <li><strong>{VERIFIED}</strong> — first published. Hands-on parallax test on one shared photo (criterion 6) not yet run; rows will gain a test image and a quality note when it is.</li>
      </ul>
    </ArticleLayout>
  );
}

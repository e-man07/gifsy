// /compare/3d-photo-makers — spoke 12 (docs/seo/runs/06). Commercial-
// investigation page for "best / free 3D photo maker". Tool facts are the
// ones verified for /alternatives/immersity-ai on 17 Sept 2026 (runs/02) plus
// Fotor from runs/01; nothing here was re-checked separately, so the
// re-verification date is shared. Gifsy is one row and is not ranked first
// by default — the sort is by output type, which is the honest axis.

import Link from "next/link";
import { ArticleLayout, H2 } from "@/components/article/ArticleLayout";
import { findArticle } from "@/lib/articles";
import { FREE_GENERATION_LIMIT, PLAN_DISPLAY } from "@/lib/billing/plans";
import { faqPageNode, type Faq } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

const article = findArticle("compare", "3d-photo-makers")!;
const VERIFIED = "17 September 2026";

export const metadata = pageMetadata({
  path: "/compare/3d-photo-makers",
  title: article.shortTitle!,
  ogTitle: article.title,
  description: article.description,
});

interface Row {
  tool: string;
  kind: "Interactive" | "Video / GIF" | "Still";
  output: string;
  runs: string;
  free: string;
  watermark: string;
  price: string;
  pick: string;
}

const ROWS: Row[] = [
  {
    tool: "Gifsy",
    kind: "Interactive",
    output: "Draggable scene as an iframe + share page; GIF/WebM/PNG capture",
    runs: "In the browser (Free: one step server-side, activations only)",
    free: `${FREE_GENERATION_LIMIT} lifetime generations, badge on embeds`,
    watermark: "Free: badge · Pro: none",
    price: `${PLAN_DISPLAY.pro.price} one-time`,
    pick: "A 3D photo on a website that visitors can drag",
  },
  {
    tool: "Depthy",
    kind: "Interactive",
    output: "In-browser viewer; GIF export; no hosted embed",
    runs: "In the browser",
    free: "Everything",
    watermark: "None",
    price: "Free (unmaintained)",
    pick: "Viewing a photo you already have a depth map for",
  },
  {
    tool: "Immersity AI (ex-LeiaPix)",
    kind: "Video / GIF",
    output: "MP4, GIF, images, spatial formats",
    runs: "Uploaded to their servers",
    free: "Unlimited, 720p, non-commercial",
    watermark: "Free: yes · paid: none",
    price: "$4.99–$99.99/mo credits (from $60/yr)",
    pick: "4K video or a spatial/3D-display format",
  },
  {
    tool: "Animagen",
    kind: "Video / GIF",
    output: "GIF + MP4 up to 4K 60 fps",
    runs: "Uploaded",
    free: "2 videos, 1080p",
    watermark: "Free: yes",
    price: "$9.99 / 12 videos · $39.99 / 80; credits never expire",
    pick: "Cheapest clean MP4/GIF without a subscription",
  },
  {
    tool: "Media.io 3D Image Maker",
    kind: "Video / GIF",
    output: "3D-styled image; video via a second image-to-video step",
    runs: "Uploaded",
    free: "3 daily credits, 720p, up to 1 video",
    watermark: "Free: yes",
    price: "Monthly credits (Standard / Premium)",
    pick: "A one-off clip inside a big toolkit you already use",
  },
  {
    tool: "CapCut 3D Zoom",
    kind: "Video / GIF",
    output: "MP4 from a template",
    runs: "Uploaded",
    free: "Standard projects export free",
    watermark: "Some templates / Pro assets add one",
    price: "Free; CapCut Pro optional",
    pick: "Free social video, if CapCut is already on your phone",
  },
  {
    tool: "Motionleap",
    kind: "Video / GIF",
    output: "Video from a phone app",
    runs: "In the app",
    free: "Limited, watermarked",
    watermark: "Removal is paid",
    price: "Subscription; varies by store and region",
    pick: "Camera-move clips made entirely on a phone",
  },
  {
    tool: "DepthFlow",
    kind: "Video / GIF",
    output: "Video up to 8K",
    runs: "On your own machine (GPU + Python)",
    free: "Everything (AGPL-3.0)",
    watermark: "None",
    price: "Free; sponsors optional",
    pick: "Unlimited clean renders, if you can install it",
  },
  {
    tool: "Dzine",
    kind: "Video / GIF",
    output: "Stylised 3D video",
    runs: "Uploaded",
    free: "100 credits, 12 months",
    watermark: "Not stated on pricing",
    price: "$8.99–$149.99/mo credits",
    pick: "Stylised AI video inside a design suite",
  },
  {
    tool: "Fotor 2D-to-3D",
    kind: "Still",
    output: "A stylised 3D-look JPG/PNG — no depth, no motion",
    runs: "Uploaded",
    free: "Free tier with sign-up",
    watermark: "Not checked",
    price: "Fotor subscription for more",
    pick: "A 3D-styled still for a thumbnail or a logo",
  },
];

const TOC = [
  { id: "three", title: "Three different products called “3D photo maker”" },
  { id: "table", title: "The table" },
  { id: "verdicts", title: "One-line verdicts" },
  { id: "video", title: "When a video tool is the right pick" },
  { id: "pricing", title: "Pricing: one-time vs credits" },
  { id: "privacy", title: "Where your photo goes" },
  { id: "method", title: "How this was checked" },
  { id: "faq", title: "FAQ" },
];

const FAQ: Faq[] = [
  {
    q: "What is the best free 3D photo maker?",
    a: "It depends on what “free” has to include. DepthFlow is fully free and unwatermarked but needs a GPU and a Python install. Depthy is free in the browser but GIF-only and unmaintained. CapCut exports standard projects free. Immersity's free tier is unlimited but watermarked, 720p and non-commercial. Gifsy's free tier is three scenes with a small badge — free for an interactive embed, not for volume.",
  },
  {
    q: "Which 3D photo makers work without uploading my photo?",
    a: "Depthy and DepthFlow run entirely on your machine. Gifsy runs in the browser; on the free plan one step sends the depth model's intermediate activations (not the photo) to the server, and on Pro nothing leaves the browser until you publish. Every other tool in the table uploads the photo.",
  },
  {
    q: "Which one makes a 3D photo I can put on my website?",
    a: "Only Gifsy hosts an interactive embed; Depthy is interactive in its own tab but has no embed. The video tools give you an MP4 you can drop into a <video> tag or a background-video slot, which plays but can't be dragged.",
  },
  {
    q: "Is a “2D to 3D image converter” the same thing?",
    a: "Usually not. Fotor's and similar converters output a stylised still image that looks rendered — no depth map, no motion, nothing to embed. Depth-parallax tools (everything else here) produce motion from estimated depth. Mesh generators like Meshy and Tripo are a third category again: they output a 3D model file.",
  },
  {
    q: "Is Immersity AI still free?",
    a: `As "Immersity for Web" Free: unlimited conversions, every export watermarked, capped at 720p and licensed non-commercial. Unwatermarked tiers start at $4.99 a month. Checked ${VERIFIED}.`,
  },
  {
    q: "How often is this page re-checked?",
    a: `Prices and free tiers were verified on ${VERIFIED} and are re-checked quarterly. If a row is wrong today, the date at the top tells you how stale it is.`,
  },
];

export default function ComparePage() {
  return (
    <ArticleLayout article={article} toc={TOC} extraGraph={[faqPageNode(FAQ)]}>
      <p className="lede">
        &ldquo;3D photo maker&rdquo; is three different products wearing one name. Before price or
        quality, the question is which of the three you need — because the tools are not
        interchangeable and the wrong kind is useless however good it is. Ten tools, sorted by
        what they make, with free tiers, watermarks, price models and where your photo goes.
        Prices checked {VERIFIED}; Gifsy is one row, not the headline.
      </p>

      <H2 id="three">Three different products called &ldquo;3D photo maker&rdquo;</H2>
      <ol>
        <li><strong>Interactive scenes.</strong> The photo becomes a depth-parallax scene that a visitor moves with the pointer or a finger. Delivered as an embed or a viewer, so it needs a web page. Two tools: Gifsy, Depthy.</li>
        <li><strong>Video / GIF.</strong> The same depth-parallax idea, rendered once into a camera move and exported as a file. Plays anywhere a video plays — Instagram, email, a slide — and is not interactive. Seven tools.</li>
        <li><strong>Stylised stills.</strong> An image that <em>looks</em> rendered: a 3D-styled logo or object. No depth, no motion. One tool here (Fotor), many like it.</li>
      </ol>
      <p>
        If you need a hero image on a Webflow site, only category 1 does it. If you need a
        Reel, only category 2 does it. If you need a thumbnail, category 3 is the cheapest. The{" "}
        <Link href="/guides/interactive-3d-photos-for-websites">complete guide</Link> covers what
        category 1 is actually good for; the rest of this page is the table.
      </p>

      <H2 id="table">The table</H2>
      <div className="table-wrap wide">
        <table>
          <thead>
            <tr>
              <th>Tool</th>
              <th>Makes</th>
              <th>Output</th>
              <th>Runs</th>
              <th>Free tier</th>
              <th>Watermark</th>
              <th>Price model</th>
              <th>Pick it for</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.tool}>
                <td>{r.tool}</td>
                <td>{r.kind}</td>
                <td>{r.output}</td>
                <td>{r.runs}</td>
                <td>{r.free}</td>
                <td>{r.watermark}</td>
                <td>{r.price}</td>
                <td>{r.pick}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2 id="verdicts">One-line verdicts</H2>
      <ul>
        <li><strong>Gifsy</strong> — the only one that gives you an interactive embed for a website; {PLAN_DISPLAY.pro.price} once for no badge and commercial use. Not the pick if you need an MP4 for social; the capture export exists but a video tool does that job better.</li>
        <li><strong>Depthy</strong> — the original open-source depth viewer. Free, private, interactive in its own tab, exports a GIF. No hosting, no embed, and it hasn&apos;t been maintained in years.</li>
        <li><strong>Immersity AI</strong> — the most polished video output and the spatial formats nobody else offers. Watermark and 720p on free, credits on paid. The full picture is on the <Link href="/alternatives/immersity-ai">Immersity alternatives</Link> page.</li>
        <li><strong>Animagen</strong> — the pragmatic video pick: $9.99 for 12 clean clips, credits that don&apos;t expire, no subscription.</li>
        <li><strong>Media.io</strong> — fine if you are already inside Wondershare&apos;s toolkit; on its own, the free tier is thin and the 3D step is a styled image first, video second.</li>
        <li><strong>CapCut 3D Zoom</strong> — a template, not a tool, but it is free and already on most phones. For a story or a Reel it is enough.</li>
        <li><strong>Motionleap</strong> — the phone-native option with real creative control over camera moves; a subscription for what most people use once.</li>
        <li><strong>DepthFlow</strong> — the power user&apos;s answer: unlimited, unwatermarked, 8K, fully local, and a Python install with a GPU as the price of entry.</li>
        <li><strong>Dzine</strong> — stylised rather than faithful; the right pick when you want the AI look, wrong when you want your photo back.</li>
        <li><strong>Fotor</strong> — not a 3D photo in the sense of this page. A stylised still; useful for a logo or a thumbnail and nothing that moves.</li>
      </ul>

      <H2 id="video">When a video tool is the right pick</H2>
      <p>
        Plainly: whenever the thing has to play where an iframe can&apos;t. Instagram, TikTok,
        YouTube, email, a slide deck, a digital sign, a Notion page on the free plan — all of
        these take a video and none take an embed. Video also autoplays in a loop without
        anyone touching it, which is what you want on a feed. The costs are that it is not
        interactive, it loops with a seam unless you mirror it, it weighs more than the scene
        that made it, and it is one fixed camera move forever.
      </p>
      <p>
        For a web page — a hero, a portfolio piece, a product shot — the interactive version is
        smaller, sharper, and does the one thing video can&apos;t. The{" "}
        <Link href="/guides/3d-hero-image">hero image guide</Link> and{" "}
        <Link href="/guides/3d-photo-portfolio">portfolio guide</Link> are about that half.
      </p>

      <H2 id="pricing">Pricing: one-time vs credits</H2>
      <p>
        Most of the table sells credits by the month: Immersity from $4.99/mo (500 credits),
        Media.io and Dzine on monthly tiers, Motionleap on a subscription. The pattern suits
        people who make a lot of clips every month and punishes people who need five scenes for
        one website. For that second person the arithmetic is simple: Animagen&apos;s $9.99 for 12
        clean videos, credits that never expire, versus Gifsy&apos;s {PLAN_DISPLAY.pro.price} once
        for unlimited interactive scenes, no badge, commercial use. Free-forever options exist —
        DepthFlow and Depthy — and both cost you setup or features instead of money.
      </p>
      <p>
        One trap: &ldquo;free&rdquo; with a watermark on a client&apos;s website is not free; it is
        an ad for the tool in the client&apos;s hero. Every watermark column above is there so you
        can price that in.
      </p>

      <H2 id="privacy">Where your photo goes</H2>
      <p>
        Seven of the ten upload the photo to a server and process it there. Depthy and DepthFlow
        never send it anywhere. Gifsy runs the models in the browser; on the free plan one step
        of the depth model runs server-side on intermediate activations rather than the image,
        and on Pro the whole pass is local. Publishing a scene, on any tool with hosting, makes
        that scene public by design — it has to be reachable to be embedded. If the photo is
        confidential, that column is the first one to read.
      </p>

      <H2 id="method">How this was checked</H2>
      <p>
        Each tool&apos;s pricing page and free-tier terms were read on {VERIFIED}; the Immersity,
        Media.io, Animagen and Depthy rows also reflect a hands-on look for the{" "}
        <Link href="/alternatives/immersity-ai">alternatives page</Link>. Fotor&apos;s watermark
        was not checked and is marked as such. Nothing here is ranked by a score; the table is
        sorted by what the tool makes, because that is the decision that matters. We make one of
        the tools; the way to keep that honest is the sort order and the &ldquo;pick it
        for&rdquo; column, which names a case for every row.
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
        <Link href="/create">Try the interactive kind</Link>. Related:{" "}
        <Link href="/alternatives/immersity-ai">Immersity AI alternatives</Link>,{" "}
        <Link href="/guides/how-3d-photos-work">how 3D photos work</Link>, and{" "}
        <Link href="/pricing">Gifsy pricing</Link>.
      </p>
    </ArticleLayout>
  );
}

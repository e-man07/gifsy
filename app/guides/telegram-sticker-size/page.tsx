// /guides/telegram-sticker-size — brief 15 §9b. Spec explainer; the static
// size/format rules and the tip line are quoted from core.telegram.org
// (#static-stickers-and-emoji), the 512 KB cap is enforced by the @Stickers
// bot rather than stated on that page, and the WebP/PNG behaviour mirrors
// lib/export.ts (quality 0.92, stepping down until ≤ 512 KB).

import Link from "next/link";
import { ArticleLayout, H2 } from "@/components/article/ArticleLayout";
import { findArticle } from "@/lib/articles";
import { faqPageNode, type Faq } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

const article = findArticle("guides", "telegram-sticker-size")!;

export const metadata = pageMetadata({
  path: "/guides/telegram-sticker-size",
  title: article.shortTitle!,
  ogTitle: article.title,
  description: article.description,
});

const TOC = [
  { id: "rules", title: "The rules, in one table" },
  { id: "512", title: "512 on one side, ≤512 on the other" },
  { id: "format", title: "PNG vs WebP for stickers" },
  { id: "rejected", title: "Why the bot rejects your file" },
  { id: "resize", title: "Resize any image to 512×512" },
  { id: "faq", title: "FAQ" },
];

const FAQ: Faq[] = [
  {
    q: "Does a Telegram sticker have to be exactly 512×512?",
    a: "One side must be exactly 512 px; the other can be 512 or less. A square 512×512 is the safe default and what the Gifsy sticker maker exports, but a 512×380 landscape sticker is valid.",
  },
  {
    q: "Is WebP or PNG better for Telegram stickers?",
    a: "WebP for uploading to @Stickers: it is far smaller, so it stays under the 512 KB cap without effort. PNG is lossless and fine when the cut-out is simple, but a detailed photo cut-out as PNG can exceed the cap.",
  },
  {
    q: "What is the file size limit for a Telegram sticker?",
    a: "512 KB for a static sticker, enforced by the @Stickers bot when you upload. Animated TGS stickers are capped at 64 KB and video WEBM stickers at 256 KB.",
  },
  {
    q: "Why does Telegram ask for 100×100 pixels?",
    a: "100×100 is the size for custom emoji, which you get by starting a pack with /newemojipack. For stickers, start with /newpack and use 512 px.",
  },
  {
    q: "Do stickers need a transparent background?",
    a: "They need to be PNG or WebP with an alpha channel; Telegram's guide recommends a transparent background with a white stroke and black shadow so the sticker stands out on any chat theme. An opaque square works technically but looks like a photo, not a sticker.",
  },
];

export default function TelegramSizeGuide() {
  return (
    <ArticleLayout article={article} toc={TOC} extraGraph={[faqPageNode(FAQ)]}>
      <p className="lede">
        A static Telegram sticker must be a PNG or WebP with a transparent background where one
        side is exactly 512 pixels and the other is 512 or less. The @Stickers bot also rejects
        files over 512 KB. Custom emoji are a different thing — exactly 100×100 — which is where
        most &ldquo;wrong size&rdquo; errors come from.
      </p>

      <H2 id="rules">The rules, in one table</H2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Format</th>
              <th>Size</th>
              <th>File limit</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Static sticker</td><td>PNG or WebP, transparent</td><td>One side exactly 512 px, the other ≤ 512</td><td>512 KB (enforced by the bot)</td></tr>
            <tr><td>Animated sticker</td><td>TGS (Lottie-style vector)</td><td>512×512</td><td>64 KB</td></tr>
            <tr><td>Video sticker</td><td>WEBM (VP9), no audio</td><td>One side 512 px</td><td>256 KB, ≤ 3 s</td></tr>
            <tr><td>Custom emoji</td><td>PNG/WebP, TGS or WEBM</td><td>Exactly 100×100</td><td>Same per-format caps</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        The size and format rules are on Telegram&apos;s{" "}
        <a href="https://core.telegram.org/stickers#static-stickers-and-emoji" rel="noopener" target="_blank">
          sticker documentation
        </a>
        , along with the design tip: &ldquo;a transparent background, white stroke and black
        shadow effect will make your sticker stand out.&rdquo; The 512 KB static cap isn&apos;t
        printed on that page any more; the bot enforces it when you upload.
      </p>

      <H2 id="512">512 on one side, ≤ 512 on the other</H2>
      <p>
        The rule is about the longer edge. A square 512×512 is the safe default: it fills the
        sticker slot and never surprises you. A 512×300 sticker is valid too and shows as a wide
        strip — useful for a caption-style sticker, odd for a face. Anything larger than 512 on
        either side is rejected; anything with neither side at 512 is rejected. Telegram displays
        stickers scaled down in chats, so 512 is the ceiling, not a recommendation to draw at 512.
      </p>

      <H2 id="format">PNG vs WebP for stickers</H2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>PNG</th>
              <th>WebP</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Transparency</td><td>Yes, lossless</td><td>Yes</td></tr>
            <tr><td>Typical size at 512×512</td><td>Larger; a detailed photo cut-out can pass 512 KB</td><td>Several times smaller</td></tr>
            <tr><td>Quality</td><td>Exact pixels</td><td>Lossy at a quality you choose; the Gifsy sticker maker starts at 0.92 and only steps down if the cap is hit</td></tr>
            <tr><td>Use it for</td><td>The untouched cut-out; Discord, Signal, iMessage images</td><td>Uploading to @Stickers</td></tr>
          </tbody>
        </table>
      </div>

      <H2 id="rejected">Why the bot rejects your file</H2>
      <ul>
        <li><strong>Sent as a photo.</strong> Telegram recompresses photos to JPEG and drops the transparency. Attach → File.</li>
        <li><strong>Over 512 KB.</strong> Convert to WebP, or lower the PNG&apos;s detail.</li>
        <li><strong>Not transparent.</strong> A JPG, or a PNG with an opaque background. Cut the background out first.</li>
        <li><strong>Wrong dimensions.</strong> Neither side is 512, or a side exceeds 512.</li>
        <li><strong>&ldquo;Exactly 100×100&rdquo;.</strong> You started an emoji pack with <code>/newemojipack</code>. Use <code>/newpack</code>.</li>
      </ul>

      <H2 id="resize">Resize any image to 512×512 for Telegram</H2>
      <p>
        Drop the photo on the <Link href="/tools/sticker">512×512 sticker maker</Link>. It does
        more than resize: it removes the background with an AI model in your browser, adds the
        white outline and shadow, and exports a 512×512 WebP re-encoded to stay under 512 KB,
        plus a PNG. Nothing is uploaded. The pack itself is then built with the @Stickers bot —
        the whole flow is in{" "}
        <Link href="/guides/telegram-sticker-pack-from-browser">how to make Telegram stickers from a photo without an app</Link>.
      </p>

      <H2 id="faq">FAQ</H2>
      {FAQ.map((f) => (
        <div key={f.q}>
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}
    </ArticleLayout>
  );
}

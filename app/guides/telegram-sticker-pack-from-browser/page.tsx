// /guides/telegram-sticker-pack-from-browser — brief 15 §9a. The @Stickers
// flow mirrors components/ImportGuide.tsx (the in-app guide); the 100×100 and
// send-as-file traps are the highest-value paragraphs. Bot management
// commands (/addsticker, /delsticker, /ordersticker, /editsticker) are from
// the bot's own help and are listed, not screenshotted.

import Link from "next/link";
import { ArticleLayout, H2 } from "@/components/article/ArticleLayout";
import { findArticle } from "@/lib/articles";
import { faqPageNode, howToNode, type Faq } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

const article = findArticle("guides", "telegram-sticker-pack-from-browser")!;

export const metadata = pageMetadata({
  path: "/guides/telegram-sticker-pack-from-browser",
  title: article.shortTitle!,
  ogTitle: article.title,
  description: article.description,
});

const STEPS = [
  { name: "Cut the photo into a sticker in your browser", text: "Drop a photo on the Gifsy sticker maker; it removes the background, adds a white outline and shadow, and downloads a 512×512 WebP under 512 KB." },
  { name: "Start a sticker pack with @Stickers", text: "In Telegram, open @Stickers and send /newpack — not /newemojipack — then name the pack." },
  { name: "Send the sticker as a file", text: "Attach → File. Sent as a photo, Telegram recompresses it and the bot rejects it." },
  { name: "Tag it with an emoji, repeat, publish", text: "Reply with one emoji per sticker, add more, then /publish and choose a short link." },
  { name: "Add the pack", text: "Open the t.me/addstickers/… link and tap Add Stickers. Share the link with anyone." },
];

const TOC = [
  { id: "quick", title: "Quick answer: the 5 steps" },
  { id: "need", title: "What you need" },
  { id: "step1", title: "Step 1 — Cut the photo in your browser" },
  { id: "step2", title: "Step 2 — Build the pack with @Stickers" },
  { id: "step3", title: "Step 3 — Share and manage the pack" },
  { id: "editor", title: "Telegram's built-in sticker editor" },
  { id: "errors", title: "Common errors" },
  { id: "faq", title: "FAQ" },
];

const FAQ: Faq[] = [
  {
    q: "Can I edit a pack later?",
    a: "Yes. Message @Stickers again: /addsticker adds to an existing pack, /delsticker removes one, /ordersticker changes the order, and /editsticker changes a sticker's emoji. The bot walks you through picking the pack each time.",
  },
  {
    q: "How many stickers fit in a pack?",
    a: "Telegram allows up to 120 stickers in a static pack. Most people stop far earlier — a good pack is a dozen expressions, not a hundred.",
  },
  {
    q: "Does this work on desktop only?",
    a: "It works from any browser and any Telegram app. The cut-out step needs a browser (phone or desktop); the @Stickers chat can be on your phone, on Telegram Desktop, or on web.telegram.org.",
  },
  {
    q: "Why does the bot say 'exactly 100×100 pixels'?",
    a: "You started a custom-emoji pack with /newemojipack. 100×100 is Telegram's emoji size. Cancel, send /newpack, and use the same 512×512 file — it is already the right size for a sticker pack.",
  },
  {
    q: "Can I make WhatsApp stickers this way?",
    a: "Not as a pack. WhatsApp only adds sticker packs through a companion app on the phone; there is no bot or web route. The PNG still works as an ordinary image in a WhatsApp chat.",
  },
  {
    q: "Can I make animated stickers?",
    a: "Not with this flow. Telegram's animated stickers are TGS (a Lottie-style vector format) or WEBM video, made in Adobe After Effects or a video tool. A GIF made from a photo is sent as a GIF, not added to a sticker pack.",
  },
];

export default function TelegramPackGuide() {
  return (
    <ArticleLayout
      article={article}
      toc={TOC}
      extraGraph={[
        howToNode({
          name: "How to make Telegram stickers from a photo without an app",
          description: "Cut a photo into a 512×512 sticker in the browser, then build a pack with Telegram's @Stickers bot.",
          steps: STEPS,
        }),
        faqPageNode(FAQ),
      ]}
    >
      <p className="lede">
        You don&apos;t need a sticker app. Telegram builds packs through its own bot,{" "}
        <strong>@Stickers</strong>, which works from any phone, desktop or web client, and the
        only thing it needs from you is a transparent 512×512 image. Making that image is the
        part every guide skips — and it takes a browser, not an app. The whole flow, start to
        finish:
      </p>

      <H2 id="quick">Quick answer: the 5 steps</H2>
      <ol>
        {STEPS.map((s) => (
          <li key={s.name}>
            <strong>{s.name}.</strong> {s.text}
          </li>
        ))}
      </ol>

      <H2 id="need">What you need</H2>
      <ul>
        <li>A photo with one clear subject — a face, a pet, an object — ideally on a plain background.</li>
        <li>A browser. The cut-out runs in it; nothing is uploaded.</li>
        <li>Telegram on any device. Desktop is fine, and easier for the file step.</li>
      </ul>

      <H2 id="step1">Step 1 — Cut the photo into a 512×512 sticker in your browser</H2>
      <p>
        Open the <Link href="/tools/sticker">Telegram sticker maker</Link> and drop the photo in.
        An AI model running in your browser removes the background; the tool then adds a white
        outline and a soft shadow — the look Telegram&apos;s own guide recommends: &ldquo;a
        transparent background, white stroke and black shadow effect will make your sticker stand
        out&rdquo; — and an optional caption. Download the <strong>WebP</strong>: it is 512×512
        and re-encoded until it is under 512 KB, which is what the bot accepts. The PNG is the same
        cut-out for anywhere else.
      </p>
      <p>
        If the cut-out is wrong — fly-away hair, a subject touching the frame edge, a white dog on
        snow — crop closer or try another photo; there is no erase brush. A thicker outline hides a
        ragged edge.
      </p>

      <H2 id="step2">Step 2 — Build the pack with @Stickers</H2>
      <ol>
        <li>In Telegram, search for <strong>@Stickers</strong> and open the chat. Tap Start.</li>
        <li>Send <code>/newpack</code>. The bot asks for a name — the title people will see.</li>
        <li>
          <strong>Send the sticker as a file.</strong> On desktop: the paperclip → File. On a phone:
          attach → File (not Gallery). Sent as a photo, Telegram converts it to a compressed JPEG,
          the transparency is gone, and the bot rejects it.
        </li>
        <li>The bot asks for an emoji. Reply with one. It only tags the sticker for the emoji-suggestion panel.</li>
        <li>Repeat the file + emoji steps for each sticker.</li>
        <li>Send <code>/publish</code>. The bot asks for an icon (you can skip it) and a short name for the link.</li>
        <li>You get <code>t.me/addstickers/&lt;shortname&gt;</code>. Open it, tap <strong>Add Stickers</strong>.</li>
      </ol>
      <h3>&ldquo;Exactly 100×100 pixels&rdquo; — you started an emoji pack</h3>
      <p>
        If the bot asks for a 100×100 image you sent <code>/newemojipack</code>, which creates a
        <em> custom-emoji</em> pack. Cancel with <code>/cancel</code>, send <code>/newpack</code>, and
        send the same 512×512 file. It is already the right size for a sticker pack.
      </p>
      <h3>&ldquo;File too big&rdquo; — the 512 KB cap</h3>
      <p>
        The bot rejects static stickers over 512 KB. A PNG of a detailed photo can pass that; the
        WebP from the sticker maker can&apos;t, because it is re-encoded until it fits. If you
        exported a PNG elsewhere, convert it to WebP or drop the photo into the sticker maker.
      </p>

      <H2 id="step3">Step 3 — Share and manage the pack</H2>
      <p>
        The <code>t.me/addstickers/…</code> link is the pack. Send it in any chat, put it in a bio,
        post it anywhere; anyone who opens it can add the pack. To change it later, message
        @Stickers:
      </p>
      <ul>
        <li><code>/addsticker</code> — add a sticker to an existing pack.</li>
        <li><code>/delsticker</code> — remove one.</li>
        <li><code>/ordersticker</code> — change the order.</li>
        <li><code>/editsticker</code> — change a sticker&apos;s emoji.</li>
        <li><code>/stats</code> — how many people have added the pack.</li>
      </ul>

      <H2 id="editor">Telegram&apos;s built-in sticker editor</H2>
      <p>
        The Telegram phone app can turn a photo into a sticker with a finger-drawn cut-out. It is
        fine for a quick one-off. It has no desktop version, no automatic background removal, and
        no outline or shadow controls — so for a clean cut-out, a consistent set, or working from a
        computer, the browser route above is the one to use.
      </p>

      <H2 id="errors">Common errors, and what they mean</H2>
      <ul>
        <li><strong>&ldquo;Please send me the sticker as a file&rdquo;</strong> — you sent it as a photo. Attach → File.</li>
        <li><strong>&ldquo;exactly 100×100 pixels&rdquo;</strong> — emoji pack, not sticker pack. <code>/newpack</code>.</li>
        <li><strong>&ldquo;too big&rdquo;</strong> — over 512 KB. Use the WebP.</li>
        <li><strong>&ldquo;must be PNG or WEBP with transparent layer&rdquo;</strong> — a JPG, or a PNG with an opaque background. The sticker maker outputs both formats transparent.</li>
        <li><strong>&ldquo;short name is already taken&rdquo;</strong> — pick another link name at <code>/publish</code>.</li>
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
        <Link href="/tools/sticker">Make a Telegram sticker from a photo</Link>. The size and format
        rules in full: <Link href="/guides/telegram-sticker-size">Telegram sticker size: 512×512, WebP vs PNG</Link>.
        Want the photo to move instead? <Link href="/tools/gif">Animate it into a GIF</Link>.
      </p>
    </ArticleLayout>
  );
}

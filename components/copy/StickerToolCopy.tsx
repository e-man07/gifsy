// Server-rendered copy for /tools/sticker. Same reasoning as GifToolCopy: the
// workshop only shows its Telegram guidance after a photo is processed, so a
// crawler saw ~25 words. Written from docs/seo/runs/15-brief-tools-sticker.md;
// every number mirrors lib/sticker.ts, lib/export.ts and ImportGuide.tsx.
//
// This is the one page on the site where "100% in your browser" is true with
// no caveat — keep the 3D tool's server step out of it.

import Link from "next/link";
import { JsonLd, faqPageNode, breadcrumbNode, howToNode, type Faq } from "@/lib/seo/json-ld";

const TELEGRAM_SPEC = "https://core.telegram.org/stickers#static-stickers-and-emoji";

const STEPS = [
  {
    name: "Add a photo",
    text: "Drop a PNG, JPG or WebP onto the sticker maker. The AI background removal runs in your browser.",
  },
  {
    name: "Style the cutout",
    text: "Set the outline width and colour, keep or drop the shadow, and add an optional caption of up to 24 characters.",
  },
  {
    name: "Make sticker and download",
    text: "Download the 512×512 WebP for Telegram, or the transparent PNG for anywhere else.",
  },
];

export const STICKER_FAQ: Faq[] = [
  {
    q: "Is the Telegram sticker maker free?",
    a: "Yes, always: no account, no watermark, and no limit on how many stickers you make. The paid product on this site is the separate 3D photo embed.",
  },
  {
    q: "Is my photo uploaded anywhere?",
    a: "No. The background-removal model is downloaded to your browser and runs there; your photo never leaves the tab. There is no upload endpoint on this page.",
  },
  {
    q: "What size does a Telegram sticker need to be?",
    a: "A static sticker is a PNG or WebP with a transparent background where one side is exactly 512 pixels and the other is 512 or less. The @Stickers bot also rejects files over 512 KB. Gifsy exports 512×512 in both formats and shrinks the WebP until it fits.",
  },
  {
    q: "Should I use PNG or WebP?",
    a: "WebP when you're sending to the @Stickers bot — it's re-encoded to stay under the 512 KB cap. PNG when you want the untouched cutout or plan to use it as an ordinary image in another app.",
  },
  {
    q: "Why does Telegram say it needs \"exactly 100×100 pixels\"?",
    a: "Because you started a custom-emoji pack with /newemojipack. 100×100 is Telegram's emoji size. Send /newpack instead; the 512×512 file you already downloaded is the right size for a sticker pack.",
  },
  {
    q: "Can I make WhatsApp stickers with this?",
    a: "Not as a pack. WhatsApp only adds sticker packs through a companion app on the phone; there is no bot, link or web route, so no browser tool can finish that job. You can still send the PNG in WhatsApp as a normal image.",
  },
  {
    q: "Why did the first run take so long?",
    a: "The first sticker downloads the background-removal model (a few dozen megabytes) and caches it in your browser. Later runs skip that and take seconds.",
  },
  {
    q: "Can I add text to the sticker?",
    a: "Yes — a caption of up to 24 characters, drawn in capitals with a dark stroke along the bottom of the sticker.",
  },
  {
    q: "Can I make animated Telegram stickers?",
    a: "No. This tool exports static PNG and WebP only; Telegram's animated stickers are TGS or WEBM files. If you want a photo to move, the GIF maker animates it — but a GIF is sent as a GIF, not added to a sticker pack.",
  },
];

export function StickerToolCopy() {
  return (
    <section className="mx-auto w-full max-w-2xl px-5 pb-16 sm:px-8">
      <JsonLd
        graph={[
          breadcrumbNode([
            { name: "Gifsy", path: "/" },
            { name: "Telegram sticker maker", path: "/tools/sticker" },
          ]),
          howToNode({
            name: "How to make a Telegram sticker from a photo",
            description:
              "Turn a photo into a transparent 512×512 sticker in your browser, then add it to a Telegram pack with the @Stickers bot.",
            steps: STEPS,
          }),
          faqPageNode(STICKER_FAQ),
        ]}
      />
      <div className="legal">
        <h2>How to make a Telegram sticker from a photo</h2>
        <ol>
          {STEPS.map((s) => (
            <li key={s.name}>
              <strong>{s.name}.</strong> {s.text}
            </li>
          ))}
        </ol>
        <p>
          The outline and shadow are on by default because that is what Telegram&apos;s own
          sticker guide recommends: &ldquo;a transparent background, white stroke and black
          shadow effect will make your sticker stand out.&rdquo;
        </p>

        <h2>Add it to Telegram with the @Stickers bot</h2>
        <p>
          Telegram builds packs through its official bot, so this works from any browser or
          desktop — no app needed — and ends with a <code>t.me/addstickers/…</code> link anyone
          can add.
        </p>
        <ol>
          <li>
            Open <strong>@Stickers</strong> in Telegram and send <code>/newpack</code> — a{" "}
            <em>sticker</em> pack, not <code>/newemojipack</code> — then name the pack.
          </li>
          <li>
            Send the downloaded image <strong>as a file</strong> (attach → File). Sent as a photo,
            Telegram recompresses it to JPEG, drops the transparency, and the bot rejects it.
          </li>
          <li>Reply with one emoji to tag the sticker; it only labels it for the emoji panel.</li>
          <li>
            Repeat for more stickers, then send <code>/publish</code> and choose a short link
            name.
          </li>
          <li>
            Open the <code>t.me/addstickers/…</code> link and tap <strong>Add Stickers</strong>.
          </li>
        </ol>

        <h3>Getting &ldquo;exactly 100×100 pixels&rdquo;? You started an emoji pack</h3>
        <p>
          100×100 is Telegram&apos;s <em>custom-emoji</em> size, and the bot asks for it when you
          began with <code>/newemojipack</code>. Send <code>/newpack</code> instead; the 512×512
          file you already downloaded is the right size for a sticker pack.
        </p>

        <h3>Telegram&apos;s built-in sticker editor vs this page</h3>
        <p>
          The Telegram phone app can crop a photo into a sticker with your finger. It has no
          desktop or browser version and no automatic subject cutout. Use it for a quick one-off;
          use this page when you want a clean AI cutout, an outline, or you are at a computer.
        </p>

        <h2>Telegram sticker size and format: 512×512, PNG or WebP, under 512 KB</h2>
        <p>
          A static Telegram sticker must be a PNG or WebP with a transparent background where one
          side is exactly 512 pixels and the other is 512 or less. The @Stickers bot also rejects
          files over 512 KB. Gifsy exports both formats at 512×512 and re-encodes the WebP until
          it fits.
        </p>
        <p>
          The size and format rules are in Telegram&apos;s{" "}
          <a href={TELEGRAM_SPEC} rel="noopener" target="_blank">
            sticker documentation
          </a>
          ; the 512 KB cap is enforced by the bot itself.
        </p>

        <h3>PNG or WebP for Telegram?</h3>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>PNG</th>
              <th>WebP</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Transparency</td>
              <td>Yes, lossless</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>File size</td>
              <td>Larger; a detailed photo can pass 512 KB</td>
              <td>Much smaller; re-encoded until it is under 512 KB</td>
            </tr>
            <tr>
              <td>Quality</td>
              <td>Exact pixels</td>
              <td>Starts at high quality and only steps down if the cap is hit</td>
            </tr>
            <tr>
              <td>Pick it when</td>
              <td>You want the untouched cutout, or an image for Discord, Signal or iMessage</td>
              <td>You are sending to @Stickers</td>
            </tr>
          </tbody>
        </table>

        <h3>Why &ldquo;send as file&rdquo; matters</h3>
        <p>
          Telegram treats anything sent as a <em>photo</em> as a JPEG to be resized and
          compressed: the transparent background is gone and the size may no longer be 512.
          Attach → File skips that and hands the bot the exact file you downloaded.
        </p>

        <h2>Your photo never leaves your browser</h2>
        <p>
          The background-removal model (ISNet, via the open-source{" "}
          <code>@imgly/background-removal</code> library) is downloaded to your browser the
          first time you make a sticker and cached after that. The cutout, outline, shadow,
          caption and WebP encoding all run on a canvas in this tab. There is no upload
          endpoint on this page and no account. What <em>is</em> fetched over the network is the
          model itself, from a content delivery network — never your photo. Close the tab and
          nothing remains.
        </p>

        <h2>What photos make good stickers — and what the cutout gets wrong</h2>
        <p>
          <strong>Works best:</strong> one clear subject with a hard edge — a face, a pet, an
          object — on a plain or blurred background, fully inside the frame, at least 600 px on
          the short side.
        </p>
        <p>
          <strong>Struggles:</strong> flyaway hair and fur (the edge goes soft or nibbled), glass
          and steam, subjects that touch the frame edge (the auto-crop cannot pad what isn&apos;t
          there), low contrast between subject and background (a white dog on snow), several
          people touching (cut as one blob), and tiny subjects in wide shots (blurry at 512 px).
          Crop closer before you drop the photo; a thicker outline hides a ragged edge. There is
          no manual erase brush — if the cutout is wrong, try another photo.
        </p>

        <h2>Also a transparent PNG for Discord, Signal and iMessage — but not WhatsApp packs</h2>
        <p>
          The PNG is an ordinary transparent image: paste it into Discord, Signal, iMessage or
          Slack like any picture.
        </p>
        <p>
          <strong>WhatsApp sticker packs are not supported.</strong> WhatsApp only adds packs
          through a companion app on the phone; there is no bot, link or web route, so a browser
          tool cannot finish the job. You can still send the PNG in WhatsApp — it arrives as an
          image, not a sticker.
        </p>

        <h2>Frequently asked questions</h2>
        {STICKER_FAQ.map((f) => (
          <div key={f.q}>
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}

        <h2>Next</h2>
        <ul>
          <li>
            <Link href="/tools/gif">Animate a photo into a GIF</Link> — the same no-upload
            approach, for motion.
          </li>
          <li>
            <Link href="/create">Make an interactive 3D photo</Link> — real depth from one
            photo, with an embed for any website.
          </li>
        </ul>
      </div>
    </section>
  );
}

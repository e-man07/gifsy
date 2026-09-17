// Server-rendered copy for /tools/sticker on the shared blocks. Facts mirror
// lib/sticker.ts, lib/export.ts and ImportGuide.tsx. This is the one page
// where "100% in your browser" is true with no caveat — keep the 3D tool's
// server step out of it. Brief: docs/seo/runs/15.

import { Download, ImagePlus, Wand2 } from "lucide-react";
import { JsonLd, faqPageNode, breadcrumbNode, howToNode, type Faq } from "@/lib/seo/json-ld";
import { Compare, CopyPage, Facts, FaqList, NextLinks, ProsCons, Section, Steps, inlineLink } from "./blocks";

const TELEGRAM_SPEC = "https://core.telegram.org/stickers#static-stickers-and-emoji";

const STEPS = [
  {
    Icon: ImagePlus,
    name: "Add a photo",
    text: "PNG, JPG or WebP. The AI background removal runs in your browser.",
  },
  {
    Icon: Wand2,
    name: "Style the cutout",
    text: "Outline width and colour, shadow on or off, an optional caption of up to 24 characters.",
  },
  {
    Icon: Download,
    name: "Make sticker, then download",
    text: "The 512×512 WebP for Telegram, or the transparent PNG for anywhere else.",
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
    <CopyPage>
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
            steps: STEPS.map(({ name, text }) => ({ name, text })),
          }),
          faqPageNode(STICKER_FAQ),
        ]}
      />

      <Section
        title="How to make a Telegram sticker from a photo"
        intro={
          <p>
            The outline and shadow are on by default because that is what Telegram&apos;s own
            guide recommends: &ldquo;a transparent background, white stroke and black shadow
            effect will make your sticker stand out.&rdquo;
          </p>
        }
      >
        <Steps steps={STEPS} />
      </Section>

      <Section
        title="Add it to Telegram with the @Stickers bot"
        intro={
          <p>
            Telegram builds packs through its official bot, so this works from any browser or
            desktop and ends with a <code>t.me/addstickers/…</code> link anyone can add.
          </p>
        }
      >
        <ol className="card divide-y divide-foreground/10 rounded-2xl bg-panel">
          {[
            ["Send /newpack to @Stickers", "A sticker pack, not /newemojipack. Then name the pack."],
            ["Send the image as a file", "Attach → File. Sent as a photo, Telegram recompresses it to JPEG, drops the transparency, and the bot rejects it."],
            ["Reply with one emoji", "It only labels the sticker for the emoji panel."],
            ["Send /publish", "Repeat for more stickers first, then choose a short link name."],
            ["Open the link, tap Add Stickers", "The t.me/addstickers/… link works for anyone."],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-4 px-5 py-3.5">
              <span className="num pt-0.5 text-sm text-sky-deep">{i + 1}</span>
              <div>
                <p className="font-display text-sm text-foreground">{t}</p>
                <p className="mt-0.5 text-sm text-muted">{d}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-petal/40 bg-petal/5 px-4 py-3">
            <h3 className="font-display text-sm text-foreground">
              Getting &ldquo;exactly 100×100 pixels&rdquo;? You started an emoji pack.
            </h3>
            <p className="mt-1 text-sm text-muted">
              100×100 is Telegram&apos;s custom-emoji size, asked for after <code>/newemojipack</code>.
              Send <code>/newpack</code> instead — your 512×512 file is already right.
            </p>
          </div>
          <div className="rounded-xl border border-foreground/10 px-4 py-3">
            <h3 className="font-display text-sm text-foreground">Telegram&apos;s in-app editor vs this page</h3>
            <p className="mt-1 text-sm text-muted">
              The phone app can crop a photo into a sticker with your finger — no desktop version,
              no automatic cutout. Use it for a quick one-off; use this for a clean AI cutout, an
              outline, or when you&apos;re at a computer.
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Telegram sticker size and format"
        intro={
          <p>
            A static Telegram sticker must be a PNG or WebP with a transparent background where
            one side is exactly 512 pixels and the other is 512 or less. The @Stickers bot also
            rejects files over 512 KB. Gifsy exports both formats at 512×512 and re-encodes the
            WebP until it fits.
          </p>
        }
      >
        <Facts
          items={[
            { label: "Size", value: "512 px on one side", note: "The other 512 or less. Gifsy: 512×512." },
            { label: "Format", value: "PNG or WebP", note: "Transparent background." },
            { label: "File size", value: "Under 512 KB", note: "Enforced by the @Stickers bot." },
            { label: "Send as", value: "File, not photo", note: "Photos get recompressed to JPEG." },
          ]}
        />
        <div className="mt-4">
          <Compare
            cols={["WebP", "PNG"]}
            rows={[
              { label: "Transparency", cells: [[true, "Yes"], [true, "Yes, lossless"]] },
              { label: "File size", cells: [[true, "Small; re-encoded to stay under 512 KB"], [false, "Larger; a detailed photo can pass 512 KB"]] },
              { label: "Quality", cells: ["High; steps down only if the cap is hit", "Exact pixels"] },
              { label: "Pick it for", cells: ["Sending to @Stickers", "The untouched cutout; Discord, Signal, iMessage"] },
            ]}
          />
        </div>
        <p className="mt-3 text-xs text-muted">
          Rules from Telegram&apos;s{" "}
          <a href={TELEGRAM_SPEC} className={inlineLink} rel="noopener" target="_blank">
            sticker documentation
          </a>
          .
        </p>
      </Section>

      <Section
        title="Your photo never leaves your browser"
        intro={
          <p>
            The background-removal model (ISNet, via the open-source{" "}
            <code>@imgly/background-removal</code> library) downloads to your browser the first
            time and is cached after that. The cutout, outline, shadow, caption and WebP encoding
            all run on a canvas in this tab. What is fetched over the network is the model — never
            your photo. Close the tab and nothing remains.
          </p>
        }
      />

      <Section title="What photos make good stickers">
        <ProsCons
          good={[
            "One clear subject with a hard edge — a face, a pet, an object",
            "Plain or blurred background",
            "Subject fully inside the frame",
            "600 px or more on the short side",
          ]}
          bad={[
            "Flyaway hair and fur — the edge goes soft or nibbled",
            "Glass, steam, transparent objects",
            "Subjects touching the frame edge — nothing to pad with",
            "Low contrast with the background, like a white dog on snow",
            "Several people touching — cut as one blob",
            "Tiny subjects in wide shots — blurry at 512 px",
          ]}
        />
        <p className="mt-3 text-xs text-muted">
          Crop closer before you drop the photo; a thicker outline hides a ragged edge. There is no
          manual erase brush — if the cutout is wrong, try another photo.
        </p>
      </Section>

      <Section
        title="Discord, Signal, iMessage: yes. WhatsApp packs: no."
        intro={
          <p>
            The PNG is an ordinary transparent image — paste it into Discord, Signal, iMessage or
            Slack like any picture. <strong className="text-foreground">WhatsApp sticker packs are not supported:</strong>{" "}
            WhatsApp only adds packs through a companion app on the phone, with no bot, link or web
            route. You can still send the PNG there; it arrives as an image, not a sticker.
          </p>
        }
      />

      <Section title="Questions">
        <FaqList faqs={STICKER_FAQ} />
      </Section>

      <Section title="Next">
        <NextLinks
          links={[
            { href: "/tools/gif", label: "Animate a photo into a GIF", note: "Same no-upload approach, for motion." },
            { href: "/create", label: "Make an interactive 3D photo", note: "Real depth from one photo, with an embed for any site." },
          ]}
        />
      </Section>
    </CopyPage>
  );
}

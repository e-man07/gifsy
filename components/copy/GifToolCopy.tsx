// Server-rendered copy for /tools/gif, laid out with the shared blocks so it
// reads as product UI rather than an article. The workshop used to gate every
// explanatory sentence behind "add a photo", so a crawler saw ~50 words.
// Facts mirror lib/gif.ts (480×480, 30 frames, 8–30 fps, boomerang, one
// global palette) — change both together. Brief: docs/seo/runs/14.

import Link from "next/link";
import { Download, ImagePlus, SlidersHorizontal } from "lucide-react";
import { GIF_EFFECTS } from "@/lib/gif";
import { JsonLd, faqPageNode, breadcrumbNode, type Faq } from "@/lib/seo/json-ld";
import {
  Compare,
  CopyPage,
  Facts,
  FaqList,
  NextLinks,
  ProsCons,
  Section,
  Steps,
  inlineLink,
} from "./blocks";

const EFFECT_COPY: Record<string, { does: string; suits: string }> = {
  zoom: { does: "Slow push-in and back.", suits: "Portraits, product shots, album covers." },
  bounce: { does: "Two hops per loop.", suits: "Mascots, pets, faces." },
  shake: { does: "Handheld jitter on two rhythms.", suits: "Memes and reaction GIFs." },
  pulse: { does: "A gentle heartbeat swell.", suits: "Logos, hearts, anything that should breathe." },
  spin: { does: "One full turn per loop, corners hidden.", suits: "Badges, records, wheels — not horizons." },
  glitch: { does: "RGB split plus torn slices, seeded so it repeats.", suits: "Posters, cyberpunk, error-screen jokes." },
};

export const GIF_FAQ: Faq[] = [
  {
    q: "Is the GIF maker free?",
    a: "Yes — always free, no account, no watermark, and no limit on how many GIFs you make. Gifsy's paid plan is for the separate 3D photo tool only.",
  },
  {
    q: "Does it add a watermark?",
    a: "No. The file you download is exactly the GIF you see in the preview, with nothing added.",
  },
  {
    q: "Where do my photos go?",
    a: "Nowhere. The photo stays in your browser tab: the frames and the GIF are built by JavaScript on your device. There is no upload endpoint for this tool — you can confirm that in your browser's Network tab.",
  },
  {
    q: "What size is the GIF, and can I change it?",
    a: "480 × 480 pixels, square, centre-cropped from your photo. There's no size control yet, so if you need a different shape, crop the photo first. Chat apps and READMEs are fine with 480 px; emoji-sized targets will need a resize after export.",
  },
  {
    q: "What does the speed slider actually change?",
    a: "The delay between the 30 rendered frames, not the file size. 8 fps gives a loop of about 3.8 seconds, 20 fps about 1.5 seconds, 30 fps about 1 second. File size comes from pixels, palette complexity, and the boomerang toggle, which doubles the frame count.",
  },
  {
    q: "What's the difference between boomerang and reverse?",
    a: "Reverse plays a clip backwards. Boomerang plays forward and then backward inside one loop, so the last frame meets the first and the loop never jumps. It's on by default for single-photo GIFs; the slideshow mode plays photos in order only.",
  },
  {
    q: "Can I make a transparent GIF from a transparent PNG?",
    a: "Not with this tool today. Transparency isn't written into the GIF, so transparent areas come out as a solid background. For a cut-out with a transparent background, use the sticker maker instead.",
  },
  {
    q: "Can the photo move in real 3D instead of a flat zoom?",
    a: "Yes — that's Gifsy's other tool. The 3D photo maker estimates depth from the photo and renders a parallax scene you can spin and embed on a website. It's free for three generations and works differently from the GIF maker, including how it handles your data.",
  },
];

export function GifToolCopy() {
  return (
    <CopyPage>
      <JsonLd
        graph={[
          breadcrumbNode([
            { name: "Gifsy", path: "/" },
            { name: "Animate a photo into a GIF", path: "/tools/gif" },
          ]),
          faqPageNode(GIF_FAQ),
        ]}
      />

      <Section
        title="How to animate a photo into a GIF"
        intro={
          <p>
            Three steps, all in this tab. Need a cut-out with a transparent background instead?
            That&apos;s the{" "}
            <Link href="/tools/sticker" className={inlineLink}>
              Telegram sticker maker
            </Link>
            .
          </p>
        }
      >
        <Steps
          steps={[
            {
              Icon: ImagePlus,
              name: "Add a photo",
              text: "JPG, PNG or WebP. Keep the subject near the middle — the GIF is a square crop of the centre.",
            },
            {
              Icon: SlidersHorizontal,
              name: "Pick an effect and a speed",
              text: "Zoom, Bounce, Shake, Pulse, Spin or Glitch; 8–30 fps; keep Boomerang on for a seamless loop.",
            },
            {
              Icon: Download,
              name: "Make GIF, then download",
              text: "Frames render in your browser in seconds and save as animation.gif — ready for Telegram, Discord, Slack or a README.",
            },
          ]}
        />
      </Section>

      <Section
        title="Two modes"
        intro={<p>Animate one photo, or combine several into a slideshow — same page, one toggle.</p>}
      >
        <Facts
          items={[
            { label: "Animate one", value: "Six effects, 8–30 fps, boomerang", note: "One shared palette, so no flicker." },
            { label: "Combine several", value: "2+ photos, 0.2–1.5 s each", note: "In the order you added them, on white." },
            { label: "Output", value: "480 × 480 GIF", note: "Centre crop. No size control yet." },
            { label: "Cost", value: "Free, no account", note: "No watermark, no limit." },
          ]}
        />
      </Section>

      <Section title="Six effects for a single photo">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GIF_EFFECTS.map((e) => {
            const c = EFFECT_COPY[e.id];
            if (!c) return null;
            return (
              <li key={e.id} className="rounded-xl border border-foreground/10 px-4 py-3">
                <h3 className="font-display text-sm text-foreground">{e.label} GIF</h3>
                <p className="mt-1 text-sm text-muted">{c.does}</p>
                <p className="mt-1 text-xs text-muted">Suits: {c.suits}</p>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-muted">
          With Boomerang on, every effect plays forward and then in reverse, so the loop never jumps.
        </p>
      </Section>

      <Section
        title="Your photo is never uploaded — check it yourself"
        intro={
          <p>
            The encoder (gifenc, open source) downloads once and runs in your browser. Your photo is
            read into a canvas, frames are drawn, the GIF is encoded and offered as a download.
            There is no upload endpoint for this tool.
          </p>
        }
      >
        <Steps
          steps={[
            { name: "Open the Network tab", text: "Developer tools (F12) → Network." },
            { name: "Click Make GIF", text: "No request carries your image. The first run loads one small script: the encoder." },
            { name: "Go offline, try again", text: "Switch Wi-Fi off and make another GIF. It still works." },
          ]}
        />
        <p className="mt-3 text-xs text-muted">
          The page loads ordinary page-view analytics with no image data. The{" "}
          <Link href="/create" className={inlineLink}>
            3D photo tool
          </Link>{" "}
          works differently on the free plan — see the{" "}
          <Link href="/privacy" className={inlineLink}>
            privacy policy
          </Link>
          .
        </p>
      </Section>

      <Section
        title="Gifsy vs ezgif, Imgflip and Canva"
        intro={<p>Including where Gifsy is more limited: square 480 px GIF only, no APNG, WebP or transparency.</p>}
      >
        <Compare
          cols={["Gifsy", "ezgif", "Imgflip", "Canva"]}
          rows={[
            { label: "Uploads your photo", cells: [[true, "No"], [false, "Yes"], [false, "Yes"], [false, "Yes"]] },
            { label: "Watermark on free", cells: [[true, "No"], [true, "No"], [false, "Yes"], [true, "No"]] },
            { label: "Account to download", cells: [[true, "No"], [true, "No"], [true, "No"], [false, "Yes"]] },
            { label: "Effects for one still photo", cells: ["6", "A few, separate page", "Some", "None"] },
            { label: "Boomerang from a still", cells: [[true, "Yes"], [false, "No"], [false, "No"], [false, "No"]] },
            { label: "Output size", cells: [[false, "480 px square only"], [true, "Up to 1920 px"], [true, "Adjustable"], [true, "Adjustable"]] },
          ]}
        />
      </Section>

      <Section title="Which photos animate well">
        <ProsCons
          good={[
            "Subject in the middle third — the crop is square",
            "Zoom and Pulse: one clear subject with room to push into",
            "Bounce and Shake: faces, pets, mascots",
            "Spin: round or symmetric things",
            "Glitch: high contrast, saturated colour",
          ]}
          bad={[
            "Wide panoramas — the ends are cropped off",
            "Under 480 px on the short side — the crop upscales and goes soft",
            "Busy, low-contrast photos — grainy after the 256-colour reduction",
            "Spin on horizons or skylines",
            "Mixed orientations in Combine — the white letterbox flashes",
          ]}
        />
      </Section>

      <Section title="Questions">
        <FaqList faqs={GIF_FAQ} />
      </Section>

      <Section
        title="Make it move in real 3D"
        intro={
          <p>
            A Zoom GIF scales the whole picture. A 3D photo separates the subject from the
            background and lets a visitor tilt or spin it on the page — real parallax from one
            photo, within about ±23°, best with a clear subject on a simpler background.
          </p>
        }
      >
        <NextLinks
          links={[
            { href: "/create", label: "Try the 3D photo maker", note: "Runs in your browser; gives you an iframe for any site." },
            { href: "/tools/sticker", label: "Telegram sticker maker", note: "AI cut-out with an outline, exported at 512×512." },
            { href: "/gallery", label: "3D gallery", note: "What the effect looks like on different photos." },
          ]}
        />
      </Section>
    </CopyPage>
  );
}

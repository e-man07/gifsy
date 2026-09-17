// Server-rendered copy for /tools/gif. Lives outside the client workshop so a
// crawler (and a reader with the tool still loading) gets the whole page —
// the workshop used to gate every explanatory sentence behind "add a photo".
// Written from docs/seo/runs/14-brief-tools-gif.md; every number here is
// what lib/gif.ts actually does, so change both together.

import Link from "next/link";
import { GIF_EFFECTS } from "@/lib/gif";
import { JsonLd, faqPageNode, breadcrumbNode, type Faq } from "@/lib/seo/json-ld";

const EFFECT_COPY: Record<string, { suits: string; does: string }> = {
  zoom: {
    does: "A slow push-in and back — the whole frame eases from a little closer to noticeably closer, then returns.",
    suits: "Portraits, product shots, album covers: anything with one subject and a bit of room around it.",
  },
  bounce: {
    does: "The photo hops twice per loop, like it's landing on a springboard.",
    suits: "Mascots, pets, faces — motion that reads as \"alive\".",
  },
  shake: {
    does: "A handheld jitter on two different rhythms, so it never looks mechanical.",
    suits: "Memes, \"earthquake\" jokes, reaction GIFs.",
  },
  pulse: {
    does: "A gentle heartbeat swell — the softest of the six.",
    suits: "Logos, hearts, anything you want to breathe rather than move.",
  },
  spin: {
    does: "One full rotation per loop, zoomed in enough that the corners never show.",
    suits: "Round or symmetric things: badges, records, wheels. Skylines and horizons look wrong upside down.",
  },
  glitch: {
    does: "Red/blue channel split plus torn horizontal slices, seeded so the loop repeats exactly.",
    suits: "Posters, cyberpunk, error-screen jokes — it needs contrast and edges to tear.",
  },
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
    <section className="mx-auto w-full max-w-2xl px-5 pb-16 sm:px-8">
      <JsonLd
        graph={[
          breadcrumbNode([
            { name: "Gifsy", path: "/" },
            { name: "Animate a photo into a GIF", path: "/tools/gif" },
          ]),
          faqPageNode(GIF_FAQ),
        ]}
      />
      <div className="legal">
        <h2>Animate one photo, or combine several</h2>
        <p>
          <strong>Animate one</strong> takes a single photo and gives it motion: pick one of six
          effects, set the speed anywhere from 8 to 30 frames per second, and leave the boomerang
          loop on so the animation plays forward and then back without a visible jump. The result
          is a 480 × 480 GIF with one shared colour palette, which is why it doesn&apos;t flicker
          between frames and stays small.
        </p>
        <p>
          <strong>Combine several</strong> turns two or more photos into a looping slideshow. Each
          photo shows for 0.2–1.5 seconds (you choose), in the order you added them, centred on a
          white square. Each photo keeps its own palette, so unrelated pictures stay accurate.{" "}
          <Link href="/tools/gif?mode=combine">Make a GIF from several photos →</Link>
        </p>
        <p>
          Need a cut-out with a transparent background instead? That&apos;s the{" "}
          <Link href="/tools/sticker">Telegram sticker maker</Link>.
        </p>

        <h2>How to animate a photo into a GIF in three steps</h2>
        <ol>
          <li>
            <strong>Add a photo.</strong> Drop a JPG, PNG or WebP on the uploader above, or tap
            it on a phone. Keep the subject near the middle: the GIF is a square crop of the
            centre.
          </li>
          <li>
            <strong>Pick an effect and a speed.</strong> Choose Zoom, Bounce, Shake, Pulse, Spin or
            Glitch, drag Speed between 8 and 30 fps, and keep Boomerang loop on for a seamless
            cycle.
          </li>
          <li>
            <strong>Make GIF, then download.</strong> The frames render in your browser in a few
            seconds and the file saves as <code>animation.gif</code>, ready for Telegram, Discord,
            iMessage, Slack or a README.
          </li>
        </ol>

        <h2>Six motion effects for a single photo</h2>
        {GIF_EFFECTS.map((e) => {
          const c = EFFECT_COPY[e.id];
          if (!c) return null;
          return (
            <div key={e.id}>
              <h3>{e.label} GIF</h3>
              <p>
                {c.does} <em>Suits:</em> {c.suits}
              </p>
            </div>
          );
        })}
        <p>
          With Boomerang on, every effect plays forward and then in reverse, so the loop never
          jumps.
        </p>

        <h2>Runs in your browser — your photo is never uploaded</h2>
        <p>
          The GIF encoder is a small open-source JavaScript library (gifenc) that your browser
          downloads once and runs locally. Your photo is read from disk into a canvas, the frames
          are drawn, the GIF is encoded, and the file is offered as a download. There is no upload
          endpoint for this tool.
        </p>
        <p>How to check that yourself:</p>
        <ol>
          <li>Open your browser&apos;s developer tools (F12) and switch to the Network tab.</li>
          <li>Click Make GIF and watch the list — no request carries your image.</li>
          <li>
            The first run loads one small script (the encoder). After that, you can switch Wi-Fi
            off and make another GIF: it still works.
          </li>
        </ol>
        <p>
          The page itself loads ordinary page-view analytics, with no image data. The{" "}
          <Link href="/create">3D photo tool</Link> works differently on the free plan — its data
          flow is spelled out in the <Link href="/privacy">privacy policy</Link>.
        </p>

        <h2>Gifsy vs ezgif, Imgflip and Canva</h2>
        <p>
          The honest version, including where Gifsy is more limited: it outputs a 480 px square
          GIF only, with no APNG, WebP or transparent output.
        </p>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Gifsy</th>
              <th>ezgif</th>
              <th>Imgflip</th>
              <th>Canva</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Uploads your photo to a server</td>
              <td>No</td>
              <td>Yes</td>
              <td>Yes</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Watermark on the free tier</td>
              <td>No</td>
              <td>No</td>
              <td>Yes</td>
              <td>No</td>
            </tr>
            <tr>
              <td>Account needed to download</td>
              <td>No</td>
              <td>No</td>
              <td>No</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Motion effects for one still photo</td>
              <td>6</td>
              <td>A few, on a separate page</td>
              <td>Some</td>
              <td>No</td>
            </tr>
            <tr>
              <td>Boomerang from a still photo</td>
              <td>Yes</td>
              <td>No</td>
              <td>No</td>
              <td>No</td>
            </tr>
            <tr>
              <td>Output size</td>
              <td>480 px square only</td>
              <td>Up to 1920 px, any shape</td>
              <td>Adjustable</td>
              <td>Adjustable</td>
            </tr>
          </tbody>
        </table>

        <h2>Which photos animate well</h2>
        <ul>
          <li>Keep the subject in the middle third — wide panoramas lose their ends to the square crop.</li>
          <li>Zoom and Pulse: one clear subject with some background to push into.</li>
          <li>Bounce and Shake: faces, pets and mascots, where motion reads as personality.</li>
          <li>Spin: round or symmetric things; avoid horizons.</li>
          <li>Glitch: high contrast and saturated colour — the split needs edges to tear.</li>
          <li>
            Any effect: at least 480 px on the short side, or the crop will upscale and look soft;
            a busy, low-contrast photo goes grainy after the 256-colour reduction.
          </li>
          <li>Combine: use the same orientation for every photo, or the white letterbox flashes.</li>
        </ul>

        <h2>Frequently asked questions</h2>
        {GIF_FAQ.map((f) => (
          <div key={f.q}>
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}

        <h2>Make it move in real 3D</h2>
        <p>
          A Zoom GIF scales the whole picture. A 3D photo separates the subject from the
          background and lets a visitor tilt or spin it on the page — a real parallax from one
          photo, within a roughly ±23° orbit (not 360°), best with a clear subject on a simpler
          background. It runs in your browser too and gives you an iframe to paste into any site.{" "}
          <Link href="/create">Try the 3D photo maker →</Link>
        </p>
      </div>
    </section>
  );
}

// Server-rendered copy for /create. The workshop's own explanation only
// appeared after a photo was added, so a crawler saw the H1 and a button.
// Written from the /create section of docs/seo/runs/05-page-audits.md with
// the honesty constraints in docs/seo/runs/_brief-context.md: the photo stays
// in the browser; on Free the second half of the depth model runs on our
// server fed with activations (not the image); Pro runs fully locally;
// publishing uploads the finished scene and it becomes public.

import Link from "next/link";
import { FREE_GENERATION_LIMIT, PLAN_DISPLAY } from "@/lib/billing/plans";
import { JsonLd, faqPageNode, breadcrumbNode, howToNode, type Faq } from "@/lib/seo/json-ld";

const STEPS = [
  {
    name: "Add a photo",
    text: "Drop a JPG, PNG or WebP with one clear subject. Around 640 px or more on the long edge gives the depth model enough detail.",
  },
  {
    name: "Generate",
    text: "A depth model estimates how far every pixel is from the camera and a second model lifts the subject off the background. Choose whether to keep the backdrop or float the cut-out on a transparent one.",
  },
  {
    name: "Drag, export or embed",
    text: "Spin the scene with the mouse, export a GIF, PNG or WebM, or publish it to get a share link and an iframe you can paste into any website.",
  },
];

export const CREATE_FAQ: Faq[] = [
  {
    q: "Is it free?",
    a: `Every account gets ${FREE_GENERATION_LIMIT} free 3D generations, and publishing and embedding are unlimited on every plan; free embeds carry a small Gifsy badge. Pro is ${PLAN_DISPLAY.pro.price} once — no subscription — for unlimited generations, no badge, and commercial use.`,
  },
  {
    q: "Do I need an account?",
    a: "Yes, a free one, for 3D. It is how the free generations are counted and how a published scene is tied to you. GIFs and stickers on this site need no account at all.",
  },
  {
    q: "Is my photo uploaded?",
    a: "Your photo stays in the browser while the scene is made. On the free plan, the second half of the depth model runs on our server and receives intermediate model activations — numbers derived from the photo, not the image itself. On Pro the whole model runs on your device. Publishing is the one step that uploads the finished scene, and published scenes are public.",
  },
  {
    q: "Will it look like my photo?",
    a: "Yes — the colour image is your photo, untouched. What is added is depth: the subject separates from the background and moves with the camera. It is a 2.5D effect from one image, not a 3D model, so the orbit is about ±23° rather than a full turn.",
  },
  {
    q: "Can I export a video?",
    a: "You can export an animated GIF, a WebM video clip, or a still PNG of the scene. The interactive version — the one a visitor can drag — is the published embed.",
  },
  {
    q: "Does it work on phones?",
    a: "Yes. Generation runs on the phone's own processor and takes longer than on a laptop; the published embed works on any modern phone browser and responds to touch.",
  },
  {
    q: "How big is the embed?",
    a: "The snippet is a single iframe that defaults to 100% width and 500 px height; change the height to suit your layout. The viewer loads the image, a depth map, the subject mask and a small renderer — no AI runs for your visitors.",
  },
  {
    q: "Can I use it commercially?",
    a: "On Pro, yes — that is part of what the one-time payment buys, along with removing the badge. Free scenes are for personal and non-commercial use.",
  },
];

export function CreateToolCopy() {
  return (
    <section className="mx-auto w-full max-w-2xl px-5 pb-16 sm:px-8">
      <JsonLd
        graph={[
          breadcrumbNode([
            { name: "Gifsy", path: "/" },
            { name: "AI 3D photo animation", path: "/create" },
          ]),
          howToNode({
            name: "How to turn a photo into an interactive 3D photo",
            description:
              "Upload one photo, let two AI models add depth and lift the subject, then export or publish an embeddable scene.",
            steps: STEPS,
          }),
          faqPageNode(CREATE_FAQ),
        ]}
      />
      <div className="legal">
        <h2>What a 3D photo animation is — and how this one is different</h2>
        <p>
          A 3D photo animation takes a flat picture and adds parallax: near things move more than
          far things as the viewpoint shifts, which the eye reads as depth. Most tools render that
          motion once and hand you a video. Gifsy renders it live, so the person looking at it
          can drag the scene themselves — on this page, on the share link, and inside the
          iframe you paste into your own site.
        </p>

        <h2>How to make one in three steps</h2>
        <ol>
          {STEPS.map((s) => (
            <li key={s.name}>
              <strong>{s.name}.</strong> {s.text}
            </li>
          ))}
        </ol>

        <h2>Two looks</h2>
        <h3>With background</h3>
        <p>
          Keeps the whole photo. The subject lifts with depth over its own backdrop, and a clean
          fill is painted behind it so that moving the camera never reveals a hole.
        </p>
        <h3>Cut-out</h3>
        <p>
          Floats the subject alone on a transparent background, so it composites onto whatever
          your page looks like. This is the look that stays clean at every angle of the orbit.
        </p>

        <h2>Exports and the embed</h2>
        <ul>
          <li>
            <strong>GIF</strong> — a looping clip of the orbit, for chats and READMEs.
          </li>
          <li>
            <strong>WebM</strong> — a short video clip, where the browser supports recording.
          </li>
          <li>
            <strong>PNG</strong> — a still frame at the current angle.
          </li>
          <li>
            <strong>Embed</strong> — after publishing, an{" "}
            <code>&lt;iframe&gt;</code> at 100% width and 500 px height with{" "}
            <code>loading=&quot;lazy&quot;</code>. Paste it into Webflow, Framer, Squarespace,
            WordPress or plain HTML. Visitors download the image, a depth map, the subject mask
            and a small renderer; no AI runs on their side.
          </li>
        </ul>

        <h2>Which photos work best</h2>
        <ul>
          <li>One clear subject, fully inside the frame, on a plain or blurred background.</li>
          <li>Around 640 px or more on the long edge; small sources come out soft.</li>
          <li>
            Frame-filling subjects and busy, low-contrast backgrounds are the weak cases: the
            subject can&apos;t be separated cleanly, so the scene falls back to a depth-only
            view that reads as a gently warping sheet.
          </li>
          <li>
            The orbit is deliberately shallow — about ±23° — because one photo only contains one
            side of anything. That is the honest limit of a single-image 3D photo.
          </li>
        </ul>

        <h2>Where your photo goes</h2>
        <p>
          While the scene is made, your photo stays in your browser. The depth model is split in
          two: your device always runs the first, larger half. On the free plan the second half
          runs on our server and receives the intermediate activations from the first half — not
          the image — and sends back a depth map; that is also where a free generation is
          counted. On Pro both halves run on your device. Publishing is the one step that uploads
          the finished scene (image, depth map, subject mask and backdrop), and published scenes
          are public. The full account is in the <Link href="/privacy">privacy policy</Link>.
        </p>

        <h2>Free and Pro</h2>
        <p>
          Free: {FREE_GENERATION_LIMIT} 3D generations, unlimited publishing, a small Gifsy badge
          on embeds. Pro: {PLAN_DISPLAY.pro.price} once, never renews — unlimited generations, no
          badge, commercial use, and the whole depth model on your own device.{" "}
          <Link href="/pricing">See pricing</Link>.
        </p>

        <h2>Frequently asked questions</h2>
        {CREATE_FAQ.map((f) => (
          <div key={f.q}>
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}

        <h2>Not what you need?</h2>
        <ul>
          <li>
            <Link href="/tools/gif">Animate a photo into a GIF</Link> — flat motion effects,
            entirely in your browser, no account.
          </li>
          <li>
            <Link href="/tools/sticker">Telegram sticker maker</Link> — AI cut-out with an
            outline, exported at 512×512.
          </li>
          <li>
            <Link href="/gallery">3D gallery</Link> — what the effect looks like on different
            kinds of photos.
          </li>
        </ul>
      </div>
    </section>
  );
}

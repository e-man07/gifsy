// Server-rendered copy for /create on the shared blocks. Honesty constraints
// (docs/seo/runs/_brief-context.md): the photo stays in the browser; on Free
// the second half of the depth model runs on our server fed with activations
// (not the image); Pro runs fully locally; publishing uploads the finished
// scene and it becomes public.

import Link from "next/link";
import { Code, ImagePlus, Layers } from "lucide-react";
import { FREE_GENERATION_LIMIT, PLAN_DISPLAY } from "@/lib/billing/plans";
import { JsonLd, faqPageNode, breadcrumbNode, howToNode, type Faq } from "@/lib/seo/json-ld";
import { CopyPage, Facts, FaqList, NextLinks, ProsCons, Section, Steps, inlineLink } from "./blocks";

const STEPS = [
  {
    Icon: ImagePlus,
    name: "Add a photo",
    text: "JPG, PNG or WebP with one clear subject. 640 px or more on the long edge gives the depth model enough detail.",
  },
  {
    Icon: Layers,
    name: "Generate",
    text: "A depth model estimates how far every pixel is; a second model lifts the subject. Keep the backdrop, or float the cut-out on transparency.",
  },
  {
    Icon: Code,
    name: "Drag, export or embed",
    text: "Spin it with the mouse, export a GIF, PNG or WebM, or publish for a share link and an iframe for any website.",
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
    <CopyPage>
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
            steps: STEPS.map(({ name, text }) => ({ name, text })),
          }),
          faqPageNode(CREATE_FAQ),
        ]}
      />

      <Section
        title="What a 3D photo animation is — and how this one differs"
        intro={
          <p>
            A 3D photo animation adds parallax to a flat picture: near things move more than far
            things as the viewpoint shifts, which the eye reads as depth. Most tools render that
            once and hand you a video. Gifsy renders it live, so the person looking at it can drag
            the scene — here, on the share link, and inside the iframe on your own site.
          </p>
        }
      >
        <Steps steps={STEPS} />
      </Section>

      <Section title="Two looks, four outputs">
        <Facts
          items={[
            { label: "Look", value: "With background", note: "Subject lifts over its own backdrop; a clean fill is painted behind it." },
            { label: "Look", value: "Cut-out", note: "Subject alone on transparency — clean at every angle of the orbit." },
            { label: "Files", value: "GIF · WebM · PNG", note: "A looping clip, a short video, or a still at the current angle." },
            { label: "Embed", value: "One iframe", note: "100% wide, 500 px tall by default, loading=\"lazy\". No AI for visitors." },
          ]}
        />
      </Section>

      <Section title="Which photos work best">
        <ProsCons
          good={[
            "One clear subject, fully inside the frame",
            "Plain or blurred background",
            "640 px or more on the long edge",
          ]}
          bad={[
            "Frame-filling subjects — nothing behind them to parallax",
            "Busy, low-contrast backgrounds — falls back to a depth-only view that reads as a warping sheet",
            "Small sources — come out soft",
          ]}
        />
        <p className="mt-3 text-xs text-muted">
          The orbit is deliberately shallow — about ±23° — because one photo only contains one side
          of anything. That&apos;s the honest limit of a single-image 3D photo.
        </p>
      </Section>

      <Section
        title="Where your photo goes"
        intro={
          <p>
            While the scene is made, your photo stays in your browser. The depth model is split in
            two: your device always runs the first, larger half.
          </p>
        }
      >
        <Facts
          items={[
            { label: "Free", value: "One step on our server", note: "The second half of the depth model receives activations, not the image. That step is what counts as a generation." },
            { label: "Pro", value: "Everything on your device", note: "Both halves run locally." },
            { label: "Publishing", value: "Uploads the finished scene", note: "Image, depth map, subject mask, backdrop. Published scenes are public." },
            { label: "Full account", value: "Privacy policy", note: "Every case, spelled out." },
          ]}
        />
        <p className="mt-3 text-xs text-muted">
          <Link href="/privacy" className={inlineLink}>
            Read the privacy policy
          </Link>
        </p>
      </Section>

      <Section
        title="Free and Pro"
        intro={
          <p>
            Free: {FREE_GENERATION_LIMIT} 3D generations, unlimited publishing, a small Gifsy badge
            on embeds. Pro: {PLAN_DISPLAY.pro.price} once, never renews — unlimited generations, no
            badge, commercial use, and the whole depth model on your own device.{" "}
            <Link href="/pricing" className={inlineLink}>
              See pricing
            </Link>
          </p>
        }
      />

      <Section title="Questions">
        <FaqList faqs={CREATE_FAQ} />
      </Section>

      <Section title="Not what you need?">
        <NextLinks
          links={[
            { href: "/tools/gif", label: "Animate a photo into a GIF", note: "Flat motion effects, in your browser, no account." },
            { href: "/tools/sticker", label: "Telegram sticker maker", note: "AI cut-out with an outline, exported at 512×512." },
            { href: "/guides/best-photos-for-3d-effect", label: "Which photos work best", note: "Eleven rules, the six that fail, and a five-second test before you upload." },
            { href: "/guides/embed-3d-photo-on-website", label: "Embed a 3D photo on any site", note: "The iframe, every attribute, and each platform's menu path." },
            { href: "/guides/how-3d-photos-work", label: "How 3D photos work", note: "Depth map, matte, backdrop, two planes — with the numbers." },
            { href: "/gallery", label: "3D gallery", note: "What the effect looks like on different kinds of photos." },
          ]}
        />
      </Section>
    </CopyPage>
  );
}

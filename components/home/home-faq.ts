// Homepage FAQ. Rendered as H3/P pairs on the page AND fed verbatim to the
// FAQPage JSON-LD, so the two can never differ. Written from
// docs/seo/runs/09-brief-homepage.md with the honesty constraints in
// docs/seo/runs/_brief-context.md. Numbers come from lib/billing/plans.ts.

import { FREE_GENERATION_LIMIT, PLAN_DISPLAY } from "@/lib/billing/plans";
import type { Faq } from "@/lib/seo/json-ld";

export const HOME_FAQ: Faq[] = [
  {
    q: "Is my photo uploaded when I make a 3D photo?",
    a: "Your photo stays in your browser while the scene is made. On the Free plan, intermediate numbers from the depth model — activations, not the image — go to our server for one step. On Pro that step runs on your device too. Publishing is the one thing that uploads the finished scene, and published scenes are public.",
  },
  {
    q: "What's the difference between Gifsy and Immersity AI (LeiaPix)?",
    a: `Immersity for Web is still sold: its free tier exports watermarked 720p video for non-commercial use, and paid tiers sell monthly credits. Every Immersity plan hands you a video. Gifsy's output is an interactive iframe your visitors can drag on your own site, for ${PLAN_DISPLAY.pro.price} once — plus a GIF, WebM or PNG capture if you want a file too.`,
  },
  {
    q: "Does the 3D photo work on phones?",
    a: "Yes. Inside the iframe a visitor drags with a finger instead of a mouse. The viewer downloads only the image, depth map and subject mask plus a small renderer — no AI model — so it loads on a phone in a couple of seconds.",
  },
  {
    q: "Can I put it on Webflow, Framer, Squarespace or WordPress?",
    a: "Any site that accepts an iframe or an HTML embed: paste the snippet into Webflow's Embed element, Framer's Embed component, a Squarespace code block, a WordPress custom-HTML block, Carrd, Notion and the rest. Some builders only allow custom code on certain plans, so check yours.",
  },
  {
    q: "Can I remove the \"Made with Gifsy\" badge?",
    a: `Yes, with Pro — a one-time ${PLAN_DISPLAY.pro.price} payment that also removes the ${FREE_GENERATION_LIMIT}-generation limit and includes commercial use. Free embeds keep the small badge.`,
  },
  {
    q: "Does Pro work offline?",
    a: "Depth generation does, after the first model download, because on Pro the whole model runs on your device. Publishing does not: the backdrop fill runs on our server once at publish, and the finished scene has to be uploaded to get a share link and an embed.",
  },
  {
    q: "Can I use scenes on client sites commercially?",
    a: "On Pro, yes — commercial use is part of what the one-time payment buys, including on client sites. Free scenes are for personal, non-commercial use. The terms spell it out.",
  },
  {
    q: "Is this a 3D model I can export to Blender or print?",
    a: "No. A Gifsy scene is a 2.5D parallax photo: a depth map and a subject cut-out rendered on two displaced planes, viewable within roughly ±23°. If you need a mesh you can rotate all the way round or 3D-print, use an image-to-3D model generator such as Meshy or Tripo instead.",
  },
  {
    q: "What photo formats and sizes work?",
    a: "PNG, JPG or WebP. Around 640 px or more on the long edge reads crisper; one clear subject with some background behind it works best. Frame-filling subjects and busy, low-contrast backgrounds are the weak cases.",
  },
  {
    q: "Can I also get a GIF or video?",
    a: "Yes. From any 3D scene you can capture a looping GIF, a WebM clip or a PNG still. For plain photo animation without depth — zoom, bounce, shake, glitch — the free GIF maker does that with no account at all.",
  },
];

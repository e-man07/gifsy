# Run 12 — content-brief: `/guides/embed-3d-photo-on-website`

Date: 2026-09-17 · Skill: `content-brief` · Spoke 3 of the 3D cluster (run 06),
batch 1. Author: TBD (see README open question).

Inputs read: `_brief-context.md`, README decisions, run 06 spoke notes and
linking map, and the real embed code path (`components/CreateWorkshop.tsx`
~l.605, `app/s/[id]/scene-client.tsx` l.30, `app/embed/[id]/page.tsx`,
`app/embed/[id]/embed-client.tsx`, `app/api/scenes/[id]/route.ts`,
`app/api/asset/[id]/[field]/route.ts`, `lib/publish/creator.ts`,
`components/SceneViewer.tsx`, `next.config.ts`).

---

## 0. Product facts the writer must use verbatim (verified in repo)

**The snippet Gifsy actually copies to the clipboard** (identical in
`CreateWorkshop.tsx` and `scene-client.tsx`):

```html
<iframe src="https://www.gifsy.fun/embed/<id>" style="width:100%;height:500px;border:0" loading="lazy"></iframe>
```

No `title`, no `allow`, no `referrerpolicy`, no `sandbox`. The guide's
"universal snippet" adds `title` and a responsive wrapper on top of this; it
must not describe attributes as "already in the copied code" when they aren't.

**What the iframe loads** (`/embed/<id>`, noindexed, canonical → `/s/<id>`):

| Request | What it is | Format / size (from `lib/publish/creator.ts`) |
|---|---|---|
| `/embed/<id>` HTML | Server-rendered shell with a blurred poster `<img>` already in the HTML (thumbnail, or the matte for subject-only scenes) so the frame is never a blank hole | small |
| `/api/scenes/<id>` | `scene.json` manifest: config + asset URLs rewritten to the proxy below | ~1 KB |
| `/api/asset/<id>/thumb` | poster, 400 px long edge, WebP q0.8 | ~7.5 KB |
| `/api/asset/<id>/image` | colour image, ≤1440 px long edge, WebP q0.9 | ~150–350 KB |
| `/api/asset/<id>/depth` | grayscale depth map, lossless PNG (WebP banding rippled the mesh) | tens of KB |
| `/api/asset/<id>/mask` | subject cut-out with alpha, ≤1024 px, PNG; absent if segmentation was skipped | varies |
| `/api/asset/<id>/background` | LaMa-inpainted backdrop, WebP q0.9; absent if no subject / inpaint unavailable (viewer falls back to client-side push-pull fill) | ~100–300 KB |
| JS | Next.js chunk + `SceneViewer` (Three.js ^0.160, dynamically imported, `ssr:false`) | one bundle — measure with DevTools before publishing; do not invent a number |

Total weight is typically well under a hero MP4 — but the writer must
measure one real scene (DevTools → Network, disable cache) and print the
actual numbers with a date. **No fabricated sizes.**

**Caching / CORS** (`/api/scenes/[id]` and `/api/asset/[id]/[field]`):
`Cache-Control: public, max-age=31536000, s-maxage=31536000, immutable` and
`Access-Control-Allow-Origin: *`. Assets are immutable per scene id, cached
at Vercel's edge per region, and served through gifsy.fun — viewers never
touch the private R2 bucket. Second and later viewers in a region hit cache.

**Framing policy:** `next.config.ts` sets no `headers()`; there is no
`X-Frame-Options` and no `Content-Security-Policy: frame-ancestors`. Any
origin may frame `/embed/<id>`. (Same fact spoke 5/Framer relies on.)

**No AI runs for the viewer.** Depth (Depth Anything V2 Small), matte
(ISNet) and inpaint (LaMa) run once at creation/publish. The embed ships only
baked assets + a WebGL two-plane renderer (`embed-client.tsx`: "no AI
models"). The viewer's browser needs WebGL; if WebGL is unavailable the
poster stays visible (`ready` never flips) — say so in troubleshooting.

**Interaction:** pointer-follow with an auto-orbit "self-demo" until the
first pointer move (`SceneViewer.tsx` ~l.277); "Spin" mode = grab-to-orbit,
honest cone ≈ ±23°. Touch: `touch-action: pan-y` — horizontal drag orbits,
vertical drag scrolls the host page (l.372–378). No gyroscope, no fullscreen
API, no camera → `allow=""` is not required.

**Sizing gotcha:** the viewer is `h-[100dvh]`, i.e. it fills whatever height
the iframe has. A percentage `height` on the iframe with no sized parent
collapses to 0 → "blank iframe". This is the #1 troubleshooting entry.

**Badge:** `showBrand={scene.record.watermark !== false}` → Free-plan scenes
render a "Made with Gifsy" `<a>` bottom-right inside the iframe
(`SceneViewer.tsx` l.380–389). Pro ($9 one-time) removes it. README/run 08
decision: the optional host-page credit line is `rel="nofollow"` and
host-editable — the guide may offer it, never require it.

**Reduced motion — product gap, flag before publish:** `SceneViewer.tsx` has
no `prefers-reduced-motion` handling (only `globals.css` page animations do).
The guide must NOT claim the embed honours reduced motion until it does.
Recommended: ship a small change (respect the media query → disable
auto-orbit, keep pointer-follow) before this page goes live, then document
it. Until then the a11y section states what the host can do (see §7).

**Privacy for the host site's visitors:** the iframe requests go to
gifsy.fun (+ DataFast/Vercel analytics on the embed page — verify which
scripts load on `/embed/[id]` before writing; if analytics fire inside the
embed, disclose it). The visitor's photo is never involved; nothing is
uploaded by a viewer.

---

## 1. Target keyword analysis

| | |
|---|---|
| Primary | **embed 3D photo on website** |
| Secondary | interactive photo embed · 3d image iframe · add 3d photo to website |
| Also cover (entities) | iframe, `loading="lazy"`, `title` attribute, aspect-ratio / responsive wrapper, Content-Security-Policy `frame-src`, WebGL, depth map, parallax, "Made with Gifsy" badge, Wix / Carrd / Notion / Shopify / Squarespace / WordPress / Webflow / Framer |
| Dominant intent | **Informational how-to** with a transactional tail (people already have a 3D photo or want the tool that gives them an embed) |
| Difficulty | **Easy–Moderate.** Every page-1 result is a GLB/mesh viewer vendor doc (Sketchfab, VNTANA, Vectary, SphereLinks, Sirv, Emersya, Modelo, 3DShot) or a 2010 Cooliris relic. None answers "one photo → interactive embed". Intent mismatch, not authority, is what keeps them there. |
| Realistic 3-month position | impressions for the primary + long-tails within 6–8 weeks of indexing; top 20 for "embed 3d photo on website" / "3d photo iframe" by month 3 if the page is linked from `/create` and the hub. Top 10 depends on the domain getting indexed at all (README: not indexed today). |

Strategy note: the SERP's *format* (upload → copy iframe → paste, then a
per-CMS list) is exactly Gifsy's flow. Match the format, replace the object
(photo, not GLB), and out-detail everyone on the iframe attributes and
troubleshooting — the vendors gloss over both.

---

## 2. SERP competitive intelligence

Searches run: "embed 3D photo on website", "3d image iframe embed", "add 3d
photo to website interactive". Fetched: VNTANA, Sirv, Emersya, web.dev
iframe lazy-loading, Wix / Notion help, Squarespace plan search. SphereLinks
(expired TLS cert), Vectary (redirect loop) and Modelo (empty shell) could not
be fetched — read from snippets and run 06.

| # | URL | ~Words | Format | Covers | Misses |
|---|---|---|---|---|---|
| 1 | vntana.com/blog/how-to-embed-a-3d-model-in-your-website-a-quick-guide | ~3,500 | Vendor guide + FAQ | GLB/USDZ formats, AR benefits, iframe vs API, Wix/WordPress/Shopify one-liners, 4-Q FAQ | No actual iframe code, no attribute explanations, no troubleshooting, no a11y, product-only (needs a 3D model to start) |
| 2 | sketchfab.com/…/getting-started-with-sketchfab | ~1,000 | Vendor onboarding | Upload → Embed button → paste; Sketchfab embed options | Requires a mesh; no per-platform depth; no performance |
| 3 | spherelinks.io/blog/embed-3d-model-website-iframe | ~1,200 (snippet) | "Any website in 2026 (iframe, no code)" | The closest format twin: single iframe tag, "works almost anywhere iframes are supported" | Mesh only; no photo path |
| 4 | sirv.com/help/articles/3d-model | ~3,200 | Help centre | Real snippet (`?embed`, `frameborder`, `allowfullscreen`), `preload:false` lazy, ARIA/keyboard note, WordPress/Shopify/Magento | Dense product docs; not a tutorial |
| 5 | emersya.com/en/howToEmbed | ~1,100 | Help centre | iframe with `allow='camera; gyroscope…'`, **"Magento, Shopify, WordPress sometimes block iframe by default"**, don't `display:none` a viewer | Not a guide; no sizing/responsive help |
| 6 | vectary.com/…/3d-web-embed-guide | ? | Vendor guide | Webflow/Wix/Squarespace embeds for GLB | Unfetchable |
| 7 | modelo.io/damf/article/…/how-to-embed-a-3d-model-using-iframe | thin ×3 | Near-duplicate articles | Generic iframe how-to | Content-farm style, empty on fetch |
| 8 | makeuseof.com/…/embed-3d-photo-gallery-blog-cooliris | old | 2010 Cooliris | Dead product | Proves the literal query has been unanswered for 15 years |
| — | facebook.com/help/414295416095269 | — | Help page | Facebook 3D photos still exist for posts | No embed option at all — cite as "why people search this" |

Word-count guidance: top-5 average ≈ 2,000 → +10% = 2,200. Run 06 set
1,800; **target 1,800–2,100**, driven by the six platform sections and the
troubleshooting table, not padding.

PAA / snippet holder / AI Overview: not observable in this tooling — check
manually and paste PAA verbatim into the FAQ before writing.

---

## 3. Content gap analysis (what to own)

1. **The object itself.** Every result assumes you already have a GLB. Nobody
   says "take one photo, get an iframe". Open with that.
2. **Attribute-by-attribute iframe anatomy.** Only Sirv and Emersya show a
   real tag; nobody explains `loading`, `title`, aspect-ratio wrappers, or why
   `sandbox` breaks things. Own this with a table.
3. **Responsive sizing done right.** Vendors say "change width to 100%";
   Wix's own doc admits its embed "won't be responsive". Give the
   `aspect-ratio` wrapper and the padding-top fallback, and explain the
   percentage-height collapse.
4. **Performance with real numbers.** Vendors talk about 99% mesh
   compression. We list the actual files, sizes, edge cache headers, and cite
   web.dev's lazy-load data (2–3% median data savings; ~500 KB per YouTube
   embed avoided) — then say when *not* to lazy-load (hero).
5. **Platforms nobody groups together.** Wix (double-iframe), Carrd (Embed
   element, plan-gated), Notion (URL not HTML, Iframely), Shopify (Custom
   Liquid), plus pointers to the dedicated Webflow/Framer/Squarespace/WordPress
   guides. Emersya's "CMS blocks iframes" warning becomes concrete per CMS.
6. **Troubleshooting** — absent everywhere: blank frame, CSP `frame-src`,
   mixed content, mobile touch vs scroll, WebGL off, ad-blockers.
7. **Accessibility + reduced motion** — Sirv has one paragraph; nobody
   covers `title`, keyboard, reduced motion for a parallax embed.
8. **Honest disclosure** — the Free badge, what the viewer's browser talks
   to, the ±23° cone. Vendors never state limits.

Information-gain anchors (first-party, cannot be fabricated): measured
network waterfall screenshot of one embed; screenshot of the poster → scene
handoff; a screenshot of each platform's editor with the code pasted.

---

## 4. Recommended outline (~1,800–2,100 words)

**H1:** `How to embed a 3D photo on any website (iframe guide)`

**Intro (≤90 words, primary keyword in first sentence):** One photo becomes
an interactive depth scene; publishing gives you a share link and an
`<iframe>`; the snippet below works on any page that accepts HTML. First
in-body hub link within this block or the next H2 — anchor **"interactive 3D
photos for websites"** → `/guides/interactive-3d-photos-for-websites`.

**H2 — Quick answer: the universal embed snippet** ← *featured-snippet
target: 40–60-word paragraph + the ordered 3-step list*
1. Make/publish a 3D photo at `/create` (anchor: "make a 3D photo from your
   own image").
2. Copy the iframe from the publish panel (or from the share page `/s/<id>`).
3. Paste it into your site's HTML/embed element and set the height.

Show the copied snippet, then the recommended fuller version:

```html
<div style="aspect-ratio:4/3;max-width:960px">
  <iframe
    src="https://www.gifsy.fun/embed/<id>"
    title="Interactive 3D photo: <describe the picture>"
    loading="lazy"
    style="width:100%;height:100%;border:0"
    referrerpolicy="strict-origin-when-cross-origin"
  ></iframe>
</div>
```

**H2 — Every attribute, explained** (table; one row each)
- `src` — `/embed/<id>`, bare canvas, noindexed; use `/s/<id>` for a share
  link, never inside an iframe (it has page chrome).
- `width` / `height` / `aspect-ratio` — the viewer fills the iframe's height;
  a percentage height needs a sized parent or it collapses; match the
  aspect-ratio to the photo (portrait 3/4, landscape 4/3 or 16/9); the
  copied 500 px default is a safe fixed fallback; padding-top hack for
  builders that strip `aspect-ratio`.
- `loading="lazy"` — defers offscreen frames; supported Chrome 77+, Edge 79+,
  Firefox 121+, Safari 16.4+; **remove it for a hero** (above the fold) and
  consider `<link rel="preconnect" href="https://www.gifsy.fun">`.
- `title` — required for screen readers (iframes without one are announced
  as "frame"); write what the photo shows.
- `style="border:0"` — replaces the deprecated `frameborder`.
- `referrerpolicy` — optional; default already fine; shown for people whose
  CSP/analytics policy asks.
- `allow` — **not needed**: no gyroscope, camera or fullscreen API is used
  (contrast with model viewers that request `gyroscope; accelerometer`).
- `sandbox` — don't add it blind: without `allow-scripts allow-same-origin`
  the WebGL viewer cannot run and you get the poster only.

**H2 — Why an iframe (and not a script tag)** (~120 words) — isolation: no
Three.js in your page bundle, no CSS bleed, no WebGL context in the host; the
host page stays static-cacheable. Concede the downside: fixed box, no
host-page styling of the scene. Link spoke 4 "how 3D photos work" for the
renderer.

**H2 — Does an embedded 3D photo slow my page?** (~220 words; the run 06
"iframe performance" fold-in)
- The real asset list (table from §0 with measured sizes + date).
- Poster is in the initial HTML, so first paint is a picture, not a hole.
- Edge-cached, immutable, CORS-open; no AI runs for the viewer.
- web.dev lazy-load numbers and the "don't lazy-load the hero" rule.
- Compare to a looping MP4 hero (concede video works without WebGL) → link
  spoke 7 when it exists (`/compare/3d-photo-video-vs-interactive-embed`).

**H2 — Platform by platform** (each 60–100 words; H3 per platform; each H3
opens with the exact menu path, then one gotcha, then the link)
- **Webflow** — Add panel → Embed → paste → set wrapper `aspect-ratio` at
  each breakpoint. Gotcha: custom code publishes on a paid site plan (verify
  at writing). Link `/guides/3d-photo-webflow` — anchor "add a 3D photo to
  Webflow".
- **Framer** — Insert → Embed → HTML mode → paste; size via the frame. Gotcha:
  Framer notes some sites block framing — Gifsy allows it. Link
  `/guides/3d-photo-framer` — anchor "3D photo in Framer".
- **Squarespace** — Code block (not Embed block: no oEmbed) → paste → Display
  Source off. Gotcha: JS/iframes in Code blocks are on Core, Plus, Advanced,
  Business and Commerce plans per Squarespace's 2026 help page (verify;
  older third-party guides say "Business+"). Link
  `/guides/3d-photo-squarespace` — anchor "Squarespace 3D photo guide".
- **WordPress** — Custom HTML block (Gutenberg) / HTML widget (Elementor).
  Gotcha: authors/contributors without `unfiltered_html` get the iframe
  stripped by `wp_kses` — paste as admin/editor. Link
  `/guides/3d-photo-wordpress` — anchor "WordPress without a plugin".
- **Wix** — Add Elements → Embed Code → Embed HTML → paste. Gotcha: Wix wraps
  your code in *its own* iframe and states embeds "won't be responsive"; set
  the Wix element's size to the aspect ratio you want and use
  `width:100%;height:100%` inside. HTTPS only (Gifsy is). No dedicated guide
  yet — this section is canonical.
- **Carrd** — Embed element → Code mode → paste (Embed is a Pro feature —
  verify tier at writing). Set the element's height in px; Carrd's column
  width handles the rest.
- **Notion** — type `/embed`, paste the **URL** `https://www.gifsy.fun/embed/<id>`
  (Notion refuses raw `<iframe>` HTML; it embeds via Iframely and shows
  "Failed to load" for sites that block framing — Gifsy doesn't). Drag the
  black handles to resize. Works on published public pages. *Test one before
  publishing the guide; screenshot it.*
- **Shopify** — Theme editor → Add section → Custom Liquid → paste; works in
  Dawn. Gotcha: community threads report iframes in Custom Liquid *blocks*
  inside Multicolumn not rendering — use a section, set an explicit height.
- **Ghost / Substack / plain HTML** — HTML card / anywhere HTML is allowed;
  one sentence each.

**H2 — Accessibility and reduced motion** (~150 words)
- `title` on the iframe; a caption or `<figcaption>` next to it describing
  the photo (the canvas has no alt).
- Motion: the scene auto-orbits gently until the visitor moves the pointer.
  **If the reduced-motion change ships first:** "the embed stops auto-orbit
  when the visitor's OS asks for reduced motion". **If not:** offer the host
  a CSS pattern — hide the iframe and show a static `<img>` under
  `@media (prefers-reduced-motion: reduce)`, using the scene's poster
  `https://www.gifsy.fun/api/asset/<id>/image`. Never claim what the code
  doesn't do.
- Keyboard: state honestly that orbit is pointer/touch driven today.

**H2 — Troubleshooting** (table: symptom → cause → fix)
| Blank / empty frame | iframe height collapsed (percentage height, unsized parent) | fixed px height or `aspect-ratio` wrapper |
| Poster shows, never animates | WebGL disabled / software-rendering blocked, or `sandbox` without `allow-scripts allow-same-origin` | enable hardware acceleration; remove `sandbox` |
| Frame refused / console "Refused to frame" | **host** page's CSP `frame-src` / `child-src` doesn't allow `https://www.gifsy.fun` | add it to the host's policy (Gifsy itself sets no `frame-ancestors`) |
| Mixed-content warning | host page served over `http://` while iframe is `https://` — that direction is allowed; the reverse can't happen (Gifsy is HTTPS-only). Wix/Notion require HTTPS embeds | serve host over HTTPS |
| Iframe stripped on save | WordPress `wp_kses` (non-admin), Notion (needs URL), some Shopify blocks | paste as admin / use URL / use a Custom Liquid section |
| Can't scroll past it on mobile | expected: horizontal drag orbits, vertical drag scrolls (`touch-action: pan-y`) | none — explain; don't make it full-width on phones if it's tall |
| Cropped on Wix | double iframe + fixed element size | resize the Wix element; use 100%/100% inside |
| Scene 404 | id deleted by owner (scenes are public; owner can remove) | republish |

**H2 — The "Made with Gifsy" badge (Free plan)** (~90 words)
Free scenes show a small "Made with Gifsy" link bottom-right *inside* the
frame; it isn't editable by the host. Pro ($9 one-time, never renews)
removes it and adds commercial use. Link `/pricing` — anchor "Pro is $9
one-time". Optional host-page credit line (nofollow, host-editable) shown as
a code snippet, explicitly optional.

**H2 — FAQ** (8; `FAQPage` JSON-LD) — see §6.

**Closing CTA** (≤60 words): `/create` + link spoke 6 "which photos produce
the best depth" (once it exists; until then link the hub's photos chapter)
and spoke 13 privacy (when it exists; until then `/privacy`).

Hub links: ≤3 total; first one in the intro/quick-answer; second in
"Platform by platform" opener; optional third in closing.

---

## 5. Hub & spoke architecture

- Role: **spoke 3, the connective centre** of the cluster. Every platform
  spoke links here with "the full iframe embed guide"; this page links out to
  every platform spoke, the hub, `/create`, `/pricing`.
- Outbound per run 06: hub · 2 (Webflow) · 5 (Framer) · 8 (Squarespace) ·
  9 (WordPress) · 13 (privacy) — plus 4 (how it works) and 7 (video vs
  interactive) as they ship. Link only URLs that exist at publish time; keep
  a TODO list in the page source for the rest.
- Inbound needed on launch: `/create` publish panel ("How to embed this →"),
  `/s/[id]` share page under the embed code, hub chapter 6 and 8, footer
  "Guides".
- Related-guides block renders *after* the body so template links never
  precede the contextual hub link.

---

## 6. FAQ (write answers 40–70 words each; first sentence answers directly)

1. **Can I embed a 3D photo on my website without any code?** — Yes: paste
   the iframe into your builder's embed element (Webflow Embed, Framer Embed,
   Squarespace Code block, WordPress Custom HTML, Wix Embed HTML, Carrd Embed)
   or paste the URL into Notion.
2. **Does the iframe slow my site down?** — The assets (one WebP image, a
   small PNG depth map, an optional mask and backdrop, plus the viewer script)
   load from an edge cache; `loading="lazy"` defers them until the frame is
   near the viewport. Give the measured total.
3. **Does it work on phones?** — Yes; drag sideways to orbit, swipe up/down
   to scroll. Needs WebGL (every modern mobile browser).
4. **Do I need a portrait-mode or depth photo?** — No. Depth is estimated
   from a normal photo when you create the scene; the viewer only loads the
   finished files.
5. **Why is my embed blank?** — Height collapse, `sandbox`, host CSP, or
   WebGL off — link the troubleshooting table.
6. **Can I use it on a client's commercial site?** — Pro ($9 one-time)
   includes commercial use and removes the badge; Free is for personal use
   with the "Made with Gifsy" mark.
7. **Is it a video?** — No; it's a live WebGL scene the visitor can drag.
   Video is the right pick for Instagram/Reels — link spoke 7 when live.
8. **What does the visitor's browser send to Gifsy?** — Requests for the
   scene's files (and the embed page's analytics, if any — verify). Nothing
   is uploaded; no AI runs in the viewer. Link `/privacy`.

Swap any of these for verbatim PAA questions if the manual SERP check finds
them.

---

## 7. Technical optimisation

- **Title (58):** `Embed a 3D Photo on Any Website: iframe Guide (2026) | Gifsy`
  Alt (55): `How to Embed a 3D Photo on Your Website (iframe) | Gifsy`
- **Meta (156):** `Copy one iframe and add an interactive 3D photo to Webflow,
  Framer, Squarespace, WordPress, Wix, Notion or Shopify. Every attribute
  explained, plus fixes.`
- **URL:** `/guides/embed-3d-photo-on-website` · canonical self ·
  `openGraph.url` self · add to `app/sitemap.ts` (monthly, 0.7).
- **Snippet format:** paragraph (40–60 words under the quick-answer H2)
  followed by the 3-step ordered list. The attribute table is a second
  snippet candidate for "3d image iframe".
- **Schema (JSON-LD, one `@graph`):** `Article` (author TBD, `datePublished`,
  `dateModified`) + `HowTo` + `FAQPage` + `BreadcrumbList`. The skill's
  structured-data reference warns HowTo + FAQPage on one page can conflict;
  Google dropped HowTo rich results for most devices in 2023 — keep HowTo
  (harmless, semantically right), but treat FAQPage as the one that matters.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Gifsy", "item": "https://www.gifsy.fun/" },
        { "@type": "ListItem", "position": 2, "name": "Guides", "item": "https://www.gifsy.fun/guides" },
        { "@type": "ListItem", "position": 3, "name": "Embed a 3D photo on any website", "item": "https://www.gifsy.fun/guides/embed-3d-photo-on-website" }
      ]
    },
    {
      "@type": "HowTo",
      "name": "How to embed a 3D photo on a website",
      "description": "Turn one photo into an interactive 3D scene and add it to any site with a single iframe.",
      "totalTime": "PT5M",
      "tool": [{ "@type": "HowToTool", "name": "A web browser" }],
      "step": [
        { "@type": "HowToStep", "name": "Create and publish the 3D photo", "text": "Upload a photo at gifsy.fun/create, adjust the depth, and publish. You get a share link and an iframe snippet.", "url": "https://www.gifsy.fun/guides/embed-3d-photo-on-website#quick-answer" },
        { "@type": "HowToStep", "name": "Copy the iframe", "text": "Copy the <iframe src=\"https://www.gifsy.fun/embed/<id>\"> snippet from the publish panel or the share page.", "url": "https://www.gifsy.fun/guides/embed-3d-photo-on-website#quick-answer" },
        { "@type": "HowToStep", "name": "Paste it into your site", "text": "Paste into your builder's HTML or embed element, add a title attribute, and set the height or an aspect-ratio wrapper.", "url": "https://www.gifsy.fun/guides/embed-3d-photo-on-website#platforms" }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "Can I embed a 3D photo on my website without any code?", "acceptedAnswer": { "@type": "Answer", "text": "…" } },
        { "@type": "Question", "name": "Does the iframe slow my site down?", "acceptedAnswer": { "@type": "Answer", "text": "…" } },
        { "@type": "Question", "name": "Does it work on phones?", "acceptedAnswer": { "@type": "Answer", "text": "…" } },
        { "@type": "Question", "name": "Do I need a portrait-mode or depth photo?", "acceptedAnswer": { "@type": "Answer", "text": "…" } },
        { "@type": "Question", "name": "Why is my embed blank?", "acceptedAnswer": { "@type": "Answer", "text": "…" } },
        { "@type": "Question", "name": "Can I use it on a client's commercial site?", "acceptedAnswer": { "@type": "Answer", "text": "…" } },
        { "@type": "Question", "name": "Is it a video?", "acceptedAnswer": { "@type": "Answer", "text": "…" } },
        { "@type": "Question", "name": "What does the visitor's browser send to Gifsy?", "acceptedAnswer": { "@type": "Answer", "text": "…" } }
      ]
    }
  ]
}
```

FAQ answer text in JSON-LD must match the on-page text word for word.
Add the `Article` node from the shared helper (README technical backlog).

---

## 8. E-E-A-T signals required

- **Experience:** first-person measurements — DevTools waterfall of one real
  embed (asset list, sizes, timing) with the date; the "10-second blank frame
  on a customer page" story that motivated the SSR poster
  (`embed-client.tsx` comment) told in the founder's voice; the Blob-firewall
  incident (32 marquee iframes) as the reason assets are proxied and
  edge-cached.
- **Expertise:** correct use of `frame-ancestors` vs `frame-src` (host vs
  embedded side), `wp_kses`/`unfiltered_html`, Wix double-iframe, Notion
  Iframely; the PNG-vs-WebP depth-map decision (banding) as a one-line
  aside.
- **Authoritativeness / citations:** MDN `<iframe>` (attributes), web.dev
  "iframe lazy-loading" (numbers + browser support), Wix Help "Embedding a
  site or a widget", Notion Help "Embed and connect other apps", Squarespace
  Help "Code blocks" (plan list), WordPress developer docs on
  `unfiltered_html`, Shopify Custom Liquid help, Framer Help "How to add an
  iframe or embed script", Webflow University "Custom code embed". Cite one
  mesh-viewer doc (Sirv or Emersya) when contrasting `allow` needs — fair,
  not competitive.
- **Trust:** the badge disclosure, the ±23° cone, "needs WebGL", the
  reduced-motion status stated truthfully, the visitor-data sentence, `/privacy`
  link. Author: TBD; updated date visible.

---

## 9. Resource assessment

- **Effort:** Medium — 1,800–2,100 words, 8–12 h including: one real embed
  measured, 6–8 platform screenshots (Webflow, Framer, Squarespace,
  WordPress, Wix, Notion at minimum), Notion/Shopify/Carrd verification tests.
- **Pre-publish checks (blocking):** (1) test the embed URL in Notion and a
  Shopify Custom Liquid section; (2) confirm Carrd's Embed plan tier and
  Squarespace's plan list on the day; (3) decide on the reduced-motion viewer
  change and write the a11y section to match; (4) confirm which analytics
  scripts run on `/embed/[id]` and disclose; (5) measure asset sizes.
- **Realistic 3-month position:** top 20 for the primary and "3d photo
  iframe"; impressions for platform long-tails ("embed 3d photo wix/notion")
  that decide whether Wix earns its own page (run 06 rule).

---

## Sources

- https://www.vntana.com/blog/how-to-embed-a-3d-model-in-your-website-a-quick-guide/
- https://sketchfab.com/blogs/enterprise/news/getting-started-with-sketchfab
- https://www.spherelinks.io/blog/embed-3d-model-website-iframe (TLS cert expired at fetch time)
- https://sirv.com/help/articles/3d-model/
- https://emersya.com/en/howToEmbed
- https://www.vectary.com/3d-modeling-blog/3d-web-embed-guide/ (redirect loop)
- https://www.modelo.io/damf/article/2024/08/12/0546/how-to-embed-a-3d-model-using-iframe-on-your-website
- https://www.makeuseof.com/tag/embed-3d-photo-gallery-blog-cooliris/
- https://www.facebook.com/help/414295416095269
- https://web.dev/articles/iframe-lazy-loading
- https://support.wix.com/en/article/wix-editor-embedding-a-site-or-a-widget
- https://www.notion.com/help/embed-and-connect-other-apps
- https://support.squarespace.com/hc/en-us/articles/206543167-Code-blocks
- https://community.shopify.com/c/shopify-design/how-to-center-iframe-in-custom-liquid-section-dawn-theme/m-p/2218732
- https://community.shopify.com/t/can-i-add-a-custom-liquid-section-to-dawn-themes-multicolumn/156824/19
- https://carrd.com/docs (Embed element page 404 at fetch — verify tier manually)
- Repo: `components/CreateWorkshop.tsx`, `app/s/[id]/scene-client.tsx`, `app/embed/[id]/page.tsx`, `app/embed/[id]/embed-client.tsx`, `app/api/scenes/[id]/route.ts`, `app/api/asset/[id]/[field]/route.ts`, `lib/publish/creator.ts`, `lib/publish/types.ts`, `components/SceneViewer.tsx`, `next.config.ts`

# Run 14 — content-brief: `/tools/gif` ("animate a photo into a GIF")

Date: 2026-09-17 · Skill: `content-brief` · Page: https://www.gifsy.fun/tools/gif
Builds on run 03 (keyword family + SERP reads, done) and run 05 §3 (page audit).
No new SERP research was done for this run; the competitive facts below are run
03's and are marked where they still need a dated re-check before publishing.
Source of truth for features: `app/tools/gif/page.tsx`, `components/GifWorkshop.tsx`,
`lib/gif.ts` (read 2026-09-17). Everything in "What the tool actually does" is
taken from that code — the writer must not describe anything not listed there.

Author: TBD (byline not yet confirmed — see README open questions).

---

## 1. Target keyword analysis

| | |
|---|---|
| Primary keyword | **animate a photo into a GIF** (family: "animate a photo GIF", "animate a still image GIF", "photo animation GIF maker") |
| Secondary (in copy only, never in the title lead) | "photo to GIF", "make a GIF from photos", "photo slideshow GIF", "boomerang GIF from photos", the six effect names as "[effect] GIF" (zoom GIF, bounce GIF, shake GIF, pulse GIF, spin GIF, glitch GIF) |
| Trust modifiers (title, intro, FAQ, table) | in your browser / no upload · no watermark · no account |
| Dominant intent | **Transactional-tool** (user wants a converter, now). The informational tail ("how do I…") is served by a 3-step block + FAQ, not by a long tutorial — that belongs to the future guide `/guides/animate-a-photo-gif`. |
| Difficulty | **Moderate** (run 03): 1 blog (Cutout.pro, 3,200w), ezgif static-to-gif (~800w, 5 effects), 3dgifmaker, and small tool pages. No authority lock. Realistic: top 20 in 90 days, top 10 in 6–12 months once the domain is indexed and the effect/boomerang sub-pages feed it. |
| Content type | **landing-page / product-page hybrid** (transactional, 800–1,500w per the content-types table). H1 = value proposition, tool above the fold, scannable body below. Schema: `SoftwareApplication` + `Offer` + `FAQPage`. |
| Word target | **~1,400 words server-rendered** (top-5 avg ≈ 1,300 + 10 %). Do not chase Kapwing's 2,300. |
| Core entities that must appear | animated GIF · photo / still image / JPG / PNG / WebP · motion effect (zoom, bounce, shake, pulse, spin, glitch) · boomerang loop · frames per second · 256-colour palette · in-browser / no upload · watermark · slideshow / combine |

Gifsy today: unranked, domain not indexed, page renders 51 crawlable words, no H2, no JSON-LD, no inbound `<a>` links (run 05). Treat as greenfield.

---

## 2. SERP competitive intelligence (from run 03 — re-verify dates before publishing)

| Competitor | URL | ~Words | Format | Covers | Misses (our opening) |
|---|---|---|---|---|---|
| ezgif static-to-gif | https://ezgif.com/static-to-gif | ~800 | tool page | 5 effects (waving flag, zoom, h-scroll, v-scroll, rotation); outputs GIF/APNG/WebP/AVIF | server upload (1 h retention), 2000s design, no boomerang, no multi-photo on the same page, no example GIFs |
| Cutout.pro blog "animate photo to GIF" | https://www.cutout.pro/learn/blog-animate-photo-to-gif/ | ~3,200 | how-to blog, named author | platform sizing table, A/B anecdote, FAQ ×3 | it is a blog for a paid AI tool — no in-page tool, no privacy story |
| 3dgifmaker | https://www.3dgifmaker.com/ (+ per-effect URLs) | ~2,800 hub | tool hub + one page per effect (70+) | in-browser, no sign-up, GitHub/Patreon credibility | no multi-photo mode, no boomerang-from-photos framing, dense/legacy UI, no privacy verification |
| Kapwing image-to-GIF | https://www.kapwing.com/tools/convert/image-to-gif | ~2,200 | tool page | 3-step how-to, FAQ ×3, logos, "35M creators" | cloud editor, login-gated export (verify), no single-photo effects |
| Canva GIF maker | https://www.canva.com/create/gif-maker/ | ~1,200 | tool page | templates, FAQ ×4 | account required to export, video-first |
| Imgflip GIF maker | https://imgflip.com/gif-maker | ~1,200 | tool page | FAQ explains the free-tier watermark | watermark, server-side |

**Top-3 for the primary phrase**: Cutout.pro blog, ezgif static-to-gif, 3dgifmaker. Our page beats all three on: both modes on one URL, boomerang, verifiable no-upload, first-party example GIFs, and a clean comparison table.

---

## 3. What the tool actually does (verified from code — the writer's fact sheet)

Everything below is true today. Use these numbers verbatim; do not round up or invent.

**Two modes** (toggle "Animate one" / "Combine several"; `?mode=combine` preselects the second):

*Animate one* (`makeAnimatedGif`):
- One photo in, one looping GIF out.
- Six effects (`GIF_EFFECTS`): **Zoom, Bounce, Shake, Pulse, Spin, Glitch**. (A former "Depth" effect was removed — never mention it.)
- **Speed slider 8–30 fps, default 20 fps.**
- **Boomerang loop toggle, default ON** — plays forward then reverse ("ping-pong") for a seamless loop. Implementation: 30 rendered frames; boomerang appends frames 29→2 in reverse, so a boomerang GIF is 58 frames.
- Output: **480 × 480 px square, centre cover-crop** of the source (the photo is scaled to fill the square; edges outside the square are cropped). File name `animation.gif`.
- **One global 256-colour palette** built from a sample of every frame (1 in 4 pixels) and written once — this is why frames don't flicker and files stay smaller than per-frame palettes.
- Effect maths (for one-line descriptions — translate to plain English, don't quote numbers the user can't see):
  - **Zoom**: smooth push-in from 1.08× to 1.30× and back (eased, one cycle per loop).
  - **Pulse**: same as zoom but gentle — 1.02× to 1.14× ("heartbeat").
  - **Bounce**: photo zoomed 1.16×, hops vertically up to 7 % of the frame — two hops per loop.
  - **Shake**: 1.12× zoom, jitters ±2 % of the frame on two different frequencies (3× horizontal, 2× vertical) — a handheld/earthquake wobble.
  - **Spin**: full 360° rotation, 1.5× zoom so the corners never show.
  - **Glitch**: chromatic aberration (red/blue channel split 3–9 px, screen-blended) plus up to 4 randomly displaced horizontal slices per frame; seeded so the loop is reproducible.

*Combine several* (`makeSlideshowGif`):
- **2 or more photos** → slideshow GIF. **Time per image slider 0.20–1.50 s (50 ms steps), default 0.60 s.**
- Each photo is centre cover-cropped to 480 × 480 on a white background. Order = order added (remove and re-add to reorder — there is no drag-to-reorder). No transitions/crossfade.
- **Per-frame palettes** (each photo keeps its own 256 colours — accurate for unrelated photos, larger file than single-photo mode).
- **No boomerang toggle in this mode.** (Boomerang exists in code only for the single-photo path. If the boomerang sub-page wants "several photos forward-then-back", that is a ~3-line change — `withBoomerang` applied in `makeSlideshowGif` + a toggle — decide before writing that page.)

**Both modes:**
- Input: any image the browser can decode (`accept="image/*"`: JPG, PNG, WebP, GIF first frame, AVIF in Chrome/Firefox). HEIC only where the browser decodes it (Safari) — say "JPG, PNG or WebP" and stop there. No hard file-size limit in code; practical limit is device memory.
- **Transparent PNGs are not preserved** — the encoder does not write a transparency index; transparent areas come out as a flat dark colour in Animate mode and white in Combine mode. State this plainly in the FAQ (and don't promise a fix).
- Encoding: `gifenc` (pure JS, dynamically imported), runs on the main thread in the tab. **Nothing about the photo is sent anywhere.** The only network activity during "Make GIF" is (first time only) the encoder script chunk, plus the site's analytics page-view beacons (Vercel Analytics, DataFast) which carry no image data.
- Free, no account, no watermark, no rate limit. (Free/Pro plans apply to 3D only.)
- Post-result note currently shown: "Send it anywhere — GIFs animate in Telegram, Discord, iMessage and more."
- Not available (don't imply): custom output size, aspect ratios other than square, frame-delay per image in Animate mode, loop count (always infinite), APNG/WebP/MP4 export, text overlays, cropping UI, dithering options.

---

## 4. Content gap analysis (what to write that nobody in the top 10 has)

1. **Single-photo effects + multi-photo sequencing on one page** — say it in the H1 subtitle and the first H2.
2. **Boomerang from a still photo** — every boomerang tool takes a GIF/video input. Name it in the meta, an H3 and the FAQ; link to the future `/tools/gif/boomerang`.
3. **Verifiable privacy** — not just "in your browser" (commoditised) but *how to check*: DevTools → Network → make a GIF → no request contains your image. Write it as a 3-step check.
4. **Comparison table naming the pain points** — ezgif uploads, Imgflip watermarks, Canva/Kapwing gate export behind an account.
5. **Practical FPS/size guidance tied to our own slider.** Non-obvious first-party fact: the frame count is fixed at 30 (58 with boomerang) and the slider only changes the per-frame delay, so **fps changes the loop duration, not the file size** (30 frames @ 8 fps = 3.75 s loop; @ 20 fps = 1.5 s; @ 30 fps = 1 s; boomerang roughly doubles each). File size is driven by pixels, palette complexity and boomerang (≈ 2× frames). Nobody else can say this because nobody else's tool works this way — use it in the FPS FAQ.
6. **Which photos animate well per effect** — subject-centred for Zoom/Pulse, a horizon-free frame for Spin, high-contrast for Glitch, faces for Bounce/Shake — plus the square-crop warning (keep the subject in the middle third).
7. **Destination sizing** (Slack emoji 128 px & ≤ 128 KB, Discord ≤ 256 KB stickers / 8 MB uploads, GitHub README, email signatures) — keep to one paragraph + link to the future `/guides/gif-size-for-slack-discord-github`. Verify each limit against the platform doc before publishing.
8. **Bridge to 3D** — "flat zoom vs real parallax" contrast that no GIF tool has.

---

## 5. Page structure (writer-ready outline)

Layout rule (run 05): tool stays above the fold; explainer paragraph renders *above* the uploader on first paint; everything from H2 "Animate one photo…" downward is server-rendered in `app/tools/gif/page.tsx` (not inside the client component). Fix nested `<main>` while there (`GifWorkshop.tsx` root → `<div>`). Move the mode switch out of the H1 row.

### Head
- **Title (57):** `Animate a Photo Into a GIF — Free, No Upload | Gifsy` *(adopted; layout template appends " · Gifsy" — confirm it doesn't double the brand; if it does, set title to "Animate a Photo Into a GIF — Free, No Upload")*
- **Meta (157):** `Turn one photo into a zoom, bounce, shake, pulse, spin or glitch GIF — or loop several photos into a slideshow. Runs in your browser: no upload, no watermark, no account.`
- `alternates.canonical: "/tools/gif"` (absorbs `?mode=combine`); per-page `openGraph.url`; own OG image = a labelled still of a Zoom GIF.

### H1 (in the workshop, first paint)
`Animate a photo into a GIF — zoom, bounce, shake, pulse, spin or glitch`
Sub-line (small): `Or combine several photos into one loop. Free, in your browser, no upload, no watermark, no account.`

### Explainer paragraph — ABOVE the uploader (≈ 45 words, first paint; this is the featured-snippet target)
Write as a direct definition answer:
> Gifsy turns a still photo into an animated GIF in your browser. Pick one of six motion effects, set the speed (8–30 fps), keep the boomerang loop on for a seamless forward-then-reverse cycle, and download a 480 × 480 GIF. Nothing is uploaded — the encoder runs in the tab.

*(Tool UI sits here.)*

### H2 — Animate one photo or combine several (≈ 150 w)
Two short paragraphs, one per mode, in the mode-toggle's own words. Animate one: single photo, six effects, speed, boomerang. Combine several: 2+ photos, 0.2–1.5 s per image, order = order added, white background, no boomerang in this mode. End with the internal link "make a GIF from photos (slideshow) →" to `/tools/gif?mode=combine` for now (future dedicated route — run 03 suggests `/tools/gif/from-photos`).

### H2 — How to animate a photo into a GIF in three steps (≈ 120 w, `<ol>`)
1. **Add a photo** — drop a JPG, PNG or WebP on the uploader (or tap it on mobile). Keep the subject near the centre: the GIF is a square crop.
2. **Pick an effect and speed** — choose Zoom, Bounce, Shake, Pulse, Spin or Glitch; drag Speed between 8 and 30 fps; leave Boomerang loop on for a seamless cycle.
3. **Make GIF → Download** — frames render in your browser in a few seconds; the file downloads as `animation.gif`, ready for Telegram, Discord, iMessage, Slack or a README.

Secondary phrase placement: "photo to GIF" appears once in this section's lead sentence.

### H2 — Six motion effects for a single photo (≈ 240 w; H3 per effect, one or two sentences each + the example GIF)
Each H3 = effect name + "GIF". Under each: what it does in plain English, what kind of photo it suits, and an inline `<img>` of a first-party example (spec in §6). Link each H3 to its future sub-page `/tools/gif/<effect>`.
- **Zoom GIF** — slow push-in and back; portraits, product shots, album covers.
- **Bounce GIF** — the photo hops twice per loop; mascots, pets, stickers-to-be.
- **Shake GIF** — handheld jitter; memes, "earthquake", reaction GIFs.
- **Pulse GIF** — a gentle heartbeat swell; logos, hearts, anything you want to "breathe".
- **Spin GIF** — one full rotation per loop; round objects, badges, records, wheels (square-ish photos work best; the 1.5× zoom hides the corners).
- **Glitch GIF** — RGB split plus torn horizontal slices; posters, cyberpunk, error-screen jokes.
One closing line: with Boomerang on, every effect plays forward then in reverse, so the loop never jumps.

### H2 — Runs in your browser: your photo is never uploaded (≈ 150 w) — the verifiable privacy section
State it, then show how to check:
- The GIF encoder (an open-source JavaScript library, gifenc) is downloaded to your browser once and runs there. Your photo is read from disk into a canvas, frames are drawn, the GIF is encoded, and the file is offered as a download. There is no upload endpoint for this tool.
- **How to verify** (`<ol>`): open DevTools (F12) → Network tab → filter "Fetch/XHR" → click Make GIF → the list shows no request carrying your image. (First run only: one small script chunk loads — that's the encoder, not your file.) Optional: turn Wi-Fi off after the first GIF and make another — it still works.
- One honest caveat line: the page itself loads site analytics (page-view only). The 3D tool on `/create` is different — link to `/privacy` for its data flow. Do not blur the two.

### H2 — Gifsy vs ezgif, Imgflip, Canva and Kapwing (≈ 120 w + table)
| | Gifsy | ezgif | Imgflip | Canva | Kapwing |
|---|---|---|---|---|---|
| Uploads your photo to a server | No | Yes (deleted after 1 h) | Yes | Yes | Yes |
| Watermark on free tier | No | No | Yes | No* | Verify |
| Account to download | No | No | Free-tier download w/o account? verify | Yes | Verify |
| Single-photo motion effects | 6 | 5 (separate page) | some (per-effect pages) | No | No |
| Boomerang from a still photo | Yes | No | Verify | No | No |
| Multi-photo slideshow | Yes | Yes | Yes | Yes | Yes |
| Max output | 480 px square | 1920 px | — | — | — |

**Facts to verify before publishing (with the URL to check and the date checked):**
- ezgif: server upload + "files deleted after 1 hour"; no watermark, no signup — https://ezgif.com/maker and https://ezgif.com/static-to-gif (FAQ). Also confirm its 5-effect list on static-to-gif.
- Imgflip: free-tier `imgflip.com` watermark and Pro removal price — https://imgflip.com/gif-maker (FAQ) and https://imgflip.com/pro.
- Canva: account required to export; watermark only on premium elements — https://www.canva.com/create/gif-maker/ (test the export flow logged out).
- Kapwing: free-tier watermark and/or sign-in to export — https://www.kapwing.com/tools/convert/image-to-gif (test logged out; run 03 notes this is "historically" true and not stated on the page — do not print it unless the test confirms it on the day).
- Be fair on our own limits in the same table: 480 px square only, GIF only (no APNG/WebP), no transparent output. A one-sided table reads as marketing and is the first thing a rater flags.

### H2 — Which photos animate well (≈ 130 w)
- Subject in the middle third (square centre-crop; wide panoramas lose their ends).
- Zoom / Pulse: one clear subject, some background room to push into.
- Bounce / Shake: faces, pets, mascots — motion reads as "alive".
- Spin: things that are round or symmetric; avoid horizons (a spinning skyline looks wrong).
- Glitch: high contrast, saturated colour — the RGB split needs edges to tear.
- Any effect: sources ≥ 480 px on the short side, or the crop will upscale and look soft; a busy, low-contrast photo will look grainy after the 256-colour quantisation.
- Combine: same orientation for all photos, or the white letterbox will flash between frames.

### H2 — FAQ (8 questions; each answer 40–70 words, direct first sentence; feed `FAQPage` JSON-LD verbatim)
1. **Is the GIF maker free?** Yes — always free, no account, no watermark, no limit on how many GIFs you make. Gifsy's paid plan is for the separate 3D photo tool only.
2. **Does it add a watermark?** No. The download is the GIF you see in the preview, nothing added.
3. **Where do my photos go?** Nowhere. The photo stays in the browser tab; frames and the GIF are built by JavaScript on your device (see "how to verify" above).
4. **What size is the GIF and can I change it?** 480 × 480 px square, centre-cropped. There's no size control yet; if you need a different shape, crop the photo first. (Slack emoji need 128 px and ≤ 128 KB — resize after export; Discord uploads ≤ 8 MB — *verify both before publishing*.)
5. **What does the speed slider actually change?** The delay between the 30 rendered frames. 8 fps gives a ~3.8 s loop, 20 fps ~1.5 s, 30 fps ~1 s (boomerang roughly doubles each). It doesn't change file size — pixels and the boomerang (which doubles the frames) do.
6. **What's the difference between boomerang and reverse?** Reverse plays the clip backwards. Boomerang plays forward *then* backward in one loop, so the last frame meets the first and the loop never jumps. It's on by default for single-photo GIFs; the slideshow mode plays photos in order only.
7. **Can I make a transparent GIF from a transparent PNG?** Not with this tool today — transparency isn't written to the GIF, so transparent areas come out as a solid background. Use `/tools/sticker` for a cut-out with transparent background (WebP for Telegram).
8. **Can the photo move in real 3D instead of a flat zoom?** Yes, that's Gifsy's other tool: `/create` estimates depth from the photo and renders a parallax scene you can embed on a website. Free for 3 generations; it works differently (see its privacy notes).

### H2 — Make it move in real 3D (≈ 90 w; the funnel block, also shown after download in the client component)
Contrast in one sentence: a Zoom GIF scales the whole picture; a 3D photo separates the subject from the background and lets the visitor tilt or spin it on the page. Honest scope: a ~±23° orbit from one photo, not 360°; works best with a clear subject on a simpler background. CTA: "Try the 3D photo maker →" `/create`. Second link: "3D photo maker" → `/`. Don't promise offline; don't repeat 3D privacy claims here — link `/privacy`.

Also add a one-line cross-link near the top or in the mode section: "Need a Telegram sticker instead? → `/tools/sticker`".

**Featured-snippet target:** the explainer paragraph above the uploader (paragraph, 40–60 w) for "animate a photo into a GIF"; the 3-step `<ol>` for "how to animate a photo into a GIF".

**Word budget check:** explainer 45 + modes 150 + how-to 120 + effects 240 + privacy 150 + comparison 120 + photos 130 + FAQ ~420 + 3D 90 ≈ 1,465. Cut the FAQ answers first if over.

---

## 6. First-party example GIFs to capture (one per effect + two extras)

Produce with the live tool (that is the E-E-A-T point — "rendered by the tool itself"):
- Source: one photo the founder owns the rights to (not stock), ≥ 1000 px, clear centred subject, medium background contrast. Same photo for all six effects so the reader can compare effects, not photos.
- Settings: 20 fps, Boomerang ON, default everything. File names `example-zoom.gif` … `example-glitch.gif`, in `public/tools/gif/`.
- Extras: `example-boomerang-off.gif` (Zoom, boomerang off — for the boomerang FAQ / sub-page) and `example-combine.gif` (4 photos, 0.6 s — for the Combine section).
- Serve with `<img loading="lazy" width="480" height="480" alt="Zoom GIF effect made with Gifsy from a single photo">`; keep each under ~1.5 MB (glitch and spin will be the heaviest — if too big, re-render at 12 fps and say so in the caption).
- Caption each: "Made with this tool · 20 fps · boomerang on · 480 px".
- Reuse the Zoom still as the page's OG image.

---

## 7. Hub & spoke

- This page is the **hub** for the GIF cluster. Spokes: `/tools/gif/boomerang`, `/tools/gif/zoom|bounce|shake|pulse|spin|glitch`, future `/tools/gif/from-photos` (combine), guides `/guides/animate-a-photo-gif` and `/guides/gif-size-for-slack-discord-github`.
- Links out of this page (all in body text, keyword anchors): the six effect H3s → their sub-pages; "boomerang GIF from a photo" → `/tools/gif/boomerang`; "make a GIF from photos" → combine; "Telegram sticker maker" → `/tools/sticker`; "3D photo maker" → `/` and "try the 3D photo maker" → `/create`; FAQ 4 → sizing guide (when live); privacy section → `/privacy`.
- Links into this page (needed — currently zero): homepage under the hero uploader and footer ("animate a photo into a GIF"), `SiteNav`, `/tools/sticker` body ("photo to GIF"), each sub-page's first paragraph ("all six effects on the GIF maker").
- Every spoke's first in-body link is back to this hub within its first 40 %.

---

## 8. Technical / on-page

- Route: `app/tools/gif/page.tsx` — `metadata` with title, description, `alternates.canonical`, `openGraph.url`, `openGraph.images` (own OG). Add `/tools/gif/*` to `app/sitemap.ts` when they ship.
- Fix nested `<main>`; H1 stays inside the workshop; server-rendered `<section>`s below it with real `<h2>`s. Mode switch: aria-label'd `role="tablist"` or plain buttons outside the H1 row.
- JSON-LD (both blocks in the page, `SoftwareApplication` first; don't add `HowTo` here — reserve for the guide, per the reference's "don't stack FAQ + HowTo" note):

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Gifsy GIF Maker",
  "url": "https://www.gifsy.fun/tools/gif",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Any (web browser)",
  "browserRequirements": "Requires JavaScript",
  "description": "Animate a photo into a GIF with zoom, bounce, shake, pulse, spin or glitch effects, or combine several photos into a looping slideshow. Runs entirely in the browser — no upload, no watermark, no account.",
  "featureList": ["Six motion effects for a single photo", "Boomerang loop", "8–30 fps speed control", "Combine 2+ photos into a slideshow GIF", "In-browser encoding, no upload"],
  "image": "https://www.gifsy.fun/tools/gif/example-zoom.gif",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "publisher": { "@type": "Organization", "name": "Gifsy", "url": "https://www.gifsy.fun" }
}
```
No `aggregateRating` (no real reviews). `FAQPage` with the 8 Q/As above, text identical to the rendered FAQ. `BreadcrumbList` on the sub-pages only.

- After download (client component): add the "Make it move in real 3D →" link to `/create` and "Make a Telegram sticker from this photo →" `/tools/sticker`.
- Request indexing in GSC after deploy (domain not indexed).

---

## 9. E-E-A-T signals required

- The six example GIFs rendered by the tool (proof of output), captioned with settings.
- The verification steps (DevTools) — a claim the reader can test beats a badge.
- Honest limits stated in the writer's voice: square-only, no transparency, 256 colours, Combine has no boomerang.
- A first-person line is allowed if the byline lands ("I built the encoder path to use one global palette so frames don't flicker — the file is smaller too"); otherwise keep third person. Author: TBD.
- External citations (only where they add a checkable fact): gifenc on GitHub (mattdesl/gifenc); Slack/Discord size docs for the sizing sentence; ezgif/Imgflip FAQ pages for the table. No fabricated stats or user counts.

---

## 10. Sub-page template — `/tools/gif/boomerang` and `/tools/gif/[effect]` ×6

One component (`GifWorkshop` with `initialEffect` / `initialBoomerang` props), one server-rendered body generated from a config object per slug, ~500–700 words each, `BreadcrumbList` + `SoftwareApplication` (same block, different `url`/`name`) + 4-question `FAQPage`. Add each to `sitemap.ts`. Canonical = itself. First body link → `/tools/gif` hub.

| Slug | Preset | Primary keyword | Title (≤ 60) | H1 |
|---|---|---|---|---|
| `/tools/gif/boomerang` | effect Zoom, boomerang ON (locked on, toggle hidden or disabled) | boomerang GIF from photos | `Boomerang GIF From a Photo — Free, No Upload · Gifsy` | Make a boomerang GIF from a still photo |
| `/tools/gif/zoom` | Zoom | zoom GIF maker | `Zoom GIF Maker — Animate a Photo, Free · Gifsy` | Zoom GIF maker: push into a photo and back |
| `/tools/gif/bounce` | Bounce | bounce GIF maker | `Bounce GIF Maker — Make a Photo Bounce · Gifsy` | Bounce GIF maker |
| `/tools/gif/shake` | Shake | shake GIF maker / shaking image GIF | `Shake GIF Maker — Make an Image Shake · Gifsy` | Shake GIF maker |
| `/tools/gif/pulse` | Pulse | pulse / heartbeat GIF maker | `Pulse GIF Maker — Heartbeat Effect for a Photo · Gifsy` | Pulse (heartbeat) GIF maker |
| `/tools/gif/spin` | Spin | spin GIF maker / rotating image GIF | `Spin GIF Maker — Rotate a Photo Into a GIF · Gifsy` | Spin GIF maker |
| `/tools/gif/glitch` | Glitch | glitch GIF maker from image | `Glitch GIF Maker — RGB Split & Tears, Free · Gifsy` | Glitch GIF maker |

Body skeleton (identical order on every sub-page, content from the config):
1. **Explainer paragraph above the tool** (40–60 w, snippet target): "[Effect] GIF maker: what the effect does + free/in-browser/no upload." Boomerang page: "A boomerang GIF plays forward then backward… Gifsy makes one from a single still photo — no video or existing GIF needed" (this is the gap: every competitor requires a GIF/video input).
2. *(tool, preset applied)*
3. **H2 "What the [effect] effect does"** (60–90 w) + the effect's example GIF (`example-<effect>.gif`, plus `example-boomerang-off.gif` vs `example-zoom.gif` side by side on the boomerang page).
4. **H2 "How to make a [effect] GIF"** — 3-step `<ol>`, same shape as the hub, with the preset step removed ("the effect is already selected").
5. **H2 "Photos that work best for [effect]"** (50–80 w, from §5 "Which photos animate well").
6. **H2 "Tips"** (2–3 bullets: fps choice for this effect, boomerang on/off, square crop).
7. **H2 FAQ ×4**: free/watermark · where does my photo go · size/shape · one effect-specific Q (zoom: "does it upscale?", spin: "why is it zoomed in?" → 1.5× to hide corners, glitch: "is it random every time?" → seeded, same loop each render, bounce: "can I change how high?" → no, fixed amplitude, pulse: "pulse vs zoom?" → smaller range, shake: "can I shake harder?" → no, fixed ±2 %; boomerang: "boomerang vs reverse?" and "can I boomerang a slideshow?" → not today, single photo only).
8. **Sibling strip**: "Other effects: Zoom · Bounce · Shake · Pulse · Spin · Glitch · Boomerang" (links) + "All effects and the slideshow mode on the GIF maker →" hub link.
9. **3D bridge** (one line) → `/create`.

Honesty notes for the sub-pages: the boomerang page must say it's a single-photo boomerang unless `makeSlideshowGif` gains the toggle first; never call the effects "AI"; never list more than six effects.

---

## 11. Resource assessment

- **Effort:** Medium for the hub (~1,400 w + 8 example GIFs + JSON-LD + route fixes ≈ 8–12 h incl. the comparison verification). Low per sub-page once the config component exists (~1–2 h each, mostly the 4 FAQs and titles).
- **90-day target:** top 10 for "boomerang GIF from photos" and 2–3 "[effect] GIF maker" pages; top 20 for "animate a photo GIF"; impressions only for "photo to GIF" (authority-locked, run 03).
- **Blockers:** domain not indexed (GSC request after deploy); byline decision; the four competitor facts marked "verify"; decision on combine-mode boomerang before the boomerang page is written.

## Sources
- docs/seo/runs/03-keyword-photo-to-gif.md (SERP reads and competitor URLs)
- docs/seo/runs/05-page-audits.md §3
- app/tools/gif/page.tsx · components/GifWorkshop.tsx · lib/gif.ts · components/Uploader.tsx · lib/image.ts (drawCover)
- https://github.com/mattdesl/gifenc (encoder used)

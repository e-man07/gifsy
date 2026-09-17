# Run 17 — Webflow showcase rebuild (hands-on, 2026-09-18)

Rebuilt the test site https://gifsy-embed-test.webflow.io/ from the "Depth
Shop" ecom mock into a studio-portfolio demo that showcases Gifsy's real use
case (agency/portfolio hero + work grid), per the founder's direction:
monochrome, Inter, colour only from the renders.

## Assets

- 8 source photos, all Unsplash (Unsplash License), chosen for depth
  separation: portrait, dog, sneaker, dahlia, toy figure, lake+rock, vintage
  car, breakfast bowl. Attribution in `qa-3d/webflow-src/ATTRIBUTION.md`
  (gitignored; keep the file).
- Each rendered through the production pipeline offline:
  `scripts/make-demo-assets.py` (Depth Anything V2 small fp16 + ISNet fp16)
  → a throwaway page mounting the real `SceneViewer` (orbit preset, mask on,
  push-pull fill) → headless canvas capture → ffmpeg forward+reverse loop.
  No live gifsy.fun generations used. Throwaway page/captures deleted.
- Output `qa-3d/webflow-assets/wf-<slug>.{webm,gif,-poster.jpg}`: WebM
  205–823 KB (all ≤ 2 MB); GIF 2.3–8.4 MB (too big for the site; WebM used).

## Site

Nav (Studio Gifsy · Work · Process · Made with Gifsy · CTA → /create) → hero
(dog, full-bleed Background Video, 85vh, z-index 1) → `#work` grid of 6
Background Videos with captions → before/after (sneaker + figure: source
image next to render) → `#process` 3 columns → footer (demo line, links to
both Webflow guides, gifsy.fun, 8 photo credits). Inter 400/500/600 via site
settings. Published; verified live: 9 `<video>` all z-index 1 with explicit
heights, hero plays on load, `document.fonts.check('16px Inter')` true, no
horizontal scroll at 390 px.

## Newly verified Webflow facts

1. Background Videos below the fold are paused by Webflow until scrolled
   into view (not a file issue) — added to the guide.
2. Uploads are transcoded to MP4 ~990 px wide regardless of source — added.
3. Google Fonts are added at `webflow.com/dashboard/sites/<site>/fonts`; the
   Designer needs a reload before the font appears in the picker.
4. The free plan keeps the "Made in Webflow" badge.
5. Automation-only (not for the guide): the Designer accepts a synthetic
   `paste` event on `document.body` carrying `@webflow/XscpData` JSON — a whole
   page with classes, breakpoint variants and Background Video nodes pastes
   in one shot; unknown font families are stripped. A Background Video node
   stores `data.bgvideo.video_urls` + `poster_image_url` as plain CDN URLs, so
   one element's "Replace video" upload can be copied for reuse.

## Caveats

- Nav is plain links, not the Navbar widget (no hamburger; links hide < 480 px).
- Guide claims still hedged: Squarespace/Framer plan tiers.

## Guide changes

`/guides/3d-photo-webflow`: demo description updated (studio portfolio, not
store), hero height, transcode width, 2 MB target, offscreen-pause note.

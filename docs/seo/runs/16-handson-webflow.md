# Run 16 — hands-on: Gifsy on Webflow (free Starter account)

Date: 2026-09-17 · Method: Claude in Chrome driving the real Webflow Designer
on the user's own Starter workspace; a test site "Gifsy embed test" was built
by hand from Webflow's Starter library (no AI assistant — user declined the
beta terms) and published to https://gifsy-embed-test.webflow.io/ (demo store
"Depth Shop": nav, hero, 3-clip gallery, 3 product cards, footer linking the
Gifsy guides).

## Verified facts (all replace earlier "check your plan" hedges)

1. **Element name is "Code Embed"**, not "Embed". Add panel → Elements →
   Advanced (or search "embed"), icon `</>`.
2. **Locked on a free site.** Tile greyed out; tooltip verbatim: "This element
   requires a paid site or account plan. Click the star icon to upgrade your
   plan." It cannot be dragged onto the canvas. The star opens
   `/dashboard/sites/<site>/plans?ref=add_embed`.
3. **Plans shown that day.** Site plans: Starter $0 (webflow.io domain, 2 static
   pages, 1 GB bandwidth), Basic $15/mo billed yearly (custom domain, 300 pages),
   Premium $25/mo billed yearly (full CMS, "Code components"). Workspace plans:
   Starter $0, Core $19/mo yearly ("Custom code on staged sites", 10 webflow.io
   staging sites), Growth $49/mo, Enterprise. The old Basic/CMS/Business names
   are gone.
4. **Help Center quick answer** (search "custom code embed element"): "Code
   Embed lets you add custom HTML/CSS/JS to your Webflow site design or rich
   text. You can place it anywhere you want; scripts won't fully render until
   you publish. No server-side languages. Max 50,000 characters." Meta Pixel
   article snippet: "Code embeds are available on any paid…".
5. **CMS binding** (article "Use dynamic data in custom code embeds", updated
   May 20, 2026): select Code Embed → Edit code → place cursor → click the
   purple dot on that line → connect menu → choose field → Save & Close. Must be
   in a Collection list or on a Collection page. Also "Code prop" to swap whole
   embeds per component instance.
6. **Free-plan route works: Background Video.** Free element. Settings: Upload
   video, "Supported formats: webm, mp4, mov, ogg. File must be smaller than
   30MB", toggles Loop / Autoplay / Include play/pause button. Uploaded Gifsy
   gallery WebMs (0.4–1.4 MB) successfully.
7. **Webflow transcodes the upload.** 561 KB WebM → served as
   `…_animals-1_mp4.mp4` from cdn.prod.website-files.com, 990 px wide, ~430 KB,
   2.83 s. WebM in, MP4 out.
8. **Gotcha: invisible video.** `.w-background-video > video` is `z-index:-100`;
   the wrapper has `z-index:auto`, so inside a section with a background
   colour (the Starter-library sections use rgb(245,247,250)) the video paints
   behind the section background → blank box with a pause button, in the
   Designer AND live. Fix: Style → Position → z-index 1 on the Background Video
   element. Verified: with z=auto blank, with z=1 the frame renders.
9. **Background Video has no intrinsic height** — inside a grid it collapses;
   set an explicit height (320 px used).
10. The Designer does render Background Video frames on the canvas (once the
    z-index fix is applied); Code Embed could not be tested on this plan.
11. Chrome pauses `<video>` in hidden tabs — automated playback checks must
    have the tab in the foreground (currentTime advanced only when visible).

## Not verified (needs a paid plan)
- Whether the Designer canvas renders the Gifsy iframe live or as a "Custom
  code" placeholder.
- CMS field insertion inside the iframe `src` end-to-end.
- Publishing custom code to a custom domain.

## Applied to
- `/guides/3d-photo-webflow` (rewritten sections: prerequisites, step 2, new
  "On the free plan: the same scene as a looping video", comparison table,
  troubleshooting, 2 FAQs; `updated` set; +"tested" tag).
- `/guides/embed-3d-photo-on-website` Webflow paragraph + FAQ 1.
- Homepage embed tile label; homepage FAQ 4.

## Framer
Not started — user was not signed in to Framer in Chrome.

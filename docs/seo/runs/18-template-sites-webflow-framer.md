# Run 18 — "Fig & Form" demo sites on Webflow + Framer free templates (2026-09-18)

Redo of run 17 after the founder rejected the hand-built Webflow site (bad
renders: raw mask, no inpaint, 250 kbps; ecom framing). New rules: use each
platform's own free template, swap media/copy only, monochrome UI, colour only
from renders, subject-only ("transparent") scenes, photos sourced to match the
landing-page showcase (stylised characters, products, portraits).

## Assets (qa-3d/site-assets, gitignored)
14 Unsplash photos sourced via Chrome (Unsplash blocks curl; napi too) — slugs
+ CDN ids in `qa-3d/site-src/ATTRIBUTION.md`. Baked with
`scripts/make-demo-assets.py` (Depth Anything V2 small fp16 + ISNet fp16, the
production models), mounted in the real `SceneViewer` on a throwaway
`/dev/site-scene` page (deleted), orbit preset, subjectOnly, captured with
`qa-3d/capture-site-assets.mjs`: an in-page virtual rAF/performance.now clock
(Playwright's fake clock breaks `page.screenshot`), 240 PNG frames at 1/30 s
with `omitBackground`, ffmpeg forward+reverse loop → VP9+alpha `.webm`,
HEVC+alpha `-alpha.mov`, opaque `-white.mp4`/`-dark.mp4`, transparent `.gif`,
alpha `-poster.png`. 11 portrait scenes at 1200×1520 + 4 landscape at
1600×1000. Dropped after review: char-chrome, char-jacket (mesh tearing),
portrait-pink (weak).

Tuning used (all user-facing sliders): shadow 0.15, edge feather 0.5, depth
0.25. Two product findings came out of this:
1. **Subject-only framing ignores the orbit relief push.** At the default
   depth 0.5 a large cut-out is pushed toward the camera and overflows the
   frame (head/feet cropped); at depth 0 it is framed exactly. `framingPlan`
   fits the matte bbox but `setRelief(ORBIT_RELIEF_BIAS, BOOST)` moves it.
2. **Mesh tearing at internal depth steps** (open jacket over shirt, dog ear):
   150-segment plane + hard depth edge = sawtooth at the orbit extreme.
   Higher `GEO_SEGMENTS` or a depth-aware feather would fix it.

## Webflow — https://fig-form.webflow.io/
Template: SilenceFolio (free, Slate Dept). Free Starter site. Hero = two
Background Videos (`char-pink`, `sneaker-red` 1600×1000 `-white.mp4`), CMS
"Works" list of 7 (hover-follow poster thumbnails + collection pages with
posters), about copy + stats, footer with guide link. Background var → #fff.
Template limits: work section is a text list, no image grid, no about image
slot; free page cap already exceeded by the template (no page duplication).
Playback verified headless (both videos readyState 4, currentTime advancing).
New facts: transcode → MP4 + WebM at 720 px tall; auto-poster from frame 0 is
greyer than the video (253 → 235); alpha lost; free Marketplace filter at
webflow.com/templates/free-website-templates; Variables panel drives palette;
CMS draft items must be "queued for next publish".

## Framer — https://figandform.framer.website (also incomplete-raven-056952.framer.app)
Template: Asher Vale (free, Asad Khaleel), "Remix for Free". Hero = Video
component with `char-pink-1200x1520.webm` (alpha) + poster; Selected Works CMS
grid of 6 with posters (CMS image fields take no video); Studio section with
`portrait-yellow` alpha WebM + a real Gifsy **Embed** (iframe of
`/embed/03ed4c7605`, renders and drags on the free published site); footer
with guide link; /projects, /projects/:slug, /contact re-authored; /about
deleted. Files served unchanged from framerusercontent (no transcode).
Free-plan facts: Embed NOT gated; free `name.framer.website` subdomain in
Site Settings → Domains; gated = custom domain, password, canonical URL,
branching/staging; Video component accepts .mp4/.webm only (.mov/.gif
refused; GIF has its own component); Basic/Pro raise CMS/page/bandwidth
limits. Alpha WebM confirmed transparent in the editor; live playback not
observed in Chrome because the tab was hidden (headless check pending).

## Guide changes
- `/guides/3d-photo-framer`: free-plan verified (FAQ + new "plans" section),
  transparent-WebM route via Video component, breakpoint pin gotcha, demo link.
- `/guides/3d-photo-webflow`: 720p MP4+WebM transcode, grey auto-poster, alpha
  lost, demo link → fig-form.webflow.io.

## Screenshots (2026-09-19, public/guides/)
`framer-insert-embed`, `framer-embed-component` (Embed selected, live scene,
HTML field), `framer-video-webm` (Video component props with the alpha WebM),
`webflow-code-embed-locked` (greyed tile + plan tooltip),
`webflow-background-video-settings`. Wired into both guides via the new
`components/article/Figure.tsx`. Founder decision: no further work on the
demo sites themselves.

## Not done
- Attribution names for the 14 Unsplash photos (slugs recorded; names to add).
- The gifsy-embed-test.webflow.io site from run 17 still exists (disposable).
- GIF exports are 8–34 MB — reference only, not web-ready.

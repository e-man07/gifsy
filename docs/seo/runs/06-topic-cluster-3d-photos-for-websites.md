# Run 06 — topic-cluster-planning: "interactive 3D photos for websites"

Date: 2026-09-17 · Skill: `topic-cluster-planning` · Site: gifsy.fun (Next.js 16
App Router, 9 indexed static URLs, no guides/compare content yet). Builds on
run 01 (keyword-deep-dive "3D photo effect").

## Method

- SERP reads (Google, US) for the seed and its neighbours: "interactive 3D
  photos for websites", "embed 3D photo on website", "Webflow interactive image
  depth parallax mouse move", "Framer 3D image parallax effect component",
  "Squarespace embed interactive image iframe code block", "WordPress 3D photo
  plugin depth parallax image", "how do 3D photos work depth map parallax",
  "3D photo website portfolio photographer interactive depth", "3D photo embed
  Notion/Wix/Carrd", "Depthy alternative online 3D photo viewer", "Facebook 3D
  photo alternative", "what photos work best for 3D photo effect", "Framer embed
  iframe", "Webflow embed iframe responsive", "iframe slow down website lazy
  loading", "3D photo animation video vs interactive parallax hero", "Depth
  Anything V2 explained", "interactive hero image website examples 2026",
  "Immersity AI alternative 2026".
- Fetched and read: Framer Help "How to add an iframe or embed script",
  Squarespace Help "Embed blocks". (Vectary's "3D web embed guide" redirected
  in a loop; used the SERP snippet only.)
- Repo check: existing routes are `/`, `/create`, `/gallery`, `/pricing`,
  `/tools/gif`, `/tools/sticker`, legal pages; no `/guides` or `/compare`
  directories exist. Nav links only to `/pricing`, `/scenes`, `/login`, legal.
- Not available in this tooling: PAA boxes, exact volumes, featured-snippet
  owner, AI Overview presence. Sub-topics were inferred from related results,
  forum threads, and competitor H2s instead.

### What the SERP told us

| Query family | Who owns it today | What they actually sell | Read |
|---|---|---|---|
| "interactive 3D photos for websites" (seed) | SeekBeak (virtual tours), WebRotate 360 (360° product spins), Sketchfab, 3D AI Studio, Vev/Awwwards "3D website examples", a DEV.to JS demo | 360° spins, GLB model viewers, design inspiration | **Nobody answers the depth-photo version.** The SERP is fragmented across three different meanings of "3D photo". Moderate difficulty, weak intent match for incumbents. |
| "embed 3D photo on website" | VNTANA, Sketchfab, Vectary, SphereLinks, 3DShot, Designhubz | GLB/OBJ model embedding via iframe | Every result is a mesh viewer. The pattern they all use (upload → get iframe → paste) is the exact pattern Gifsy uses — but for a photo. Easy to slot into. |
| Webflow + parallax/mouse image | Webflow blog, Webflow Help, Webflow forum (2015–2024 threads), FlowRadar cloneables, redpanther.io | Layered PNG + Interactions tutorials; "Display a photo by moving the mouse over it" forum thread | Demand exists, answer is "cut your own layers in Photoshop". |
| Framer + 3D image parallax | Framer Marketplace (ThreeDParallax, Parallax Image 3D, 3D Parallax Layers, Bachoff "Image 3D Parallax"), Framer University | CSS `preserve-3d` tilt or 3-layer PNG stacks | Same gap: every component needs the *designer* to supply pre-cut layers. None generate depth. |
| Squarespace + iframe | Squarespace Help, silvabokis, bycrawford, elfsight, embeddy.ai | Generic iframe how-tos (Code block, Display Source off) | Easy; needs a 3D-photo-specific version with plan caveats. |
| WordPress + 3D photo | Scenic 3D Photo Parallax (CodeCanyon), Cinematic slider (wp.org), Wiloke, Smart Slider 3, InstaWP listicle | Paid plugins that require Photoshop-made layers; 100+ stock "3D images" | Real query family; the "no plugin, one Custom HTML block" answer is open. |
| "how do 3D photos work" | Alan Zucconi (Facebook 3D photos, parallax shaders), Fstoppers, Adobe Substance | Shader-level explainers from 2019 | Authoritative but old; none cover modern monocular depth (Depth Anything V2) + matte + inpaint. |
| "what photos work best" | lunabloom, motionlaps, oreate (AI-tool blogs), Shotkit, Fstoppers | Generic "clear foreground/background" tips | Thin; nobody shows failures. |
| Immersity / LeiaPix alternative | Slashdot, SourceForge, Toolify, aiseesoft, leaveit2ai, Animagen | Directories + one 3,200-word listicle | Confirmed in run 01: weak SERP, high commercial intent. |
| Facebook 3D photos | Meta blog (2018–2020), Facebook groups asking "why did it disappear", SaaSHub/topbestalternatives | App lists (VIMAGE, Phogy, PopPic) | Nostalgia query; "share it on your own site instead" is unanswered. |
| iframe performance | web.dev, MDN, Iframely | `loading="lazy"` guidance | Objection-handling material for the embed guide, not its own page. |

Difficulty read: **Easy–Moderate** for the cluster. No single domain owns the
seed; incumbents rank by accident (mesh viewers, 360° spins) and none match the
"one photo → interactive embed" intent. Platform how-tos compete only with
generic iframe tutorials. The head term `3D photo maker` stays Hard (run 01).

## Cluster overview

- **Seed:** interactive 3D photos for websites
- **Difficulty:** Easy–Moderate (fragmented SERP, intent mismatch for incumbents)
- **Size:** 1 hub + 14 spokes ≈ 24,000 words
- **Timeline:** 4 months for a solo operator at 3–4 pieces/month; cluster
  visibly forming by month 3, long-tails ranking months 3–6.
- **Publishing-sequence rule applied:** decision tree → site has <50 indexed
  pages *and* a one-person team → ship 3 spokes, then hub + 1 explainer, then
  scale (see "Publishing order").

## Hub

**Format:** Pillar + chapters. The topic has clean sub-chapters (what it is /
how it works / which platform / what to shoot / what it costs) and each chapter
already has a natural deep-dive. An "ultimate guide" would duplicate the
spokes; a category page is too thin for a domain with no authority yet.

**URL:** `/guides/interactive-3d-photos-for-websites`
(`/guides` itself becomes a short index page that lists the hub first, then
every spoke — cheap crawl path, no keyword target.)

**Target keyword:** "interactive 3D photos for websites" · secondary: "3D
photo for website", "add 3D photo to website", "3D photo embed".

**Title (58):** `Interactive 3D Photos for Websites: The Complete Guide | Gifsy`
**H1:** `Interactive 3D photos for websites: the complete guide (2026)`
**Meta (155):** `Turn one photo into a 3D scene visitors can drag, then embed
it in Webflow, Framer, Squarespace or WordPress. How it works, what to shoot,
what it costs.`

**Word target:** 3,000–3,500.

**H2 outline** (each H2 opens with a snippet-able paragraph, then links its spoke):

1. Table of contents (anchor links)
2. What an interactive 3D photo is — and the three things people mean by "3D
   photo" (360° spin, 3D mesh, depth-parallax photo). Sets the definition;
   links → "How 3D photos work".
3. Why interactive beats a 3D video on a website (page stays live, no autoplay
   penalty, no MP4 weight, drag-to-orbit) — 2 paragraphs + a 4-row table;
   links → "Video vs interactive embed".
4. How it works in 60 seconds (depth map → subject matte → inpainted backdrop →
   two planes in WebGL) — one diagram; links → "How 3D photos work".
5. Which photos work (and which don't) — 5 bullets; links → "Best photos".
6. Adding one to your site, platform by platform — one short paragraph per
   platform with the one-line gist (Webflow: Embed element; Framer: Embed
   component; Squarespace: Code block; WordPress: Custom HTML block; anything
   else: iframe); links → all five platform/embed spokes.
7. Use cases: hero sections for no-code builders; portfolios for photographers,
   illustrators, 3D/motion designers — links → both use-case spokes.
8. Performance and privacy (iframe lazy-loading, no video bytes, what leaves
   the browser and what doesn't) — links → privacy spoke and embed guide.
9. Costs: one-time vs credits vs subscription across the category — links →
   both comparison spokes and `/pricing`.
10. FAQ (8–10 Q; `FAQPage` JSON-LD): Does it work on mobile? Does the iframe
    slow my site? Do I need portrait mode / a depth photo? Can I use it
    commercially? Does it work on Wix/Carrd/Notion? What if my photo has a busy
    background? Can I remove the badge? Is it a video?
11. Resources and next steps (the spoke list grouped by intent + CTA → `/create`)

**What the hub must NOT cover in depth:** step-by-step platform instructions
with screenshots (spokes), the model pipeline internals (explainer spoke),
competitor-by-competitor tables (compare spokes), photo-selection failure
gallery (best-photos spoke).

**Schema:** `Article` + `FAQPage` + `BreadcrumbList`. Byline required (open
question in README).

## Spokes

Sorted by priority (impact × ease). All under the App Router as
`app/guides/<slug>/page.tsx` or `app/compare/<slug>/page.tsx` (static routes,
`generateMetadata`, `HowTo`/`FAQPage` JSON-LD where noted; add each to
`app/sitemap.ts`).

| # | Spoke | Target keyword (secondary) | Type | Words | URL slug | Hub anchor text (from spoke → hub) |
|---|---|---|---|---|---|---|
| 1 | Immersity AI / LeiaPix alternative that embeds on your site | immersity ai alternative (leiapix alternative, immersity ai free) | Comparison (1 vs many + table) | 2,000 | `/compare/immersity-ai-alternative` | "interactive 3D photos for websites" |
| 2 | Add an interactive 3D photo to Webflow | interactive image webflow (webflow 3d image, webflow parallax image mouse move) | How-to (`HowTo` schema) | 1,600 | `/guides/3d-photo-webflow` | "guide to interactive 3D photos for websites" |
| 3 | Embed a 3D photo on any website (iframe guide) | embed 3d photo on website (3d photo iframe, add 3d photo to website) | How-to + reference | 1,800 | `/guides/embed-3d-photo-on-website` | "interactive 3D photos for websites" |
| 4 | How 3D photos work: depth map, matte, two planes | how do 3d photos work (depth map photo, 2.5d parallax) | Explainer (information-gain anchor) | 2,200 | `/guides/how-3d-photos-work` | "using interactive 3D photos on a website" |
| 5 | Add a 3D photo to Framer | framer 3d image (framer 3d parallax image, framer interactive image) | How-to (`HowTo`) | 1,500 | `/guides/3d-photo-framer` | "complete guide to interactive 3D photos for websites" |
| 6 | Best photos for a 3D effect (and the ones that fail) | best photos for 3d effect (what photos work for 3d photo, 3d photo tips) | Guide + failure gallery | 1,500 | `/guides/best-photos-for-3d-effect` | "interactive 3D photos on your website" |
| 7 | 3D photo video vs interactive embed | 3d photo animation vs interactive (3d photo mp4 vs embed, parallax video vs interactive) | Comparison (concept) | 1,500 | `/compare/3d-photo-video-vs-interactive-embed` | "interactive 3D photos for websites" |
| 8 | Add a 3D photo to Squarespace | embed interactive image squarespace (squarespace 3d image, squarespace parallax image) | How-to (`HowTo`) | 1,400 | `/guides/3d-photo-squarespace` | "guide to interactive 3D photos for websites" |
| 9 | Add a 3D photo to WordPress without a plugin | 3d photo wordpress (wordpress 3d parallax image, 3d photo plugin wordpress) | How-to (`HowTo`) | 1,600 | `/guides/3d-photo-wordpress` | "interactive 3D photos for websites" |
| 10 | 3D hero image for a website (no-code builders) | 3d hero image website (interactive hero image, parallax hero image) | Use-case page + examples | 1,700 | `/guides/3d-hero-image` | "adding interactive 3D photos to a website" |
| 11 | Interactive 3D photos for a portfolio site | 3d photo portfolio (interactive photography portfolio, 3d portfolio website images) | Use-case page + examples | 1,700 | `/guides/3d-photo-portfolio` | "interactive 3D photos for websites" |
| 12 | Best AI 3D photo makers compared (Media.io, Fotor, FlexClip, Animagen, Depthy, Gifsy) | best 3d photo maker online (ai 3d photo maker, 3d photo maker free) | Listicle / comparison table | 2,300 | `/compare/3d-photo-makers` | "how interactive 3D photos work on websites" |
| 13 | Make a 3D photo without uploading it (in-browser processing) | 3d photo maker no upload (private 3d photo maker, runs in browser) | Explainer (trust) | 1,200 | `/guides/3d-photo-privacy-in-browser` | "interactive 3D photos for websites" |
| 14 | Facebook 3D photos alternative: put it on your own site | facebook 3d photo alternative (facebook 3d photos gone, 3d photo without facebook) | Explainer + how-to | 1,300 | `/guides/facebook-3d-photo-alternative` | "interactive 3D photos for websites" |

Total ≈ 23,300 spoke words + 3,200 hub.

### Spoke notes (what each one owns, and what to put in it)

**1. Immersity AI alternative** — `/compare/immersity-ai-alternative`
Owns the navigational/commercial query every listicle still chases. Angle no
listicle has: Immersity pivoted to hardware/OEM (run 01), every alternative
exports MP4/GIF, only Depthy is interactive and it doesn't embed. Table:
output type (video / interactive embed), runs where (server / browser),
pricing model (credits / sub / one-time), badge/commercial use, embed support.
Include Depthy honestly. CTA → `/create`, pricing link → `/pricing`.

**2. Webflow** — `/guides/3d-photo-webflow`
Steps with screenshots: Add → Embed element → paste iframe → set the wrapper's
aspect ratio (padding-top trick or `aspect-ratio` CSS) → breakpoint sizes →
`loading="lazy"` unless it is the hero. Contrast with the forum answer (cut
layers in Photoshop, wire Interactions) and the FlowRadar cloneables. Add an
H2 "Using it as a hero" that links spoke 10. Note Webflow's Embed element
requires a paid site plan to publish custom code on a custom domain (verify at
time of writing).

**3. Embed on any website** — `/guides/embed-3d-photo-on-website`
The reference page. Anatomy of the iframe (src, allow, referrerpolicy, title
for a11y), responsive wrapper, `loading="lazy"`, why an iframe (isolation, no
WebGL in the host page), what to do if a host blocks iframes. Short sections
for Wix (Embed HTML), Carrd (Embed widget), Notion (`/embed`), Shopify (Custom
Liquid), Ghost/Substack (HTML card), plain HTML. Fold in "does an iframe slow
my page" as an H2 with the web.dev lazy-loading numbers. This spoke absorbs
the platform long-tails that don't justify their own page yet.

**4. How 3D photos work** — `/guides/how-3d-photos-work`
The information-gain anchor. Four stages with first-party screenshots from the
pipeline: monocular depth (Depth Anything V2, cite the arXiv paper), subject
matte (ISNet), backdrop inpainting (LaMa) to fill what the subject hides,
two-plane rendering + grab-to-orbit (Three.js). Explain why two planes, not a
mesh; why edges "smear" in naive single-plane displacement; why iPhone
portrait-mode depth isn't required. Link Alan Zucconi's 2019 Facebook 3D
Photos write-up as prior art. Definition paragraph optimised for a snippet.

**5. Framer** — `/guides/3d-photo-framer`
Insert → Embed → URL or HTML mode; sizing via the component's constraints;
placing it inside a hero frame; CMS pages with per-item embeds. Contrast with
Marketplace components (ThreeDParallax, 3D Parallax Layers, Bachoff) which
tilt or need three pre-cut PNGs. Note Framer's own doc says some sites block
embedding via headers — state that Gifsy's `/embed/[id]` allows framing.

**6. Best photos for a 3D effect** — `/guides/best-photos-for-3d-effect`
Works: clear subject 1–3 m in front of a receding background, portraits with
hair separation, products on a surface, layered travel scenes. Fails: subject
fills the frame, flat wall behind, glass/reflections, busy overlapping crowd,
low-contrast fog, heavy motion blur. Show 6–8 real before/after pairs
including failures. This is the honest-limits page run 01 asked for.

**7. Video vs interactive embed** — `/compare/3d-photo-video-vs-interactive-embed`
Decision page. Table: file weight, autoplay policies on mobile, loop seams,
interactivity, accessibility (reduced-motion), CMS friction, where each wins
(Instagram/Reels → video; website hero/portfolio → interactive). Concede
video's advantages (works everywhere, no iframe). Links spoke 12 for tools that
do video.

**8. Squarespace** — `/guides/3d-photo-squarespace`
Embed block vs Code block (Squarespace Help: Code block when oEmbed isn't
supported → that's us); Display Source off; plan requirement for code
rendering (third-party guides say Business+; verify against current
Squarespace pricing before publishing); mobile sizing.

**9. WordPress** — `/guides/3d-photo-wordpress`
Gutenberg Custom HTML block; Elementor HTML widget; classic editor Text tab;
`wp_kses` stripping iframes for non-admin roles and the `unfiltered_html`
capability. Contrast with Scenic/Cinematic/Wiloke which need Photoshop-cut
layers and bundle sliders. Title angle: "without a plugin".

**10. 3D hero image (no-code builders)** — `/guides/3d-hero-image`
ICP #1 page. Why a hero needs one strong layered moment (cite Webflow/Framer
parallax posts), 5–8 example patterns (agency case-study hero, founder
portrait, product-on-surface, landing-page mood shot), performance budget for
above-the-fold iframes (don't lazy-load the hero; do preconnect), copy
placement over/next to the scene. Links platform spokes 2, 5, 8, 9.

**11. Portfolio** — `/guides/3d-photo-portfolio`
ICP #2 page. Photographers (portraits, editorial), illustrators (layered
artwork — note flat art needs contrast to get depth), 3D/motion designers
(still renders → interactive without shipping a WebGL build). Gallery vs hero
usage, badge/no-badge for client-facing work, Format/Squarespace/Framer
portfolio templates that accept iframes.

**12. Best 3D photo makers** — `/compare/3d-photo-makers`
Catches "best/free 3D photo maker" commercial-investigation traffic. Rows:
Media.io, Fotor, FlexClip, Animagen, Wondershare Virbo, Depthy, Immersity,
Gifsy. Columns: output, interactive?, embed?, runs in browser?, pricing model,
watermark. Be fair; say when a video tool is the right pick. Pricing H2 makes
the one-time-vs-credits argument with numbers.

**13. Privacy / in-browser** — `/guides/3d-photo-privacy-in-browser`
What runs locally (depth, matte, render) and what leaves the browser (free
plan uploads intermediate activations for inpainting — see commit 4d830d0;
published scenes are hosted). Must pass the honesty check in the README
backlog before publishing. Short, trust-building, links `/privacy`.

**14. Facebook 3D photos alternative** — `/guides/facebook-3d-photo-alternative`
Stories support removed; people ask "where did it go". Show how to get the
same effect from any photo (no portrait mode) and host it on your own page or
share the `/s/[id]` link. Low effort, evergreen nostalgia traffic.

### Rejected / folded

- Notion, Wix, Carrd, Shopify how-tos → sections in spoke 3; promote Wix to
  its own page later if spoke 3's Search Console queries show Wix demand
  (Vectary/Clooned prove the "embed 3D on Wix" query family exists).
- "Does an iframe slow down my site?" → H2 in spoke 3 + hub FAQ.
- "Depth map generator" / "Depthy alternative" → too far toward technical
  users; one paragraph in spoke 4.
- "Spline alternative for photos" → hold; Spline is a strong Webflow/Framer
  brand but it's 3D models. Revisit after spoke 12 ranks.
- "3D photo maker" head term → stays on `/` (run 01), not in this cluster.

## Internal linking map

Rules (from `first-link-weight-evidence.md`): every spoke's *first* link to the
hub is an in-body sentence within the first ~40% of the article, using the
anchor in the table above; no "read more"; ≤3 hub links per spoke; template
links (nav/footer) are secondary only. Hub links every spoke from its chapter
paragraph, not just the resources list.

```
HUB /guides/interactive-3d-photos-for-websites
 ├─ links every spoke from the matching H2 + "Resources" list
 ├─ CTA → /create · pricing chapter → /pricing · gallery mention → /gallery
 │
 1  /compare/immersity-ai-alternative        → hub · 12 · 7 · 3 · /pricing
 2  /guides/3d-photo-webflow                 → hub · 3 · 10 · 6
 3  /guides/embed-3d-photo-on-website        → hub · 2 · 5 · 8 · 9 · 13
 4  /guides/how-3d-photos-work               → hub · 6 · 13 · 7
 5  /guides/3d-photo-framer                  → hub · 3 · 10 · 6
 6  /guides/best-photos-for-3d-effect        → hub · 4 · 11 · /create
 7  /compare/3d-photo-video-vs-interactive   → hub · 12 · 3 · 4
 8  /guides/3d-photo-squarespace             → hub · 3 · 11 · 6
 9  /guides/3d-photo-wordpress               → hub · 3 · 10 · 6
10  /guides/3d-hero-image                    → hub · 2 · 5 · 9 · 6
11  /guides/3d-photo-portfolio               → hub · 8 · 5 · 6 · /gallery
12  /compare/3d-photo-makers                 → hub · 1 · 7 · 13 · /pricing
13  /guides/3d-photo-privacy-in-browser      → hub · 4 · 12 · /privacy
14  /guides/facebook-3d-photo-alternative    → hub · 4 · 3 · 6
```

Connective centre of the graph: spoke 3 (embed reference) and spoke 6 (best
photos) — most spokes link to them naturally, which is the sign the cluster is
coherent rather than 14 loose articles.

### Anchor text for cross-links (suggested)

| From → To | Anchor |
|---|---|
| any platform spoke → 3 | "the full iframe embed guide" |
| any platform spoke → 6 | "which photos produce the best depth" |
| 2 / 5 / 9 → 10 | "using a 3D photo as a hero image" |
| 8 / 5 → 11 | "3D photos in a portfolio site" |
| 1 / 7 → 12 | "how the 3D photo makers compare" |
| 4 → 13 | "what stays in your browser" |
| 12 / 1 → `/pricing` | "Pro is $9 one-time" |
| 6 / hub → `/create` | "make a 3D photo from your own image" |

### Links from existing pages into the cluster (needed so the hub isn't an orphan)

- `/` — in the "how it works" section: body link → spoke 4; in the use-case
  section → spokes 10 and 11; a "Guides" nav item → `/guides`.
- `/create` — under the uploader: "Not sure what to upload? See
  [which photos work best](spoke 6)". Post-generation embed step: link → spoke 3
  and platform spokes 2/5/8/9 as small tabs.
- `/pricing` — FAQ row "Compared to Immersity / Media.io?" → spokes 1 and 12.
- `/gallery` — intro sentence → spoke 11.
- Footer: "Guides" and "Compare" columns (secondary signal only).

## Publishing order

Decision tree: no hard deadline → no existing page ranks for the seed → solo
operator can ship ~3–4 pieces/month → domain has <50 indexed pages. Result:
**ship 3 spokes, then the hub with 1 explainer, then scale**, with the hub
landing in month 2 rather than month 3.

| Batch | When | Pieces | Why |
|---|---|---|---|
| 1 | Month 1 | 1 Immersity alternative · 2 Webflow · 3 Embed on any site | Fastest wins from run 01 (uncontested commercial query + exact-ICP how-to) plus the reference page most other spokes will link to. Three indexable URLs for the hub to point at. |
| 2 | Month 2 | 4 How 3D photos work · **HUB** · 5 Framer | Explainer first (hub cites it in two chapters), hub same week with links to spokes 1–5, Framer completes the two ICP-#1 platforms. Update `/`, `/create`, `/pricing` links the day the hub goes live. |
| 3 | Month 3 | 6 Best photos · 7 Video vs interactive · 8 Squarespace · 9 WordPress | Finish the platform set; add the honest-limits and decision pages the hub FAQ already answers in brief. |
| 4 | Month 4 | 10 Hero image · 11 Portfolio · 12 3D photo makers | Use-case pages once platform pages exist to link down to; the big comparison table last so it can reference every spoke. |
| 5 | Month 5 (or fold into 4) | 13 Privacy · 14 Facebook alternative | Low-lift trust/nostalgia pages; 13 waits on the privacy honesty check. |

After batch 2, revisit the hub monthly: add each new spoke to its chapter, bump
`dateModified`, keep a visible "updated" note.

## External linking strategy (hub cites, not competitors)

1. Depth Anything V2 — arXiv 2406.09414 (the depth model)
2. Alan Zucconi, "Inside Facebook 3D Photos: Parallax Shaders" (prior art for
   depth-parallax rendering)
3. web.dev, "Lazy load images and iframe elements" (performance guidance)
4. Framer Help, "How to add an iframe or embed script"; Squarespace Help,
   "Embed blocks"; Webflow Help / University on the Embed element (primary
   platform docs; cite from the platform chapter)
5. MDN, `<iframe>` reference (allow/sandbox/loading attributes)

## Technical checklist for implementation (ties to README backlog)

- Create `app/guides/page.tsx` (index), `app/guides/<slug>/page.tsx` ×11,
  `app/compare/<slug>/page.tsx` ×3, and the hub route. Static routes are
  fine; MDX not required.
- `generateMetadata` per page (title ≤60, description ≤160), `BreadcrumbList`
  on every nested route, `HowTo` on 2/3/5/8/9, `FAQPage` on hub + 1 + 12,
  `Article` everywhere with byline + dates.
- Add all 15 URLs to `app/sitemap.ts` (`changeFrequency: "monthly"`,
  priority 0.7 for guides, 0.8 for hub).
- Shared `<GuideLayout>` with TOC, byline, updated date, in-body CTA slot, and
  a "Related guides" block rendered *after* the body so template links never
  precede the contextual hub link.
- Real screenshots of the pipeline and each platform's editor (E-E-A-T).

## Success metrics

- Month 3: hub indexed and in top 50 for the seed; spoke 1 top 20 for
  "immersity ai alternative"; spokes 2–3 receiving impressions for
  "interactive image webflow" / "embed 3d photo on website".
- Month 6: ≥3 spokes top 20 on their long-tails; hub top 30.
- Month 9: hub top 20; platform spokes drive measurable `/create` sessions.
- Month 12: cluster supports `/` climbing for "3D photo maker" (run 01 head term).

## Sources

- https://seekbeak.com/interactive-3d-models/
- https://www.webrotate360.com/
- https://dev.to/chrisgreening/i-built-an-interactive-3d-photo-display-with-javascript-303j
- https://www.vev.design/blog/3d-website-examples/
- https://www.vntana.com/blog/how-to-embed-a-3d-model-in-your-website-a-quick-guide/
- https://sketchfab.com/blogs/enterprise/news/getting-started-with-sketchfab
- https://www.vectary.com/3d-modeling-blog/3d-web-embed-guide/
- https://www.spherelinks.io/blog/embed-3d-model-website-iframe
- https://webflow.com/blog/parallax-scrolling
- https://help.webflow.com/hc/en-us/articles/33961254763667-Parallax-movement-on-scroll
- https://discourse.webflow.com/t/display-a-photo-by-moving-the-mouse-over-it-parallax/171377
- https://www.flowradar.com/cloneables/mouse-image-movement
- https://www.flowradar.com/answer/how-can-i-make-my-iframe-embed-responsive-in-webflow
- https://www.redpanther.io/blog/parallax-hover-webflow
- https://www.framer.com/marketplace/components/threedparallax/
- https://www.framer.com/community/marketplace/components/3d-parallax-layers/
- https://bachoff.studio/framer-components/image-3d-parallax
- https://www.framer.com/help/articles/how-to-add-an-iframe-or-embed-script/
- https://support.squarespace.com/hc/en-us/articles/206543617-Embed-blocks
- https://bycrawford.com/blog/embed-an-iframe-on-squarespace
- https://www.embeddy.ai/docs/embedding-guide/squarespace
- https://codecanyon.net/item/scenic-3d-photo-parallax-wordpress-plugin/22845211
- https://wordpress.org/plugins/cinematic/
- https://instawp.com/wordpress-parallax-scrolling-plugins-to-try/
- https://www.alanzucconi.com/2019/01/01/facebook-3d-photos/
- https://fstoppers.com/originals/hacking-portrait-mode-create-3d-parallax-photo-facebook-189359
- https://arxiv.org/abs/2406.09414
- https://blog.roboflow.com/depth-anything/
- https://depthy.stamina.pl/
- https://blog.lunabloomai.com/3-d-photo-effect/
- https://motionlaps.ai/en/blog/photo-3-d-effect
- https://www.meta.com/blog/introducing-new-features-for-3d-photos-on-facebook/
- https://www.saashub.com/facebook-3d-photos-alternatives
- https://web.dev/learn/performance/lazy-load-images-and-iframe-elements
- https://web.dev/articles/iframe-lazy-loading
- https://www.framer.com/blog/parallax-scrolling-examples/
- https://reallygooddesigns.com/interactive-portfolio-examples/
- https://slashdot.org/software/p/Immersity-AI/alternatives
- https://leaveit2ai.com/ai-tools/image/immersity-ai
- https://www.3dpicmaker.com/blog/leiapix-immersity-alternatives.html
- https://www.vectary.com/3d-modeling-blog/how-to-embed-3d-models-on-your-wix-website/
- https://clooned.com/how-to-embed-3d-models-on-wix-the-easiest-way/

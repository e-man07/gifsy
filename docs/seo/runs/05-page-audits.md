# Run 05 — page-audit: `/`, `/create`, `/tools/gif`, `/tools/sticker`

Date: 2026-09-17 · Skill: `page-audit` (7-dimension) · Four pages, one file.
Primary keywords were assigned by the caller: `/` = "3D photo maker" (from run 01),
`/create` = "AI 3D photo animation", `/tools/gif` = "photo to GIF",
`/tools/sticker` = "sticker maker". Sibling runs are deep-diving the last two;
SERP work here is limited to what the audit needs.

## Method

**What was read**

- Live HTML of all four URLs via `curl` (server-rendered output only — what a
  crawler gets before hydration). Extracted `<title>`, meta description, H1–H3,
  visible-text word count, `<a href>` inventory, OG tags, JSON-LD count,
  canonical, `<main>` count.
- Source for what the client renders after hydration: `app/layout.tsx`,
  `app/page.tsx`, `app/create/page.tsx` + `components/CreateWorkshop.tsx`,
  `app/tools/gif/page.tsx` + `components/GifWorkshop.tsx`,
  `app/tools/sticker/page.tsx` + `components/StickerWorkshop.tsx`, plus
  `SiteNav`, `PersonaShowcase`, `PlanCards`, `ImportGuide`, `lib/gif.ts`,
  `lib/sticker.ts`, `lib/billing/plans.ts`, `app/sitemap.ts`, `app/robots.ts`.
- SERPs: "3D photo maker", "AI 3D photo animation", "photo to GIF",
  "sticker maker", plus two qualifier probes ("interactive 3D photo maker
  online depth parallax", "photo to sticker maker … WhatsApp Telegram").
- Competitor pages fetched and read: png3D, OpenArt Photo-to-3D, FlexClip 3D
  Photo Animation Maker, Wink Photo-to-3D-Animation, Kapwing Image-to-GIF,
  Adobe Express Image-to-GIF, FreeConvert Image-to-GIF, Sticker it, Jukebox
  Sticker Maker, Canva Sticker Maker. Media.io, Fotor and Immersity were read in
  run 01 and are not re-fetched. Pippit returned 503.

**What the tooling cannot see**

- People-Also-Ask boxes, AI Overview presence, featured-snippet holder, exact
  SERP position of any result, search volumes. Intent calls are made from the
  result *composition*, not from a ranking tool.
- Rendered post-hydration DOM (the audit reads source for that). Core Web
  Vitals / Lighthouse were not run.
- GSC: no impression or CTR data. Priorities are by severity + nav prominence.
- Competitor schema: the fetch summariser reports "none mentioned" for every
  page; that is not proof they have none.

**Crawler-facing facts that shape every audit below**

| URL | SSR words | H1 | H2s | JSON-LD | Canonical | Inbound `<a>` from other Gifsy pages |
|---|---|---|---|---|---|---|
| `/` | 740 (≈350 after removing 32× "3D · Made with Gifsy" + scene titles) | 1 | 5 | 0 | none | n/a |
| `/create` | 27 | 1 | 0 | 0 | none | **0** |
| `/tools/gif` | 51 | 1 | 0 | 0 | none | **0** |
| `/tools/sticker` | 26 | 1 | 0 | 0 | none | **0** |

The zero-inbound-link row is the single biggest finding of this run. The
homepage hands files to the tool pages with `router.push()`
(`app/page.tsx` `addFiles`), which is invisible to crawlers. Every other page
(`/gallery`, `/pricing`, legal) links only to `/`, `/#how` and the footer. The
three tool pages exist for Google only through `sitemap.xml`. Group B of the
POP hierarchy (anchor text of internal links pointing *to* the page) is
therefore empty for three of the four audited URLs.

Also site-wide: sub-pages inherit the root `openGraph.url` =
`https://www.gifsy.fun`, so `/create`, `/tools/gif`, `/tools/sticker` all
declare the homepage as their OG URL, and no page emits a canonical.

---

## 1. `https://www.gifsy.fun/` — primary keyword "3D photo maker"

### Content identity

A client-rendered product landing page whose job is to get one photo dropped
into the hero uploader and route the visitor to `/create` (Pro at $9 is the
monetisation). Journey stage: solution-aware to product-aware. Intent it
serves: transactional. Structural mismatch: the copy is positioning-led
("live 3D photo you can embed anywhere") and never says the noun phrase a
searcher types. "3D photo maker" appears **zero** times on the page; "3D
photo" appears twice (H1 + title). The page is engineered for a warm visitor
(Product Hunt, social) not for a cold searcher.

### SERP reality check on the assigned keyword

The literal "3D photo maker" SERP today: Google Play "AI Image to 3D Model
Maker", MakerWorld image-to-3D, Canva AI 3D Model Generator, Sloyd, 3D AI
Studio, Meshy, SupaVoxel — **seven of nine results are mesh generators**
(GLB/STL output). Only png3D (depth-video) and OpenArt (Pixar-style stills)
are photo-effect tools. This is the "image to 3D" SERP run 01 said never to
target, wearing a different query. Run 01's decision stands as the *brand
head term*, but the homepage must carry the disambiguating modifiers
("interactive", "parallax", "depth", "embed") in H1/H2 copy so it clusters
with the depth-tool set, not the mesh set. The qualified probe "interactive 3D
photo maker online depth parallax" returns the real competitive set: Depth
Studio (browser-local, mouse-interactive, "nothing uploaded"), Upsampler
("no sign-up, no watermark" parallax generator), GIFMakes 3D GIF maker,
Depthy, Media.io, DepthFlow (OSS). That set is what the page has to beat.

### Competitors read (top of the assigned SERP that are actually photo tools + the qualified set)

| | png3D | OpenArt Photo to 3D | Depth Studio (qualified SERP) | Media.io (run 01) |
|---|---|---|---|---|
| Format | tool + FAQ + pricing table | 2,200-word feature landing | single-page browser app | 2,500-word tool landing |
| Output | MP4 / GIF depth animation | stylised still (Pixar look) | interactive parallax + depth map + video | image / video |
| Hook | "circle / zoom / swing / dolly-zoom" motion presets | "Pixar-meets-Disney look" | "100% in your browser, nothing uploaded" | iOS-26 lock-screen trend |
| Pricing on page | yes: free 2/mo, $10/50, $20/111, $100/700 | tier name only | free | credits + 50% banner |
| FAQ | 6 (how it works, best image, data retention, why charge, free vs paid, contact) | 9 | none | none |
| E-E-A-T | one Quora quote | dated blog (Sep 2026), named models | GitHub author | Wondershare brand |
| Internal links | ~15 | 50+ | ~0 | 40+ |
| Does better | honest "why charge / what we do with uploads" answers | use-case sections, FAQ depth, link web | privacy claim, zero friction | breadth |
| Gap Gifsy can take | none say **embed** | not interactive | no embed, no publish, no hosting | uploads to server |

**#1 thing competitors do better:** they explain themselves. png3D and OpenArt
both have "how does it work / what's the best photo / what happens to my
upload / free vs paid" answered in H2s. Gifsy's homepage has a three-word
"How it works" (Upload · Customize · Publish) and nothing else.

**#1 gap to exploit:** nobody on either SERP sells an *interactive iframe
you host on your own site*. The hero already says "embed anywhere"; the body
never shows the snippet, never names Webflow/Framer except in one persona
eyebrow, and never explains what "live" means.

### Semantic landscape (1B)

Entities present on the page: photo, 3D, depth, embed, browser, Webflow/Framer
(once), WebGL (once, in a persona pitch), GIF, sticker, Pro, $9, badge.
Entities present on competitor pages and absent here: **depth map**,
**parallax**, **AI depth estimation / depth model**, **subject / background
segmentation (cutout)**, **iframe**, **MP4/WebM/GIF export**, **camera motion
(orbit, dolly, sway)**, **resolution / supported formats (PNG, JPG, WebP is
only in the uploader)**, **privacy / what happens to the upload**, **use
cases** (hero section, portfolio piece, product shot are gestured at in
persona pitches but not written out), **Immersity / LeiaPix**, **Squarespace /
Wix / WordPress**.

Predicates on page: turn, upload, give, hand, paste, drag, drop, pick, tune,
publish, download. Domain predicates missing: estimate (depth), segment,
matte, displace, parallax, orbit, layer, render, embed (as a verb it appears
once), host, lazy-load, loop, export.

EAV triples on page: `[Free] [3D generations] [3]`, `[Pro] [price] [$9 once]`,
`[gallery] [scenes] [22]`. That is three specific values on the whole page.
png3D alone has ~10 (tiers, per-image counts, 720p/1080p, 2 free/month).

### Scorecard

| Dimension | Score | Priority |
|---|---|---|
| 1. Information Gain & Originality | 4/10 | 🟡 |
| 2. Semantic Depth & Topical Completeness | 3/10 | 🔴 |
| 3. E-E-A-T Signals | 4/10 | 🟡 |
| 4. Structure, Readability & Time-to-Value | 5/10 | 🟡 |
| 5. Technical On-Page SEO | 3/10 | 🔴 |
| 6. Engagement, Distribution & Discoverability | 6/10 | 🟢 |
| 7. Conversion & Business Impact | 6/10 | 🟡 |
| **TOTAL** | **31/70** | |

### Detailed findings

**D1 — Information gain (4).** What works: the live iframe section
(`app/page.tsx` "EMBEDDED SCENE") is genuinely something no competitor page
has — a drag-able embed *of the product itself*. The community marquee of real
published scenes is original proof. What doesn't: none of that is in text.
There is no sentence a model or a crawler can extract that says "the visitor
can drag it on your site". The three "How it works" steps are generic ("Drop
in a photo", "tune the depth", "paste the embed") and could describe Media.io.
Non-obvious: the pipeline the app already exposes in `CreateWorkshop.tsx` —
"A depth model turns your photo into a 3D scene, and a second model lifts the
subject off the background… the AI runs once, then it's pure graphics at 60
fps" — is the information-gain sentence. It is currently only shown *after* a
file is added, on `/create`. Put a version of it on the homepage, above the
fold-two, with a screenshot of the depth map and the matte.

**D2 — Semantic depth (3).** Capped at 5 by the predicate check (fewer than 5
domain verbs) and again by EAV density (3 values on the page). Subtopic diff
against the two photo-tool competitors plus run 01's set: missing "How it
works" with substance (all), "What photos work best" (png3D, Fotor), "What
happens to my upload" (png3D, FlexClip FAQ), "Free vs paid" as prose not just
cards (png3D), "Use cases" as sections not persona pills (OpenArt, Fotor,
Media.io), "FAQ" (png3D 6, OpenArt 9, Fotor 9, Gifsy 0). Recommendation: the
run-01 backlog spec (≈2,200 words, 3-step how-to, use cases, 8–10 FAQ,
"video vs interactive embed" table, "what photos work best") is the right
brief; this audit adds two more sections: a *literal embed snippet* block
(`<iframe src=… loading="lazy">`) with a 3-line "paste it into Webflow /
Framer / Squarespace" note, and a "Made in your browser — what that actually
means" block that is honest about the free-plan activation upload
(README already flags commit 4d830d0).

**D3 — E-E-A-T (4).** Experience: the 22-scene gallery and the community
strip are real first-party artefacts (strong); the footer privacy line is a
first-person claim (good). Expertise: nothing on the page explains *why* the
effect works or when it fails — `CreateWorkshop.tsx` already knows ("Small
source… ~640px on the long edge or more reads crisper", "Needs a subject —
this photo's background couldn't be separated"); those are expert edge cases
sitting in error strings. Authority: no author, no about page, no topical
cluster (the `/compare` and guides pages from run 01 do not exist yet); the
Product Hunt badge is the only third-party signal. Trust: pricing is visible
(good), but the OfferBanner's countdown discount is the kind of urgency the
rubric flags — if `OFFER_ENDS_AT` is a rolling date, it is fabricated urgency;
if it is a real one-off, say the end date in text. The H1 says "you can embed
anywhere" but the free plan puts a badge on embeds; that qualifier is four
scrolls down. Recommendation: add an "Honest limits" H2 (frame-filling
subjects, busy backgrounds, low-res sources — the exact strings from the
workshop), and a one-line "who built this" with a name; run 01 already asked
the user for a byline.

**D4 — Structure / time-to-value (5).** Time-to-value is excellent for a
warm visitor (uploader is the hero). For a reader it is poor: the H2 sequence
is "One photo. Shot in three dimensions." → "Find your fit." → "Every one of
these was a flat photo." → "How it works" → "Keep going for $9, once." Read
as an outline, that communicates nothing about what the product is; two of
five H2s are taglines. Heading hierarchy is fine (1× H1, H2s, H3s under
steps). The "See what people are building 👀" section heading is a `<p>` not
an H2 (`app/page.tsx` ~line 367) — its content (real user scenes) is the
strongest proof on the page and is invisible to the outline. The 32
repeated "3D · Made with Gifsy" strings from `CommunityShowcase` are ~40% of
the crawlable words — pure noise to an NLP pass; give the marquee cards
`aria-hidden` labels or a single visually-hidden caption instead. Language: no
spelling errors found; "Customize" as the scroll-cue label under the hero is
misleading (it scrolls *up* to the uploader — see `scrollToUploader`).

**D5 — Technical on-page (3).** Group A: title `Gifsy — turn any photo into
a live 3D photo` (43 chars) lacks the searched noun phrase; H1 lacks it; body
lacks it; URL is fine. Group B: H2s carry no keyword variant; zero internal
anchor text points at `/create` (the page that actually makes the 3D photo),
`/tools/gif` or `/tools/sticker` — the homepage's only content links are
`/gallery` and `/pricing` plus footer legal. Group C: hero image `alt=""`
(decorative, acceptable); gallery strip items — check `GalleryGrid.tsx` alts
carry scene titles. Group D: no JSON-LD (`SoftwareApplication` + `Offer`,
`Organization`, `FAQPage` once a FAQ exists); no canonical (Next.js
`alternates.canonical` in `app/layout.tsx` metadata). Featured snippet / AIO:
there is no definitional paragraph ("A 3D photo maker is…") and no numbered
steps in `<ol>` — the steps are `div`s. Fix order: title → H1 → body copy →
H2s → real `<a>` links to the three tool pages → schema.

**D6 — Engagement / distribution (6).** OG/Twitter cards are configured with
a generated 1200-wide image (543 KB PNG — fine for cards). The embedded
scene is an unusual dwell-time asset. Discover readiness is low (no
editorial headline, no dated content). Shareability: no quotable stat. Mobile:
the hero uploader is full-width; the persona grid collapses to one column —
reasonable. Rich-result eligibility: zero today.

**D7 — Conversion (6).** Value prop lands in under five seconds (H1 +
uploader + three checkmarks). Single CTA (drop a photo) is repeated ("Try it
with your photo", plan cards). Social proof (community strip, gallery, PH
badge) is *above* the pitch — good. Friction: 3D needs an account only at
publish time, but the page never says that, and the hero badges say "3 free
3D generations" without saying an account is required for those — a
mismatch with `CreateWorkshop.tsx` ("3D needs a free account"). Fabricated
urgency risk from the countdown banner (see D3). Missing: a one-line "what
you get" under the plan cards for an agency buyer (commercial use, no badge —
both are in `PLAN_DISPLAY.pro.features` but rendered as a list, not a
sentence).

### Semantic gap brief (what to add)

Entities: depth map · parallax · depth estimation model · subject
segmentation / cutout · iframe embed · lazy loading · Webflow, Framer,
Squarespace, Wix, WordPress · MP4/WebM/GIF/PNG export · resolution guidance
(≥640 px long edge) · Immersity/LeiaPix (as "alternative to").
Predicates: estimate depth, segment the subject, displace two planes,
parallax on pointer move, render on GPU, embed via iframe, host, lazy-load.
EAV to state: `[Gifsy] [output] [interactive iframe]`, `[free plan] [3D
generations] [3]`, `[free plan] [badge] [yes]`, `[Pro] [price] [$9 one-time]`,
`[Pro] [commercial use] [yes]`, `[embed] [default height] [500 px]`,
`[input] [formats] [PNG, JPG, WebP]`, `[recommended source] [long edge]
[≥640 px]`, `[runtime after generation] [fps] [60]`, `[model] [runs where]
[browser; Pro fully on-device]`.
Sections competitors have that this page lacks: How it works (substantive) ·
Best photos / limits · Privacy & uploads · Use cases · FAQ · Free vs Pro
prose.

### Top 5 quick wins

1. **Title** (`app/layout.tsx` `metadata.title.default` and `openGraph.title`
   / `twitter.title`): FROM `Gifsy — turn any photo into a live 3D photo` TO
   `3D Photo Maker — Interactive Depth, Embed Anywhere | Gifsy` (58 chars).
   Contains the head term, the two modifiers that pull it out of the mesh
   SERP, and the click reason. Keep the `template: "%s · Gifsy"` for sub-pages.
2. **H1** (`app/page.tsx` ~line 258): FROM `Turn any photo into a live 3D
   photo you can embed anywhere.` TO `The interactive 3D photo maker you can
   embed on any site.` — keeps the voice, adds the noun phrase.
3. **Real links to the tool pages.** In the hero mode switch
   (`app/page.tsx` ~lines 279–298) the 3D / GIF / Sticker buttons are
   `<button>`s. Add a small text row under the uploader: "or open the tool:
   [3D photo maker](/create) · [photo to GIF](/tools/gif) · [sticker
   maker](/tools/sticker)". Also add the three to the footer `<nav>`. This
   single edit un-orphans three indexable pages with exact-match anchor text.
4. **Promote the community heading** (`app/page.tsx` ~line 367) from `<p>`
   to `<h2>`: `Interactive 3D photos published by Gifsy users`.
5. **Steps as an ordered list** (`app/page.tsx` "STEPS" section): render the
   three steps as `<ol><li>` with an H3 per step, and expand each `desc` to
   two sentences using the workshop's own language (depth model, subject
   lift, iframe). This is the snippet-eligible block.

### Top 5 strategic improvements

1. Implement the run-01 body: ≈2,200 words in sections *below* the live
   embed, in this order — "What a 3D photo is (and isn't)" definition
   paragraph → How it works (depth map + matte + two planes, with two
   first-party screenshots) → Embed it (snippet + Webflow/Framer/Squarespace
   lines linking to the future guides) → Video vs interactive embed table →
   Who it's for (rewrite the four personas as H3s with 60–80 words each) →
   What photos work best / limits → Free vs Pro → FAQ (8–10).
2. JSON-LD in `app/page.tsx` (or a server wrapper — the page is
   `"use client"`, so move metadata/schema into a server `layout` or inject
   via `<script type="application/ld+json">` in the client tree):
   `SoftwareApplication` (`applicationCategory: MultimediaApplication`,
   `operatingSystem: Web`, `offers: [Offer $0, Offer $9]`) + `Organization`
   + `FAQPage` once the FAQ exists.
3. Split the page's crawlable text from its decoration: remove the 32×
   "3D · Made with Gifsy" caption repeats from the DOM text (single
   `sr-only` caption for the marquee), so the page's NLP profile is copy, not
   chrome.
4. Build the `/compare/immersity-ai-alternative` page and the Webflow/Framer
   guides from run 01 and link to them from the homepage FAQ — the homepage
   cannot rank a head term without a cluster behind it.
5. Replace the countdown-discount pattern with a stated, dated launch offer
   (or drop it). Trust and E-E-A-T scoring both penalise rolling countdowns.

### Rewritten elements

- Title (58): `3D Photo Maker — Interactive Depth, Embed Anywhere | Gifsy`
  Alt (54): `Interactive 3D Photo Maker — Embed on Any Site | Gifsy`
- Meta (143): `Make an interactive 3D photo from one image, in your browser.
  Drag it, then paste the iframe into Webflow, Framer or any site. 3 free, $9 once.`
- H1: `The interactive 3D photo maker you can embed on any site.`
- Opening paragraph (under H1, replaces "Upload one image. Gifsy gives it real
  depth…"): `Drop in one photo. Gifsy estimates a depth map and lifts the
  subject off the background right here in your browser, then gives you an
  iframe your visitors can drag around — no video export, no WebGL developer,
  no plugin.`
- Definition paragraph for the new body (snippet target): `A 3D photo maker
  turns a single flat photo into a scene with real depth. Gifsy does it with
  two AI models that run in your browser: one estimates a depth map, one cuts
  the subject out. The result isn't a video — it's an interactive embed that
  responds to the visitor's mouse or tilt.`

---

## 2. `https://www.gifsy.fun/create` — primary keyword "AI 3D photo animation"

### Content identity

The working tool page for the paid product. It renders a card with `<h1>Make
your 3D photo</h1>`, the uploader and "↑ Add a photo to begin." — **27
server-rendered words**, zero H2s. Everything informative (the pipeline
explanation, background/cutout modes, exports, the embed snippet, generation
counter) appears only after a file is added. Intent: transactional. Journey:
product-aware (people arrive from the homepage uploader, which hands the file
over in memory). Mismatch: the page is designed for a warm handoff, but the
sitemap and the assigned keyword ask it to rank cold.

### SERP

"AI 3D photo animation" is a clean, single-intent SERP: FlexClip (three
URLs), Wondershare Virbo listicle, Pippit (two template pages), Wink, Meshy
blog. All are *video-output* tools or listicles; all use the exact phrase
"3D photo animation" in title and H1. Dominant format: tool landing with
"How to" steps + FAQ, 1,200–1,800 words. Opportunity angle: **interactive,
not rendered** — no result offers an embed or a live viewer.

### Competitors read

| | FlexClip 3D Photo Animation Maker | Wink Photo to 3D Animation | png3D (also ranks for the qualified query) |
|---|---|---|---|
| Format | ~1,200-word landing, before/after sliders, 3-step how-to, FAQ 3 | ~1,800-word landing, 6 sections, 3 named testimonials, FAQ 6 | tool + FAQ 6 + pricing |
| Title | `3D Photo Animation Maker - Turn Your Static Image into 3D Animation with FlexClip` | `Photo to 3D Animation: Add Motion and Magic to Every Pixel \| Wink` | `Image 3D Maker - Convent [sic] 2D images…` |
| Output | video / GIF | stylised still (video via separate tool) | MP4 / GIF |
| Hook | "one click" | "keeps subject likeness", text-directed | motion presets (circle, zoom, swing, dolly) |
| E-E-A-T | "Trusted by" logos, privacy statement | named testimonials, Meitu Inc. | Quora quote |
| Internal links | 80+ | 35+ | ~15 |
| Does better | motion-effect vocabulary, editing-after-generation | testimonials, FAQ about likeness/formats/limits | honest data-retention + pricing FAQ |
| Gap | no interactivity, no embed, upload to server | not real depth | no embed |

### Semantic landscape

Present in source (post-hydration only): depth model, second model lifts
subject, 60 fps, GPU, background / cutout, blurred backdrop, GIF / PNG / WebM
/ Scene JSON export, publish, iframe, `loading="lazy"`, 500 px, free
account, "photo itself isn't uploaded", Pro runs locally, ~640 px guidance.
That is a strong entity set — the problem is that *none of it is in the
crawlable HTML*. Missing vs competitors: "animation" (the keyword's noun —
the page says "3D photo", never "animation"), motion-effect names (orbit /
sway / dolly-zoom — Gifsy's `ThreeDPreview` has depth and motion controls;
name them in copy), supported input formats in text, output resolution,
"how long does it take", "will it look like the original", "can I use it
commercially".

Predicates in the hidden copy: turn, lift, move, run, upload, publish, copy,
download, separate, float. Missing: animate, parallax, orbit, export, loop.

### Scorecard

| Dimension | Score | Priority |
|---|---|---|
| 1. Information Gain & Originality | 3/10 | 🟡 |
| 2. Semantic Depth & Topical Completeness | 2/10 | 🔴 |
| 3. E-E-A-T Signals | 3/10 | 🟡 |
| 4. Structure, Readability & Time-to-Value | 4/10 | 🟡 |
| 5. Technical On-Page SEO | 2/10 | 🔴 |
| 6. Engagement, Distribution & Discoverability | 3/10 | 🟡 |
| 7. Conversion & Business Impact | 6/10 | 🟢 |
| **TOTAL** | **23/70** | |

### Detailed findings

**D1 (3).** The one paragraph in `CreateWorkshop.tsx` (~line 361) — "A depth
model turns your photo into a 3D scene, and a second model lifts the subject
off the background… the AI runs once, then it's pure graphics at 60 fps" —
is more technically honest than anything on FlexClip or Wink. It is gated
behind `sources.length > 0`. The "Small source (W×H px)… ~640px on the long
edge" note (~line 156) is the kind of hands-on detail competitors lack. Both
are invisible to Google. Non-obvious: the export of a *Scene JSON* (config +
depth grid dimensions) is unique in this category and never described.

**D2 (2).** 27 crawlable words, no domain predicates, no EAV. Capped hard.
The fix is not clever: give the page a static body under the tool card.

**D3 (3).** Trust signal that exists: "Rendered on your device. Your photo
never leaves it." (~line 560) — again post-upload only, and it must be
reconciled with the free-plan activation upload (README honesty item). No
byline, no examples of output on the page itself (the homepage has 22; this
page has none), no "what fails" text before generation.

**D4 (4).** Time-to-value for a user is instant (uploader). For a reader or
crawler there is no value. HTML validity: `app/create/page.tsx` wraps in
`<main>` and `CreateWorkshop.tsx` renders its own `<main>` → **nested
`<main>`** (2 on the page). Same bug on both tool pages. Change the
workshop root to `<div>` or `<section>`.

**D5 (2).** Title `Make a 3D Photo · Gifsy` (23 chars) — no "animation", no
"AI". H1 `Make your 3D photo` — same. Meta is decent copy but ranks nothing.
No H2. Zero inbound internal links. OG URL inherited = homepage. No canonical.
No schema. Fix order: title → H1 → 600–900 words of body with H2s → links
from `/` and `/gallery` with anchor "AI 3D photo animation" → `SoftwareApplication`
+ `HowTo` (once steps exist) + `FAQPage`.

**D6 (3).** Shares as the homepage card (inherited OG). No page-specific OG
image; a before/after or a short looping WebM of the effect would make this
page shareable on its own. Nothing to dwell on before upload.

**D7 (6).** The tool itself converts well: mode choice, generate, preview,
export, publish, embed snippet, generation counter — all present. Friction:
the sign-in wall is discovered at publish time; state it in the intro copy.
The counter "N free 3D generations left" is honest scarcity. Missing: a link
to `/pricing` or `#plans` beside the counter for a logged-in user near the
limit (check `UpgradeDialog` covers this).

### Semantic gap brief

Add to a static body (server-rendered, under the card): definition of "3D
photo animation" and how Gifsy's differs (interactive vs rendered) ·
3-step `<ol>` (Upload → Generate: depth + cutout → Drag, export or embed) ·
"Two looks: with background / cutout" as H3s (copy exists in the buttons) ·
Exports: GIF, PNG, WebM, Scene JSON, iframe embed (state sizes, `loading=
"lazy"`, 500 px default height) · What photos work best (≥640 px long edge,
a clear subject, plain background; busy backgrounds → depth-only view) ·
Privacy: what stays local, what is uploaded on publish and on the free plan ·
Free vs Pro (3 generations, badge, on-device model) · FAQ 6–8 (Is it free?
Do I need an account? Does it look like my photo? Can I export video? Can I
use it commercially? Does it work on phones? What is the embed's size?).

### Top 5 quick wins

1. **Title** (`app/create/page.tsx` `metadata.title`): FROM `Make a 3D Photo`
   TO `AI 3D Photo Animation — Free, Runs in Your Browser` (renders as 58
   chars with the ` · Gifsy` template).
2. **H1** (`components/CreateWorkshop.tsx` ~line 344): FROM `Make your 3D
   photo` TO `AI 3D photo animation, made in your browser`.
3. **Unhide the pipeline paragraph**: move the ~line 361 explanation above
   the uploader so it renders on first paint (drop the `sources.length > 0`
   guard for that one `<p>`). That alone takes the page from 27 to ~90
   meaningful words with "depth model", "subject", "60 fps", "account",
   "uploaded" in the DOM.
4. **Fix nested `<main>`**: change the root element in `CreateWorkshop.tsx`
   (~line 342) to `<div>`.
5. **Inbound links**: from `/` (hero, footer) and `/gallery` header with
   anchor text "AI 3D photo animation" / "make a 3D photo".

### Top 5 strategic improvements

1. Static body (600–900 words) rendered by `app/create/page.tsx` as a server
   component *below* `<CreateWorkshop />`, using the gap brief above. Keep
   the tool first — the SERP's dominant format is tool-then-copy.
2. Two example scenes embedded on the page (reuse the gallery iframes) with
   a caption naming what to look at ("subject lifts, background stays").
3. Per-page OG image (`app/create/opengraph-image.tsx`) and per-page
   `openGraph.url` / `alternates.canonical`.
4. `HowTo` + `FAQPage` + `SoftwareApplication` JSON-LD emitted from the
   server page.
5. Honesty pass on "your photo is never uploaded" (meta description) vs the
   free-plan activation upload — either change the mechanism or the words.
   This is a Trust item, not a copy nit; the meta description is the first
   thing a searcher reads.

### Rewritten elements

- Title (58 incl. template): `AI 3D Photo Animation — Free, Runs in Your Browser · Gifsy`
- Meta (147): `Upload a photo. An AI depth model adds real parallax in
  seconds — drag to look around, export GIF, PNG or WebM, or publish an
  iframe embed. 3 free.`
- H1: `AI 3D photo animation, made in your browser`
- Opening paragraph (above uploader): `Drop in one photo. A depth model
  turns it into a 3D scene and a second model lifts the subject off the
  background. Move your mouse to look around — the AI runs once, then it's
  pure graphics at 60 fps. Export a GIF, PNG or WebM, or publish it and paste
  the iframe into your site. Publishing needs a free account; the photo
  itself stays on your device.` (Adjust the last clause after the honesty
  pass.)

---

## 3. `https://www.gifsy.fun/tools/gif` — primary keyword "photo to GIF"

### Content identity

Free, no-account tool page: `<h1>Make your GIF</h1>`, Animate-one / Combine-
several switch, uploader, six effect buttons (Zoom, Bounce, Shake, Pulse,
Spin, Glitch), speed slider (8–30 fps), boomerang toggle. **51 crawlable
words**, no H2. Top-of-funnel: intent transactional ("convert / make"),
journey solution-aware. Purpose: acquire visitors who will later notice the
3D mode. Mismatch: the page has a real feature set that is stated nowhere in
prose, and the words "photo to GIF" / "image to GIF" / "convert" never
appear.

### SERP

"photo to GIF" is a converter SERP: Cloudinary, Kapwing, FreeConvert, Imagen
AI, online-convert, Adobe Express, Imgflip, MakeAGIF. Every top result is a
tool landing with H1 `Image to GIF` / `Convert Image to GIF` and a "How to"
block; word counts 800–1,400; FAQ on most. Two sub-intents are mixed:
(a) *combine several images into an animated GIF* (FreeConvert, Imgflip,
MakeAGIF) and (b) *convert one image file to .gif format* (Cloudinary,
online-convert). Gifsy's "Animate one" (apply motion to a single still) is a
third angle none of the top 8 leads with — it is the differentiator. High-
authority SERP; realistic target is the "animate a photo into a GIF" tail,
with "photo to GIF" as the umbrella.

### Competitors read

| | Kapwing | Adobe Express | FreeConvert |
|---|---|---|---|
| Title | `Convert Image To GIF — Image To GIF Converter — Kapwing` | `Free Online Image to GIF Converter \| Adobe Express` | `Image to GIF \| Make a GIF online for Free` |
| H1 | Convert Image to GIF | Convert image to GIF for free. | Image to GIF |
| Words | ~1,300 | ~1,150 | ~800 |
| Structure | how-to, multi-image, FAQ 3, 9 testimonials, logo bar | how-to, use cases, timeline control, FAQ 5 | how-to, Easy / Quality / Secure, no FAQ |
| Free / limits | "free to start", premium implied | free plan, no watermark mentioned | free, 1 GB limit, upgrade tier |
| Processing | unspecified (server) | implied upload | server ("secure uploads, auto removal") |
| E-E-A-T | "35 million creators", brand logos | none | SSL badges |
| Internal links | 45+ | 100+ | 100+ |
| Does better | scale proof, multi-image story | timeline / duration control copy | security framing |
| Gap | none run in-browser; none animate a single still with motion presets | | |

### Semantic landscape

Present (mostly post-hydration): GIF, animate, combine, zoom, bounce, shake,
pulse, spin, glitch, fps, boomerang loop, Telegram/Discord/iMessage (in the
result note). Missing vs competitors: **image to GIF / convert**, **JPG /
PNG / WebP input** in text, **frame delay / duration**, **loop count**,
**GIF size / dimensions**, **quality / dithering / colour palette (256
colours)**, **file size**, **slideshow**, **transparent GIF**, **no
watermark** (true, unstated), **no upload / in-browser** (true, in meta only),
**social use (Slack, Twitter/X, WhatsApp)**. Predicates: make, animate,
combine, play, drop. Missing: convert, loop, sequence, resize, compress,
export, dither.

EAV available but unstated: `[speed] [range] [8–30 fps]`, `[time per image]
[range] [0.2–1.5 s]`, `[effects] [count] [6]`, `[account] [required] [no]`,
`[watermark] [none]`, `[processing] [where] [browser]`.

### Scorecard

| Dimension | Score | Priority |
|---|---|---|
| 1. Information Gain & Originality | 4/10 | 🟡 |
| 2. Semantic Depth & Topical Completeness | 2/10 | 🔴 |
| 3. E-E-A-T Signals | 3/10 | 🟡 |
| 4. Structure, Readability & Time-to-Value | 4/10 | 🟡 |
| 5. Technical On-Page SEO | 2/10 | 🔴 |
| 6. Engagement, Distribution & Discoverability | 3/10 | 🟡 |
| 7. Conversion & Business Impact | 5/10 | 🟡 |
| **TOTAL** | **23/70** | |

### Detailed findings

**D1 (4).** Genuinely different from the SERP: single-still motion presets,
boomerang, fully client-side (no upload at all — stronger than FreeConvert's
"secure upload"). None of it is written down. The result note "Send it
anywhere — GIFs animate in Telegram, Discord, iMessage and more" is the only
use-case sentence and only appears after generation.

**D2 (2).** Six effect *names* is the entire domain vocabulary in the DOM.
Capped.

**D3 (3).** No proof of output (no example GIFs on the page), no "what
we do with your file" (the honest answer — nothing, it never leaves the tab —
is a trust win Kapwing/FreeConvert cannot make), no byline.

**D4 (4).** Nested `<main>` (`GifWorkshop.tsx` ~line 172). The mode switch
lives in the H1 row, so the H1 and the two mode labels read as one line to a
screen reader. No headings after H1.

**D5 (2).** Title `Make a GIF · Gifsy` (18 chars) does not contain "photo",
"image" or "to GIF". H1 `Make your GIF` — same. Zero inbound links. Inherited
OG URL. No canonical. The `?mode=combine` search param creates a second URL
for the same page with no canonical → duplicate-URL risk once linked. Fix
order: title → H1 → body → canonical (`alternates.canonical: "/tools/gif"`)
→ internal links → `SoftwareApplication` + `HowTo`.

**D6 (3).** Nothing to share; OG card is the 3D homepage card. A demo GIF
(the product's own output) as the page's OG image would be on-brand and
cheap.

**D7 (5).** The tool converts: one click, no account. Missing the funnel
hook: after download there is no "make this photo 3D instead" cross-link to
`/create` — the whole point of the free tools being top-of-funnel.

### Semantic gap brief

H2 "Turn a photo into a GIF in three steps" (`<ol>`) · H2 "Six motion effects
for a single photo" (H3 per effect, one line each — this is unique content) ·
H2 "Combine several photos into one GIF" (time per image 0.2–1.5 s,
ordering) · H2 "Speed, loops and boomerang" (8–30 fps; forward-then-reverse)
· H2 "Runs in your browser — nothing is uploaded" · H2 "Where GIFs work"
(Telegram, Discord, iMessage, Slack, X) · FAQ 5–6 (Is it free? Watermark?
Formats? Max size? Transparent? Why is my GIF grainy — 256-colour palette).

### Top 5 quick wins

1. **Title** (`app/tools/gif/page.tsx`): FROM `Make a GIF` TO `Photo to GIF
   Maker — Free, No Upload, No Watermark` (58 chars with template).
2. **H1** (`components/GifWorkshop.tsx` ~line 175): FROM `Make your GIF` TO
   `Photo to GIF maker — animate one photo or combine several`. Move the
   mode switch out of the H1 row.
3. **Two-sentence intro above the uploader** (renders on first paint):
   `Turn a photo into an animated GIF with zoom, bounce, shake, pulse, spin
   or glitch — or combine several photos into one loop. Everything runs in
   your browser: no upload, no account, no watermark.`
4. **Canonical** `alternates: { canonical: "/tools/gif" }` in the page
   metadata (covers `?mode=combine`).
5. **Cross-links**: to `/create` ("make this photo 3D instead") after the
   result, to `/tools/sticker` in the intro, and inbound from `/` and the
   footer with anchor "photo to GIF".

### Top 5 strategic improvements

1. Static server-rendered body (700–1,000 words) below the tool per the gap
   brief, with two or three real output GIFs inline (`<img>` with alt naming
   the effect).
2. Own OG image (an actual GIF still with the effect labelled).
3. Consider a `/tools/gif/combine` route (or keep the param but link only
   the canonical) so "combine images into a GIF" can be its own targetable
   page later.
4. `HowTo` + `FAQPage` + `SoftwareApplication` JSON-LD.
5. Fix nested `<main>`.

### Rewritten elements

- Title (58): `Photo to GIF Maker — Free, No Upload, No Watermark · Gifsy`
- Meta (156): `Turn a photo into an animated GIF (zoom, bounce, shake,
  glitch) or combine several into one loop. Runs in your browser — no upload,
  no signup, no watermark.`
- H1: `Photo to GIF maker — animate one photo or combine several`
- Opening paragraph: as quick win 3.

---

## 4. `https://www.gifsy.fun/tools/sticker` — primary keyword "sticker maker"

### Content identity

Free, no-account tool: `<h1>Make your sticker</h1>`, uploader, "↑ Add a photo
to begin." — **26 crawlable words**. After upload: outline slider (0–40 px),
outline colour, caption (24 chars), drop shadow, Make Sticker → PNG + WebP at
512×512, plus an `ImportGuide` with Telegram @Stickers-bot steps. Intent:
transactional. Purpose: top-of-funnel.

### SERP — the assigned keyword does not match the product

"sticker maker" today: StickerYou (print), Amazon "sticker maker machine",
Sticker it (print designer), Jukebox (print, die-cut), StickerApp (print),
Google Play WhatsApp sticker app, StickerYou home, Canva (print + digital).
**Six of eight are physical/print.** Gifsy makes a chat sticker (transparent
512×512 PNG/WebP with outline). The matching SERP is the probe "photo to
sticker … WhatsApp Telegram": GIFDB image-to-sticker, LightX Telegram sticker
maker, Wipe.bg, Sinaï Studio blog, Sticker Crafter, Snappy-Fix ("512×512
WebP"), phototosticker.net, Pixoate, Homiwork — all small sites, all
"free / no watermark / no signup". That is a winnable SERP; the print SERP is
not. Recommendation for the sibling deep-dive: keep "sticker maker" as the
H1 noun but qualify it ("photo to sticker", "WhatsApp & Telegram") in title
and H2s. The audit below scores against the assigned keyword but rewrites
toward the qualified one.

### Competitors read

| | Jukebox Sticker Maker | Canva Sticker Maker | Sticker it |
|---|---|---|---|
| Title | `Free Sticker Maker \| Create Custom Stickers Online \| Jukebox` | `Sticker Maker Online - Design and print stickers on Canva` | `Free Online Sticker Maker - 1000s of Free Templates \| Sticker it` |
| H1 | Sticker Maker | Free online sticker maker | Free online designer |
| Words | ~2,500 | ~2,000 | ~1,200 |
| Output | die-cut print + PNG/JPG/PDF | print + digital PNG | print |
| Structure | 13 H2s: upload → auto background removal → die-cut shape → download/print → FAQ 9 | benefits, how-to, testimonials, FAQ 3 ("what are digital stickers?"), templates | shapes, templates, FAQ 6 |
| E-E-A-T | Trustpilot, Amazon/Meta/Google/Shopify logos, phone number | 5 @handle testimonials | Texas facility, 4-day turnaround |
| Internal links | 50+ | 80+ | 30+ |
| Does better | explains background removal + outline ("die-cut") step by step | defines "digital sticker" | — |
| Gap | none target chat apps as the primary output; none run in-browser | | |

From the qualified SERP, Snappy-Fix and GIFDB own the "512×512 WebP for
WhatsApp/Telegram" entity explicitly.

### Semantic landscape

Present (post-hydration): outline, colour, caption, drop shadow, PNG, WebP,
512×512 (ImportGuide), Telegram, @Stickers bot, custom-emoji 100×100
gotcha. That Telegram import guide (`components/ImportGuide.tsx`) is the
most experience-rich text on any of the four pages — "Got 'exactly 100×100
pixels'? That's Telegram's custom-emoji size — you started an emoji pack
instead of a sticker pack" is a real, hands-on error-message note. It only
renders after generation. Missing vs both SERPs: **background removal /
cutout** (the core AI step is never named in prose), **transparent PNG**,
**WhatsApp** (the highest-volume chat entity — only Telegram is covered),
**Discord / iMessage / Signal**, **sticker pack**, **die-cut / outline**
as a named concept, **WebP vs PNG when to use which**, **file size limits**
(WhatsApp: 512×512, <100 KB static — verify before publishing), **no
watermark / no signup / in-browser**.

Predicates: cut, add, pop, make, download. Missing: remove (background),
segment, outline, pad, resize to 512, import, send as file, tag.

### Scorecard

| Dimension | Score | Priority |
|---|---|---|
| 1. Information Gain & Originality | 4/10 | 🟡 |
| 2. Semantic Depth & Topical Completeness | 2/10 | 🔴 |
| 3. E-E-A-T Signals | 3/10 | 🟡 |
| 4. Structure, Readability & Time-to-Value | 4/10 | 🟡 |
| 5. Technical On-Page SEO | 2/10 | 🔴 |
| 6. Engagement, Distribution & Discoverability | 3/10 | 🟡 |
| 7. Conversion & Business Impact | 5/10 | 🟡 |
| **TOTAL** | **23/70** | |

### Detailed findings

**D1 (4).** The ImportGuide's Telegram walkthrough (send as *file* to keep
512×512; the 100×100 emoji-pack trap) is information no top-8 competitor has.
It is hidden until a sticker exists. The in-browser AI cutout with an
outline is what Jukebox charges print orders for.

**D2 (2).** 26 words, no domain nouns in the DOM. Capped.

**D3 (3).** Real experience (the Telegram guide) exists but is invisible;
no example stickers; no byline; no privacy statement on-page (meta only).

**D4 (4).** Nested `<main>` (`StickerWorkshop.tsx` ~line 129). No H2s. The
ImportGuide's own heading is a `<p>` — when unhidden, make its steps an
`<ol>` under an H2.

**D5 (2).** Title `Make a Sticker · Gifsy` (22 chars) — no "maker", no
"photo", no platform. H1 `Make your sticker`. Zero inbound links. Inherited
OG URL. No canonical. Fix order: title → H1 → body → links → schema.

**D6 (3).** Nothing shareable; OG is the 3D card. A sticker sheet of three
example outputs as the OG image would be cheap and distinctive.

**D7 (5).** One-click tool, no account, converts fine. After download the
funnel stops — no "make it 3D" or "make a GIF of it" cross-link. The
Telegram guide is a retention asset (people come back to import); a
WhatsApp equivalent is the obvious next step and the biggest entity gap.

### Semantic gap brief

H2 "Photo to sticker in three steps" (`<ol>`: upload → AI removes the
background → add outline, caption, shadow → download PNG or WebP) · H2
"Made for WhatsApp, Telegram, Discord and iMessage" (512×512, transparent,
PNG vs WebP) · H2 "Add it to Telegram" (existing guide, unhidden) · H2 "Add
it to WhatsApp" (new: needs a third-party pack app or WhatsApp Web
limitations — write only what has been verified) · H2 "Runs in your browser
— your photo is never uploaded" · FAQ 5–6 (free? watermark? animated
stickers? why does Telegram say 100×100? can I print these? outline colours?).

### Top 5 quick wins

1. **Title** (`app/tools/sticker/page.tsx`): FROM `Make a Sticker` TO
   `Photo to Sticker Maker — WhatsApp & Telegram Ready` (58 chars with
   template). If the sibling deep-dive insists on the head term:
   `Sticker Maker: Photo to Transparent PNG, Free · Gifsy` (53).
2. **H1** (`components/StickerWorkshop.tsx` ~line 131): FROM `Make your
   sticker` TO `Sticker maker — cut any photo into a WhatsApp or Telegram
   sticker`.
3. **Intro paragraph above the uploader** (first paint): `Upload a photo.
   Gifsy removes the background in your browser, adds an outline, caption
   and shadow, and gives you a 512×512 transparent PNG or WebP — the size
   WhatsApp and Telegram want. No upload, no account, no watermark.`
4. **Unhide the Telegram import guide** as a static H2 section (keep the
   generated-file buttons inside it conditional).
5. **Inbound links** from `/`, footer, `/tools/gif` with anchor "sticker
   maker" / "photo to sticker".

### Top 5 strategic improvements

1. Static 700–1,000-word body per the gap brief, with three example stickers
   on a checkerboard (`alt="Transparent sticker of … with white outline"`).
2. WhatsApp import section (verified steps) — closes the biggest entity gap
   on the qualified SERP.
3. Own OG image.
4. `HowTo` + `FAQPage` + `SoftwareApplication` JSON-LD.
5. Fix nested `<main>`; canonical.

### Rewritten elements

- Title (58): `Photo to Sticker Maker — WhatsApp & Telegram Ready · Gifsy`
- Meta (144): `Cut the subject out of any photo into a 512×512 transparent
  sticker with outline and caption. WhatsApp, Telegram, Discord. No upload,
  no signup.`
- H1: `Sticker maker — cut any photo into a WhatsApp or Telegram sticker`
- Opening paragraph: as quick win 3.

---

## Common issues across the four pages

Ordered by POP group, then severity.

**Group A — critical**

1. **No page carries its searched noun phrase in title, H1 or body.**
   Titles are product-voice ("Make a GIF", "Make your 3D photo"). Every
   competitor title on all four SERPs is keyword-first. Files:
   `app/layout.tsx` (default title), `app/create/page.tsx`,
   `app/tools/gif/page.tsx`, `app/tools/sticker/page.tsx`, and the H1
   strings in `app/page.tsx`, `CreateWorkshop.tsx`, `GifWorkshop.tsx`,
   `StickerWorkshop.tsx`.
2. **Three pages have ≤51 crawlable words.** All informative copy is gated
   behind `sources.length > 0` or `result`. Pattern fix: (a) move the
   one-paragraph explainer above the uploader in each workshop, (b) add a
   server-rendered static body below the workshop in each `page.tsx`
   (600–1,000 words, `<ol>` steps, H2/H3, FAQ). The homepage needs the
   run-01 ≈2,200-word body.
3. **Homepage copy is ~40% marquee noise** (32× "3D · Made with Gifsy").

**Group B — important**

4. **`/create`, `/tools/gif`, `/tools/sticker` have zero inbound `<a>`
   links site-wide.** Navigation is `router.push()` and `<button>`. Add
   text links in the homepage hero (under the uploader), the footer `<nav>`
   (`app/page.tsx` ~line 696), `SiteNav` (`components/SiteNav.tsx` — the
   "Make one" CTA could become a small menu: 3D / GIF / Sticker), and
   cross-links between the three tool pages. Use the keyword as anchor text.
5. **No H2s on the three tool pages.**

**Group C / D — supporting**

6. **Nested `<main>`** on `/create`, `/tools/gif`, `/tools/sticker`: page
   wrapper `<main>` + workshop `<main>`. Change the workshop roots to
   `<div>`.
7. **No canonical on any page; sub-pages inherit `openGraph.url =
   homepage`.** Add `alternates: { canonical }` and page-level
   `openGraph.url` in each page's `metadata` (Next.js merges shallowly, so
   `openGraph` must be re-declared per page, not just `title`).
   `/tools/gif?mode=combine` needs the canonical most.
8. **Zero JSON-LD site-wide.** Minimum set: `Organization` (root),
   `SoftwareApplication` + `Offer` ($0 / $9 one-time) on all four,
   `HowTo` and `FAQPage` once the sections exist. Ranking-neutral per POP,
   but it is the only route to rich results and to being cited as an entity
   in AI Overviews.
9. **One OG image for every URL.** Add `opengraph-image.tsx` per route (the
   scene pages already do this).
10. **Honesty items that touch Trust scoring**: "your photo is never
    uploaded" (`/create` meta, homepage footer) vs free-plan activation
    upload; countdown discount banner (`OfferBanner`) — state a real end
    date or remove; "embed anywhere" in the H1 vs badge on free embeds.
11. **The best E-E-A-T text on the site is hidden in conditional UI**: the
    pipeline paragraph and ≥640 px note (`CreateWorkshop.tsx`), the Telegram
    100×100 trap (`ImportGuide.tsx`), the "GIFs animate in Telegram, Discord,
    iMessage" note (`GifWorkshop.tsx`). Surface them as static copy.
12. **No author / about anywhere.** Run 01's open question (byline) is still
    open; a single `/about` with a name and the "why browser-local" story
    would serve all four pages.

**Keyword-fit notes for the sibling runs**

- "3D photo maker" literal SERP is 7/9 mesh generators; the homepage must
  carry "interactive" / "parallax" / "depth" / "embed" modifiers to cluster
  with Depth Studio, Upsampler, png3D, Media.io rather than Meshy.
- "sticker maker" literal SERP is 6/8 print; the product matches "photo to
  sticker" / "WhatsApp Telegram sticker maker" (small-site SERP, winnable).
- "photo to GIF" is a high-authority converter SERP; Gifsy's angle is
  "animate a single still with motion presets, in-browser" — lead with it.

## Sources

- https://png3d.com/
- https://openart.ai/features/photo-to-3d/
- https://www.flexclip.com/tools/3d-photo-animation-maker/
- https://wink.ai/photo-to-3d-animation
- https://www.kapwing.com/tools/convert/image-to-gif
- https://www.adobe.com/express/feature/image/convert/gif
- https://www.freeconvert.com/image-to-gif
- https://www.stickerit.co/en-us/tools/online-designer
- https://www.jukeboxprint.com/sticker-maker
- https://www.canva.com/create/stickers/
- https://hammyasf.github.io/depth-studio.html
- https://upsampler.com/free-3d-parallax-generator-no-signup
- https://www.snappy-fix.com/tools/sticker-maker
- https://gifdb.com/tools/image-to-sticker/
- SERP reads: "3D photo maker", "AI 3D photo animation", "photo to GIF",
  "sticker maker", "interactive 3D photo maker online depth parallax",
  "photo to sticker maker online free transparent PNG WhatsApp Telegram"

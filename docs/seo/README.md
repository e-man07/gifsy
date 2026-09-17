# Gifsy SEO — research log

Working notes for the SEO phase (started 2026-09-17). Every research run gets its
own numbered file under `runs/`; this index accumulates the decisions and the
backlog so the implementation phase can work from one place.

Tooling: the `superseo` skills in `.claude/skills/` (page-audit, keyword-deep-dive,
content-brief, write-content, topic-cluster-planning, eeat-audit, …).

## Baseline (2026-09-17)

Site: https://www.gifsy.fun — Next.js 16 App Router, Vercel.

**Already in place:** `app/robots.ts`, `app/sitemap.ts` (9 static URLs),
`metadataBase` + OG/Twitter cards in `app/layout.tsx`, per-page `<title>`s,
generated OG images (site + per-scene), `noindex` on `/embed`, `/account`,
`/scenes`, canonical `/embed/[id]` → `/s/[id]`, single `<h1>` on the landing page.

**Missing:** no structured data at all (no JSON-LD), meta descriptions on most
sub-pages (titles only), no keyword-targeted copy (tool pages titled
"Make a GIF" / "Make a Sticker"), no guides/comparison content, no internal-link
structure beyond the nav, `/s/[id]` scenes deliberately out of the sitemap
(open question), landing copy is positioning-led not search-led.

**Visibility:** Gifsy is not indexed for any relevant query (searched
`gifsy.fun 3D photo` → only GIPHY/Tenor results). The brand name "Gifsy" pulls
SERPs toward GIF sites; 3D pages must carry the keyword in on-page copy.

## Status

**Research phase complete (2026-09-17):** 7 research runs (01–08) + 7 content
briefs (09–15).

**Implementation phase 1 done (2026-09-17)** — trust fixes + technical plumbing,
`next build` clean, rendered output verified:
- `/terms` names the operators (individuals, trading as Gifsy); `/privacy` now
  says R2 + DataFast; policy date bumped; Pro "works offline" claim narrowed;
  expired $5 offer code deleted (`OfferBanner`, `offer.ts`, `use-countdown.ts`).
- `lib/founders.ts` (names + X), `lib/seo/json-ld.tsx` (Organization, Person ×2,
  WebSite, SoftwareApplication+Offers, plus FAQPage/HowTo/Breadcrumb builders),
  `lib/seo/metadata.ts` (`pageMetadata` → canonical + og:url + robots).
- New `components/SiteFooter.tsx` on every page: keyword-anchored links to the
  three tool pages, About, GitHub, Product Hunt, both founders' X. New `/about`.
- Titles adopted on `/`, `/create`, `/tools/gif`, `/tools/sticker`, `/gallery`;
  brand suffix comes from the layout template only. Hero now has real `<a>`
  links to the tool pages. Nested `<main>` fixed in all three workshops.

Partial: the founder paragraph on `/` and the data-flow statement on `/` are
deferred to the homepage rewrite (phase 2); `/about` carries both for now.

**Phase 2 done (2026-09-17)** — server-rendered copy on the three tool pages
(`components/copy/{Gif,Sticker,Create}ToolCopy.tsx`): `/tools/gif` 50→1,362
words, `/tools/sticker` 25→1,360, `/create` 27→1,139; keyword H1s + first-paint
explainers in the workshops; FAQPage (+HowTo on sticker/create) + Breadcrumb
JSON-LD; post-download bridge to `/create` from GIF and sticker. Not done from
the briefs: first-party example GIFs / sticker screenshots (need the founders'
own photos), measured WebP sizes, the competitor-table rows the brief marked
"verify" (Kapwing omitted; ezgif/Imgflip/Canva kept to widely-documented facts).

**Phase 3 done (2026-09-17)** — homepage rewrite per brief 09. `app/page.tsx`
is now a server component (static-prerendered); the nav pill and hero drop
card are client components in `components/home/`. 2,291 crawlable words,
13 H2 / 19 H3, HowTo + FAQPage (10 Qs) schema, new H1 "The interactive 3D photo
maker you can embed on any site.", definition/snippet paragraph, 3-step how-it-
works naming the models + split-model data flow, literal embed snippet, video-
vs-embed table, persona H3s, honest-limits block, data-flow section, plans
prose with refund + MoR, founder paragraph linking both X profiles + /about,
FAQ. Marquee "3D · Made with Gifsy" moved to CSS (was 32× DOM text). Not
done: depth-map + matte screenshots (need a founder-owned photo); links to
/guides/* and /alternatives/* are held back until those routes exist.

**Design pass (2026-09-17)** — user feedback: the first cut read like docs.
Every new section on `/` and under the three tools was rebuilt as a UI element
(step tiles, ✓/✗ cards, comparison grid, fact tiles, native `<details>` FAQ,
founder card) with the copy fitted to the element. Shared blocks live in
`components/copy/blocks.tsx`; the tool pages use only those. Rule going
forward: **design the section first, then write copy to fit it** — never
paste brief prose into `.legal`. Word counts after: `/` 1,985, `/tools/gif`
1,141, `/tools/sticker` 1,216, `/create` 993 — all still with H2/H3
structure and FAQPage/HowTo schema.

**Phase 4 done (2026-09-17)** — article system + first alternatives page.
Layout per the user's reference (metamemory.tech/blog): `lib/articles.ts`
registry, `components/article/ArticleIndex.tsx` (mono date · read time, bold
title, description, mono tag pills, hairline dividers) and
`components/article/ArticleLayout.tsx` (mono breadcrumb + tags, bold H1, dek,
byline with both founders, sticky "On this page" rail; Article + Breadcrumb
JSON-LD). `/alternatives` index, `/alternatives/immersity-ai` (2,580 words,
10 H2, FAQPage, wide scrollable head-to-head table), `/alternatives/leiapix`
308 → it; both in the sitemap. Honesty: page states it compared published
pricing/output/data-handling on 17 Sep 2026 and that the hands-on same-photo
test (criterion 6) is not yet run; CapCut + Motionleap rows flagged as
unverified by tooling.

**Phase 5 done (2026-09-17)** — `/guides` index + four guides on the article
layout: `/guides/3d-photo-webflow` (1,660w, HowTo+FAQ), `/guides/embed-3d-
photo-on-website` (1,750w, HowTo+FAQ, platform-by-platform + troubleshooting
table), `/guides/how-3d-photos-work` (2,400w, FAQ, live embed on the page,
disambiguation table, approved data-flow statement, citations),
`/guides/3d-photo-framer` (870w, HowTo+FAQ). Held-back links swapped in: the
homepage embed tiles now link the three guides, how-it-works links the
explainer, video-vs-embed links the comparison; footer gained a "Learn"
column; `/create` next-links; sitemap has 17 URLs. Not done: the screenshots
each guide brief specifies (need a founder-owned photo); Webflow/Framer/
Squarespace/Carrd plan tiers are worded as "check your plan" because the
tooling could not verify them.

**Next:** the editorial hub `/guides/interactive-3d-photos-for-websites`
(run 06), then Squarespace + WordPress guides, best-photos guide, and the
Telegram sticker guides (brief 15). Then Search Console: request indexing
for every URL in the sitemap.

## Runs

| # | Date | Skill | Input | File |
|---|---|---|---|---|
| 01 | 2026-09-17 | keyword-deep-dive | "3D photo effect" | [runs/01-keyword-3d-photo-effect.md](runs/01-keyword-3d-photo-effect.md) |
| 02 | 2026-09-17 | keyword-deep-dive | "Immersity AI alternative" | [runs/02-keyword-immersity-ai-alternative.md](runs/02-keyword-immersity-ai-alternative.md) |
| 03 | 2026-09-17 | keyword-deep-dive | "photo to GIF" family | [runs/03-keyword-photo-to-gif.md](runs/03-keyword-photo-to-gif.md) |
| 04 | 2026-09-17 | keyword-deep-dive | "sticker maker" family | [runs/04-keyword-sticker-maker.md](runs/04-keyword-sticker-maker.md) |
| 05 | 2026-09-17 | page-audit | `/`, `/create`, `/tools/gif`, `/tools/sticker` | [runs/05-page-audits.md](runs/05-page-audits.md) |
| 07 | 2026-09-17 | eeat-audit | homepage + /pricing /privacy /terms /refund | [runs/07-eeat-audit-homepage.md](runs/07-eeat-audit-homepage.md) |
| 08 | 2026-09-17 | linkbuilding | phase classification + plan | [runs/08-linkbuilding-phase-plan.md](runs/08-linkbuilding-phase-plan.md) |
| 06 | 2026-09-17 | topic-cluster-planning | "interactive 3D photos for websites" | [runs/06-topic-cluster-3d-photos-for-websites.md](runs/06-topic-cluster-3d-photos-for-websites.md) |

### Content briefs (wave 2)

| # | Page | Primary keyword | File |
|---|---|---|---|
| 09 | `/` | 3D photo maker (+interactive/depth/embed) | [runs/09-brief-homepage.md](runs/09-brief-homepage.md) |
| 10 | `/alternatives/immersity-ai` | Immersity AI alternative | [runs/10-brief-alternatives-immersity-ai.md](runs/10-brief-alternatives-immersity-ai.md) |
| 11 | `/guides/3d-photo-webflow` | interactive image webflow | [runs/11-brief-guide-3d-photo-webflow.md](runs/11-brief-guide-3d-photo-webflow.md) |
| 12 | `/guides/embed-3d-photo-on-website` | embed 3D photo on website | [runs/12-brief-guide-embed-3d-photo-on-website.md](runs/12-brief-guide-embed-3d-photo-on-website.md) |
| 15 | `/tools/sticker` (+ 2 Telegram guide outlines) | telegram sticker maker | [runs/15-brief-tools-sticker.md](runs/15-brief-tools-sticker.md) |
| 13 | `/guides/how-3d-photos-work` | how do 3D photos work | [runs/13-brief-guide-how-3d-photos-work.md](runs/13-brief-guide-how-3d-photos-work.md) |
| 14 | `/tools/gif` (+ boomerang/effect sub-pages template) | animate a photo into a GIF | [runs/14-brief-tools-gif.md](runs/14-brief-tools-gif.md) |

Shared honesty constraints every brief follows: [runs/_brief-context.md](runs/_brief-context.md).

## Decisions so far

- **Do not target "3D photo effect" literally** — fragmented SERP (Photoshop
  tutorial, Instagram reel, app stores, After Effects). Intent mismatch, not
  difficulty. (run 01)
- **Never target "turn photo into 3D" / "image to 3D"** — that SERP is 3D mesh
  generators (Meshy, Tripo). Wrong product, already ruled out in GTM. (run 01)
- **Primary head term for `/`:** "3D photo maker" (+ "interactive 3D photo").
  Secondary: "3D photo animation", "3D parallax photo". (run 01)
- **Fastest wins are two uncontested long-tails that match the ICP exactly:**
  "Immersity AI alternative / LeiaPix alternative" (comparison page) and
  "embed 3D photo on website / interactive image Webflow" (guides). (run 01)
- **Positioning lever nobody on the SERP uses:** interactive embed, not a video
  export. (run 01) **Correction (run 02):** Immersity has NOT left — "Immersity
  for Web" is still sold at immersity.ai/pricing (Free = watermark/720p/
  non-commercial; $4.99–$99.99/mo credits; à-la-carte gone); only the homepage
  now sells displays. No Immersity plan offers an embed. Say this honestly.
- **"Immersity AI alternative" page:** commercial-investigation intent (ex-LeiaPix
  users hitting the watermark/credit wall). Positions 1–4 are off-target
  directories (G2, SourceForge); real competition is small-vendor listicles
  (1.2k–3.2k words). Format = listicle + head-to-head table led by an
  output-type taxonomy (interactive embed / video export / 3D mesh) + a
  Gifsy-vs-Immersity block. ~2,300–2,500 words, 8 tools tested on the same
  photo, 8-Q FAQ incl. "Is the LeiaPix converter still free?", 40–60-word
  direct answer under the H1. **Slug: `/alternatives/immersity-ai`** (LeiaPix
  redirects to it) — this sets the convention: `/alternatives/<tool>`. (run 02)

- **GIF head terms are authority-locked** ("photo to GIF", "GIF maker online",
  "make a GIF from photos" → Cloudinary, Kapwing, Canva, Adobe, Imgflip, ezgif).
  **Primary for `/tools/gif` = "animate a photo into a GIF"** (Moderate: a
  Cutout.pro blog, ezgif static-to-gif ~800w, 3dgifmaker, small tools). Head
  terms become secondary phrases in copy only. "No upload / no watermark / no
  signup" is commoditised by micro-tool sites — a trust modifier for titles/FAQ,
  not a head keyword, but a real contrast vs ezgif (server upload), Canva/
  Kapwing/Adobe (account to export), Imgflip (watermark). Real single-photo
  competitor = 3dgifmaker.com (70+ effects, in-browser). (run 03)
- **GIF gaps Gifsy wins:** (a) boomerang GIF from still photos — every boomerang
  tool needs a GIF/video input (Easy); (b) per-effect pages zoom/bounce/shake/
  pulse/spin/glitch (Easy; only 3dgifmaker + Imgflip do this); (c) single-photo
  effects + multi-photo sequencing on one page — nobody else has both. (run 03)
- **Do not target "sticker maker" literally** — page 1 is print shops + Amazon
  cutting machines (StickerYou, Jukebox, Canva Print). **Primary for
  `/tools/sticker` = "telegram sticker maker"** (Moderate; only one real web
  tool ranks — LightX, ~1,100w, server-side, no 512 handling). Secondary:
  "online sticker maker from photo" / "photo to sticker". Winning long-tails:
  "telegram sticker 512x512 webp", "sticker maker no upload / in browser",
  "photo to sticker white outline". Nobody combines AI cutout + no-upload +
  outline/shadow + 512×512 ≤512 KB WebP + @Stickers walkthrough; Gifsy already
  does all of it. State plainly that WhatsApp packs are NOT supported. (run 04)
- **Rendering problem, site-wide risk:** `/tools/sticker` shows crawlers ~25
  words — the 512 note and the whole @Stickers guide are client-rendered only
  after a photo is processed. Expect the same on `/tools/gif` and `/create`.
  Fix = server-rendered copy below the tool on every tool page. (run 04)

- **3D content cluster:** 1 hub + 14 spokes (~26k words), Easy–Moderate. The
  seed SERP splits across three meanings of "3D photo" (360° spins, GLB mesh
  viewers, depth-parallax) and nobody answers "one photo → interactive embed";
  every Webflow/Framer/WordPress result needs designer-cut Photoshop layers.
  Hub = `/guides/interactive-3d-photos-for-websites` (3,000–3,500w, pillar +
  chapters, FAQPage). `/guides` = light index page. Ship 3 spokes first, then
  hub + explainer, then scale (solo operator, <50 indexed pages). (run 06)
- **URL conventions (settled 2026-09-17, reconciling runs 02 + 06):**
  `/guides/<slug>` for how-tos, explainers, use-case pages;
  `/alternatives/<tool>` for "X alternatives" listicles (the SERP format for
  that intent — run 02); `/compare/<slug>` only for head-to-head or roundup
  comparisons (e.g. `/compare/3d-photo-makers`). So run 06's
  `/compare/immersity-ai-alternative` → **`/alternatives/immersity-ai`**.
- **Cluster publishing order (run 06):** 1 `/alternatives/immersity-ai` →
  2 `/guides/3d-photo-webflow` ("interactive image webflow", 1,600w) →
  3 `/guides/embed-3d-photo-on-website` ("embed 3d photo on website", iframe
  reference, 1,800w; absorbs Wix/Carrd/Notion/Shopify + iframe performance) →
  4 `/guides/how-3d-photos-work` (2,200w explainer) → 5 `/guides/3d-photo-framer`
  ("framer 3d image", 1,500w). Hub ships month 2 with #4/#5; month 3 =
  Squarespace, WordPress, best-photos, video-vs-interactive; month 4 = hero-image
  + portfolio use-case pages, `/compare/3d-photo-makers`; last = privacy-in-
  browser (waits on honesty check) and Facebook-3D-photo-alternative.
- **Linking rule:** every spoke's first hub link is in-body within the first
  40% with a keyword anchor; spokes 3 (embed reference) and 6 (best photos) are
  the connective centre; `/`, `/create`, `/pricing`, `/gallery` need body links
  into the cluster on hub launch day so it isn't orphaned. (run 06)

- **Page audits:** `/` 31/70, `/create` 23/70, `/tools/gif` 23/70,
  `/tools/sticker` 23/70. The three tool pages have **zero inbound `<a href>`
  links anywhere on the site** (homepage hands files over with `router.push()`,
  mode buttons are `<button>`s) — they exist for Google via the sitemap only.
  Tool pages server-render 26–51 words and no H2s; ~40% of the homepage's
  crawlable text is 32× "3D · Made with Gifsy" marquee noise. No canonical
  anywhere; sub-pages inherit `openGraph.url = homepage`; `/tools/gif?mode=
  combine` is an uncanonicalised duplicate; nested `<main>` on all tool pages.
  After a GIF/sticker download there is no cross-link to `/create` — the free
  tools don't feed the paid wedge. (run 05)
- **Homepage keyword caveat:** the literal "3D photo maker" SERP is 7/9 mesh
  generators (Meshy, Sloyd, 3D AI Studio). The page must carry "interactive /
  parallax / depth / embed" modifiers to cluster with Depth Studio, Upsampler,
  png3D, Media.io instead. (run 05)
- **Reconciliations (2026-09-17):** run 05's sticker title mentioning WhatsApp
  is rejected (product is Telegram-only — run 04); run 03's GIF title stands
  over run 05's "Photo to GIF Maker" lead (head term is authority-locked);
  run 05's homepage title is adopted over run 01's two options.
- **E-E-A-T = 16/40** (Experience 3, Expertise 5, Authoritativeness 2, Trust 6).
  Product proves itself (live embeds, gallery) but there's zero first-person
  voice, no founder name anywhere on the site, no /about (404), no JSON-LD,
  contact email on another domain, no legal entity named. /privacy's split-
  model paragraph is the most expert text on the site — the homepage explains
  nothing. (run 07)

- **Link phase = Foundation, early.** Domain not in Google's index, no
  knowledge panel, no social/GitHub links in the footer, PH page at 4 upvotes,
  GitHub 0 stars + all-rights-reserved. **"Gifsy" is contested by two unrelated
  older apps** → entity disambiguation (JSON-LD `sameAs`, consistent NAP)
  matters more than usual. Velocity guardrail: 15–25 RDs month 1 (entity +
  directories) → 5–10 m2–3 → 8–15 m4–6 → 10–20 m7+. (run 08)
- **The "Made with Gifsy" badge passes zero link equity today** — it's an `<a>`
  rendered *inside* the iframe (`components/SceneViewer.tsx:380-389`) on the
  noindexed `/embed/[id]`; the copied snippet is a bare `<iframe>`. Decision:
  ship an OPTIONAL host-page credit line (`<p><a href="https://www.gifsy.fun/?ref=embed" rel="nofollow">Made with Gifsy</a></p>`),
  nofollow by default, host-editable, branded anchor only. A forced followed/
  keyword link is the widget-link pattern Google penalises. (run 08)
- **Red flags for this domain:** forced widget links, 50+ links in month 1, paid
  directory tiers (Futurepedia), competitor link swaps, exact-match anchors in
  the first 6 months, Wikidata now, PR wires under a colliding name,
  skyscraper/guest posts before month 4, all links to the homepage. (run 08)

## Backlog (to implement after research)

**Trust / accuracy fixes (do these first — some are factual errors live today)**
- [x] `/privacy` is wrong since this week: still says Vercel Blob stores scene
      files (→ Cloudflare R2 since 09-16) and lists only Vercel Analytics
      (DataFast added 09-17); "Last updated 9 September" predates both. Fix the
      text and bump `POLICY_LAST_UPDATED`. (run 07)
- [x] Over-claims to rewrite: "Runs fully on your device — works offline"
      (publishing hits the inpaint server + upload; matte model fetched from
      CDN) → "3D depth runs fully on your device (offline after first
      download)"; drop the "Most popular" badge (two tiers); make "Real scenes
      published by Gifsy users" checkable or soften; reconcile "two halves"
      (/privacy) vs "last 10% of the model" (README); remove the expired $5
      launch-offer code so the page can never show a price Dodo doesn't
      charge. (run 07)
- [x] State the data flow on `/` in the same words as `/privacy`: photo stays
      in the browser; Free sends depth-model activations (not the photo) for
      one step; Pro fully local; publishing uploads the finished scene and it
      is public. Name the legal operator in `/terms`. (run 07)
- [x] Founder paragraph on `/` in first person with a real number (44 MB
      encoder, the Blob-firewall marquee incident) + GitHub link; minimal
      `/about` naming the founder, linked from every footer; a Contact link
      outside the legal pages; a gifsy.fun-domain email. (run 07)
- [x] `Organization` + `Person` + `SoftwareApplication` JSON-LD in
      `app/layout.tsx` with `sameAs` → github.com/e-man07/gifsy, the Product
      Hunt listing, the founder's X profile (template in run 07). (run 07)

**Pages**

- [x] Inbound links to the tool pages: hero line + `SiteFooter` on every page;
      post-download cross-link from GIF/sticker → `/create` (run 05)
- [x] Surface the hidden E-E-A-T copy as static text: the depth-model/
      segmentation/60fps paragraph + ≥640px note (`CreateWorkshop.tsx`), the
      Telegram 100×100 emoji-pack trap (`ImportGuide.tsx`), the chat-app note
      (`GifWorkshop.tsx`) (run 05)
- [x] Tool-page pattern: one-paragraph explainer ABOVE the uploader (first
      paint) + server-rendered body below each workshop in `page.tsx` (run 05)
- [x] `/` — rewrite to ~2,200 words around "3D photo maker"; add 3-step how-to,
      use cases, 8–10 Q FAQ, "video vs interactive embed" table, "how it works",
      "what photos work best" (honest limits)
- [x] `/create` — real copy + FAQ around "AI 3D photo animation"
- [x] `/tools/gif` — ~1,400 words server-rendered under the tool: both modes,
      3-step how-to, six presets with first-party example GIFs, verifiable
      privacy section, comparison table vs ezgif/Imgflip/Canva/Kapwing, which
      photos animate well, FAQ ×8, "make it move in real 3D" bridge to `/`.
      Current crawlable copy ≈ 50 words of UI labels. (run 03)
- [ ] new routes: `/tools/gif/boomerang`, `/tools/gif/[effect]` ×6 (same
      component, preset pre-selected), a dedicated combine-mode route ("photo
      slideshow GIF maker"); guides "how to animate a photo into a GIF" and
      "GIF size limits for Slack/Discord/GitHub/email" (run 03)
- [x] `/tools/sticker` — ~1,800–2,200 words **server-rendered** below the tool:
      3-step how-to, @Stickers bot flow (incl. the "exactly 100×100" emoji-pack
      trap), Telegram spec section (512 px, PNG vs WebP, ≤512 KB, send-as-file;
      cite core.telegram.org's "white stroke + black shadow"), no-upload/privacy,
      honest limits, 8–10 Q FAQ, explicit "no WhatsApp"; H1 "Telegram sticker
      maker — turn a photo into a sticker in your browser" (run 04)
- [ ] new guides `/guides/telegram-sticker-pack-from-browser` (~1,500w, HowTo)
      and `/guides/telegram-sticker-size` (~900w, table snippet) (run 04, brief 15)
- [ ] sticker copy nuance: the 512 KB cap is no longer on core.telegram.org's
      public spec (only TGS 64 KB / WEBM 256 KB) — it's enforced by the
      @Stickers bot; attribute it to the bot and screenshot the rejection.
      Citation for "white stroke + black shadow":
      https://core.telegram.org/stickers#static-stickers-and-emoji (brief 15)
- [x] new `/alternatives/immersity-ai` — listicle + comparison table (run 02);
      `/alternatives/leiapix` 308s to it. STILL NEEDED: same-photo test assets
      for 8 tools (criterion 6 marked "not yet scored" on the page), dated
      Immersity pricing screenshots, quarterly re-check (next Dec 2026)
- [ ] later spokes: `/alternatives/media-io-3d-image-maker`, `/alternatives/depthy` (run 02)
- [ ] explainer assets from eng (brief 13): a raw-depth dump + refined-depth
      crop, a backdrop-bearing demo scene for the push-pull-vs-LaMa screenshot,
      an orbit-extreme capture, an exploded-plane SVG
- [~] `/guides` index + hub `/guides/interactive-3d-photos-for-websites` (run 06)
- [~] spokes per run 06 order: `/guides/3d-photo-webflow`,
      `/guides/embed-3d-photo-on-website`, `/guides/how-3d-photos-work`,
      `/guides/3d-photo-framer`, then Squarespace/WordPress/best-photos/
      video-vs-interactive, use-case pages, `/compare/3d-photo-makers`
- [ ] verify Webflow/Squarespace paid-plan requirements for custom code/embeds
      before publishing platform spokes (run 06)

**Link building (run 08 — in order)**
- [x] Entity stacking: footer links to GitHub / Product Hunt / X; GitHub repo
      cleanup (website field, topics, a licence decision); complete the PH
      profile; Organization/SoftwareApplication JSON-LD with `sameAs`
- [ ] Curated directories only: Toolify, There's An AI For That, Uneed,
      DevHunt, Fazier, TinyLaunch, Smol Launch, AlternativeTo (listed as an
      Immersity/LeiaPix/Depthy alternative), SourceForge Immersity-AI
      alternatives, AIxploria, topai.tools. Skip paid Futurepedia + mass lists.
- [ ] After `/alternatives/immersity-ai` exists: niche-edit pitches to the
      Animagen listicle (3dpicmaker.com), leaveit2ai, vidau.ai, and
      sygnal.com/kb/image-25d-parallax-effects (Webflow-agency KB — best find)
- [ ] Webflow/Framer surfaces (need `/guides/3d-photo-webflow` + `-framer` as
      docs URLs first): "3D Photo Hero" cloneable on Made in Webflow, FlowRadar
      "Add resource", Flowfav/Memberstack roundups, Framer Community Gallery +
      Marketplace component; later a Webflow Marketplace app
- [ ] Linkable assets: the how-it-works explainer with first-party pipeline
      screenshots + inline live demo; indexable curated `/demo/*` scenes; a
      "Made with Gifsy" showcase in `/gallery`; consider open-sourcing the
      viewer to unlock awesome-lists
- [ ] Badge: add the optional nofollow credit line to the copied embed snippet
      (`components/CreateWorkshop.tsx` / `app/s/[id]/scene-client.tsx`)
- [ ] Show HN once the explainer exists

**Product gaps surfaced by the briefs (small code changes)**
- [ ] embed snippet lacks a `title` attribute (a11y + how-to guides quote it) —
      `components/CreateWorkshop.tsx:605`, `app/s/[id]/scene-client.tsx:30` (brief 11)
- [ ] `SceneViewer` has no `prefers-reduced-motion` handling — guides must say
      so honestly until it's added; brief 12 recommends shipping it BEFORE the
      embed guide (brief 11, 12)
- [ ] Combine mode has no boomerang — `/tools/gif/boomerang` must be
      single-photo unless a small `withBoomerang` change ships first (brief 14)
- [ ] capture first-party example GIFs: `public/tools/gif/example-<effect>.gif`
      (same owned photo, 20 fps, boomerang on) + boomerang-off + combine (brief 14)
- [x] title template: `app/layout.tsx` uses `%s · Gifsy` — page titles that
      already end in "| Gifsy" will double the brand; pick one (brief 14)
- [ ] decide + document framing policy: today no X-Frame-Options /
      frame-ancestors anywhere, so any origin may frame `/embed/[id]` (that's
      the product) — but `/`, `/create`, `/account` etc. are also frameable;
      consider `frame-ancestors 'self'` everywhere except `/embed/*` (brief 12)

**Technical**
- [x] JSON-LD: `Organization`, `SoftwareApplication` (+ `Offer`), `FAQPage` on
      pages with FAQs, `HowTo` on guides, `BreadcrumbList` on nested routes,
      `ItemList` on alternatives pages — build a shared helper (run 02)
- [x] meta `description` on every indexable route
- [ ] title for `/alternatives/immersity-ai`: A (59) "Immersity AI Alternatives (2026): 8 Tools Tested & Compared" / B (60) "LeiaPix / Immersity AI Alternatives: Interactive, Not Just Video"; meta leads with the watermark change (run 02)
- [x] title for `/tools/gif`: A (57, recommended) "Animate a Photo Into a GIF — Free, No Upload | Gifsy" / B (59) "Photo to GIF Maker: Zoom, Shake, Glitch, Boomerang | Gifsy" (run 03)
- [x] title for `/tools/sticker`: A (57) "Telegram Sticker Maker — Photo to 512px Sticker, Free | Gifsy" / B (58) "Free Online Sticker Maker: Photo to Telegram Sticker | Gifsy" (run 04)
- [x] title for `/` (adopted, run 05): "3D Photo Maker — Interactive Depth, Embed Anywhere | Gifsy" (58)
- [x] title for `/create` (run 05): "AI 3D Photo Animation — Free, Runs in Your Browser · Gifsy" (58); matching H1s in each workshop component
- [x] `alternates.canonical` + per-page `openGraph.url` in every page's
      metadata; canonicalise `/tools/gif?mode=combine`; per-route
      `opengraph-image.tsx` for tool pages (run 05)
- [x] fix nested `<main>` on tool pages — workshop roots → `<div>` (run 05)
- [x] `OfferBanner` countdown: state a real end date or remove (reads as
      fabricated urgency; offer expired 09-12) (run 05, run 07)
- [ ] add new routes to `app/sitemap.ts` (all guides/alternatives/compare URLs)
- [ ] static App Router routes + `generateMetadata` for guides; a shared
      article layout with byline, updated date, breadcrumbs (run 06)
- [ ] internal links: tool pages → guides → comparison → pricing; nothing
      currently links to `/tools/sticker` at all (run 04)
- [ ] real screenshots: before/after sticker, @Stickers chat (run 04)
- [ ] request indexing in Google Search Console after each rewrite — site is
      currently not indexed at all (run 03)
- [ ] decide: index `/s/[id]` scenes or not (UGC; currently excluded)
- [ ] honesty check on privacy claims (photo stays local; free plan uploads
      activations — see commit 4d830d0)

## Manual checks the tooling couldn't do

- Brief 12: measure real embed asset sizes in DevTools before publishing any
  performance numbers; test Notion (via Iframely) + Shopify Custom Liquid
  embeds; verify Carrd Embed tier and Squarespace's current plan list
  (Core/Plus/Advanced/Business/Commerce, not "Business+"); confirm which
  analytics scripts fire inside `/embed/[id]` and disclose them.
- Brief 11: Webflow plan gate for the Embed element — help.webflow.com and
  webflow.com/pricing both 403'd; needs a dated citation before publish.
- Brief 10 contradictions to resolve in a browser before writing: CapCut
  (capcut.com returns HTTP 451 to fetches; the 3D Zoom template may watermark)
  and Motionleap (a 2026 review says "sunset" but Google Play shows v1.9.38 on
  2026-08-02 — don't write "discontinued"). Animagen pricing re-verified
  2026-09-17: free = 2 watermarked, $9.99/12, $39.99/80 (supersedes run 02).

- PAA boxes, featured-snippet holder and AI Overview presence for every keyword
  (open the SERPs in a browser). G2 and TopAI.tools returned 403 to fetches.

## Decisions from the user

- **Byline / authorship (2026-09-17):** publish both founders by name.
  - **Aman Jha** — founder · https://x.com/WhyParabola
  - **Priyanshu Tiwari** — co-founder · https://x.com/priyanshudotsol
  Use as: `Person` nodes in the JSON-LD `@graph` (linked from `Organization`
  via `founder`), byline on every guide/alternatives page ("By Aman Jha and
  Priyanshu Tiwari" or one primary author + reviewer), the founder paragraph
  on `/`, and the `/about` page. `sameAs` on each Person = their X profile;
  Organization `sameAs` = GitHub repo, Product Hunt, both X profiles.
  Spelling of "Aman Jha" taken from the PH listing — confirm before shipping.

- **Legal operator (2026-09-17):** no company yet. `/terms` (and privacy/
  refund where they name the operator) say the service is operated by
  **Aman Jha and Priyanshu Tiwari** as individuals, trading as Gifsy. Dodo
  Payments remains Merchant of Record for purchases. Contact email stays as
  is until a gifsy.fun mailbox exists.
- **Title template (2026-09-17, default taken):** keep `%s · Gifsy` in
  `app/layout.tsx`; page titles must NOT include the brand.

## Open questions for the user

- A gifsy.fun-domain contact email (none yet).
- Whether to index published scenes (`/s/[id]`).

# Run 11 — content-brief: `/guides/3d-photo-webflow`

Date: 2026-09-17 · Skill: `content-brief` (how-to template) · Cluster spoke #2 from
run 06 · Site: gifsy.fun (Next.js 16 App Router).

Primary keyword: **interactive image webflow**
Secondary: **webflow 3d image**, **webflow parallax image**, **add 3d photo to webflow**
Content type: **how-to** (HowTo + FAQPage + BreadcrumbList) · Target: ~1,600 words
Author: TBD (see README open question) · Effort: Medium (6–10 h incl. screenshots)

Read `_brief-context.md` first. Every honesty constraint in it applies here.

---

## 1. Target keyword analysis

| | |
|---|---|
| Primary | interactive image webflow |
| Apparent difficulty | **Easy–Moderate.** Page 1 is Webflow's own forum (2015–2023 threads), two Made-in-Webflow cloneables, a Webflow blog post on hover effects, and two hotspot-widget vendors (Interactivity Studio, Common Ninja). No page answers "one photo → depth/parallax you can drag". Webflow.com itself ranks with 3 URLs, but on generic/adjacent intent. |
| Dominant intent | **Informational → how-to** with a commercial tail (people want a way to *do* it and will use a tool). |
| Strategy | 3–6 months. Win by being the only result that matches the literal query (an image that is *interactive*, not a scroll/hover trick) and by shipping exact Designer steps with real screenshots. |
| Realistic 3-month position | Top 20 for the primary; impressions for the three secondaries. Top 10 by month 6 if the hub (run 06) is live and linking down. |

**Secondary SERPs (read 2026-09-17):**
- "webflow 3d image" → Webflow's *2.5D effect* University lesson, a "3D Images Slider" cloneable, Webflow's "3D websites" blog (Spline/three.js), IconScout 3D illustrations, a "How to Add 3D Models in Webflow" YouTube. Split between CSS 3D transforms and GLB models. **Nobody covers depth photos.**
- "webflow parallax image" (+ mouse move) → Webflow Help "Parallax movement on scroll", the *parallax-hero-section* cloneable (Activator Studios, 96 clones — "layers of images … 3D parallax effect based on mouse movement"), redpanther.io "Parallax Hover Effect" (~800w, needs Photoshop/GIMP PNG layers), asknocode.com (404 now), forum threads from 2015 ("Parallax background move on mouse move") and 2023 ("Display a photo by moving the mouse over it"). Every answer = cut your own alpha-PNG layers, wire Interactions.
- "add 3d photo to webflow" → BRIX Agency "How to embed 3D models in Webflow" (~2,100w: Google model-viewer / Spline $24–30/mo / Vectary $24–29/mo), Webflow 2.5D lesson, Sirv 360 spins, Wikipedia "Facebook 3D Posts". Mesh-viewer intent leaks in; our page must say "photo, not model" in the first 100 words to avoid clustering with them.

**Related terms to carry on-page** (from competitor H2s and the SERP): Embed element / Code Embed, custom code, Interactions, mouse move over element, parallax, 2.5D, depth, hero section, iframe, responsive, aspect ratio, lazy loading, Site plan, cloneable, Spline (as the contrast, once).

**Core entities that must appear:** Webflow Designer, Embed (Code Embed) element, Webflow Interactions, `<iframe>`, `loading="lazy"`, `aspect-ratio`, Site plan, depth map / 2.5D parallax, Gifsy.

---

## 2. SERP competitive intelligence (top results across the 4 queries)

| # | URL | ~Words | Format | Covers | Misses |
|---|---|---|---|---|---|
| 1 | discourse.webflow.com/t/interactive-images-is-it-possible/6966 (+ /creating-interactive-images/30251, /display-a-photo-by-moving-the-mouse-over-it-parallax/171377) | 300–900 per thread | Forum Q&A | Hotspots, hover reveals, layered PNG parallax via Interactions | Steps are scattered across replies, no screenshots of the current Designer, no single-photo path. Threads now 301 to community.webflow.com/ask-answer — cite carefully. |
| 2 | webflow.com/made-in-webflow/website/parallax-hero-section (and /image-interaction, /3d-images-slider) | 50–150 | Cloneable | Working demo, clone button | Zero instructions; you inherit someone's layered PNGs; can't swap in your own photo without re-cutting layers. |
| 3 | webflow.com/blog/image-hover-effect | ~1,500 | Tutorial listicle | 5 hover effects with Interactions | Hover, not depth; no embed path; no performance or a11y notes. |
| 4 | webflow.com/apps/detail/interactivity-studio · commoninja.com/widgets/image-hotspot/webflow | 400–800 | Vendor landing | Hotspot/clickable-region widgets, "paste code in Embed element" | "Interactive" = clickable pins. Domain whitelisting required. Not 3D. |
| 5 | university.webflow.com/lesson/2d-objects-in-3d-space ("2.5D effect") | ~600 + video | Official lesson | Layer 2D images in 3D space with transforms/perspective | Assumes you already have separated layers; static unless you add Interactions. |
| 6 | redpanther.io/blog/parallax-hover-webflow | ~800 | How-to | Create PNG layers (Photoshop/GIMP) → absolute-position at 120vw/110vh → Interactions "Mouse move over element" → Mouse X/Y actions | No mobile, no reduced motion, no responsive sizing; 3 layers = 3 exports per photo. |
| 7 | brixagency.com/blog/how-to-embed-3d-models-in-webflow | ~2,100 | How-to (3 methods) | Google model-viewer, Spline, Vectary; prices | 3D *models* only; no load-time/optimisation, no SEO, no browser notes. |
| 8 | flowradar.com/answer/how-can-i-make-my-iframe-embed-responsive-in-webflow | ~850 | Q&A | The padding-top 56.25% wrapper trick, remove width/height attrs, add `loading="lazy"` + `title` | Generic; predates `aspect-ratio`. Good to cite and improve on. |
| 9 | help.webflow.com …/33961332238611-Custom-code-embed (403 to fetch; SERP snippet) | ~700 | Help doc | "If you have a Core, Growth, Agency, or Freelancer Workspace, or if your site has an active Site plan, you can use the Code Embed element"; 50,000-char limit; HTML/CSS/JS only | Nothing about iframes specifically. **This is the plan-gate source — see VERIFY.** |

Top-5 average ≈ 900 words (forum threads and cloneables drag it down); how-to template says 1,500–3,000. **1,600 is right** — enough to hold steps + screenshots + FAQ, no padding.

SERP features: no featured snippet observed for the primary (tooling can't confirm PAA/AI Overview — manual check in a browser before publish, as README notes). The "how to make an iframe responsive in webflow" sub-query has a list-style snippet opportunity (FlowRadar holds it loosely).

---

## 3. Content gap analysis (what nobody on page 1 has)

1. **A single-photo path.** Every parallax/2.5D result requires designer-cut alpha PNG layers (redpanther: "PNGs with an alpha channel"; cloneables ship fixed layers). The gap: upload one JPEG, get depth + subject matte + inpainted backdrop automatically, paste one iframe.
2. **Drag-to-orbit interactivity, not just mouse-tilt.** Webflow Interactions can only move layers on Mouse X/Y; none of the results let a visitor *grab* the image or work on touch. State the honest orbit cone (≈ ±23°, not 360°).
3. **Exact, current Embed-element steps with screenshots.** Forum replies reference old panel names; the Help doc is generic. Show *Add panel (⌘/Ctrl+E or "+") → Components → Embed*, the code modal, the "Save & Close" button, the placeholder the Designer shows for iframes, and where the Style panel settings go.
4. **Responsive sizing done the modern way.** FlowRadar teaches padding-top 56.25%. Offer both: the padding hack for legacy, and CSS `aspect-ratio` on the Embed element via the Style panel (Size → Aspect ratio field exists in the Designer — VERIFY the exact label on the current build and screenshot it).
5. **The plan gate, stated plainly.** No how-to says up front whether the free plan can publish an Embed. Ours does, with a dated citation.
6. **Hero placement.** Nobody explains how an iframe sits *behind* hero copy in Webflow (position absolute inside a relative hero Section, z-index, `pointer-events` on the text layer so drag still reaches the iframe).
7. **Performance + reduced motion.** No result mentions `loading="lazy"`, what bytes an embed actually loads, or `prefers-reduced-motion`. web.dev's numbers (YouTube embed ≈ 500 KB initial; lazy iframes → 2–3 % median data savings) give the writer a citable baseline.
8. **Contrast with the "official" ways honestly.** Webflow 2.5D lesson, Interactions mouse-move, Spline ($24–30/mo, 3D models) — say when each is the *better* pick (Spline for actual 3D objects; Interactions if you already have cut layers and want zero third-party code).

---

## 4. Recommended outline

**H1:** `How to add an interactive 3D photo to Webflow (one photo, no layers)`
Primary keyword variant appears in H1 ("interactive … photo … Webflow"), verbatim "interactive image" in the first 100 words and in two H2s.

**Intro (≤120 words).** Name the pain: every "interactive image Webflow" tutorial wants Photoshop-cut PNG layers and an Interactions rig. This guide does it from one photo, in ~10 minutes, with Webflow's Embed element. Say "photo, not a 3D model" (keeps us out of the Spline/model-viewer cluster). **Hub link goes here or in the Quick answer — must be within the first ~40 % (≈ first 640 words):** `…the wider [guide to interactive 3D photos for websites](/guides/interactive-3d-photos-for-websites)…` (anchor per run 06, spoke 2 row).

**H2: Quick answer — the 5 steps** ← **FEATURED SNIPPET TARGET** (ordered list, 5 items, ≤ 60 words total, immediately under the H2)
1. Make the 3D photo at gifsy.fun/create and click *Publish*.
2. Copy the embed snippet.
3. In Webflow: Add panel → Components → **Embed**, paste, *Save & Close*.
4. Set the Embed's width to 100 % and an aspect ratio (Style panel).
5. Publish; check on mobile.

**H2: What you need (prerequisites)**
- A Webflow site with a **Site plan (Basic or higher) or a paid Workspace** — see the plan callout below. On the free Starter plan the Embed element still works in the Designer and on the `.webflow.io` staging URL [VERIFY], but not on a custom domain.
- A photo ≥ 640 px on the short side, clear subject 1–3 m in front of a receding background (link → `/guides/best-photos-for-3d-effect` "which photos produce the best depth" — it's spoke 6, not yet live; writer leaves the link in and implementation stubs the route or drops it at publish).
- A published Gifsy scene (Free = 3 generations lifetime, badge on; Pro = $9 one-time, no badge, commercial use — one sentence, no sales pitch).

> **Plan callout (boxed, dated).** "Checked on webflow.com/pricing and Webflow Help *Custom code embed* on 17 Sep 2026: the Embed element is available if your Workspace is Core/Growth/Agency/Freelancer **or** the site has an active Site plan (Basic, CMS, Business). On a free Starter site you can add the Embed in the Designer and test on `yoursite.webflow.io`; publishing to a custom domain needs a paid Site plan." — **VERIFY before publish, see §9.**

**H2: Step 1 — Make the 3D photo and copy the embed code** (H3s = sub-steps, one action each)
- Upload at `/create`, pick a preset (Orbit for drag-to-spin; the "mouse" presets follow the cursor), adjust depth strength, *Publish*.
- Show the real snippet the product copies (from `components/CreateWorkshop.tsx:605` / `app/s/[id]/scene-client.tsx:30`):

```html
<iframe src="https://www.gifsy.fun/embed/YOUR_SCENE_ID" style="width:100%;height:500px;border:0" loading="lazy"></iframe>
```

- Explain the three attributes in one line each: `src` (the `/embed/<id>` page is a bare canvas, no chrome), inline `style` (100 % wide, fixed 500 px — we'll replace the fixed height in step 3), `loading="lazy"` (defer until scrolled near; **remove it for a hero**).
- Recommend the writer add `title="Interactive 3D photo of …"` for accessibility (not in the copied snippet today — say so; don't pretend the product emits it).

**H2: Step 2 — Add an Embed element in the Webflow Designer** (screenshots)
- Open the page → Add panel (**+** top-left or ⌘/Ctrl+E) → scroll to **Components** → drag **Embed** onto the canvas (into the Section/Container you want).
- The **Edit Code** modal opens (also via the ⚙ settings icon on the element). Paste the iframe. Click **Save & Close**.
- The Designer shows a grey "Custom code" placeholder / or renders the iframe [VERIFY which the current Designer does for iframes; Flowout says HTML renders live, JS doesn't]. Either way, the real thing appears on publish.
- Side-note H3: **Embed element vs Page/Site custom code.** Use the *element* for a scene in the page flow. *Page settings → Custom code → Before </body>* is for scripts, not for placing an iframe (it'd have no layout position). Never paste this into Site settings custom code.
- 50,000-character limit is irrelevant here (snippet is ~120 chars) — one line.

**H2: Step 3 — Make it responsive (aspect ratio, not fixed height)**
- Delete `height:500px` from the snippet, or leave it and override: select the Embed element → Style panel → **Size**: Width 100 %, and set the **aspect ratio** (VERIFY the field label; if absent on the build, use the padding-top wrapper).
- Option A (modern): wrapper Div Block `position: relative; aspect-ratio: 4 / 3;` (match the photo — portrait scenes 3 / 4, hero 16 / 9), Embed inside with `position:absolute; inset:0`, iframe `width:100%;height:100%`.
- Option B (FlowRadar padding trick, cite): wrapper `height:0; padding-top:75%` (4:3) / `56.25%` (16:9) / `100%` (square).
- Breakpoints: in the Designer's tablet/mobile views, switch the aspect ratio (e.g. 16 / 9 desktop → 4 / 5 on phones so the subject isn't a sliver). Mention touch: visitors drag with a finger on mobile (SceneViewer handles touchstart/touchmove).
- Include one paste-ready `<style>` + `<iframe>` block for people who prefer all-in-code in the Embed.

**H2: Using it as a hero image** (links → `/guides/3d-hero-image` "using a 3D photo as a hero image")
- Hero Section `position: relative; min-height: 80vh`; Embed absolute, full-bleed, z-index 0; heading/CTA wrapper z-index 1 with `pointer-events: none` on the wrapper and `pointer-events: auto` on the button — otherwise the copy blocks the drag.
- **Drop `loading="lazy"`** for above-the-fold (web.dev: lazy is for below-viewport iframes); optionally `<link rel="preconnect" href="https://www.gifsy.fun">` in Page settings → head code (paid-plan feature; note it).
- Portrait vs landscape scenes in a hero; where copy sits so it doesn't cover the subject.

**H2: Performance — what the iframe actually loads**
- Honest numbers from the product (writer may quote the code comments): colour image WebP ≤ 1440 px long edge, q0.9, "~150–350 KB"; depth map PNG; subject mask PNG; inpainted backdrop WebP; a ~1 KB manifest; a 400 px WebP poster that is server-rendered so something paints immediately; plus the viewer JS (Three.js r160 — writer to measure the real transfer size of `/embed/<id>` in DevTools and print it with a date; **no invented total**).
- No video bytes, no autoplay policy issues; the 3D depth model never runs on the visitor's device.
- The iframe is isolated: WebGL runs off your page's main document, no Webflow CSS collisions.
- Compare against a YouTube embed (~500 KB initial, web.dev) so the number has context.
- Lazy-load everything below the fold; one scene per viewport is plenty.

**H2: Respect reduced motion (and a static fallback)**
- Fact: the embed auto-orbits until the first pointer move (self-demo), then follows the pointer/drag. As of today the viewer does **not** read `prefers-reduced-motion` (checked `components/SceneViewer.tsx`, 2026-09-17) — say so honestly and give the host-side fix:

```html
<style>
@media (prefers-reduced-motion: reduce) {
  .gifsy-3d { display: none; }
  .gifsy-3d-fallback { display: block; }
}
.gifsy-3d-fallback { display: none; }
</style>
<div class="gifsy-3d"> <iframe …></iframe> </div>
<img class="gifsy-3d-fallback" src="your-photo.jpg" alt="…">
```

- Also note: choose the *Mouse* preset (subtle, cursor-follow) rather than Orbit for pages with a lot of copy; the writer can mention that motion strength is a slider at `/create`.
- Flag to product (not in the article): add `prefers-reduced-motion` handling to SceneViewer so the fallback becomes optional.

**H2: The other ways to get an "interactive image" in Webflow (and when to use them)** — 4-row table, snippet-friendly
| Method | Needs | Interactive how | Best for |
|---|---|---|---|
| Interactions "Mouse move over element" + PNG layers (redpanther / cloneables) | Photoshop/GIMP layer cutting per photo | tilts with cursor, no touch drag | you already have layered art, want zero 3rd-party code |
| Webflow 2.5D lesson (3D transforms) | separated layers | static unless you add Interactions | illustration/UI compositions |
| Spline / model-viewer / Vectary (BRIX) | a 3D model; Spline paid $24–30/mo | orbit a real mesh | products, objects, not photos |
| Gifsy embed | one photo | grab-to-orbit ± ~23°, touch | portraits, hero photos, portfolio stills |

Be fair: concede Interactions are free with any paid plan and keep everything first-party.

**H2: Troubleshooting** (H3 per issue, 2–3 sentences each)
- "Embed shows a placeholder in the Designer" → normal; publish or open the staging URL.
- "Nothing renders on my custom domain" → plan gate; check Site plan.
- "The iframe is a fixed 500 px and crops on mobile" → Step 3 aspect ratio.
- "Can't drag — hero text blocks it" → `pointer-events`.
- "Blocked by CSP / X-Frame-Options?" → Gifsy's `/embed/[id]` is built to be framed (no `X-Frame-Options`/`frame-ancestors` restriction set in the repo as of 09-17 — VERIFY on a live response header before printing this).
- "Page feels slow" → lazy-load, one scene per fold, check transfer size.

**H2: FAQ** (FAQPage JSON-LD, 6–8, PAA-style; 40–80-word answers)
1. Can I add an interactive image to Webflow on the free plan? (plan answer, dated)
2. Does Webflow support 3D images natively? (2.5D transforms + Interactions; layers required; no depth from a photo)
3. How do I make an iframe responsive in Webflow? (aspect-ratio / padding-top)
4. Will an embedded 3D photo slow down my Webflow site? (bytes; lazy; poster; no video)
5. Does it work on mobile and touch? (touch drag yes; no gyro today — VERIFY, SceneViewer has touch handlers, no deviceorientation)
6. Can I use it in a Webflow CMS Collection page? (Embed element with a CMS field for the scene ID — Webflow allows "Add field" inside Embed for CMS; VERIFY current name "Insert field"/"+ Add Field")
7. Can I remove the "Made with Gifsy" badge? (Pro, $9 one-time; badge is inside the iframe on Free)
8. Is this the same as Webflow's parallax on scroll? (No: scroll parallax moves whole elements; this is per-pixel depth from one photo, drag-to-orbit)

**Closing CTA** (short): "make a 3D photo from your own image" → `/create`. Then the "Related guides" block *after* the body (template links never precede the contextual hub link): `/guides/embed-3d-photo-on-website` "the full iframe embed guide", `/guides/3d-photo-framer` "the Framer version of this guide", hub.

---

## 5. Hub & spoke

- Role: **spoke #2** of the "interactive 3D photos for websites" cluster (run 06).
- Outbound links (in order of appearance): hub (in-body, first 40 %, anchor "guide to interactive 3D photos for websites") · `/create` (Step 1 and CTA) · `/guides/best-photos-for-3d-effect` (prereqs; spoke 6 — stub or drop if not live) · `/guides/3d-hero-image` (hero H2; spoke 10 — same rule) · `/guides/embed-3d-photo-on-website` (Step 3 + Related, "the full iframe embed guide") · `/guides/3d-photo-framer` (Related) · `/pricing` once (FAQ 7, anchor "Pro is $9 one-time").
- ≤ 3 hub links total. No "read more" anchors.
- Inbound on publish: hub chapter 6 (Webflow paragraph), `/create` post-publish "Webflow" tab, `/guides` index. Also the future Made-in-Webflow cloneable and FlowRadar resource (run 08) should point at this URL.

---

## 6. Technical optimisation

- **URL:** `/guides/3d-photo-webflow` (static App Router route `app/guides/3d-photo-webflow/page.tsx`, `generateMetadata`, add to `app/sitemap.ts` monthly / 0.7).
- **Title (58):** `Interactive Image in Webflow: Add a 3D Photo (No Layers) | Gifsy`
  Alt (56): `Add an Interactive 3D Photo to Webflow — Embed Element Guide`
- **Meta (156):** `Add an interactive 3D photo to Webflow from one image: Embed element steps, responsive sizing, hero placement, lazy loading, plan requirements. 10 minutes.`
- **H1:** as in §4.
- **Schema (single `<script type="application/ld+json">` with `@graph`):** `HowTo` (5 `HowToStep`s mirroring the Quick answer, `totalTime: PT10M`, `tool`: Webflow Designer, `supply`: one photo, `image` per step = the screenshots) + `FAQPage` (the 8 Q&As verbatim) + `BreadcrumbList` (Home › Guides › Add a 3D photo to Webflow) + `Article`/`TechArticle` wrapper with `author` (TBD), `datePublished`, `dateModified`, `image`. Skeleton:

```json
{"@context":"https://schema.org","@graph":[
 {"@type":"HowTo","name":"How to add an interactive 3D photo to Webflow","totalTime":"PT10M",
  "tool":[{"@type":"HowToTool","name":"Webflow Designer"}],"supply":[{"@type":"HowToSupply","name":"One photo (≥640px)"}],
  "step":[{"@type":"HowToStep","name":"Publish the 3D photo","text":"…","url":"…#step-1","image":"…"},
          {"@type":"HowToStep","name":"Copy the embed code","text":"…"},
          {"@type":"HowToStep","name":"Add an Embed element","text":"…"},
          {"@type":"HowToStep","name":"Set width and aspect ratio","text":"…"},
          {"@type":"HowToStep","name":"Publish and test","text":"…"}]},
 {"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"…","acceptedAnswer":{"@type":"Answer","text":"…"}}]},
 {"@type":"BreadcrumbList","itemListElement":[
   {"@type":"ListItem","position":1,"name":"Home","item":"https://www.gifsy.fun/"},
   {"@type":"ListItem","position":2,"name":"Guides","item":"https://www.gifsy.fun/guides"},
   {"@type":"ListItem","position":3,"name":"Add a 3D photo to Webflow","item":"https://www.gifsy.fun/guides/3d-photo-webflow"}]}
]}
```
  Note: Google dropped HowTo *rich results* in 2023; keep the markup anyway (cheap, consistent with run 06's plan, still parsed by AI answer engines). Validate with the Rich Results Test; mark it up only where the page really has the steps/FAQ.
- **Featured snippet format:** ordered list under "Quick answer" (5 items, ≤ 60 words). Secondary: table under "other ways".
- **Keyword placement:** "interactive image" + "Webflow" in H1, first sentence, the Quick-answer H2 wording ("…interactive image in Webflow"), one more H2 ("other ways to get an interactive image in Webflow"). Secondaries once each in body: "Webflow 3D image", "Webflow parallax image", "add a 3D photo to Webflow". Density is a ceiling, not a target.
- Canonical self, `openGraph.url` self, OG image = the hero screenshot (Webflow Designer with the embed on canvas).

---

## 7. E-E-A-T signals required

- **Experience:** first-person walkthrough on a real Webflow site (a `.webflow.io` staging project is fine), with our own screenshots — not Webflow's stock UI images. Name one real thing that went wrong (e.g. the fixed 500 px height cropping on the phone breakpoint, or copy blocking drag) and how it was fixed.
- **Expertise:** cite the product's actual asset pipeline in plain words (depth map + subject matte + inpainted backdrop, two planes in WebGL), the ±23° honest orbit cone, the ≥ 640 px source rule. Print the measured transfer size with a date.
- **Authoritativeness / citations:** Webflow Help *Custom code embed* (plan + 50k limit), Webflow Help *Choose a Site plan* / webflow.com/pricing (dated), Webflow University *2.5D effect*, web.dev *iframe lazy-loading* (the 500 KB YouTube / 2–3 % numbers), MDN `<iframe>` (`loading`, `title`), FlowRadar responsive-iframe answer (credit the padding trick), redpanther.io (the layered-PNG contrast, credited fairly).
- **Trust:** byline (TBD — README open question), "Last verified" date on the plan callout, no fabricated stats/testimonials, state plainly what is *not* handled (reduced motion, no `title` in the copied snippet, no gyro).

---

## 8. Screenshots to capture (annotate with numbered callouts; 1600 px wide, WebP)

1. `/create` after publish: the embed-snippet box with the *Copy* button (crop to the snippet).
2. Webflow Designer: Add panel open, **Components → Embed** highlighted.
3. The **Edit Code** modal with the iframe pasted, *Save & Close* visible.
4. Canvas view of the Embed element right after saving (whatever the Designer shows — placeholder or live iframe).
5. Style panel → Size section with Width 100 % and the aspect-ratio / padding setting (whichever the build offers).
6. Navigator panel showing the hero structure: Section › Embed (abs) + Hero-content wrapper (z-index above).
7. Mobile breakpoint view with the portrait aspect ratio applied.
8. Published page (desktop) mid-drag — cursor shown as "grab"; and the same on a phone (touch).
9. Chrome DevTools Network tab filtered to the `/embed/<id>` frame with transfer size + date visible (this is the number the performance H2 quotes).
10. Webflow **pricing page** section showing Site plans (for the dated plan callout; store the date in the filename).
11. Optional: the redpanther/cloneable layered-PNG setup side by side with our single-JPEG upload (the "no layers" contrast image, credited).

---

## 9. VERIFY before publishing (writer + implementer checklist)

- [ ] **Plan gate.** Open https://webflow.com/pricing and Webflow Help "Custom code embed" (help.webflow.com/hc/en-us/articles/33961332238611) on the day of writing. Confirm: (a) which Site plans include the Embed element / custom code; (b) whether a free Starter site can use Embed on the `.webflow.io` staging domain; (c) exact plan names and prices. Both pages returned 403 to our fetcher — only the SERP snippet ("Core, Growth, Agency, or Freelancer Workspace, or … an active Site plan") and third-party posts (Flowout: staging OK on free, custom domain needs paid; CSS Agency: "requires a paid site plan") were readable. Cite the Webflow page with the access date in the callout, not the third parties.
- [ ] Exact current Designer labels: Add panel section name ("Components" vs "Elements"), the "Embed" element name, the code modal title, "Save & Close", the Style panel aspect-ratio control label (or absence).
- [ ] Whether the Designer canvas renders the iframe live or shows a placeholder.
- [ ] CMS: the current name of the Embed's dynamic-field insert ("Add field") for FAQ 6.
- [ ] Live response headers of `https://www.gifsy.fun/embed/<id>` — no `X-Frame-Options` / restrictive `frame-ancestors` (repo shows none set; confirm in production).
- [ ] Measured transfer size of one embed load (DevTools, cache disabled) — print with date.
- [ ] Manual SERP check for PAA / featured snippet / AI Overview on the four queries (README "manual checks").
- [ ] Byline decision (Author: TBD).
- [ ] Spokes 6 and 10 aren't live yet — decide stub route vs. remove links at publish.

---

## 10. Writer notes (voice, anti-slop)

- Write it like a Webflow freelancer explaining to another freelancer. Short imperative steps, one action per step, real labels in **bold**, no "seamlessly/unleash/elevate".
- Say "photo" not "image" when referring to the source; say "interactive image" when echoing the search phrase.
- No claims of "works offline"; no user counts; no invented load-time totals. Concede Spline/Interactions where they're the better tool.
- Keep the Gifsy pitch to: one photo, no layers, drag-to-orbit, iframe, $9 one-time for no badge. That's it.
- Hand-off: next step is the `write-content` skill with this brief as context.

## Sources read (2026-09-17)

- https://discourse.webflow.com/t/interactive-images-is-it-possible/6966
- https://discourse.webflow.com/t/creating-interactive-images/30251
- https://discourse.webflow.com/t/display-a-photo-by-moving-the-mouse-over-it-parallax/171377 (now 301 → community.webflow.com)
- https://webflow.com/made-in-webflow/website/parallax-hero-section
- https://webflow.com/made-in-webflow/website/image-interaction
- https://webflow.com/made-in-webflow/website/3d-images-slider
- https://webflow.com/blog/image-hover-effect
- https://webflow.com/blog/3d-design-website
- https://webflow.com/apps/detail/interactivity-studio
- https://www.commoninja.com/widgets/image-hotspot/webflow
- https://university.webflow.com/lesson/2d-objects-in-3d-space
- https://university.webflow.com/lesson/parallax-movement-on-scroll
- https://help.webflow.com/hc/en-us/articles/33961332238611-Custom-code-embed (403; snippet only)
- https://help.webflow.com/hc/en-us/articles/33961232582419-Choose-a-Site-plan (403)
- https://webflow.com/pricing (fetch failed; VERIFY manually)
- https://www.flowout.com/blog/webflow-custom-code
- https://www.thecssagency.com/blog/webflow-custom-code
- https://www.redpanther.io/blog/parallax-hover-webflow
- https://www.flowradar.com/answer/how-can-i-make-my-iframe-embed-responsive-in-webflow
- https://brixagency.com/blog/how-to-embed-3d-models-in-webflow
- https://web.dev/articles/iframe-lazy-loading
- Repo: `components/CreateWorkshop.tsx:605`, `app/s/[id]/scene-client.tsx:30` (embed snippet); `components/SceneViewer.tsx` (auto-orbit, touch handlers, badge, no reduced-motion); `app/embed/[id]/page.tsx` (server-rendered poster, noindex + canonical); `lib/publish/creator.ts` (WebP 1440 px q0.9 "~150–350 KB", PNG depth/mask, 400 px thumb).

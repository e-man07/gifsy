# Run 09 — content-brief: homepage `/` — "3D photo maker"

Date: 2026-09-17 · Skill: `content-brief` (+ `references/content-types-overview.md`,
`structured-data-snippets.md`, `information-gain-writing.md`) · Page: `app/page.tsx`
(rewrite in place — keep the live demo scenes, gallery strip and plan cards; this brief
says what copy goes around them). Inputs: `_brief-context.md`, README decisions, runs
01 / 05 (`/` section) / 07. Author: **TBD** (founder byline not yet confirmed).

Adopted title (run 05, unchanged): **`3D Photo Maker — Interactive Depth, Embed Anywhere | Gifsy`** (58).

---

## Method

- SERPs read today: "3D photo maker", "interactive 3D photo", "interactive 3D photo
  maker online depth parallax" (the qualified probe from run 05).
- Pages fetched and read: Depth Studio, Upsampler parallax generator, png3D, GIFMakes
  3D GIF maker, Media.io 3D Image Maker, Depthy, OpenArt Photo-to-3D. Meshy / Sloyd /
  3D AI Studio / Canva were classified from the SERP only — they are mesh generators
  and never the target (README decision).
- Not visible to the tooling: PAA boxes, AI Overview, featured-snippet holder, volumes.
  FAQ questions below are built from the competitors' own FAQs (which is where their
  PAA-style demand shows) plus the questions the product's UI already answers.

## Target keyword analysis

| | |
|---|---|
| Primary | **3D photo maker** — carried with the modifiers *interactive / parallax / depth / embed* in H1, H2s and first 100 words |
| Secondary on the same page | interactive 3D photo · 3D parallax photo · 3D photo animation · depth map photo · embed 3D photo on website · Immersity / LeiaPix alternative (one mention, linked) |
| Literal SERP | 7 of 9 results are image-to-mesh generators (Google Play "AI Image to 3D Model Maker", MakerWorld, Canva, Sloyd, 3D AI Studio, Meshy, SupaVoxel). Only png3D and OpenArt are photo-effect tools. Wrong-intent majority — treat as a *brand head term*, not a page-1 target. |
| Cluster to join | The qualified SERP: **Depth Studio** (GitHub Pages, browser-local, 580 w), **Upsampler** (2,000 w, MP4/GIF, no sign-up), **GIFMakes** (800 w, GIF/MP4/WebM, in-browser), **png3D** (1,200 w, 4 video presets, tiers), **Media.io** (1,200 w, iOS-26 trend), **Depthy** (45 w, 2014-era), DepthFlow (OSS, GitHub). |
| Dominant intent | **Transactional** (people want a tool now) with an **informational tail** ("how does it work", "is my photo uploaded", "what photo works best") that every serious competitor answers in H2s. |
| Difficulty | Head term: Hard (authority play, 12+ mo, mesh intent). Qualified set: **Moderate** — three of six are one-page hobby tools with no schema, no FAQ, no author; Upsampler and Media.io are the only DR-heavy pages. |
| 3-month realistic | Impressions for "interactive 3D photo maker", "3D parallax photo maker", "3D photo embed"; top-10 only if the cluster (`/alternatives/immersity-ai`, Webflow/Framer guides) ships alongside. Head term: none in 3 months. |
| Content type | **landing-page** (transactional) with the depth of a **product-page** — the reference table says 800–1,200 for a pure landing; the qualified SERP's serious pages sit at 1,200–2,000 and none explain embedding, so the ~2,200 w target from run 01 stands (Upsampler 2,000 + 10%). Do not pad past it. |

## SERP competitive intelligence (top pages that are actually the competition)

| | Depth Studio | Upsampler | png3D | GIFMakes | Media.io |
|---|---|---|---|---|---|
| Format / words | single-page browser app + FAQ · ~580 | tool landing · ~2,000 | tool + pricing + FAQ · ~1,200 | tool + feature list + FAQ · ~800 | tool landing · ~1,200 |
| H2s | How it works (Predict depth / Displace on the GPU / Move the camera) · How is this running in my browser? · What it is good for · 6 FAQ-style H2s · "I build tools like this every day" | Turn any photo into a moving 3D scene · How a flat photo becomes a 3D scene · Motion styles and where to use them · What to expect · FAQ | Demo · FAQ · pricing tiers | AI Depth Map Generation · Camera Controls · Layered Parallax · Output Settings · FAQ | 3-step how-to · viral effects · toolkit · spatial photos |
| Output | in-browser interactive + video clip + depth PNG | MP4 / GIF | MP4 (GIF paid) | GIF / MP4 / WebP / WebM / APNG | image / video |
| Hook | "100% private — your photo never leaves your browser" | "no sign-up, no watermark, no ads" | 4 camera presets, tiers | "runs offline, never leaves your machine" | iOS-26 lock screen trend |
| Pricing | free | free daily + premium | Free 2/mo · $10/50 · $20/111 · $100/700 | free | credits, 50 % banner |
| E-E-A-T | named author (Harman Kamboj), first-person | none | contact email, "why charge" answer | none | brand |
| What they miss | no embed, no publish, no hosting, no subject cutout | no interactivity for the *viewer*, no embed | uploads to server, 3-day retention, video only | video only, no embed | uploads, no FAQ |

**What every one of them misses (the gap this page owns):** the *visitor* on your site can drag it. All five ship a file; none ships an `<iframe>`. Nobody names Webflow, Framer, Squarespace or WordPress. Nobody says which photos fail. Only Depth Studio explains the mechanism (and it's the shortest page). Nobody offers a one-time price.

**What they do better than the current `/`:** they explain themselves. Depth Studio and png3D answer *how it works / is my photo uploaded / best image / does it work offline* in headings. The current homepage's H2s are taglines ("One photo. Shot in three dimensions.", "Find your fit.").

## Content gap analysis (exact sections to add)

1. **Definition paragraph** ("A 3D photo maker turns…") — absent on every competitor except OpenArt's FAQ; snippet target.
2. **Mechanism with named models** — Depth Studio has the only one (3 lines). Gifsy adds subject matte + inpainted backdrop + the 2.5D scope statement.
3. **Embed section with the literal snippet** — zero coverage on the SERP.
4. **Video vs interactive embed** — the output-type table; nobody frames the choice.
5. **What photos work best / fail** — png3D's one line ("object in the image center") is the entire SERP's coverage.
6. **Honest data flow** — Depth Studio/GIFMakes claim "never leaves your browser"; Gifsy must say the three-case truth (photo local; Free sends activations; publishing uploads and is public). Different claim, more credible.
7. **Free vs Pro in prose** — png3D does this well ("why charge?"); Gifsy answers with one-time pricing.
8. **First-person founder line** — Depth Studio's "I build tools like this every day" is the only one on the SERP and it's a contractor pitch.

---

## Page architecture — what stays, what moves, what's new

Keep (already built, already the strongest proof): hero `Uploader` with 3D/GIF/Sticker
switch · `CommunityShowcase` marquee · the lightning "Now showing" iframe · `PersonaShowcase`
· `GalleryStrip` + "All N scenes" · `PlanCards` · footer. Everything below is copy and
headings around those components, plus new static sections. Order is changed once:
the persona section moves *after* "How it works" so a cold searcher reads what the
product is before being asked to pick a job.

Crawlable-word budget: **~2,250** (UI labels, marquee captions and alt text excluded).
The 32× "3D · Made with Gifsy" marquee captions must become a single `sr-only`
caption (run 05) or the NLP profile stays 40 % noise.

### Outline with per-section word counts

**H1 — `The interactive 3D photo maker you can embed on any site.`** (hero, 70 w)
- Eyebrow (keep): "For portfolios, product pages & hero sections".
- Sub-line (replaces current): "Drop in one photo. Gifsy estimates a depth map and lifts the subject off the background in your browser, then hands you an iframe your visitors can drag — no video export, no WebGL developer, no plugin."
- Keep the three check badges (live constants). Add a fourth line of real links under the uploader (this un-orphans three pages): "Or open a tool directly: [3D photo maker](/create) · [animate a photo into a GIF](/tools/gif) · [Telegram sticker maker](/tools/sticker)."
- Rename the scroll cue from "Customize" to "Try it" (it scrolls to the uploader).

**H2 — `Interactive 3D photos published on Gifsy`** (community marquee, 40 w)
- Promote the `<p>` to an H2. Copy: "Scenes published on Gifsy, playing back as clips. The live, draggable one is next." Do **not** write "real users" unless each card links to its `/s/<id>` (run 07). One sentence of the failure story is allowed here and is an Experience signal: "The first version of this strip mounted 32 live WebGL scenes at once and tripped the host's firewall — so these are recordings; the embed below is live."

**H2 — `Drag it: this is the embed, not a video`** (lightning iframe section, 60 w)
- Keep the iframe. Copy above it: "Live in the frame below — click and drag. It's the same `<iframe>` snippet you paste into your own site. The visitor's page loads image, depth and mask files only; no AI runs for them, and it's on screen in a couple of seconds."
- Must state in text: `[Gifsy] [output] [interactive iframe]`. This is the one sentence run 05 said no crawler can currently extract.

**H2 — `What a 3D photo maker does — and what this one isn't`** (150 w) — **featured-snippet target**
- 40–60 w definition first, verbatim from run 05: "A 3D photo maker turns a single flat photo into a scene with real depth. Gifsy does it with two AI models that run in your browser: one estimates a depth map, one cuts the subject out. The result isn't a video — it's an interactive embed that responds to the visitor's mouse or tilt."
- Then the scope sentence that repels mesh intent (Trust signal, run 07 fix 5): "This is a 2.5D parallax scene, not a 3D mesh. You can look around the photo, roughly ±23° left-right, not walk behind it. If you need a model you can rotate 360° or print, use a mesh generator like Meshy or Tripo — Gifsy is for photos on web pages."

**H2 — `How it works`** (320 w) — `id="how"` stays; render steps as `<ol>` with an H3 each (list-snippet eligible)
- **H3 1. Upload one photo** (70 w): PNG, JPG or WebP; ≥640 px on the long edge reads crisper; one clear subject. GIFs and stickers never leave the browser; 3D needs a free account (say it here — the hero badges don't).
- **H3 2. Depth, matte, backdrop — in your browser** (140 w): name the pipeline and the models. "Depth Anything V2 (small) estimates a depth map. ISNet lifts the subject off the background. A LaMa inpaint fills in what was behind the subject so the backdrop doesn't tear when you look around. All three run once, at publish; the viewer never runs AI." Include the split-model line in the same words as `/privacy` (see honesty section). Two first-party screenshots: the depth map and the matte of the same photo (alt text: "Depth map estimated from a portrait photo", "Subject matte cut from the same photo").
- **H3 3. Publish and paste the embed** (110 w): "Tune depth, motion and the Spin orbit live, then publish. You get a share page and an `<iframe>`; the finished scene (image, depth, mask, backdrop) is uploaded and public. Everything after that is WebGL at 60 fps — two displaced planes, no model download for your visitors."
- Link out: [how 3D photos work](/guides/how-3d-photos-work) (guide, ships month 2 — add the link when live) and `/privacy#how-3d-depth-is-calculated` from the word "step".

**H2 — `Embed the 3D photo on your site`** (220 w)
- Show the literal snippet in a `<pre><code>` block exactly as the workshop copies it: `<iframe src="https://www.gifsy.fun/embed/<id>" style="width:100%;height:500px;border:0" loading="lazy"></iframe>` — state `[embed] [default height] [500 px]` and that `loading="lazy"` keeps it off the critical path.
- Three platform lines, each linking to the guide: "[Webflow](/guides/3d-photo-webflow): drop an Embed element, paste, publish." · "[Framer](/guides/3d-photo-framer): Embed component → HTML." · "Squarespace, WordPress, Carrd, Notion and anything else that takes an iframe: [embed a 3D photo on any website](/guides/embed-3d-photo-on-website)." Only link guide slugs that exist at ship time; until then link the `/guides` hub anchor "guides to interactive 3D photos for websites".
- One line for the badge, honestly: Free embeds carry a small "Made with Gifsy" badge; Pro removes it.

**H2 — `Video export vs an interactive embed`** (120 w + table) — table-snippet target
- 3 columns (Video/GIF export · Interactive embed · Where it matters), 5 rows: visitor control (none / drag, tilt) · file weight (MP4 per placement / image+depth+mask once) · autoplay & battery (looping video / GPU idle until pointer) · edits after publish (re-export / re-publish, same iframe) · works in email & social (yes / no — use GIF). Be fair: the last row is where video wins, and say so; link [make a GIF from a photo](/tools/gif) for that case.
- Body: Immersity for Web, png3D, Upsampler and Media.io all hand you a video. Gifsy's outputs are the embed *and* a GIF/WebM/PNG capture if you want a file too.

**H2 — `Built for the jobs a flat hero image can't do`** (280 w) — keep `PersonaShowcase`; add an H3 + 60–70 w for each persona *as static text* above/below the cards
- **H3 Webflow and Framer builders** — client hero sections without a WebGL developer; paste an Embed element; commercial use on Pro; link [Webflow guide](/guides/3d-photo-webflow).
- **H3 Portfolio creators** — one self-portrait or key project shot that moves; stays interactive on a phone (tilt).
- **H3 Product pages** — a product shot with depth, not a 360 spin rig; be honest that it's one angle with parallax, not a turntable.
- **H3 Creators and streamers** — the same scene captured as a looping GIF/WebM for socials, via the capture button; link [gallery](/gallery) with anchor "browse 3D photo examples".

**H2 — `Every one of these was a flat photo`** (gallery strip, 40 w) — keep heading and `GalleryStrip`. Copy: "One image in, real depth out. Hit play on any, then drop in your own." Keep "All N scenes" → `/gallery` with anchor "See all N 3D photo examples".

**H2 — `Which photos work best (and which don't)`** (220 w) — the honest-limits block; nobody on the SERP has it
- Works best: one clear subject with visible separation from the background; ≥640 px long edge; some background depth (a room, a street, a landscape behind the subject).
- Works worst, each one a line only someone who has run the model knows: frame-filling subjects (nothing behind them to parallax — the edges stretch); busy or low-contrast backgrounds where the matte can't separate the subject (the workshop literally says "Needs a subject — this photo's background couldn't be separated"); flat illustrations and logos (no depth cues); glass, fur and fly-away hair at the silhouette; small phone screenshots.
- State the orbit cone: about ±23° horizontally and ±13° vertically — the honest ceiling of single-image depth. "If you drag to the edge of that cone you'll see a thin stretch at the silhouette; that's the height-field, not a bug."
- Link out: [best photos for 3D](/guides/best-photos-for-3d) when it exists; otherwise the `/guides` hub.

**H2 — `Made in your browser — what that actually means`** (160 w) — the data-flow statement, same words as `/privacy`
- Required copy (run 07 fix 14, verbatim intent): "Your photo stays in your browser. On the Free plan the intermediate numbers from the depth model — activations, not the photo — go to our server for one step, and that step is what we meter as a free generation. On Pro that step runs on your device too, so depth generation works offline after the first ~50 MB model download. Publishing uploads the finished scene (image, depth, mask, backdrop) to our storage and it becomes public at its share link. GIFs and stickers never leave your browser at all."
- Do **not** write "works offline" for the product as a whole (publishing hits the inpaint server and uploads). Do not write "never leaves your device" for 3D. Link [privacy policy](/privacy) with that anchor and, once live, [the GitHub repo] as "source on GitHub" (verifiable proof of onnxruntime-web).

**H2 — `Free to try. $9 once for unlimited.`** (150 w) — keep `PlanCards`; add prose above
- State as sentences (EAV): Free = 3 lifetime 3D generations, unlimited publishing and embeds, Gifsy badge on embeds; Pro = $9 one-time, never renews, unlimited generations, no badge, commercial use, depth model fully local. "No credits, no monthly plan — the depth model running in your browser is what makes a one-time price possible." Mention 14-day no-questions refund, Dodo Payments as merchant of record. Link [pricing](/pricing) with anchor "compare Free and Pro" and [refund policy](/refund).
- Drop the "Most popular" badge (`PlanCards.tsx`) and the expired offer countdown copy (run 07).

**H2 — `Who built this`** (130 w) — founder paragraph, first person — **Author: TBD**
- Direction (fill in only with facts the founder confirms): "I built Gifsy because every hero image on my own portfolio was flat. The first build ran the depth model on a server; moving the 44 MB encoder into the browser (cached after the first run) is what made a $9 one-time price possible instead of credits. Gifsy is made in India, launched August 2026, and the viewer is plain Three.js — the AI runs once, then it's graphics." Link `/about` (to be created), GitHub, Product Hunt. If the name is not confirmed at ship time, publish the paragraph unsigned rather than invent one; no stats, no user counts.

**H2 — `Questions people ask before they try it`** (FAQ, ~520 w; 9 questions × 50–65 w; each an H3 so it's extractable; mirrored in `FAQPage` JSON-LD)

1. **Is my photo uploaded when I make a 3D photo?** — the three-case answer from the data-flow section, compressed.
2. **What's the difference between Gifsy and Immersity AI (LeiaPix)?** — Immersity for Web is still sold (free = watermark/720p/non-commercial; $4.99–$99.99/mo credits) and exports video; no Immersity plan offers an embed. Gifsy's output is an interactive iframe, $9 once. Link [Immersity AI alternatives](/alternatives/immersity-ai).
3. **Does the 3D photo work on phones?** — yes; tilt/touch-drag in the iframe; the viewer downloads assets only, no model.
4. **Can I put it on Webflow, Framer, Squarespace or WordPress?** — any site that accepts an iframe / HTML embed; link the three guides (Webflow, Framer, generic embed). Note that some builders need a plan that allows custom code — verify per platform (README open item).
5. **Can I remove the "Made with Gifsy" badge?** — Pro ($9 one-time). Free keeps it.
6. **Does Pro work offline?** — depth generation, yes, after the first model download; publishing and the backdrop inpaint need a connection; say it plainly.
7. **Can I use scenes on client sites commercially?** — Pro includes commercial use; link [terms](/terms).
8. **Is this a 3D model I can export to Blender or print?** — no; it's a 2.5D parallax scene. Send them to Meshy/Tripo. (Absorbs the mesh-intent visitor with a clean answer instead of a bounce.)
9. **What photo formats and sizes work?** — PNG, JPG, WebP; ≥640 px long edge; one clear subject; link "which photos work best" section.
10. *(optional 10th)* **Can I also get a GIF or video?** — yes, capture GIF/WebM/PNG from the scene; or use the free [GIF maker](/tools/gif) for plain photo animations.

**Footer nav** (no word budget): add `/create` "3D photo maker", `/tools/gif` "GIF maker", `/tools/sticker` "Telegram sticker maker", `/guides` "Guides", `/about`, Contact, GitHub — alongside the existing Pricing / Gallery / Privacy / Terms / Refunds.

Section total ≈ 70+40+60+150+320+220+120+280+40+220+160+150+130+520 = **2,480** ceiling; trim the persona H3s and FAQ answers first to land at ~2,200–2,300.

### Keyword placement (ceilings, not targets)

- "3D photo maker": H1, first 100 words, the definition H2, one FAQ, title. ≤ 6 uses in body.
- "interactive 3D photo": H2 (community), definition, embed section, FAQ 3.
- "parallax" / "depth map" / "depth" : how-it-works, video-vs-embed, limits section.
- "embed": H1, H2 (embed section), snippet, FAQ 4.
- Entities that must appear once each: depth map · depth estimation model (Depth Anything V2) · subject segmentation / matte (ISNet) · inpainting (LaMa) · iframe · lazy loading · Three.js / WebGL · Webflow · Framer · Squarespace · WordPress · Immersity / LeiaPix · GIF / WebM / PNG capture · 60 fps · ±23°.

## Hub & spoke

`/` is the **commercial hub** of the 3D cluster (run 06's `/guides/interactive-3d-photos-for-websites` is the *editorial* hub). Every spoke links back to `/` with a branded anchor; `/` links out as below. On hub-launch day `/` must carry body links into the cluster so it isn't orphaned (README linking rule).

### Internal links out (anchor text — vary, no exact-match spam)

| Target | Anchor | Where |
|---|---|---|
| `/create` | "3D photo maker" (once), "make your 3D photo" | under uploader; persona section CTA |
| `/tools/gif` | "animate a photo into a GIF", "GIF maker" | under uploader; video-vs-embed table; FAQ 10 |
| `/tools/sticker` | "Telegram sticker maker" | under uploader; footer |
| `/pricing` | "compare Free and Pro", "pricing" | plans prose; footer |
| `/gallery` | "See all N 3D photo examples", "browse 3D photo examples" | gallery strip; persona 4 |
| `/alternatives/immersity-ai` | "Immersity AI alternatives", "LeiaPix alternative" | FAQ 2; video-vs-embed body |
| `/guides` | "guides to interactive 3D photos for websites" | embed section (fallback until spokes exist); footer |
| `/guides/3d-photo-webflow` | "add a 3D photo to Webflow", "Webflow guide" | embed section; persona 1; FAQ 4 |
| `/guides/3d-photo-framer` | "3D image in Framer" | embed section; FAQ 4 |
| `/guides/embed-3d-photo-on-website` | "embed a 3D photo on any website" | embed section; FAQ 4 |
| `/guides/how-3d-photos-work` | "how 3D photos work" | how-it-works step 2 (when live) |
| `/privacy#how-3d-depth-is-calculated`, `/terms`, `/refund` | "privacy policy", "terms", "refund policy" | data-flow section; plans; FAQ 7 |
| `/about` (new) | founder name / "about Gifsy" | founder paragraph; footer |

Rule: link only routes that exist at ship time; keep a checklist in the PR and swap the `/guides` hub anchor for the spoke once each spoke publishes.

## Technical optimisation

- **Title (58):** `3D Photo Maker — Interactive Depth, Embed Anywhere | Gifsy` (set `metadata.title.default`, OG and Twitter titles in `app/layout.tsx`; keep the `%s · Gifsy` template).
- **Meta (154):** `Make an interactive 3D photo from one image, in your browser. Drag it, then paste the iframe into Webflow, Framer or any site. 3 free, then $9 once.`
- **H1:** `The interactive 3D photo maker you can embed on any site.`
- **Canonical:** `https://www.gifsy.fun/` via `alternates.canonical`; `openGraph.url` per page (sub-pages currently inherit the homepage URL — run 05).
- **Snippet formats:** paragraph (definition H2, 40–60 w) · ordered list (`<ol>` in How it works) · table (video vs embed).
- **Rendering:** `app/page.tsx` is `"use client"`. Put the JSON-LD and all new prose in a server component wrapper (or a server `layout`) so it is in the HTML, not hydrated in. Nested-`<main>` fix and the `sr-only` marquee caption ride along.
- **Images:** two first-party pipeline screenshots (depth map, matte) with descriptive alt; gallery alts carry scene titles.

### Schema (JSON-LD, server-rendered, one `@graph`)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.gifsy.fun#organization",
      "name": "Gifsy",
      "url": "https://www.gifsy.fun",
      "logo": "https://www.gifsy.fun/icon.png",
      "foundingDate": "2026-08",
      "sameAs": [
        "https://github.com/e-man07/gifsy",
        "https://www.producthunt.com/products/gifsy"
      ]
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://www.gifsy.fun#app",
      "name": "Gifsy",
      "url": "https://www.gifsy.fun",
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "Web browser",
      "description": "Interactive 3D photo maker: one photo becomes a depth-parallax scene in your browser, published as an iframe embed for any website.",
      "featureList": "AI depth map, subject cutout, interactive iframe embed, GIF/WebM/PNG capture, in-browser processing",
      "publisher": { "@id": "https://www.gifsy.fun#organization" },
      "offers": [
        { "@type": "Offer", "name": "Free", "price": "0", "priceCurrency": "USD", "description": "3 lifetime 3D generations, unlimited publishing and embeds, Gifsy badge on embeds, unlimited GIFs and stickers" },
        { "@type": "Offer", "name": "Pro (one-time)", "price": "9", "priceCurrency": "USD", "description": "Unlimited 3D generations, no badge, commercial use, depth model runs fully on device. One payment, never renews." }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "Is my photo uploaded when I make a 3D photo?", "acceptedAnswer": { "@type": "Answer", "text": "<FAQ 1 answer, identical to on-page text>" } }
        /* …one Question per on-page FAQ H3, text identical to the visible answer… */
      ]
    }
  ]
}
```

Add `founder` → a `Person` node and `x.com/…` to `sameAs` **only** once the byline is confirmed (Author: TBD). No `AggregateRating` — there are no reviews to cite. `HowTo` is deliberately omitted (FAQPage + HowTo conflict; the `<ol>` gets the list snippet without schema).

## E-E-A-T elements (required in the copy)

- **Experience:** the founder paragraph in first person with one real number (44 MB encoder / 5.4 MB head, or the 32-iframe firewall incident); the marquee failure story in one sentence; the "which photos don't work" list written from the model's actual error strings.
- **Expertise:** named models (Depth Anything V2 small, ISNet, LaMa), the two-plane WebGL explanation, the 2.5D / ±23° scope statement, recommending Meshy/Tripo for the adjacent job.
- **Authoritativeness:** Organization + SoftwareApplication schema with `sameAs`; footer links to GitHub and Product Hunt; `/about` linked from the founder paragraph; the cluster links above.
- **Trust:** the data-flow paragraph in `/privacy`'s words; the badge stated up-front; 14-day refund + Dodo as MoR next to the plan cards; no "Most popular", no countdown, no "works offline" for the whole product, no user counts or testimonials; Immersity described accurately (still sold, video only, no embed).
- **Original artefacts:** depth-map + matte screenshots of one photo; the live iframe; the gallery.
- **External sources to cite (sparingly, in the how-it-works or limits section):** Depth Anything V2 (arXiv / GitHub), ISNet via `@imgly/background-removal`, LaMa inpainting paper, Three.js docs — the links prove the pipeline is real rather than "cutting-edge AI".

## Banned on this page

"Cutting-edge", "seamless", "stunning", "unlock", "elevate"; "works offline" unqualified; "never leaves your device" for 3D; "Most popular"; "real users" without links; any statistic not in the repo; "360°"; "3D model".

## Resource assessment

- **Effort: Medium-High** — ~2,200 w of copy + two screenshots + schema + server-component refactor + link plumbing; 10–14 h.
- **Dependencies:** founder name decision (`/about`, Person schema), Gifsy-domain email, `/guides` hub or at least the three embed spokes for the outbound links, marquee provenance decision.
- **3-month target:** impressions and page-2 for the qualified modifiers; the head term is a 12-month authority play that this page starts, and the cluster finishes.

## Sources

- SERPs (2026-09-17): "3D photo maker", "interactive 3D photo", "interactive 3D photo maker online depth parallax"
- https://hammyasf.github.io/depth-studio.html · https://upsampler.com/free-3d-parallax-generator-no-signup · https://png3d.com/ · https://gifmakes.com/3d_gif_maker · https://www.media.io/image-effects/3d-image-maker.html · https://depthy.stamina.pl/ · https://openart.ai/features/photo-to-3d/
- Repo: `app/page.tsx`, `components/CreateWorkshop.tsx` (pipeline sentence, 640 px warning, "Needs a subject" string, iframe snippet with `height:500px`), `lib/billing/plans.ts`, `README.md` (44 MB encoder / 5.4 MB head), `components/SceneViewer.tsx` (`ORBIT_MAX_THETA` 0.40 rad ≈ ±23°, `ORBIT_MAX_PHI` 0.22 rad ≈ ±13°)
- Prior runs: 01 (keyword), 05 (`/` audit, rewritten elements), 07 (E-E-A-T fixes, schema template), `_brief-context.md`

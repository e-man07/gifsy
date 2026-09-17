# Run 10 — content-brief: `/alternatives/immersity-ai`

Date: 2026-09-17 · Skill: `content-brief` (templates: alternatives-page + listicle +
comparison block) · Builds on run 02 (SERP read, intent, competitor pages) — that
work is not repeated here. Re-fetched today only to fill gaps: immersity.ai/pricing
(re-confirmed), Animagen pricing, Media.io 3D Image Maker + pricing, Dzine pricing,
DepthFlow GitHub, Depthy homepage, Motionleap + CapCut via search (both vendor pages
returned 451/ENOTFOUND to the fetch tool — writer must open them in a browser).

Author: TBD (README open question — named founder byline not yet confirmed).

---

## 1. Target keyword analysis

| | |
|---|---|
| Primary keyword | **Immersity AI alternative** (H1, first 100 words, ≥2 H2s) |
| Secondary | **LeiaPix alternative**, **Immersity AI free** (both in the H1/direct answer; "LeiaPix" must appear above the fold because half the searchers still use the old name) |
| Absorb (in body/FAQ, not headings) | "LeiaPix converter alternative", "websites like Immersity AI", "AI like Immersity free", "is LeiaPix still free", "Immersity AI watermark", "Immersity AI pricing", "Depthy alternative" |
| Intent | Commercial investigation — ex-LeiaPix users who hit the watermark / 720p / credit wall and want a replacement; strong "free" modifier |
| Difficulty | Moderate on domain weight (G2/SourceForge/Slashdot hold 1–4 with off-target auto-lists), **Easy on editorial** (real competition = small-vendor listicles 1.2k–3.2k words, no tests, no dated pricing) |
| Strategy | 3–6 months to top 10 for both brand queries; realistic top 5 within 6 months (Animate Photo AI entered with ~1.5k words) |
| Content type | **alternatives-page** (ItemList + FAQPage), borrowing the listicle "how we evaluated + quarterly update" rule and the comparison template's "verdict-first per criterion" for the Gifsy-vs-Immersity block |
| Word target | 2,300–2,500 (avg of the five editorial competitors ≈ 2,100 + 10%). Do not pad. |
| Core entities that must appear | Immersity AI, LeiaPix, depth map, parallax / 2.5D, watermark, credits, MP4/GIF export, interactive embed / iframe, 3D mesh (as the thing this is *not*) |

## 2. SERP competitive intelligence (condensed from run 02)

| # | Page | Words | Format | Covers | Misses |
|---|---|---|---|---|---|
| 1–4 | G2 / SourceForge / Slashdot / TopAI directories | 8–9k card copy | auto-generated directory | review counts, 50 tools | intent (Canva, Firefly, Synthesia as "alternatives"); no Immersity description; nothing interactive |
| 5 | Animagen "Top 10 Immersity AI (Originally Leiapix) Alternatives" (3dpicmaker.com) | ~3,200 | listicle + table + FAQ | Type / Best for / Price / Free option table; how-to-choose; 4-Q FAQ | mixes mesh generators (Meshy, Tripo, Alpha3D) into a depth-animation list; no Immersity pricing, no watermark story, no tests, no screenshots |
| 6 | Vidau "Immersity AI: What It Is, Pricing & 7+ Free Alternatives" | ~2,500 | listicle | leads with *pricing* (confirms intent); CapCut, Depthy, Motionleap, Pika, Runway | off-topic FAQ; no output-type split; undated |
| 7 | HitPaw Edimakor "6 Websites Like Immersity AI" | ~2,000 | vendor listicle | Dzine, Depthy, Tripo, Alpha3D, Owl3D | no FAQ, pushes own editor, no pricing dates |
| — | Animate Photo AI `/alternatives/immersity-ai-alternatives` | ~1,500 | single-vendor alternatives page | TL;DR, table, "choose X if", FAQ | one product; proof that a small site can enter this SERP |
| — | Aiseesoft LeiaPix review | ~2,500 | review | the only page telling the rename/credit story; FAQ "How to use LeiaPix for free?" | 2024, stale pricing |

## 3. Content gap → what this page does that none of them do

1. **Fair criteria first, then the list.** Nobody states *how* they compared. This page opens with the criteria and applies them identically to all 8 tools, Gifsy included.
2. **Output-type taxonomy** (interactive embed / video-GIF export / 3D mesh) — resolves the confusion that makes the directory and Animagen lists useless.
3. **Immersity's actual current terms, dated** (free = watermark + 720p + non-commercial; $4.99–$99.99/mo; à-la-carte credits gone; homepage sells displays; no embed). Re-confirmed 2026-09-17 — see §7.
4. **Same-photo hands-on test** across 8 tools with a GIF/screenshot of each result and one live Gifsy embed.
5. **Pricing-model column** (subscription / credits / one-time / free-OSS) — every alternative except two is a subscription or credit pack.
6. **"Does my photo leave my browser?" column** — with Gifsy's honest footnote (Free plan sends depth-model activations, not the photo; publishing uploads the finished scene).
7. **Webflow/Framer/Squarespace path** — one paragraph + links to the embed guide.

## 4. Fair-comparison criteria (write this section BEFORE any tool is named)

The brief's honesty requirement: Gifsy is one of eight entries, not "the winner". The
page must state the criteria first, score every tool on the same criteria, and be
explicit about where Gifsy loses. Criteria (in this order, same order in every H3):

| Criterion | How it's judged | Where Gifsy loses |
|---|---|---|
| **Output type** | What you actually get: interactive embed, MP4/GIF file, 3D mesh, app-only | Gifsy gives no MP4/4K video export — anyone who needs a file for Instagram/YouTube should pick a video exporter |
| **Free tier — what it really includes** | resolution cap, watermark/badge, count limit, commercial use | Gifsy Free = 3 lifetime generations + "Gifsy" badge on embeds; Immersity Free = unlimited conversions (watermarked, 720p) — Immersity is more generous on *quantity* |
| **Watermark / branding** | on free and on paid | Free Gifsy embeds carry a badge |
| **Price model + 12-month cost** | subscription / credits / one-time / free | — ($9 one-time) |
| **Where processing happens** | browser vs upload | Free plan sends intermediate depth-model activations to Gifsy's server; publishing uploads the finished scene and it is public |
| **Parallax quality on the test photo** | edge halos, background stretch, subject separation | 2.5D height-field: ≈ ±23° orbit, not 360°; frame-filling subjects and busy backgrounds work worst; ≥640 px source needed |
| **Embed / share on a website** | iframe, share URL, or none | — |
| **Maintenance / risk** | last update, roadmap signals | Gifsy is a young solo product — say so; no track record |

Also state what was **excluded and why**: Meshy, Tripo, Alpha3D (mesh generators —
different product), Runway/Pika/Kaiber (generic image-to-video; motion is not depth
parallax), PhotoMirage/PhotoVibrance (desktop cinemagraph, $69.99), Owl3D (stereo
3D for VR headsets). One line each; link none.

## 5. Recommended outline (H1 → H2/H3) with word budgets

```
H1  Immersity AI (LeiaPix) Alternatives in 2026: 8 Tools Tested on the Same Photo
    [≤ 60 w] Byline (Author: TBD) · "Last verified: 2026-09-XX" element · reading time
    [40–60 w] DIRECT ANSWER — snippet/AIO target, see §6
    [≤ 80 w] Intro: one photo through 8 tools; the three output types; what we excluded

H2  TL;DR — which alternative for which job                              (~120 w + table)
    4-row verdict table: Interactive on your site → Gifsy · Free video export, no
    account → CapCut / DepthFlow · Cheapest paid MP4/GIF → Animagen · Stay on Immersity
    if → you need 4K MP4/spatial video and can pay monthly

H2  How we compared (criteria + methodology)                             (~220 w)
    The §4 criteria in prose; test photo description (portrait, clear subject, plain-
    ish background, 2,000 px; plus a second "hard" photo: busy background); dates;
    "we make Gifsy, here's how we controlled for that" disclosure; exclusions list.

H2  What changed at Immersity AI (and why people are looking)            (~250 w)
    LeiaPix → Immersity rename · Free = watermark, 720p, non-commercial · $4.99–
    $99.99/mo credit plans · "We have discontinued credits à la carte" · homepage now
    sells displays, the web converter lives at app.immersity.ai · exports = JPG/PNG/
    HEIC/LIF + MP4/MKV/MOV/GIF + spatial/SBS/anaglyph · NO plan offers an embed.
    Dated screenshot of immersity.ai/pricing. Do NOT say Immersity is dead.

H2  The three kinds of "3D photo" tool (don't compare across them)      (~200 w)
    H3 Interactive embeds — Gifsy, Depthy (viewer only)
    H3 Video / GIF exporters — Immersity, Media.io, Animagen, CapCut, Motionleap, DepthFlow, Dzine
    H3 3D mesh generators — Meshy, Tripo: a different product; if you want a GLB you
       want a different article (no link)

H2  Head-to-head table (table snippet target)                          (table + ~60 w)
    Columns: Tool · Output · Interactive on your site? · Free tier · Watermark ·
    Price model (12-mo cost) · Photo leaves browser? · Best for
    Rows: 8 tools + Immersity itself as row 1 (template rule: include the original)

H2  The 8 alternatives, tested on the same photo                        (~150–190 w each)
    Each H3 in the SAME order: What you get · Free tier & price · Test result (image)
    · Honest limitation · Best for · "Verify" footnote date
    H3 1. Gifsy — interactive embed, $9 one-time            (live embed on page)
    H3 2. Depthy — free, interactive viewer, unmaintained, GIF export
    H3 3. Media.io 3D Image Maker — server-side, credits, video via image-to-video
    H3 4. Animagen — GIF/MP4, points packs, free = 2 watermarked
    H3 5. CapCut 3D Zoom — free, template-based, video, mobile/desktop/web
    H3 6. Motionleap (Lightricks) — mobile, subscription, camera-move 2.5D video
    H3 7. DepthFlow — open source (AGPL-3.0), GPU + Python, video, no watermark
    H3 8. Dzine — subscription credits, image→3D video, stylised
    (Order = by output type then by "closest to what an ex-LeiaPix user wanted",
    not by quality score. State that ordering rule in one sentence.)

H2  Gifsy vs Immersity AI, side by side                                 (~250 w + table)
    Two-column table on the §4 criteria, verdict-first per row.
    "Choose Immersity if…" (4 bullets: 4K MP4, spatial video for Apple Vision Pro /
    Leia displays, unlimited watermarked freebies, video-to-3D) /
    "Choose Gifsy if…" (4 bullets: visitor can drag it on your site, one-time price,
    photo stays in browser (Pro), Webflow/Framer embed).

H2  Putting the result on a Webflow, Framer or Squarespace site         (~120 w)
    Iframe snippet shape (no code dump), link to /guides/embed-3d-photo-on-website,
    note that Immersity/Media.io/Animagen outputs go in as <video> files instead.

H2  FAQ (8 Q — FAQPage JSON-LD)                                         (~400 w)
H2  Methodology, sources & update log                                   (~120 w)
    Test date, tool versions, pricing-check date, quarterly re-check promise,
    changelog list (first entry = publish date).
```

Total ≈ 2,300–2,500 words. If over, trim tool sections 5–8 to ~130 w, never the
criteria or the Immersity section.

## 6. Direct answer under the H1 (snippet / AI Overview target, 40–60 words)

> Immersity AI (formerly LeiaPix) turns a photo into a depth-parallax video; its free
> plan is watermarked, capped at 720p and non-commercial, and no plan offers a web
> embed. The closest alternatives split by output: Gifsy and Depthy give you something
> interactive, while Animagen, Media.io, CapCut, Motionleap, DepthFlow and Dzine export
> video or GIF. (52 words)

Follow it immediately with the TL;DR table — table + paragraph is the cite-able unit.

## 7. Per-tool verification checklist (writer MUST check live before publishing)

State on-page: "Prices and limits checked on <date>." Every fact below is a claim the
page makes; re-check each at the URL given and screenshot pricing pages (dated file
names, e.g. `immersity-pricing-2026-09-17.png`).

### Immersity AI (the incumbent — row 1 of the table)
Re-confirmed 2026-09-17 via fetch: Free $0 unlimited conversions, "2D|3D Conversion up
to 720p", "Watermarked Export Only", "No Commercial Use" · Image $4.99/500 cr · Image
Pro $14.99/1,700 · Video $24.99/3,300 · Video Pro $49.99/7,500 · Video MAX $99.99/
20,000 · 4K + no watermark + commercial on all paid · à-la-carte credits discontinued.
- [ ] Plans/prices/credits — https://www.immersity.ai/pricing
- [ ] Free-plan watermark + 720p + non-commercial wording — same URL (screenshot)
- [ ] Output formats (JPG/PNG/HEIC/LIF; MP4/MKV/MOV/GIF; spatial/SBS/anaglyph/depth map) — same URL + https://app.immersity.ai (log in, check export dialog)
- [ ] Embed support: confirm there is still no share-page/iframe option — export dialog in app.immersity.ai
- [ ] Homepage sells displays (not the converter) — https://www.immersity.ai/
- [ ] Watermark appears on the test export (run the photo on the free plan)

### 1. Gifsy (own product — verify against the live site, not memory)
- [ ] Free = 3 lifetime 3D generations, unlimited publishing, "Gifsy" badge on embeds; Pro = $9 one-time, unlimited, no badge, commercial use — https://www.gifsy.fun/pricing
- [ ] Outputs: share page `/s/<id>` + `<iframe>` embed `/embed/<id>`; no MP4 export — https://www.gifsy.fun/create
- [ ] Data flow wording matches https://www.gifsy.fun/privacy (photo stays in browser; Free sends depth-model activations for the second half of the model; Pro fully local; publishing uploads image/depth/mask/backdrop and the scene becomes public). Do NOT write "works offline".
- [ ] Orbit cone (~±23°) and ≥640 px guidance — check `components/CreateWorkshop.tsx` copy
- [ ] No expired launch-offer price anywhere in the article (README backlog: $5 code expired 09-12)

### 2. Depthy
Fetched 2026-09-17: "Displays Google Camera Lens Blur photos with 3D parallax effects and creates animated GIFs"; accepts custom depth maps; no pricing; no embed; no version/date signal; browser-support warning.
- [ ] Still loads and animates a photo in a current Chrome — https://depthy.stamina.pl/
- [ ] Export options (GIF only? size cap?) — in-app export panel
- [ ] Does it accept a plain JPG (auto-depth) or only Lens Blur / depth-map inputs — test with the same photo
- [ ] Last commit date — https://github.com/panrafal/depthy
- [ ] Any share URL / embed — confirm none

### 3. Media.io 3D Image Maker
Fetched 2026-09-17: "100% online. Free credits on signup."; output is a 3D-styled *image*, motion comes from the separate image-to-video tool; Free Trial = "3 daily check-in credits", "Up to 1 video", "720p exports" with watermark; Standard 100 cr/mo, Premium 200 cr/mo, "1080p exports without watermark"; regional pricing (dollar figures render client-side — read them in a browser).
- [ ] Tool page and what it outputs — https://www.media.io/image-effects/3d-image-maker.html
- [ ] Image-to-video step required for motion, credit cost per run — https://www.media.io/create/photo-animation-maker.html
- [ ] Standard / Premium monthly prices in USD, credits, watermark line — https://www.media.io/pricing.html (open in browser; template placeholders in the HTML)
- [ ] Free-tier watermark on the test export
- [ ] Share/embed: none expected — confirm in export dialog

### 4. Animagen (3dpicmaker.com)
Fetched 2026-09-17: Free "2 Free Videos + GIFs", 1080p 30fps, "With watermark"; Starter $9.99 (struck $11.99) = 12 watermark-free, 4K 60fps; Pro $39.99 (struck $79.99) = 80; points never expire; 7-day refund if unused. (Run 02's "$1/img" is from Animagen's own listicle — the pricing page is the authority.)
- [ ] Packs, prices, strike-through promo still live — https://www.3dpicmaker.com/pricing.html
- [ ] Free count + watermark + 1080p cap — same URL
- [ ] Output formats (GIF + MP4) and max resolution — https://www.3dpicmaker.com/
- [ ] Upload/processing is server-side — confirm in app
- [ ] Embed: none expected — confirm

### 5. CapCut "3D Zoom"
Search only (capcut.com returned HTTP 451 to the fetch tool — open in a browser). Reported: template-based ("3D Zoom" template library), free export without watermark for standard projects, but "certain templates, effects, AI tools, and Pro assets can trigger watermarks"; delete the ending logo clip; also a web "3D photo effect" that exports JPG/PNG.
- [ ] 3D Zoom template exists on mobile + desktop + web; which one you used — https://www.capcut.com/resource/capcut-3d-zoom
- [ ] Whether the 3D Zoom template is a Pro asset today and whether export adds a watermark — test an actual export on the free tier
- [ ] CapCut Pro price (monthly/annual, region) — https://www.capcut.com/pricing (or in-app)
- [ ] Output = MP4 only; resolution cap on free — export dialog
- [ ] Processing: upload to CapCut servers vs on-device — note that CapCut is ByteDance-owned; state only what the privacy policy says (https://www.capcut.com/privacy)

### 6. Motionleap (Lightricks)
Search only (motionleap.app did not resolve). Reported: iOS/Android app, freemium subscription, App Store IAP tiers seen at $3.99–$59.99 (varies by region), 2.5D via camera-move "3D" tools, watermark removal is a paid feature; one 2026 review claims the app is in "sunset" mode / no longer supported while Google Play shows a v1.9.38 release on 2026-08-02. **Contradictory — verify; do not write "discontinued" unless Lightricks says so.**
- [ ] App still listed + last update date — https://play.google.com/store/apps/details?id=com.lightricks.pixaloop and https://apps.apple.com/us/app/motionleap-by-lightricks/id1381206010
- [ ] Current IAP prices in the store listing's "In-App Purchases" section (screenshot)
- [ ] Free tier: watermark on export? resolution cap? — export from the free app
- [ ] Which feature produces the parallax (3D Photo / Camera FX) and the output (MP4, GIF?)
- [ ] Any Lightricks statement on support status — https://help.lightricks.com/ (search "Motionleap")

### 7. DepthFlow (BrokenSource)
Fetched 2026-09-17: "Images to 3D parallax effect videos"; AGPL-3.0; "Free and Open Source", "no watermarks, unlimited usage", "Commercial use is encouraged"; GitHub Sponsors optional; "up to 8k50fps rendering with an RTX 3060-class GPU"; docs at depth.tremeschin.com.
- [ ] License string (AGPL-3.0 vs any dual/commercial licence note) — https://github.com/BrokenSource/DepthFlow
- [ ] Install requirements: Python version, GPU/OpenGL, Windows/macOS/Linux — https://depth.tremeschin.com/ (installation page)
- [ ] Output formats (MP4/WebM/GIF? loop export?) and whether any web/embed export exists (expect none)
- [ ] Time-to-first-render on a laptop *without* a discrete GPU — record it; this is the honest limitation
- [ ] Latest release version/date — GitHub releases / https://pypi.org/project/depthflow

### 8. Dzine
Fetched 2026-09-17: Beginner $8.99/mo (promo $4.49 first month) 1,000 cr; Creator $24.99/mo 6,000 cr; Master $59.99/mo 9,000 cr; Master Pro $149.99/mo 30,000 cr; free = "100 Credits after sign-up, valid for 12 months"; "Commercial Use" on paid plans; watermark policy not stated on pricing page; has a "3D AI Video Generator" (image→3D video) and a separate image-to-3D-*model* tool (exclude that one).
- [ ] Plans/credits/promo — https://www.dzine.ai/pricing/
- [ ] The feature actually used and its credit cost per generation — https://www.dzine.ai/tools/3d-ai-video-generator/ (run it; note credits deducted)
- [ ] Free-tier watermark and commercial-use wording — https://www.dzine.ai/faq/
- [ ] Output (MP4? length? resolution?) — export dialog
- [ ] Clarify on-page that Dzine's "Image to 3D Model" is a mesh tool and not what this article compares

### Sources to cite in the Methodology section (external, authoritative, non-obvious)
- immersity.ai/pricing (dated screenshot) — primary
- Aiseesoft LeiaPix review (the rename + credit history) — https://www.aiseesoft.com/resource/leiapix-converter.html
- Depth Anything V2 paper (what single-image depth can and can't do) — https://arxiv.org/abs/2406.09414
- DepthFlow repository (for the OSS claim) — https://github.com/BrokenSource/DepthFlow
- Google Play / App Store listings for Motionleap (update dates)

## 8. FAQ (8 questions — write 40–90 word answers, mark up with FAQPage)

1. **Is the LeiaPix converter still free?** Yes, as "Immersity for Web" Free: unlimited conversions but watermarked, 720p max, non-commercial. The unwatermarked tiers start at $4.99/mo (Image, 500 credits). Checked <date>.
2. **Does Immersity AI put a watermark on exports?** On the Free plan, yes ("Watermarked Export Only"); all paid plans remove it.
3. **What is the difference between LeiaPix and Immersity AI?** Same company/product, renamed; the converter moved to app.immersity.ai; the homepage now sells displays. Credits à la carte were discontinued.
4. **Can I embed an Immersity AI animation on my website?** Not as an interactive element — every plan exports files (MP4/GIF/images). You can embed the MP4 as a `<video>`; for a draggable 3D photo you need a tool that hosts an embed (Gifsy) or a viewer you self-host (Depthy, DepthFlow output is still video).
5. **Is there a free Immersity AI alternative without a watermark?** DepthFlow (open source, needs a GPU) and CapCut's 3D Zoom (standard projects export clean, some templates don't) — Depthy is free and unwatermarked but GIF-only and unmaintained. Gifsy Free shows a badge; Pro removes it for $9 one-time.
6. **Interactive embed or video export — which should I pick?** Video for Instagram/YouTube/TikTok and email; interactive for a website hero, portfolio or product page where the visitor can drag it. State the trade-off: video works everywhere, interactive needs an iframe.
7. **Is Meshy (or Tripo) an Immersity AI alternative?** No — they generate 3D meshes (GLB/OBJ) from an image; Immersity generates a depth-parallax animation. Different output, different use.
8. **Does Gifsy upload my photo?** The photo stays in the browser. On Free, intermediate depth-model activations (not the image) go to the server for one step; Pro runs fully locally. Publishing uploads the finished scene (image, depth, mask, backdrop) and makes it public. Link /privacy.

(Q1 and Q5 also answer the Aiseesoft-style PAA "How to use LeiaPix for free?". Manual
check in a browser for actual PAA wording is still outstanding — README §Manual checks.)

## 9. Structured data (three blocks, one `<script type="application/ld+json">` each or a `@graph`)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Gifsy", "item": "https://www.gifsy.fun/" },
        { "@type": "ListItem", "position": 2, "name": "Alternatives", "item": "https://www.gifsy.fun/alternatives" },
        { "@type": "ListItem", "position": 3, "name": "Immersity AI alternatives", "item": "https://www.gifsy.fun/alternatives/immersity-ai" }
      ]
    },
    {
      "@type": "ItemList",
      "name": "Immersity AI (LeiaPix) alternatives tested on the same photo",
      "itemListOrder": "https://schema.org/ItemListOrderAscending",
      "numberOfItems": 8,
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Gifsy", "url": "https://www.gifsy.fun/alternatives/immersity-ai#gifsy" },
        { "@type": "ListItem", "position": 2, "name": "Depthy", "url": "https://www.gifsy.fun/alternatives/immersity-ai#depthy" },
        { "@type": "ListItem", "position": 3, "name": "Media.io 3D Image Maker", "url": "https://www.gifsy.fun/alternatives/immersity-ai#media-io" },
        { "@type": "ListItem", "position": 4, "name": "Animagen", "url": "https://www.gifsy.fun/alternatives/immersity-ai#animagen" },
        { "@type": "ListItem", "position": 5, "name": "CapCut 3D Zoom", "url": "https://www.gifsy.fun/alternatives/immersity-ai#capcut" },
        { "@type": "ListItem", "position": 6, "name": "Motionleap", "url": "https://www.gifsy.fun/alternatives/immersity-ai#motionleap" },
        { "@type": "ListItem", "position": 7, "name": "DepthFlow", "url": "https://www.gifsy.fun/alternatives/immersity-ai#depthflow" },
        { "@type": "ListItem", "position": 8, "name": "Dzine", "url": "https://www.gifsy.fun/alternatives/immersity-ai#dzine" }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "Is the LeiaPix converter still free?",
          "acceptedAnswer": { "@type": "Answer", "text": "<final answer text, identical to on-page copy>" } }
        /* …one Question per FAQ item, 8 total, text must match the visible answers verbatim */
      ]
    }
  ]
}
```

Rules: `Article` schema with `author`/`datePublished`/`dateModified` is optional and
can be added once the byline is confirmed; `SoftwareApplication` stays on `/`, not
here. Do not add `Review`/`AggregateRating` (no ratings to mark up). If the
`/alternatives` index route does not exist at launch, drop breadcrumb item 2. Validate
with the Rich Results Test before indexing. Build these with the shared JSON-LD helper
the README backlog calls for (`FAQPage`, `BreadcrumbList`, `ItemList`).

## 10. Internal links (in-body, keyword anchors; first one within the first 40%)

| Target | Anchor text | Where |
|---|---|---|
| `/` | "interactive 3D photo maker" | Gifsy H3, first sentence |
| `/create` | "make a 3D photo from one image" | Gifsy H3 CTA; and the Gifsy-vs-Immersity "choose Gifsy if" block |
| `/guides/embed-3d-photo-on-website` | "embed a 3D photo on your website" | "Putting the result on a Webflow…" H2 and FAQ Q4 |
| `/guides/how-3d-photos-work` | "how single-image depth parallax works" | "Three kinds of tool" H2 (interactive H3) and the limitation line in the Gifsy H3 |
| `/pricing` | "Gifsy pricing: Free vs $9 one-time Pro" | table footnote + Gifsy H3 |
| `/privacy` | "privacy page" | FAQ Q8 |

Both guides are not yet built (run 06 order: this page ships first). Either ship them in
the same release or link to `/` with the same anchors and swap when the guides exist —
do not link to 404s. Inbound: link this page from `/pricing` ("compare to Immersity
AI") and from the two guides once live; add to `app/sitemap.ts` (priority 0.7, monthly).

## 11. Technical / on-page

- **Title (A, adopted in README):** `Immersity AI Alternatives (2026): 8 Tools Tested & Compared` (59)
- **H1 / OG title:** `Immersity AI (LeiaPix) Alternatives in 2026: 8 Tools Tested on the Same Photo`
- **Meta (158):** `Immersity AI (ex-LeiaPix) now watermarks free exports. We ran one photo through 8 alternatives — including the only one that embeds as an interactive 3D photo.`
- **Canonical:** `https://www.gifsy.fun/alternatives/immersity-ai`; `openGraph.url` same. A `/alternatives/leiapix` route should 308 → this URL.
- **Snippet formats:** paragraph (direct answer) + table (head-to-head). Keep the head-to-head table ≤ 8 columns, real `<table>` markup, `<th>` headers.
- **"Last verified" element:** visible `<p class="verified"><time datetime="2026-09-XX">Prices and limits verified 17 September 2026</time></p>` directly under the byline AND repeated above the head-to-head table; feed `dateModified` from the same value. **Quarterly re-check note** in Methodology: "We re-check every pricing page in this article each quarter (next: December 2026) and log changes below." Maintain a visible changelog list.
- **Images:** one result GIF/WebP per tool (same photo, same crop, ≤ 300 KB each, `alt` = "<tool> parallax result on the test photo"), dated Immersity pricing screenshot, one live Gifsy iframe (lazy-loaded, below the fold, with the optional nofollow credit line per run 08). Server-render all copy — no client-only sections (run 04/05 crawlability finding).
- **Disclosure line** near the top: "Gifsy is our product. We tested it with the same photo and the same criteria as the other seven, and we say where it loses."

## 12. E-E-A-T signals required

- Named author (TBD) with a one-line credential ("built Gifsy's depth pipeline"); until confirmed, publish with "Gifsy team" and add the person later.
- First-person test notes per tool: time to result, one UI quirk, one thing that surprised you — nothing generic that could be written without running the tool.
- Dated screenshots of every pricing page; dated result images.
- Honest limitation for every tool including Gifsy (see §4). If the writer cannot find a real limitation for a tool, the section isn't finished.
- No fabricated stats, user counts or testimonials. No "trusted by" claims.

## 13. Test assets to produce (before writing)

1. Two test photos (one easy portrait, one hard busy-background) at ≥ 2,000 px, rights-cleared (own photo).
2. Run both through all 8 tools + Immersity Free; keep the raw exports; record date, plan used, time-to-result, credits consumed, watermark presence.
3. Screenshots: immersity.ai/pricing, 3dpicmaker.com/pricing.html, dzine.ai/pricing, media.io/pricing.html, Motionleap store IAP list, CapCut Pro pricing.
4. Publish one Gifsy scene from the easy photo for the live embed.

## 14. Resource assessment

- **Effort:** High — 2,400 words + 9 hands-on tests + assets + JSON-LD + sitemap + redirect ≈ 16–20 h.
- **3-month target:** top 10 for "Immersity AI alternative" and "LeiaPix alternative"; 6-month: top 5.
- **Refresh:** quarterly pricing re-check (Dec 2026 first), re-date the page; that is the freshness edge the directories can't match.

## 15. Questions for the writer / owner before drafting (human-input framework)

1. Which of the 8 tools would *you* actually recommend to an ex-LeiaPix user who just wants a free MP4 — and why? (Drives the TL;DR row 2.)
2. What broke or surprised you when running the hard photo through Gifsy? (Goes in the Gifsy limitation line — real, not generic.)
3. Byline: can the founder's name be published on this page? (Blocks the `Article`/`author` schema and the E-E-A-T byline.)
4. Will `/guides/embed-3d-photo-on-website` ship with this page, or do we temporarily point those anchors at `/`?

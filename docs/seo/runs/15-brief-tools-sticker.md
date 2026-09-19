# Run 15 — content-brief: `/tools/sticker` ("telegram sticker maker")

Date: 2026-09-17 · Skill: `content-brief` (tool / landing-page template) ·
Builds on run 04 (SERP + keyword decision, done), run 05 §4 (page audit),
`_brief-context.md` (honesty constraints). Author: TBD.

Every product claim below was checked against the code on 2026-09-17:
`app/tools/sticker/page.tsx`, `components/StickerWorkshop.tsx`,
`components/ImportGuide.tsx`, `lib/sticker.ts`, `lib/export.ts`. Anything
not listed under "Verified product facts" must not appear in the copy.

---

## 0. Verified product facts (the only features the copy may describe)

| Fact | Source in code |
|---|---|
| Input: one photo, any `image/*` the browser can decode (PNG, JPG, WebP; HEIC only where the browser supports it — do not promise HEIC) | `Uploader.tsx:150`, drop-zone label "PNG · JPG · WebP" |
| Background removal runs in the browser with the ISNet model (`@imgly/background-removal`, `isnet_fp16` default); model chunks (~24 files) are fetched from a CDN on first run and cached (`cache: "force-cache"`) | `lib/sticker.ts` `cutout()` |
| Status strings the user actually sees: "Loading AI model (first time only)…", "Removing background…", "Adding outline…" | `StickerWorkshop.tsx:86-95` |
| Edge cleanup: de-halo + 1 px feather, auto-crop to the subject, centre on a square canvas with an 8 % margin (plus outline width and shadow room) | `lib/sticker.ts` `composeSticker()` / `refineCutout` |
| Outline: 0–40 px slider, **default 16 px**, any colour, **default white**; drawn as three stacked rings of a tinted silhouette so it follows the feathered edge smoothly | `StickerWorkshop.tsx:37-38, 154-156`; `composeSticker` outline loop |
| Drop shadow: **on by default**, soft black contact shadow (50 % black, blurred ~9 px, offset ~10 px down at 512) | `StickerWorkshop.tsx:39`; `composeSticker` shadow block |
| Caption: optional, max 24 characters, rendered UPPERCASE, heavy weight, white fill with dark stroke, bottom of the sticker | `StickerWorkshop.tsx:179-180`; `drawCaption()` |
| Output 1: transparent **PNG, 512×512** | `composeSticker(..., size = 512)` |
| Output 2: **WebP 512×512**, quality starts at 0.92 and is stepped down (−0.12 per pass, floor 0.4) until the file is **≤ 512 KB** | `lib/export.ts` `toStickerWebp()` |
| Post-result note shown in the UI: "512×512 and transparent — the right size for Telegram stickers." | `StickerWorkshop.tsx:106` |
| "Download + open @Stickers" button downloads the **PNG** and opens `https://t.me/stickers` in a new tab; a secondary link downloads the WebP | `ImportGuide.tsx` |
| The in-app @Stickers walkthrough: `/newpack` (not `/newemojipack`) → name the pack → send the image **as a file** → reply with one emoji to tag → repeat → `/publish` → short link → `t.me/addstickers/…` → "Add Stickers" | `ImportGuide.tsx` `<ol>` |
| The 100×100 trap, verbatim from the app: "Got 'exactly 100×100 pixels'? That's Telegram's custom-emoji size — you started an emoji pack. Send `/newpack` instead for a sticker pack; our 512×512 file is already the right size." | `ImportGuide.tsx` |
| Free, no account, no watermark (nothing in the sticker pipeline adds one) | `page.tsx` meta; pipeline |
| Nothing is uploaded: the whole pipeline is `cutout → composeSticker → toStickerWebp` on canvas/WASM in the tab; the only network traffic is the model download | same files |

**Not supported — never claim:** WhatsApp packs, animated/video stickers
(TGS/WEBM), Telegram custom emoji (100×100), batch/multi-photo, brush
erase/restore, printing, iMessage/Discord "packs" (the PNG can be used there
as an image, that is all), HEIC on browsers that cannot decode it.

**Telegram facts and where they come from (cite these, not blogs):**

- Spec page: **https://core.telegram.org/stickers#static-stickers-and-emoji**
  — verbatim: "For stickers, one side must be exactly **512 pixels** in
  size – the other side can be 512 pixels **or less**." · "For emoji, images
  must be exactly **100x100 pixels** in size." · "The image file must be in
  either .PNG or .WEBP format." · **"Tip: a transparent background, white
  stroke and black shadow effect will make your sticker stand out."**
  (Checked 2026-09-17. Anchor exists as `name="static-stickers-and-emoji"`.)
- Same page, `#in-app-sticker-maker` and `#stickers-mini-app`: Telegram has a
  built-in Sticker Editor (phone) and a Stickers mini app. The page must
  acknowledge this — our angle is "from a browser / desktop, with an AI
  cutout, without your phone".
- Bot API `https://core.telegram.org/bots/api#uploadstickerfile`: accepts
  ".WEBP, .PNG, .TGS, or .WEBM" and points back to the spec page.
- **The 512 KB cap is NOT on the public spec page any more** (it lists sizes
  only for TGS 64 KB and WEBM 256 KB). It is enforced by the @Stickers bot
  itself when you send a file. The code comment in `lib/export.ts` and every
  competitor repeat "512 KB". **Writer/founder must reproduce it:** send a
  >512 KB PNG to @Stickers, screenshot the bot's rejection text, and quote
  that message verbatim in the spec section. Until that screenshot exists,
  phrase it as "the @Stickers bot rejects static stickers larger than 512 KB"
  and attribute it to the bot, not to the spec page.

---

## 1. Target keyword analysis

| | |
|---|---|
| Primary | **telegram sticker maker** — Moderate (rubric 4/10, run 04) — Transactional-tool |
| Secondary (H2/body) | online sticker maker from photo · photo to sticker · telegram sticker 512x512 webp · sticker maker no upload |
| Supporting long-tails (section anchors, FAQ) | photo to sticker white outline · telegram sticker size · telegram sticker png or webp · telegram sticker send as file · "exactly 100x100 pixels" telegram · make telegram stickers without an app · telegram sticker maker online free no app |
| Dominant intent | Transactional-tool: the searcher wants a file they can drop into @Stickers now. Informational sub-intent ("what size / how do I add it") rides along and is answered *below* the tool. |
| Difficulty strategy | Moderate → 6–12 months for top 5 on the head phrase; the spec long-tails (512×512 / WebP vs PNG / no-upload) are small-site SERPs and should move in 60–90 days once the page is server-rendered and indexed. |
| Content type | **landing-page (tool)** per `references/content-types-overview.md`, with how-to and FAQ sections grafted on. Schema: `SoftwareApplication` + `HowTo` + `FAQPage`. |
| Word budget | **1,800–2,200 words server-rendered** (run 04). This exceeds the template's 800–1,500 transactional range on purpose: the top-5 average for the qualified SERP is ~2,240 (LightX 1,100 · insMind 2,800 · StickerBeam 2,800 · GIFDB 2,500 · Filmora 2,000). Do not pad past 2,200; the tool must stay above the fold. |
| Core entities that must appear | Telegram · @Stickers bot · 512×512 (px) · WebP / PNG · transparent background · white outline (stroke) · drop shadow · background removal / cutout · sticker pack · `/newpack` `/publish` · send as file · custom emoji 100×100 · in your browser / no upload |

Do **not** use "sticker maker" alone in title/H1 — the bare term is a print
SERP (StickerYou, Jukebox, Amazon cutting machines). "WhatsApp" appears on
the page exactly once, in the "not supported" section, so the page does not
attract WhatsApp searchers who would pogo-stick.

---

## 2. SERP competitive intelligence (from run 04, condensed)

| Competitor | ~Words | Format | Covers | Misses (our opening) |
|---|---|---|---|---|
| LightX — lightxeditor.com/photo-editing/telegram-sticker-maker/ | 1,100 | tool landing, 3-step, 5-Q FAQ | AI cutout + outline, per-platform page family | JPG/PNG only, **no WebP, no 512 px rule, no 512 KB, no @Stickers flow**, server-side upload, account implied, no author/date |
| insMind — insmind.com/photo-editor/photo-to-sticker-maker | 2,800 | tool landing, 11 H2s, testimonials | AI cutout, text/clipart, "sticker packs for social", 11-tool cluster | No Telegram spec, no WebP, no 512, server-side; testimonials unverifiable |
| StickerBeam — stickerbeam.com | 2,800 | tool landing + editorial | **in-browser, no upload, outline, PNG + 512 WebP**, honest cutout tips (hair/fur/glass), spoke pages | WhatsApp-oriented; **no Telegram / @Stickers flow**; low authority but already page 1 for "photo to sticker" |
| GIFDB image-to-sticker | 2,500 | tool + guide | 512×512 PNG, explicit Telegram @stickers steps | No AI cutout on busy backgrounds, no outline/shadow/caption, no WebP size cap |
| Filmora listicle (28 Jul 2026, Shanoon Cox) | 2,000 | listicle | "512×512 PNG transparent" | Not one browser-only, no-upload tool listed |
| core.telegram.org/stickers | — | official spec | 512 rule, PNG/WebP, white stroke + black shadow tip, in-app editor | Not a tool; no cutout |

SERP features (not observable by tooling — **manual check before writing**):
PAA questions for "telegram sticker maker", "telegram sticker size", "how to
make telegram stickers from photo"; whether an AI Overview shows; whether the
app-store carousel sits above the fold. Record verbatim PAA questions and map
them onto the FAQ below (replace, don't add).

---

## 3. Content gap analysis (exact sections nobody on page 1 has)

1. **Telegram-correct file, stated as spec compliance.** "One side exactly
   512 px" + PNG/WebP + ≤512 KB + send-as-file, quoted from
   core.telegram.org, next to the sentence "the WebP you download is already
   512×512 and re-encoded until it is under 512 KB". LightX/insMind/Filmora
   say "512×512 PNG" at best; none mention WebP or the size cap.
2. **The @Stickers bot flow on the tool page, with the 100×100 trap.**
   Only guides have the flow; no tool page does; nobody explains the
   "exactly 100×100 pixels" error (it means you typed `/newemojipack`).
3. **"White stroke and black shadow" is Telegram's own tip** — cite it, then
   say the tool's defaults are exactly that (16 px white outline + soft black
   shadow, both on by default). Frames the feature as compliance, not
   decoration. Zero competitors cite this line.
4. **Send as file, and why.** Telegram recompresses images sent as *photos*
   (JPEG, resized) which strips transparency; sending as a *file* keeps the
   PNG/WebP intact. GIFDB touches it; nobody explains the reason.
5. **AI cutout + no upload + outline + 512 WebP on one page.** Stickerfy has
   no-upload but no outline/Telegram; GIFDB has 512 but no AI; imageonline
   has outline but only solid-colour removal; LightX/insMind have AI but
   upload. Say the combination plainly, in one sentence, without a
   competitor table (the page is transactional; a table belongs on a guide).
6. **Honest limits** (only StickerBeam does this): fine hair/fur, glass and
   transparent objects, subjects that touch the frame edge, low-contrast
   subject-vs-background, tiny subjects in wide shots, first-run model
   download time.
7. **WebP vs PNG for Telegram** as a 4-row table (quality, size, transparency,
   when to pick which). Nobody explains it.
8. **Explicit "WhatsApp packs are not supported, and why."** WhatsApp packs
   are only added through a companion app (WhatsApp's own sticker-pack API is
   app-to-app on the phone); there is no bot or web route. The PNG still
   works as an ordinary image in any chat.
9. **Acknowledge Telegram's own in-app Sticker Editor** and position against
   it: phone-only, no AI subject cutout, no desktop/browser route. Honest and
   nobody else does it.

---

## 4. Recommended page structure

Page order matters: transactional intent means the tool is the first thing
under the H1. The explainer paragraph is the *only* prose above the uploader.
Everything from §4.3 down is a server-rendered body in
`app/tools/sticker/page.tsx` beneath `<StickerWorkshop />` (keep the
interactive `ImportGuide` inside the workshop after a result; duplicating the
words is fine).

### 4.1 Head

- `<title>` (57): **Telegram Sticker Maker — Photo to 512px Sticker, Free | Gifsy**
- Meta description (158): `Turn any photo into a Telegram-ready sticker in your browser: AI cutout, white outline, shadow, caption. Exports 512×512 WebP or PNG. Free, no upload, no account.`
- Canonical `https://www.gifsy.fun/tools/sticker`; `openGraph.url` same; own OG image = three example stickers on a checkerboard.

### 4.2 H1 + explainer (above the uploader, ~60–80 words) — first paint

**H1:** Telegram sticker maker — turn a photo into a sticker in your browser

Explainer draft (writer may tighten, keep every fact): "Drop a photo. Gifsy
removes the background with an AI model that runs inside your browser, adds
a white outline and a soft shadow — the look Telegram's own sticker guide
recommends — and gives you a transparent 512×512 PNG or WebP under 512 KB,
the exact size the @Stickers bot accepts. Free, no account, and your photo
is never uploaded."

*Primary keyword appears in H1 and inside these first 100 words.*

### 4.3 Tool (`<StickerWorkshop />`) — unchanged, but change its root
`<main>` → `<div>` (nested `<main>`, run 05).

### 4.4 H2 — How to make a Telegram sticker from a photo (~220 words) — **HowTo JSON-LD**

**Featured-snippet target (ordered list, 3 items, ≤ 60 words total):**

1. Drop a photo (PNG, JPG or WebP) onto the sticker maker — the AI cutout
   runs in your browser.
2. Set the outline width and colour, toggle the drop shadow, add an optional
   caption (up to 24 characters).
3. Click Make Sticker and download the 512×512 WebP for Telegram, or the
   transparent PNG.

Then one short paragraph per step in prose: what "Loading AI model (first
time only)" means (model chunks downloaded once, cached; seconds to a minute
depending on connection); that auto-crop centres the subject with a margin so
the outline never gets clipped; that the caption is rendered in caps with a
dark stroke so it reads on any chat background.

### 4.5 H2 — Add it to Telegram with the @Stickers bot (~300 words)

Intro sentence: Telegram builds packs through its official bot, so this
works from any browser or desktop — no app needed — and gives you a
`t.me/addstickers/…` link anyone can add.

`<ol>` (mirror `ImportGuide.tsx` exactly, one action per step):

1. Open **@Stickers** in Telegram and send `/newpack` — a **sticker** pack,
   not `/newemojipack` — then give the pack a name.
2. Send the downloaded image **as a file** (attach → File), so Telegram keeps
   it at full 512×512 with transparency. Sending it as a photo makes Telegram
   recompress it to JPEG and the bot will reject it.
3. When prompted, reply with one emoji to tag the sticker. It only labels
   the sticker for the emoji-suggestion panel — it is still a sticker.
4. Repeat for more stickers, then send `/publish` and choose a short link name.
5. Open the `t.me/addstickers/…` link and tap **Add Stickers**.

**H3 — Getting "exactly 100×100 pixels"? You started an emoji pack** (~80
words; this is the highest-information-gain paragraph on the page — keep the
app's wording): 100×100 is Telegram's *custom-emoji* size. The bot says it
when you began with `/newemojipack`. Send `/newpack` instead; the 512×512
file you already downloaded is the right size for a sticker pack.

**H3 — Telegram's built-in Sticker Editor vs this page** (~70 words): the
in-app editor (Telegram 10.x, April 2024) crops a photo with your finger on a
phone; there is no desktop or browser version and no automatic subject
cutout. Use it for a quick one-off; use this page when you want a clean AI
cutout, an outline, or you are at a computer. Link to
core.telegram.org/stickers#in-app-sticker-maker.

Screenshot: the @Stickers chat showing `/newpack` → file sent → emoji → `/publish` → link (see §7).

### 4.6 H2 — Telegram sticker size and format (512×512, PNG or WebP, under 512 KB) (~320 words)

**Paragraph-snippet target (40–60 words, first paragraph under this H2):**
"A static Telegram sticker must be a PNG or WebP with a transparent
background where one side is exactly 512 pixels and the other is 512 or
less. The @Stickers bot also rejects files over 512 KB. Gifsy exports both
formats at 512×512 and shrinks the WebP until it fits."

Then, as an `<ul>` quoting **https://core.telegram.org/stickers#static-stickers-and-emoji** verbatim (blockquote the four lines listed in §0), followed by the tip line: *"Tip: a transparent background, white stroke and black shadow effect will make your sticker stand out."* → one sentence: that tip is the tool's default output (16 px white outline + soft black shadow, both on unless you turn them off).

**H3 — PNG or WebP for Telegram?** Table (snippet-eligible, 4 rows):

| | PNG | WebP |
|---|---|---|
| Transparency | yes (lossless) | yes |
| Typical size for a 512×512 sticker | 150–500 KB, can exceed 512 KB on detailed photos | usually 30–120 KB; Gifsy re-encodes until ≤ 512 KB |
| Quality | exact pixels | lossy; Gifsy starts at 0.92 quality and only steps down if the cap is hit |
| Pick it when | you want the untouched cutout, or for Discord/Signal/iMessage image use | you are sending to @Stickers (guaranteed under the cap) |

(Fill the "typical size" cells from real exports of the three screenshot
photos — measured numbers, not estimates. Replace the ranges above with what
you measured.)

**H3 — Why "send as file" matters** (~70 words): Telegram treats anything
sent as a photo as a JPEG to be resized and compressed; the alpha channel is
gone and the size may no longer be 512. Attach → File bypasses that.

### 4.7 H2 — Your photo never leaves your browser (~180 words)

Verifiable, not marketing: the background-removal model (ISNet, via
`@imgly/background-removal`) is downloaded to the browser in ~24 chunks the
first time and cached after; the cutout, outline, shadow, caption and WebP
encoding all run on a canvas in the tab; there is no upload endpoint on this
page and no account. State what *is* downloaded (model weights from a CDN)
so the claim survives a network-tab check. Say "close the tab and it's
gone". Do **not** say "works offline" (first run needs the model download).
Do not mention the 3D tool's server step here — it is irrelevant to stickers
and would confuse the privacy statement; the stickers page is the one place
on the site where "100 % in-browser" is true without caveats.

### 4.8 H2 — What photos make good stickers (and what the cutout gets wrong) (~220 words)

Works best: one clear subject, plain or blurred background, subject fully
inside the frame, ≥ 600 px on the short side, face/pet/object with a hard
edge. Struggles (say so): flyaway hair and fur (edge goes soft or nibbled),
glass/transparent objects and steam, subjects that touch the frame edge
(auto-crop cannot pad what is not there), low-contrast subject vs background
(white dog on snow), several people touching (cut as one blob), tiny
subjects in wide shots (512 px output makes them blurry). Practical fixes:
crop closer before dropping the photo; a thicker outline hides a ragged
edge; there is no manual erase brush on this tool — if the cutout is wrong,
try a different photo.

### 4.9 H2 — Also works as a transparent PNG for Discord, Signal, iMessage — but not WhatsApp packs (~150 words)

Two paragraphs. (1) The PNG is a normal transparent image: paste it into
Discord/Signal/iMessage/Slack as an image; Signal's sticker-pack creator
(desktop) also takes 512×512 PNG/WebP — **only say this if verified** by
the writer, otherwise drop Signal packs. (2) **WhatsApp sticker packs are not
supported.** WhatsApp only adds packs through a companion app on the phone
(its sticker API is app-to-app); there is no bot, link or web route, so a
browser tool cannot finish the job. You can still send the PNG as an image
in WhatsApp; it will not become a sticker. Do not build or promise a
WhatsApp mode.

### 4.10 H2 — Frequently asked questions (~400 words, 9 Q) — **FAQPage JSON-LD**

Answers 40–80 words each, direct first sentence. Replace with verbatim PAA
wording where the manual SERP check finds a match.

1. Is the Telegram sticker maker free? — Yes, always; no account, no
   watermark, no limit on how many you make. (The paid product on this site
   is the 3D photo embed, separate.)
2. Is my photo uploaded anywhere? — No; the AI model runs in your browser
   (model weights are downloaded, your photo is not).
3. What size does a Telegram sticker need to be? — One side exactly 512 px,
   other ≤ 512, PNG or WebP, transparent; the bot rejects files over 512 KB.
4. Should I use PNG or WebP? — WebP for @Stickers (always under the cap);
   PNG for the untouched cutout or other apps.
5. Why does Telegram say "exactly 100×100 pixels"? — You started an emoji
   pack (`/newemojipack`); use `/newpack`.
6. Can I make WhatsApp stickers with this? — No packs; WhatsApp needs a
   companion app on the phone. The PNG works as a plain image.
7. Why did the first run take so long? — One-time model download, cached
   afterwards; later runs take seconds.
8. Can I add text to the sticker? — Yes, a caption up to 24 characters,
   rendered in caps with a dark stroke at the bottom.
9. Can I make animated Telegram stickers? — No; this tool exports static
   PNG/WebP only. Telegram animated stickers are TGS/WEBM. To animate a
   photo, use the [GIF maker](/tools/gif) (that is a GIF, not a Telegram
   sticker — say so).
10. (optional) Can I remove the outline or shadow? — Yes: outline slider to
    0, shadow toggle off.

### 4.11 Related / next step (~60 words, plain links)

- [Animate a photo into a GIF](/tools/gif) — same no-upload approach.
- [Make an interactive 3D photo](/create) — the paid wedge; place this link
  also in the post-download result area of the workshop (run 05 D7).
- [How to make Telegram stickers from a photo without an app](/guides/telegram-sticker-pack-from-browser) — planned.
- [Telegram sticker size: 512×512, WebP vs PNG](/guides/telegram-sticker-size) — planned.
- Gallery link stays in nav.

Word tally: 80 + 220 + 300 + 150 + 320 + 180 + 220 + 150 + 400 + 60 ≈ 2,080.

---

## 5. Hub & spoke

`/tools/sticker` is the **hub** of a three-page mini-cluster (tool + two
guides). Linking pattern:

- Tool → both guides (in-body, §4.5 and §4.6, keyword anchors "make Telegram
  stickers without an app", "Telegram sticker size 512×512") + Related block.
- Each guide → tool in the first 40 % with anchor "Telegram sticker maker",
  plus a CTA block after the steps; guides link each other once.
- Inbound to the tool (currently **zero** `<a href>` site-wide): homepage
  hero text link under the uploader, footer nav, `SiteNav`, `/tools/gif`
  body ("turn the same photo into a Telegram sticker"). Anchors: "Telegram
  sticker maker" / "photo to sticker".
- Sitemap: add both guide URLs when live.

---

## 6. Technical on-page

- **Schema (three blocks, one `<script type="application/ld+json">` each, rendered server-side in `page.tsx`):**

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Gifsy Telegram Sticker Maker",
  "url": "https://www.gifsy.fun/tools/sticker",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Web browser",
  "browserRequirements": "Requires JavaScript and WebAssembly",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "featureList": "AI background removal in the browser, outline, drop shadow, caption, 512×512 PNG and WebP export under 512 KB",
  "publisher": { "@type": "Organization", "name": "Gifsy", "url": "https://www.gifsy.fun" }
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to make a Telegram sticker from a photo",
  "totalTime": "PT2M",
  "estimatedCost": { "@type": "MonetaryAmount", "currency": "USD", "value": "0" },
  "tool": [{ "@type": "HowToTool", "name": "Gifsy Telegram Sticker Maker" }],
  "step": [
    { "@type": "HowToStep", "name": "Drop a photo", "text": "Drop a PNG, JPG or WebP onto the sticker maker. The AI cutout runs in your browser.", "url": "https://www.gifsy.fun/tools/sticker#how-to" },
    { "@type": "HowToStep", "name": "Style the sticker", "text": "Set outline width and colour, toggle the drop shadow, add an optional caption up to 24 characters." },
    { "@type": "HowToStep", "name": "Download 512×512", "text": "Click Make Sticker and download the 512×512 WebP for Telegram or the transparent PNG." }
  ]
}
```

FAQPage: one `Question`/`acceptedAnswer` per FAQ in §4.10, answer text
identical to the visible copy. Do **not** add `aggregateRating` (no
reviews). No `Article` — it is a tool page. Keep HowTo and FAQPage on the
same page (both are genuine sections); validate in Rich Results Test.

- **Headings:** single H1 in the workshop; H2s in the order of §4; the
  @Stickers steps as a real `<ol>` under the H2 (today the ImportGuide
  heading is a `<p>` — run 05 D4).
- **Anchors:** `#how-to`, `#add-to-telegram`, `#size-and-format`,
  `#privacy`, `#what-works`, `#faq` — used by HowTo `url` and by the guides.
- **Snippet formats:** ordered list (§4.4), paragraph (§4.6 opener), table
  (PNG vs WebP).
- `alternates.canonical`, page-level `openGraph.url`, own OG image, meta
  description above, `robots` index/follow as now.
- Images: `alt` in the form "Transparent sticker of a [subject] with white
  outline and shadow, 512×512" — no keyword stuffing.

---

## 7. E-E-A-T signals required

- **Screenshots to capture (real, dated in the caption):**
  1. Before/after ×3 on a checkerboard: portrait, pet (fur — show the honest
     edge), object (mug/plant). Same three photos feed the size table.
  2. The tool mid-run showing "Loading AI model (first time only)…" — proves
     the in-browser claim.
  3. The @Stickers chat: `/newpack`, the file bubble (showing it was sent as
     a file), the emoji reply, `/publish`, the `t.me/addstickers/…` link.
  4. The bot's "exactly 100×100 pixels" error after `/newemojipack`
     (deliberately trigger it) — this is the money screenshot for §4.5 H3.
  5. The bot's rejection of a >512 KB file — quote its wording in §4.6.
  6. The finished pack open in Telegram desktop.
  7. Browser DevTools network tab during a run: only model-chunk requests,
     no upload — optional but decisive for §4.7.
- **Measured numbers to include:** PNG vs WebP byte sizes for the three test
  photos; first-run model download time on the founder's connection;
  second-run time. Replace every placeholder range in §4.6.
- **Author:** "Author: TBD" — a named founder byline is planned but not
  confirmed (README open question). Add "Last updated" date.
- **External citations (only these):** core.telegram.org/stickers
  (#static-stickers-and-emoji, #in-app-sticker-maker),
  core.telegram.org/bots/api#uploadstickerfile, t.me/stickers. No competitor
  links. No stats, testimonials or user counts.
- **First-person notes worth one sentence each (founder to confirm):** why
  the outline is drawn as three rings (smooth edge on feathered cutouts);
  why the WebP quality loop exists (the first version shipped PNGs the bot
  bounced); the emoji-pack mistake happened to us.

---

## 8. Resource assessment

- Effort: **Medium** — ~2,000 words + 7 screenshots + JSON-LD + moving
  `ImportGuide` text into static markup + nested-`<main>` fix + inbound
  links. No product work. ~8–12 h writing/capture, ~3 h implementation.
- 3-month target: top 10 for "telegram sticker maker online", "telegram
  sticker 512x512 webp", "photo to sticker no upload"; impressions for
  "telegram sticker maker". 6–12 months: top 5 head phrase (LightX is the
  only real web-tool incumbent).
- Blockers: byline decision; screenshot capture needs a Telegram account the
  founder is willing to show (blur handle if needed).

---

## 9. Guide sub-pages (outlines only — separate briefs when scheduled)

### 9a. `/guides/telegram-sticker-pack-from-browser` — ~1,500 w, `HowTo` + `FAQPage`

- Keyword: **how to make Telegram stickers from a photo without an app** (+
  "@Stickers bot", "telegram sticker maker online free no app"). Informational how-to.
- Title (≈58): "Make Telegram Stickers From a Photo Without an App (Browser)".
  H1: "How to make Telegram stickers from a photo without an app".
- Quick answer (40–60 w, ordered list) under the H1.
- H2 What you need (a photo, a browser, Telegram on any device — desktop is fine).
- H2 Step 1: cut the photo into a 512×512 sticker in your browser → link to
  `/tools/sticker` (anchor "Telegram sticker maker"), with the outline/shadow
  tip quoted from Telegram.
- H2 Step 2: create the pack with @Stickers (`/newpack` → send as file →
  emoji → `/publish`), screenshots per step; H3 the 100×100 emoji-pack
  mistake; H3 the >512 KB rejection and the WebP fix.
- H2 Step 3: share and manage the pack (`/addsticker`, `/delsticker`,
  `/ordersticker`, `/editsticker` — verify each command in the bot before
  publishing; `/stats` if still offered).
- H2 Telegram's built-in Sticker Editor: when it is enough, when it isn't
  (phone-only, no AI cutout, no desktop).
- H2 Common errors (bot messages verbatim: wrong size, too big, sent as
  photo, pack name taken).
- FAQ ×6 (edit later? delete a sticker? how many per pack? on desktop only?
  WhatsApp? animated?).
- Links: tool in first 40 %; `/guides/telegram-sticker-size` once; `/tools/gif` once.

### 9b. `/guides/telegram-sticker-size` — ~900 w, `FAQPage` (+ table)

- Keyword: **telegram sticker size** / "telegram sticker 512x512" / "telegram
  sticker webp vs png". Informational spec explainer, table-snippet target.
- Title (≈57): "Telegram Sticker Size: 512×512, WebP vs PNG, 512 KB Limit".
  H1: "Telegram sticker size and format (512×512, WebP vs PNG)".
- 40–60-word paragraph answer under the H1 (same wording as §4.6 opener so
  the two pages do not fight: make the guide the canonical long answer,
  keep the tool page's paragraph shorter).
- H2 The rules, quoted from core.telegram.org (static · animated TGS 64 KB ·
  video WEBM 256 KB · custom emoji 100×100) as one table.
- H2 512 on one side, ≤512 on the other — what non-square stickers look like.
- H2 PNG vs WebP for stickers (table; measured sizes from the same three photos).
- H2 Why the bot rejects your file (sent as photo · >512 KB · not
  transparent · 100×100 emoji pack).
- H2 How to resize any image to 512×512 for Telegram → `/tools/sticker`
  (anchor "512×512 sticker maker") — note it also cuts the background.
- FAQ ×5. Links: tool, guide 9a.

---

## Sources checked this run

- https://core.telegram.org/stickers (anchors: `#static-stickers-and-emoji`, `#in-app-sticker-maker`, `#stickers-mini-app`, `#custom-emoji`, `#importing-stickers-from-other-apps`) — fetched 2026-09-17; tip line and 512/100×100 rules quoted verbatim above.
- https://core.telegram.org/bots/api#uploadstickerfile — formats list; no static size cap on the page.
- Run 04 sources (LightX, insMind, StickerBeam, GIFDB, Filmora, Stickerfy, imageonline.io) — not re-fetched.
- Repo: `app/tools/sticker/page.tsx`, `components/StickerWorkshop.tsx`, `components/ImportGuide.tsx`, `components/Uploader.tsx`, `lib/sticker.ts`, `lib/export.ts`, `app/sitemap.ts`.

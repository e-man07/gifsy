# Run 04 — keyword-deep-dive: "sticker maker"

Date: 2026-09-17 · Skill: `keyword-deep-dive` · Page: `/tools/sticker` (always
free, no account). Product facts verified in code (`lib/sticker.ts`,
`lib/export.ts`, `components/StickerWorkshop.tsx`, `components/ImportGuide.tsx`):
ISNet background removal in the browser, auto-crop + centre, outline (px +
colour), optional drop shadow, optional caption, exports transparent PNG and a
512×512 WebP that is re-encoded down until it is ≤ 512 KB; an in-app guide walks
the `/newpack` → send-as-file → `/publish` flow for Telegram's @Stickers bot.
WhatsApp is not supported and must not be claimed.

## Method

- Google SERP reads for: "sticker maker", "telegram sticker maker", "photo to
  sticker", "make stickers from photos online", "telegram sticker 512x512 webp
  png converter online", "sticker maker online no upload runs in browser
  privacy", "telegram sticker maker online free no app", "how to make telegram
  stickers from photo @Stickers bot", "photo to sticker with white outline
  online free".
- Fetched and read in full: LightX Telegram Sticker Maker, insMind Photo to
  Sticker Maker, StickerBeam, Jukebox Sticker Maker, Canva Stickers, Filmora
  "Top 10 Telegram Sticker Makers", GIFDB Image to Sticker, Stickerfy,
  imageonline.io Sticker Maker, core.telegram.org/stickers (spec), and
  https://www.gifsy.fun/tools/sticker.
- Not visible in this tooling: People-Also-Ask boxes, featured-snippet holder,
  AI Overview presence, app-store carousel placement, exact positions. Flagged
  inline. Word counts are approximate from fetched text.

### What the current page shows a crawler

`/tools/sticker` renders ~25 words: title `Make a Sticker · Gifsy`, H1 "Make
your sticker", the drop zone ("PNG · JPG · WebP"), nav links to `/gallery` and
`/`. A meta description exists in `app/tools/sticker/page.tsx` ("Cut a subject
out of any photo and turn it into a transparent sticker, right in your
browser. Always free, no account needed.") — the fetcher missed it, but it is
there. Everything that would rank — the 512×512 note, the outline/shadow/caption
controls, the whole Telegram @Stickers walkthrough — is client-rendered **only
after a photo is processed**, so Google never sees it. The page is in the
sitemap (priority 0.7) but has no other internal links pointing at it.

## Keyword family map

| Query | Dominant intent | Who ranks | Print vs digital | Fit for `/tools/sticker` |
|---|---|---|---|---|
| **sticker maker** | Mixed: Transactional (print services) + app-store | StickerYou, Amazon (machines), Sticker it, Jukebox, StickerApp, Google Play "Sticker maker for WhatsApp", Canva | **Print-dominated** (6 of 8 are print shops / hardware) | ❌ as a head term — wrong intent; keep only as a modifier ("Telegram sticker maker", "online sticker maker from photo") |
| **telegram sticker maker** | Transactional-tool (digital) | App Store (Sticker Maker for Telegram), Sogni AI bot, core.telegram.org, Google Play (Sticker Maker: Telegram & WA), Filmora listicle, **LightX web tool**, Storiko AI, Sticker Tools Desktop | 100 % digital | ✅✅ **primary target**. Only one real web tool (LightX) on page 1, and it exports JPG/PNG with no 512 handling |
| **photo to sticker** | Mixed: Apple Support (iOS feature) + print (CarStickers, StickerYou, MakeStickers) + 2 digital tools (Colorify AI, StickerBeam) | Apple, print shops, small tools | ~50/50 | ⚠️ secondary; the digital half is winnable, but Apple + print shops absorb the top |
| **make stickers from photos online** | Transactional-tool | Jukebox, Canva, Picmaker, **LightX**, **insMind**, HeadshotMaster, Colorify | Mostly digital with print upsell | ✅ secondary — this is the "online tool" SERP; insMind/LightX are the incumbents to beat |
| telegram sticker 512x512 / converter / resizer | Transactional-tool, spec-driven | GIFDB, FurryGuides, onlineresizeimage, Toolschimp, ImageWand, ezgif | 100 % digital | ✅✅ **long-tail where "512px + ≤512 KB WebP" wins**; all small sites |
| sticker maker no upload / in browser / private | Transactional-tool, privacy-driven | Stickerfy (RMBG-1.4 in WASM), IDPhotoDIY, MakeMyStickers, Atomm | Digital | ✅✅ long-tail; small sites, thin pages (~1,100 w) |
| photo to sticker white outline | Transactional-tool | imageonline.io (650 w), insMind outline maker, Pixelcut, DataChef, UD5, EditThisPic | Digital | ✅ long-tail; matches the outline+shadow feature exactly |
| how to make telegram stickers (from photo) | Informational | telegram.org blog, MakeUseOf, iTechGuides, UNN, Sticked guide, Filmora | n/a | ✅ supporting guide (not the tool page) — Telegram's own built-in editor (Apr 2024) now answers the basic version, so the guide must be the "pack from a browser, no phone" version |

**Decision:** `/tools/sticker` targets **"Telegram sticker maker"** as primary,
with "online sticker maker from photo" / "photo to sticker" as the secondary
phrase in H1/copy. "Sticker maker" alone is a print SERP and is not pursued.

## Keyword profile — "telegram sticker maker" (chosen target)

| | |
|---|---|
| Intent | Transactional-tool (user wants something that produces a Telegram-ready file now) |
| Difficulty | **Moderate** (rubric ≈ 4/10: >5 authority domains incl. Apple/Google Play/Telegram/Wondershare +1; AIO presence unknown; listicle updated Jul 2026 +1 freshness; Filmora meta CTR-optimised +1; niche site (LightX) in top 5 +1). No Wikipedia, no page over 2,500 w except the listicle, no original data |
| SERP composition | 2 app-store listings · Telegram's own docs · 1 AI bot · 1 listicle · **1 web tool (LightX, ~1,100 w)** · 1 AI portrait app · 1 desktop app |
| SERP features (visible) | App-store results; likely PAA (not observable); no evidence of a featured snippet; AI Overview unknown |
| Zero-click risk | **Medium** — app-store rows and Telegram's built-in editor take a share, but the query is tool-transactional so clicks still flow to web tools |
| Volatility | Moderately fresh: Filmora listicle dated 28 Jul 2026, LightX/StickerBeam "© 2026"; app listings are old. Stable core, refreshed listicle layer |
| Gifsy position | Unranked / not indexed |

Keyword profile — "sticker maker" (for the record): Transactional-print,
Hard, **wrong intent** (StickerYou, Jukebox, Canva Print, Amazon machines).
Zero-click risk Low but irrelevant — a digital-only tool would pogo-stick.

## Competitive read (top 3 for the chosen family)

### LightX — Free Telegram Sticker Maker Online
- URL: https://www.lightxeditor.com/photo-editing/telegram-sticker-maker/
- Authority: high (LightX is an established editor with a large tool web).
  Format: tool landing. ~1,100 words.
- Title: `Free Telegram Sticker Maker Online | LightX`. H1 "Make Telegram
  Stickers for Free Online".
- H2s: how to make Telegram stickers (3 steps: upload → auto cutout + outline →
  save JPG/PNG) · "just got easier" · communicate better · easy-to-use · precise
  with AI · FAQ (5 Q: cat stickers, which app, my photo as sticker, funny
  stickers, iPhone free) · discover more tools.
- **Gaps:** exports JPG/PNG only, no WebP, **no 512×512, no 512 KB limit, no
  @Stickers bot flow**, processing is server-side (upload), "Get started for
  free" implies account. No dates, no author.
- Best at: per-platform page templating (WhatsApp/Snapchat/Facebook/Instagram
  variants) and internal links to 10+ tools.

### insMind — Sticker Maker: Make Sticker from Photo Online Free
- URL: https://www.insmind.com/photo-editor/photo-to-sticker-maker
- Authority: high-ish generalist AI editor. Format: tool landing. ~2,800 words.
- H1 "Online Sticker Maker: Create Custom Stickers from Photos". Eleven H2s:
  how-to (upload → AI remove bg → add text/clipart/emoji → download) · "in
  seconds with AI" · 3 easy steps · sticker packs for social · creative ideas ·
  brand visuals · more features · personal & professional · why insMind · FAQ
  (5 Q) · related tools.
- Mentions WhatsApp packs and transparent PNG; **no Telegram spec, no WebP,
  no 512**. Server-side. Testimonials (Sophie/Emma/Jack), Jan-2025 image
  timestamps, "New" nav tag.
- Best at: word depth and a 11-tool internal cluster (background remover, PNG
  maker, face cut-out…).

### StickerBeam — Photo to Transparent Sticker PNG
- URL: https://stickerbeam.com/
- Authority: **low** (single-purpose new site, "© 2026", demo dated 6 Sep 2026).
  Format: tool landing + editorial. ~2,800 words.
- H1 "Turn Any Photo into a Transparent Sticker PNG". Sections: one-photo
  sticker · demo PNGs (portrait / pet / drink) · small editor · tips for a
  cleaner cutout · on-device creation · erase/restore brushes · outline controls
  · free export · FAQ (5 Q incl. "Is my photo uploaded?" and "Do you print
  physical stickers?") · "make a photo that works as a digital sticker" ·
  "judge the cutout at the size people see it".
- **This is the closest analogue to Gifsy**: in-browser, no upload, outline,
  PNG + **512×512 WebP — but oriented to WhatsApp**, not Telegram. Already ranks
  page 1 for "photo to sticker" with near-zero authority, which proves the
  long-tail is open.
- Best at: honest tips (hair/fur/glass edges), spoke pages
  (`/jpg-to-sticker`, `/png-to-sticker`, `/meme-sticker-maker`, `/guides`).

### Secondary reads
- **Filmora listicle** (Wondershare, 2,000 w, 28 Jul 2026, author Shanoon
  Cox): says "512 × 512 PNG with transparent background"; lists Stickery,
  Sticker.ly, Filmora, PicsArt, Sticker Maker Studio, LINE, StickerYou,
  MakeStickers, Picmaker, Crello — **not one is a browser-only, no-upload
  tool**, and several are print shops. Easy to be "the missing entry".
- **GIFDB Image to Sticker** (2,500 w): in-browser, 512×512 PNG, explicit
  WhatsApp + Telegram @stickers steps, related `telegram-sticker-pack` guide.
  Closest spec-match competitor on the "512" long-tail; no outline/shadow/caption,
  no AI cutout on busy backgrounds ("background removal conditions").
- **Stickerfy** (1,100 w): RMBG-1.4 in WebAssembly, "photo never leaves your
  browser", WhatsApp-only, no Telegram, no 512, no outline.
- **imageonline.io** (650 w): white outline + shadow + HTML-canvas on-device,
  names Telegram/WhatsApp/iMessage, but only removes *solid-colour*
  backgrounds (no AI).
- **core.telegram.org/stickers**: static stickers = PNG or WebP, one side
  exactly 512 px, other ≤ 512 px, transparent background; recommends "white
  stroke and black shadow" — i.e. Telegram's own docs describe Gifsy's default
  output.

### SERP-difficulty rubric (telegram sticker maker)
Wikipedia/gov 0 · >5 authority publishers 1 · all top-5 >2,500 w 0 · snippet
held by authority ? (0) · AIO present ? (0) · named authors 0 · original data
0 · freshness 1 · niche authority in top 3 (LightX) 1 · CTR-optimised metas 1
→ **4 = Moderate** (cluster play, 6–12 months for top 5; long-tails faster).

## Content gaps (where Gifsy differentiates)

1. **Telegram-correct output, not just "PNG".** Nobody on the "telegram sticker
   maker" page 1 handles 512×512 + ≤ 512 KB WebP + send-as-file. Gifsy already
   enforces the size cap in `toStickerWebp`. Say so in the copy, with the spec
   quoted from Telegram's docs.
2. **@Stickers bot walkthrough on the page** (`/newpack` → send as file → emoji
   tag → `/publish` → `t.me/addstickers/…`), including the "exactly 100×100"
   emoji-pack trap that the app already explains. The only page-1 guide pages
   are generic; the tool pages have none.
3. **AI cutout + no upload together.** Stickerfy has no-upload but no Telegram
   or outline; GIFDB has 512 but no AI; imageonline has outline but only
   solid-colour removal; LightX/insMind have AI but upload to servers. Gifsy is
   the only combination of all four (ISNet in-browser, outline, shadow,
   caption, 512 WebP).
4. **"White stroke + shadow" as Telegram's own recommendation** — cite
   core.telegram.org; frames the outline/shadow defaults as spec-compliance,
   not decoration.
5. **Honest limits** (StickerBeam is the only one doing this): hair/fur/glass
   edges, subjects touching the frame, low-contrast backgrounds, first-run
   model download (~tens of MB ISNet, cached after).
6. **Why WebP vs PNG for Telegram** and what "send as file" changes (Telegram
   recompresses images sent as photos). Nobody explains it.
7. **Not-WhatsApp clarity.** WhatsApp packs need a companion app; saying so
   plainly avoids pogo-sticking from WhatsApp searchers and keeps claims honest.

## Ranking strategy

Greenfield — the page exists but is invisible to crawlers (client-rendered
copy). This is a **content + rendering fix** on an existing URL, not a new
page.

### Position diagnosis
- Current position: unranked for every query in the family.
- Versus top 3: missing ~1,500–2,500 words of server-rendered copy, missing the
  keyword in title/H1 ("Make a Sticker" contains no searched phrase), missing
  FAQ, missing the Telegram spec + walkthrough as indexable text, zero internal
  links from `/` or any guide.

### Quick wins (week 1–2)
- Title/H1/meta rewrite (below).
- Move the Telegram spec note + ImportGuide text into **server-rendered** copy
  below the tool (keep the interactive one after the result; duplicate the
  words, that is fine).
- Add `FAQPage` + `SoftwareApplication` (`applicationCategory:
  MultimediaApplication`, `offers.price: 0`) JSON-LD.
- Link to `/tools/sticker` from the landing page footer/nav and from the GIF
  tool page.

### 30-day content plan for `/tools/sticker` (~1,800–2,200 words, SERP average ≈ 1,800 + 10 %)
Sections in order, tool first (transactional intent: first 100 words = value
prop + drop zone):
1. H1 + one-paragraph value prop (Telegram-ready, in browser, free).
2. Tool.
3. "How to make a Telegram sticker from a photo" — 3 steps (drop → outline /
   shadow / caption → download WebP) + `HowTo` JSON-LD.
4. "Add it to Telegram with @Stickers" — the 5-step bot flow, with the
   100×100 emoji-pack trap.
5. "Telegram sticker size and format" — 512 px rule, PNG/WebP, ≤ 512 KB, send
   as file; short comparison table PNG vs WebP.
6. "Your photo never leaves your browser" — ISNet runs locally; what is and
   isn't downloaded (model weights are); no account.
7. "What photos work best" — honest limits.
8. "Also works for Discord, Signal, iMessage as transparent PNG" (one
   paragraph; do **not** claim WhatsApp packs).
9. FAQ (8–10 Q): Is it free? · Is my photo uploaded? · Why 512×512? · PNG or
   WebP? · Why does Telegram say "exactly 100×100"? · Can I make WhatsApp
   stickers? (honest no / PNG only) · Why did the first run take a while? ·
   Can I add text? · Does it print? (no) · Can I make an animated sticker? (no
   — point to the GIF tool if relevant).
10. Related: link to `/tools/gif`, `/gallery`, and the future guide.

### Supporting cluster (for internal links)
| Page | Primary keyword | Type | Priority |
|---|---|---|---|
| `/tools/sticker` | telegram sticker maker (+ online sticker maker from photo) | tool landing | 1 |
| new guide `/guides/telegram-sticker-pack-from-browser` | how to make telegram stickers from a photo without an app / @Stickers bot | how-to, ~1,500 w, `HowTo` | 1 |
| new guide `/guides/telegram-sticker-size` | telegram sticker size 512x512 / webp vs png | spec explainer, ~900 w | 2 (cheap, GIFDB-style long-tail) |
| optional spoke `/tools/sticker/outline` or section anchor | photo to sticker with white outline | anchor/section first; only a page if impressions appear | 3 |

Do not build WhatsApp pages (no product support). Do not chase "sticker
maker" or "photo stickers" print SERPs.

### E-E-A-T required
Real before/after screenshots of Gifsy output (portrait, pet, object), a
screenshot of the @Stickers chat, a named byline on the guides (open question
from README), last-updated dates, visible "free, no account" and privacy
statement that matches reality (model weights download from a CDN; photo does
not leave the device).

## Title / meta proposals — `/tools/sticker`

Current: `Make a Sticker · Gifsy` (22 chars, no searched phrase);
description exists but is generic.

- A (57): `Telegram Sticker Maker — Photo to 512px Sticker, Free | Gifsy`
  — primary keyword first, the spec number is the differentiator no page-1
  competitor shows.
- B (58): `Free Online Sticker Maker: Photo to Telegram Sticker | Gifsy`
  — leads with the broader "online sticker maker" phrase for the secondary
  SERP while keeping Telegram.
- Meta (158): `Turn any photo into a Telegram-ready sticker in your browser: AI cutout, white outline, shadow, caption. Exports 512×512 WebP or PNG. Free, no upload, no account.`

H1 proposal: "Telegram sticker maker — turn a photo into a sticker in your
browser".

## Timeline estimate

- Current position: unranked (page effectively empty to crawlers).
- 90-day target: top 10 for "telegram sticker maker online", "telegram
  sticker 512x512 converter", "photo to sticker no upload"; impressions for
  "telegram sticker maker" and "photo to sticker".
- 6–12 months: top 5 "telegram sticker maker" (Moderate; only LightX is a
  real web-tool incumbent).
- Effort: **Medium** — content rewrite + server-rendering of existing copy +
  JSON-LD + 2 guide pages + internal links. No new product work needed.

## Sources

- https://www.stickeryou.com/stickermaker
- https://www.jukeboxprint.com/sticker-maker
- https://www.canva.com/create/stickers/
- https://play.google.com/store/apps/details?id=com.marsvard.stickermakerforwhatsapp
- https://apps.apple.com/us/app/sticker-maker-for-telegram/id1575085196
- https://www.sogni.ai/stickers
- https://core.telegram.org/stickers
- https://play.google.com/store/apps/details?id=co.stickermaker
- https://filmora.wondershare.com/telegram/telegram-sticker-maker.html
- https://www.lightxeditor.com/photo-editing/telegram-sticker-maker/
- https://www.lightxeditor.com/photo-editing/sticker-maker-online/
- https://support.apple.com/guide/iphone/make-stickers-from-your-photos-iph9b4106303/ios
- https://colorifyai.art/ai-image-to-sticker/
- https://stickerbeam.com/
- https://www.insmind.com/photo-editor/photo-to-sticker-maker
- https://www.picmaker.com/sticker-maker
- https://gifdb.com/tools/image-to-sticker/
- https://gifdb.com/tools/telegram-sticker-pack/
- https://furryguides.com/tools/image-to-telegram-sticker
- https://imagewand.app/tools/resize/telegram-sticker
- https://stickerfy.click/
- https://www.idphotodiy.com/tools/stickers.php
- https://imageonline.io/sticker-maker/
- https://www.pixelcut.ai/create/sticker-outline-generator
- https://telegram.org/blog/sticker-maker
- https://www.makeuseof.com/tag/how-to-make-telegram-stickers/
- https://sticked.app/guides/create-telegram-stickers
- https://www.gifsy.fun/tools/sticker

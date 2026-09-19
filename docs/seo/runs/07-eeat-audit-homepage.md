# Run 07 — E-E-A-T audit: homepage (+ pricing / privacy / terms / refund as trust surfaces)

Date: 2026-09-17 · Skill: `eeat-audit` · Page: https://www.gifsy.fun/ · Not YMYL, but the site takes payments (Pro, $9 one-time via Dodo Payments), so trust surfaces are weighted.

**Scorecard: 16 / 40.** Experience 3 · Expertise 5 · Authoritativeness 2 · Trustworthiness 6.

The product *demonstrates* itself well (a live, draggable embed above the fold, four live persona embeds, a 22-scene gallery) and the legal pages are unusually honest for a solo launch. What is missing is any *person*: the founder's name appears nowhere on gifsy.fun, there is no About page, no byline, no outbound link to GitHub / Product Hunt maker / X, and no structured data. For a brand-new domain (first commit 2026-08-17) with a name that collides with GIF sites, the anonymous-company signal is the single biggest E-E-A-T drag, followed by three factual drifts on /privacy that git history shows are already out of date.

---

## Method

1. Fetched the live HTML of `/`, `/pricing`, `/privacy`, `/terms`, `/refund` (all 200) and extracted visible text. The homepage is client-rendered; its SSR HTML carries ~750 visible words, roughly half of which are gallery scene titles repeated twice for the marquee loop. There is no `<script type="application/ld+json">` on any page. `/about` → 404.
2. Read the source the HTML is generated from: `app/page.tsx`, `app/layout.tsx`, `app/pricing/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/refund/page.tsx`, `components/PlanCards.tsx`, `components/CommunityShowcase.tsx`, `components/PersonaShowcase.tsx`, `lib/legal.ts`, `lib/billing/plans.ts`, `lib/billing/offer.ts`, and `README.md`.
3. Cross-checked every claim against git history, in particular commit `4d830d0` ("stop claiming the photo never leaves the device"), `feat: move scene storage from Vercel Blob to Cloudflare R2` (2026-09-16) and `add DataFast analytics script` (2026-09-17).
4. Checked external entity signals: GitHub repo `e-man07/gifsy` (public, 0 stars, no licence file, created 2026-08-20), GitHub user `e-man07` (name "Aman Jha", X handle `WhyParabola`, 17 followers), Product Hunt product page (makers Aman Jha and Priyanshu Tiwari, 4 upvotes, 2 comments, links X `whyparabola`). The Orynth listing could not be located by URL guess; only the `ory-verify` meta tag proves it exists.
5. Scored against the skill rubric (`SKILL.md`), the `fastest-eeat-wins.md` ranking, `eeat-signal-embedding.md`, `author-schema-templates.md`, and the `pricing-pages.md` / `about-pages.md` content-type bars.

---

## Scores with evidence

| Signal | Score | Key gap |
|---|---|---|
| Experience | 3 / 10 | Product proves itself live, but there is no first-person voice, no founder story, no "what doesn't work" anywhere on the site |
| Expertise | 5 / 10 | The split-depth-model explanation on /privacy is genuinely expert; the homepage says "real depth" and explains nothing |
| Authoritativeness | 2 / 10 | Anonymous company, brand-new domain, no About, no schema, no outbound entity links, one 4-upvote PH badge |
| Trustworthiness | 6 / 10 | Honest privacy caveat, 14-day no-questions refund, "lifetime" defined, MoR named — but /privacy is stale on two facts, no legal entity, contact email on another brand's domain |
| **Total** | **16 / 40** | |

### Experience — 3 / 10

What works:
- The "Now showing" section mounts a real `<iframe src="gifsy.fun/embed/03ed4c7605">` and tells the visitor "drag it. This is an embed, the same snippet you can paste into your own site." That is the strongest possible Experience signal for a tool: the thing itself, not a screenshot of it.
- Four live persona embeds (agency / portfolio / product / creator) and a 22-scene gallery show the effect on many subject types. The gallery scene names ("Latte Art", "Fox in Snow", "Retriever, Standing") read like somebody actually ran the model on a range of photos.
- Hero badges quote live constants (`FREE_GENERATION_LIMIT`, `PLAN_DISPLAY.pro.price`), so the numbers on the page are the numbers the server enforces.

What's absent:
- Zero first-person language on any page. Not one "I built", "we found", "when I tested". The Product Hunt comment has the founder story ("a stupidly simple way to give a normal image some depth"); the website does not.
- No failure story or honest-limits section. The README's principles ("AI for image understanding, graphics code for the effect", "the viewer never runs AI", "the depth GIF effect was removed because it silently consumed the metered quota") are exactly the hands-on details the skill's "smell test" wants, and none of them are on the site.
- No "what photos work best / worst" guidance, which a founder who has run hundreds of images through Depth Anything V2 + ISNet certainly knows (busy backgrounds, hair matting, transparent objects, flat graphics).
- "Real scenes published by Gifsy users" (community marquee) is asserted, not evidenced. The source comment says they are "scenes people actually published", but several are Hulk/Joker character shots that could equally be the makers' own tests. Nothing on the page lets a reader tell.

### Expertise — 5 / 10

What works:
- `/privacy` "How 3D depth is calculated" is the best-written paragraph on the site: it names the split model, explains activations as "intermediate numbers ... not an image and cannot be viewed as one", and then volunteers the caveat that "published research shows that approximate reconstruction from data of this kind is possible in principle." That is expert-level honesty and precision; a generalist would not know to write it.
- `/terms` and `/refund` are internally consistent on the one-time/lifetime semantics and on what a refund does to an account (badge state, licence, generation count).

What's missing:
- The homepage explains the mechanism nowhere. "Real depth" and "live 3D photo" are undefined. The README has the pipeline in one line (photo → depth map → subject matte → inpainted backdrop → two displaced planes in WebGL) and the model names (Depth Anything V2 small fp16, ISNet via @imgly/background-removal, LaMa). None of that is on gifsy.fun.
- No "when NOT to use this" — the README explicitly says Gifsy "does not try to reconstruct a watertight mesh" and is 2.5D, which is precisely the scope-narrowing statement that reads as expertise (and which run 01 says is needed to keep "image to 3D" mesh-seekers from bouncing).
- The README's own numbers disagree with /privacy on the split: README says the server runs "the last 10 % of the depth model" (encoder 44 MB, head 5.4 MB); /privacy says "the first and larger half" runs locally and "the second half" on the server. Both are honest but "half" undersells how little goes to the server. Pick one description and use it everywhere.
- No FAQ, no comparison, no guide content — the domain is 9 URLs.

### Authoritativeness — 2 / 10

- The founder's name does not appear on gifsy.fun. It does appear on Product Hunt (Aman Jha, Priyanshu Tiwari), on GitHub (`e-man07` → "Aman Jha"), and on X (`WhyParabola`). Google can connect none of these to the site because the site links to none of them.
- No `/about`, no team, no byline, no author entity.
- No JSON-LD of any kind (`Organization`, `SoftwareApplication`, `Person`, `FAQPage` all absent).
- Outbound links from the homepage: exactly one — the Product Hunt badge (4 upvotes). No GitHub link even though the repo is public and the README links back to the site.
- Domain age ~1 month; no external citations found; the brand name "Gifsy" pulls SERPs to GIPHY/Tenor (run 01, README baseline).
- No topical cluster: homepage → gallery → tools → pricing → legal. No guides, no comparison page, nothing for the homepage to be the hub of.
- Contact email is `aman@metamemory.tech` — a different brand's domain. A rater checking "who runs this" finds no Gifsy-branded address, no entity name, no postal address (Terms name only "Gifsy" and "India" as governing law).

### Trustworthiness — 6 / 10

What works (this is the strongest dimension):
- `/privacy` intro states the data flow correctly in one paragraph: GIF/sticker fully local; Free 3D sends activations "not the photo"; Pro local; publishing uploads. Commit `4d830d0` removed every absolute "never leaves your device" claim site-wide and the current footer reads "your photo is only uploaded when you publish" — accurate.
- `/refund`: 14-day, no-questions, in full; "lifetime" is defined identically in Terms and Refunds as "for as long as Gifsy operates as a service"; a 12-month full refund is promised if Pro features are withdrawn. Merchant of record (Dodo Payments) is named and the "card details never reach us" line is true.
- Every policy page shows "Last updated 9 September 2026".
- Pricing on `/` and `/pricing` render the same `<PlanCards />`, so the two surfaces cannot disagree.

What leaks trust:
1. **`/privacy` is factually stale on storage.** "Vercel — hosting, file storage for published scenes" — scene storage moved to Cloudflare R2 on 2026-09-16 (`lib/storage/r2.ts`). Cloudflare is not listed as a processor.
2. **`/privacy` is factually stale on analytics.** It names only Vercel Analytics; `app/layout.tsx` also loads DataFast (`datafa.st/js/script.js`, added 2026-09-17). DataFast is a third-party analytics vendor and must be disclosed.
3. **`POLICY_LAST_UPDATED` ("9 September 2026") predates both changes**, so the visible date is now asserting a currency the page doesn't have.
4. **No legal entity.** Terms say "Gifsy" and "the laws of India" but no company/individual name, no address. For a page that takes card payments this is the standard rater check, and it fails.
5. **Contact only inside legal pages.** The homepage and `/pricing` have no Contact/Support link at all; a buyer has to open Terms to find an email.
6. **"Most popular" badge on Pro** (`PlanCards.tsx`) — there are two tiers, one is free, and the product launched weeks ago; this is unverifiable social-proof language.
7. **"Runs fully on your device — works offline"** (Pro feature list) — over-stated. Depth generation can run offline once the ~50 MB of models is cached, but the background-removal model is fetched from img.ly/jsDelivr on first use, and publishing *always* sends the image to `/api/inpaint` and uploads to storage. "Works offline" reads as "the whole product works offline".
8. **Launch-offer code still live** (`lib/billing/offer.ts`, `OFFER_ENDS_AT = 2026-09-12`). It has expired and correctly hides itself, but the strikethrough/countdown copy remains in the bundle; if the timestamp is ever bumped without changing the Dodo price the page will advertise $5 while charging $9 (the file's own comment admits the price is set manually on the Dodo dashboard). Remove or gate it behind a server-verified price.
9. **README licence says "Private — all rights reserved"** while the repo is public on GitHub. Not a site claim, but if you link the repo (recommended below) add a proper licence or a one-line "source-available, not open source" note so the two don't contradict.

---

## Per-dimension fixes

### Experience — what to add

1. **A founder paragraph on the homepage, in first person, under "How it works".** Concrete copy direction: *"I built Gifsy because every hero image on my own portfolio was flat. The first version ran the depth model on the server and cost me $X per generation; moving the encoder into the browser (44 MB, cached after the first run) is what made a $9 one-time price possible."* Use real numbers from the repo history (encoder size, the Blob-firewall incident, the removed depth-GIF effect).
2. **A "What photos work best" block with three honest limits**, e.g. single clear subject vs. busy background; hair and fur mattes; flat illustrations and transparent objects. Each limit is a line only someone who has run the model knows.
3. **One failure story**: the community marquee originally mounted ~32 live WebGL iframes and Vercel's firewall served challenge pages — so the marquee is now recorded clips. That paragraph (already written in `CommunityShowcase.tsx` as a code comment) is a perfect Experience signal; put a two-sentence version on the page next to "Real scenes published by Gifsy users".
4. **Make the "real users" claim checkable**: either label each marquee card with a `/s/<id>` link so a reader can open the scene, or soften the copy to "Scenes published on Gifsy" if any of the sixteen are the makers' own uploads.

### Expertise — what to add

5. **A "How the 3D works" section on `/`** (also the backlog's "how 3D photos work" guide): depth map → subject matte → inpainted backdrop → two displaced planes, with the model names (Depth Anything V2 small, ISNet, LaMa) and the one-line scope statement "this is a 2.5D parallax scene, not a 3D mesh — if you need a model you can rotate 360°, use Meshy or Tripo." Recommending the competitor for the adjacent job is a rubric-listed Trust signal and keeps the wrong intent from bouncing.
6. **Reconcile the split-model description.** Pick "encoder in the browser (~90 % of the model), small head on the server" or "two halves" and use the same words on `/privacy`, `/terms`, the README and the new homepage section.
7. **An 8–10 question FAQ** (already in the backlog) with `FAQPage` JSON-LD — include "Does my photo get uploaded?" answered with the exact three-case breakdown from /privacy, "What's the difference between this and Immersity/LeiaPix?", "Can I remove the badge?", "Does Pro work offline?" (answer honestly: generation yes after first download; publishing needs a connection).

### Authoritativeness — what to add

8. **Create `/about`** with: mission in two sentences; founding story (August 2026, why); **Aman Jha** with photo, one-line credential ("built the browser-side depth pipeline in onnxruntime-web"), links to GitHub `e-man07`, X `WhyParabola`, Product Hunt maker profile; Priyanshu Tiwari if he is a continuing collaborator (he is a PH co-maker and has 10 commits); contact section with a Gifsy-branded email. Link it from the footer of every page and from the homepage founder paragraph.
9. **Add `Organization` + `WebSite` + `SoftwareApplication` JSON-LD in `app/layout.tsx`** (rendered server-side so it's in the HTML):
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
         "founder": { "@id": "https://www.gifsy.fun/about#aman-jha" },
         "sameAs": [
           "https://github.com/e-man07/gifsy",
           "https://www.producthunt.com/products/gifsy",
           "https://x.com/WhyParabola"
         ]
       },
       {
         "@type": "Person",
         "@id": "https://www.gifsy.fun/about#aman-jha",
         "name": "Aman Jha",
         "url": "https://www.gifsy.fun/about",
         "jobTitle": "Founder",
         "worksFor": { "@id": "https://www.gifsy.fun#organization" },
         "sameAs": ["https://github.com/e-man07", "https://x.com/WhyParabola"]
       },
       {
         "@type": "SoftwareApplication",
         "name": "Gifsy",
         "applicationCategory": "DesignApplication",
         "operatingSystem": "Web browser",
         "url": "https://www.gifsy.fun",
         "offers": [
           { "@type": "Offer", "price": "0", "priceCurrency": "USD", "name": "Free" },
           { "@type": "Offer", "price": "9", "priceCurrency": "USD", "name": "Pro (one-time)" }
         ],
         "publisher": { "@id": "https://www.gifsy.fun#organization" }
       }
     ]
   }
   ```
   Add the Orynth listing URL to `sameAs` once you have it. Only include profiles that exist — the skill's reference warns broken `sameAs` is worse than none.
10. **Link the public GitHub repo** from the footer or About ("Source on GitHub"). It is the one verifiable proof that the "AI runs in your browser" claim is real — a rater can open `lib/` and see onnxruntime-web.
11. **Byline every future guide/comparison page** with `author: Person@id` and a `dateModified`, per the README open question — the entity from fix 9 is what the bylines reference.
12. **Build the cluster the homepage sits on top of** (already in the backlog): `/compare/immersity-ai-alternative`, Webflow/Framer/Squarespace embed guides, "how 3D photos work". Cross-link them from the FAQ and from the new "How the 3D works" section.

### Trustworthiness — what to add

13. **Correct `/privacy` "Services we rely on"**: replace "Vercel — hosting, file storage for published scenes, and analytics" with *"Vercel — hosting and page analytics. Cloudflare R2 — storage for the files of published scenes. DataFast — visitor analytics."* Add DataFast to the Analytics paragraph: *"We use Vercel Analytics and DataFast to count page views and a small number of product events…"* Bump `POLICY_LAST_UPDATED`.
14. **State the data flow on `/` in the same words as /privacy.** Recommended sentence for the "How it works → Upload" step or a footnote under the plan cards: *"Your photo stays in your browser. On the Free plan the intermediate numbers from the depth model (not the photo) go to our server for one step; on Pro that step runs on your device too. Publishing uploads the finished scene, and it is public."* Link the word "step" to `/privacy#how-3d-depth-is-calculated`.
15. **Name the legal entity** in `/terms` and `/privacy` (`lib/legal.ts` → add `LEGAL_ENTITY` and a contact address). If Gifsy is operated by an individual, say "Gifsy is operated by Aman Jha, [city], India"; if via a company, the registered name. Dodo as MoR covers the card-processing side but not "who is the counterparty to these terms".
16. **Gifsy-branded contact email** (e.g. `hello@gifsy.fun` forwarding to the current inbox) and a **Contact link in the homepage and pricing footers**, not only in legal pages.
17. **Replace "Most popular"** on the Pro card with a verifiable label ("One-time" / "Recommended for embeds"), or drop the badge until you have a number you can cite.
18. **Rewrite "Runs fully on your device — works offline"** → *"3D depth runs fully on your device (works offline after the first model download)"* and keep publishing out of the offline claim.
19. **Add a "Who runs this / how billing works" strip on `/pricing`**: MoR (Dodo), 14-day refund, one-time (no renewal), link to `/refund`, contact. The pricing-page content-type bar also wants a short FAQ ("What happens after 3 generations?", "Do I need an account for GIFs?", "Can I use scenes on client sites?") — the answers already exist in Terms.
20. **Remove or gate the expired launch-offer code** so the page can never show a price the checkout does not charge.

---

## Over-claims to fix (current site text)

| Where | Current text | Problem | Fix |
|---|---|---|---|
| `/pricing` Pro card, `/terms` Pro bullet | "Runs fully on your device — works offline" | Publishing always sends the image to the inpaint endpoint and uploads assets; matte model is fetched from a CDN on first use | "3D depth runs fully on your device (offline after first download)" |
| `/privacy` Services | "Vercel — hosting, file storage for published scenes, and analytics" | Storage is Cloudflare R2 since 2026-09-16 | List Cloudflare R2 |
| `/privacy` Analytics | "We use Vercel Analytics…" | DataFast is also loaded on every route | Add DataFast |
| `/privacy`, `/terms`, `/refund` header | "Last updated 9 September 2026" | Two material changes since | Bump after fixes 13/15 |
| `/` community marquee | "Real scenes published by Gifsy users" | Not checkable from the page; some subjects look like maker test uploads | Link scenes or soften to "Scenes published on Gifsy" |
| `/` and `/pricing` Pro card | "Most popular" | Two tiers, weeks-old product, 4 PH upvotes | Remove or replace with a factual label |
| `/` plans intro | "runs the whole model on your own device" | True for the depth model; ambiguous next to the publish-time server step | "runs the whole depth model on your device" |
| `/privacy` vs README | "split in two halves" vs "last 10 % of the depth model" | Inconsistent description of the same split | Standardise |
| `/terms` | "the laws of India" with no named party | Terms with no counterparty | Add operator name |
| README | "Private — all rights reserved" on a public repo; "Creation stays local and anonymous. Accounts exist only for publishing and billing." | Accounts are required to *generate* 3D, not just to publish | Fix before linking the repo from the site |

Claims that are **correctly stated** and should be kept as-is: footer "your photo is only uploaded when you publish"; `/privacy` intro; `/gallery` meta "your photo itself is never uploaded to make one" (true — activations, not the photo); `/refund` 14-day and 12-month shutdown clauses; the pricing headline "GIFs and stickers … never leave your device" (true for those two modes).

---

## Fastest wins (each under 30 minutes, ordered by impact)

1. **Fix `/privacy` (R2 + DataFast) and bump the date** — 10 min, closes two factual errors on the page a buyer reads before paying. (+1 Trust)
2. **Add the Organization/Person/SoftwareApplication JSON-LD to `app/layout.tsx`** with the `sameAs` links above — 15 min. This is the first time Google can connect gifsy.fun to Aman Jha, the GitHub repo and the PH listing. (+1 Authoritativeness, +1 Trust)
3. **Founder paragraph on `/` with a real number and a GitHub link** — 15 min. The only first-person sentence on the site would be an outsized signal. (+2 Experience)
4. **Footer: add "About · Contact · GitHub"** on every page (`LegalFooter` and the homepage footer) and stand up a minimal `/about` — 30 min for a first version. (+1 Authoritativeness, +1 Trust)
5. **Rewrite the two over-stated lines** — "works offline" and "Most popular" — 5 min. (+1 Trust)

Expected after the five: roughly 22–24 / 40. The structural work below is what gets past 30.

## Structural recommendations

- Full `/about` per the about-pages bar (mission, story, named people with photos and linked profiles, contact) — and Organization schema pointing at it.
- The backlog's homepage rewrite: fold in the "How the 3D works" mechanism section, honest-limits block, FAQ with `FAQPage` schema, and the data-flow sentence.
- Guides/comparison cluster with bylines and `dateModified`, cross-linked to `/` — this is what turns the homepage from an isolated page into a hub.
- Legal entity + Gifsy-domain contact across all three policy pages; consider a short `/support` or `/contact` route so the trust surfaces are reachable in one click from pricing.
- Decide and document the community-marquee provenance so "real users" is either linked or reworded.

---

## Sources

- Live pages: https://www.gifsy.fun/ , /pricing , /privacy , /terms , /refund , /gallery , /sitemap.xml (fetched 2026-09-17)
- Source files: `app/page.tsx`, `app/layout.tsx`, `app/pricing/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/refund/page.tsx`, `components/PlanCards.tsx`, `components/CommunityShowcase.tsx`, `components/PersonaShowcase.tsx`, `components/LegalPage.tsx`, `lib/legal.ts`, `lib/billing/plans.ts`, `lib/billing/offer.ts`, `lib/storage/r2.ts`, `README.md`
- Git: commit `4d830d0` (2026-09-09, "stop claiming the photo never leaves the device"); "feat: move scene storage from Vercel Blob to Cloudflare R2" (2026-09-16); "add DataFast analytics script" (2026-09-17); first commit 2026-08-17
- External: https://github.com/e-man07/gifsy (public, created 2026-08-20, 0 stars, no licence); https://api.github.com/users/e-man07 (Aman Jha, X `WhyParabola`); https://www.producthunt.com/products/gifsy (makers Aman Jha, Priyanshu Tiwari; 4 upvotes; 2 comments)
- Skill: `.claude/skills/eeat-audit/SKILL.md` + `references/fastest-eeat-wins.md`, `eeat-signal-embedding.md`, `author-schema-templates.md`, `content-types/pricing-pages.md`, `content-types/about-pages.md`
- Prior run: `docs/seo/runs/01-keyword-3d-photo-effect.md` (intent findings on "image to 3D" mesh SERP, byline open question)

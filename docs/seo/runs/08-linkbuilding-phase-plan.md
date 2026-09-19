# Run 08 — linkbuilding: phase classification + link plan

Date: 2026-09-17 · Skill: `linkbuilding` (SKILL.md + `phase-classification-tree`,
`anchor-text-safety-guide`, `link-velocity-redflags`, tactics:
`new-site-launch-strategy`, `entity-stacking`, `citations-directories`,
`resource-pages`, `skyscraper-technique`, `strategic-partnerships`) · Site:
https://www.gifsy.fun · Inputs: README.md, run 01, repo state.

## Method

- Classified authority phase from free signals only (skill Step 1 + decision
  tree): brand-name SERPs, `site:`/domain searches, Product Hunt page, GitHub
  repo, homepage read (footer links, schema, PH badge). WHOIS/Wayback were not
  reachable from this tooling; site age taken from the ~Aug 2026 launch date in
  the task brief.
- Re-read run 01's "alternatives" SERP sources and fetched the listicle/directory
  pages to find contact paths, "suggest a tool" mechanisms, and link behaviour.
- Fetched AI-directory roundups (Smol Launch, LaunchBoosts) for free-vs-paid and
  dofollow/nofollow status; Framer Help ("get visibility in the Community",
  "publish to Gallery"), Webflow Made-in-Webflow/cloneables, FlowRadar, Sygnal's
  2.5D parallax KB, Webflow Marketplace guidelines.
- Read the repo for how the "Made with Gifsy" badge is actually emitted
  (`components/SceneViewer.tsx`, `app/embed/[id]/embed-client.tsx`,
  `app/s/[id]/scene-client.tsx`, `components/CreateWorkshop.tsx`) before judging
  it as a link mechanic.
- Not available: backlink tool data (DR, referring domains, anchor
  distribution). Step 3 (anchor audit) is therefore prescriptive, not diagnostic.

## Phase classification: Foundation (with evidence)

| Signal | Observed | Bucket |
|---|---|---|
| Site age | Launched ~Aug 2026 → ~1–2 months old | Foundation |
| Indexed pages | `"gifsy.fun"` search returns zero results for the domain; only GIPHY/Tenor/unrelated "Gifsy" apps (Amazon Appstore, getgifsy.com gift-card app, a Facebook page for a 2016 Android GIF app). Sitemap has 9 URLs. | Foundation (<20) |
| Knowledge panel | None. The brand name is contested by two older, unrelated "Gifsy" products. | Foundation |
| News/media | Zero. | Foundation |
| Social/entity profiles | Homepage footer links only Pricing/Gallery/Privacy/Terms/Refunds — **no social or GitHub links, no JSON-LD**. GitHub repo exists (0 stars, 0 forks, "all rights reserved"). Product Hunt page exists (tagline "Turn any photo into an interactive 3D scene you can embed", **4 upvotes**, makers Aman Jha + Priyanshu Tiwari, links to `gifsy.fun/?ref=producthunt`). Orynth listing could not be verified by search (orynth.com resolves to a Solana no-code builder, not a directory). | Foundation (0–2 active) |
| DR | Unknown; assume 0–5 (one PH link, one GitHub link). | Foundation |

All six signals agree: **Foundation phase, early**. The playbook to run is
`new-site-launch-strategy.md` Weeks 1–12, not Growth/Authority tactics.

Two site-specific wrinkles:

1. **Brand-name collision.** "Gifsy" already belongs to an Android GIF app and a
   gift-card app in Google's index. Entity stacking matters *more* than usual:
   every profile must say "Gifsy — interactive 3D photo embeds" so Google can
   disambiguate. Consider `sameAs` + `alternateName: "Gifsy 3D"` in Organization
   JSON-LD.
2. **Open-source + Product Hunt already done** = two of the highest-DR launch
   links are banked but under-exploited (PH at 4 upvotes means no "featured"
   badge equity; the GitHub repo has no website field surfaced, no topics, and a
   private license, which blocks the open-source link channels — awesome-lists,
   "open-source alternative to" roundups).

## Tactics, ranked (phase-appropriate)

| # | Tactic | Effort | Expected links (90 d) | Why now |
|---|---|---|---|---|
| 1 | **Entity stacking + Organization JSON-LD with `sameAs`** (`entity-stacking.md`) | 8–10 h once | 15–25 RDs (mostly nofollow, DR 90+) | Foundation prerequisite; fixes the name collision; the README technical backlog already lists JSON-LD |
| 2 | **Curated AI/tool directories** (`citations-directories.md`) | 4–6 h | 8–12 RDs, 3–5 dofollow | Free, fast, topically relevant; only the curated ones (see targets) |
| 3 | **"Alternatives" listicle inclusion pitches** (niche-edit variant of `resource-pages.md`) | 3–4 h + follow-ups | 2–4 editorial links | Run 01 found a category vacuum (Immersity pivoted); every listicle still names it and links every tool it lists |
| 4 | **Webflow/Framer community surfaces** (cloneable + Gallery + Marketplace listing = "integration page" from `strategic-partnerships.md`) | 10–15 h | 3–6 RDs incl. webflow.com / framer.com | Exact ICP; these are permanent, high-DR platform links |
| 5 | **Linkable assets** — gallery, live demo, "how depth parallax works" explainer (`skyscraper-technique.md` 3-layer upgrade, `new-site-launch-strategy.md` Month 2 "ONE killer asset") | 15–25 h | 0–2 in 90 d, compounding after | Needed before any Growth-phase outreach has something to point at |
| 6 | **Network / testimonial / open-source links** | 2–3 h | 3–6 RDs | Vercel, Supabase, Dodo Payments, ONNX Runtime Web, Depth-Anything showcases; 20–30% hit rate |
| 7 | Badge/attribution mechanic (see §b) | 4–6 h dev | Slow drip, 1–5/mo once Free embeds exist | Only after it is made compliant; today it yields zero |
| — | Deferred (Growth phase, month 4+): guest posts on Webflow/Framer blogs, HARO-style quotes, podcasts | | | Nothing to pitch yet; DR too low for reply rates |

### Top 3 in the skill's required format

**1. Entity stacking + schema.** Fits Foundation because nothing else works
until Google can resolve "Gifsy" to *this* company. Expected 15–25 referring
domains in month 1. Time: 8–10 h spread over 2 weeks (do not create all in one
day). First action: add `Organization` JSON-LD to `app/layout.tsx` with
`sameAs` [Product Hunt, GitHub, X, LinkedIn, YouTube, Crunchbase], and add those
same links to the footer. Then create the profiles in this order: X, LinkedIn
company page, YouTube (upload one 30 s gallery clip), Crunchbase, Wellfound,
Medium (one post), Dev.to (one post), Gravatar/About.me for the founder.
Wikidata: **not yet** — notability will be challenged and deleted; revisit after
3+ independent write-ups exist.

**2. Curated directories + alternatives listicles.** Fits Foundation because
directory links are the expected pattern for a new SaaS and the "alternatives"
SERP is weak (run 01). Expected 10–16 RDs over months 1–2. Time: 8–10 h. First
action: submit to Toolify (auto-crawls; also produces "X alternatives" pages),
There's An AI For That, Uneed, DevHunt, Fazier, TinyLaunch, Smol Launch, SaaSHub,
AlternativeTo (nofollow, but it seeds "alternatives" pages).

**3. Webflow/Framer community presence.** Fits because it is the ICP and
platform links are editorial-grade. Expected 3–6 RDs over months 2–3. Time:
10–15 h. First action: build a "3D Photo Hero" Webflow cloneable whose Embed
element wraps the Gifsy iframe, publish to Made in Webflow, then submit to
FlowRadar / Flowfav / Memberstack's cloneable roundup; in parallel submit a
Framer site to the Framer Gallery and a Framer component/template to the
Marketplace.

## (a) AI-tool directories and "alternatives" listicles — specific targets

### Directories (from Smol Launch + LaunchBoosts roundups; curated only)

| Target | URL | Cost | Link | Notes |
|---|---|---|---|---|
| Toolify | https://www.toolify.ai/ (submit) | **$99 one-time** (+$49 per update) — corrected 2026-09-19; a free queue may or may not still exist | dofollow | Generates https://www.toolify.ai/alternative/leiapix-ai — but at $99 it is not worth it in Foundation phase; AlternativeTo/SaaSHub/AIxploria give the same "alternatives page" effect free |
| There's An AI For That | https://theresanaiforthat.com/ (submit) | Free basic (long queue) / paid | dofollow | Highest DR in the AI niche; category "3D" / "image animation" |
| Uneed | https://www.uneed.best/ | Free (1 product) | dofollow | Weeks-long queue; submit early |
| DevHunt | https://devhunt.org/ | Free | dofollow | Quick approval; open-source angle helps |
| Fazier | https://fazier.com/ | Free launch | dofollow | Quick |
| TinyLaunch | https://tinylaunch.com/ | Free | dofollow | Same week |
| Smol Launch | https://smollaunch.com/ | Free standard | dofollow (verified) | Same week |
| SaaSHub | https://www.saashub.com/ | Free / paid dofollow | nofollow free | Produces "alternatives" pages |
| AlternativeTo | https://alternativeto.net/ | Free | nofollow | Worth it anyway: it is where "LeiaPix alternative" browsers land; add Gifsy as an alternative to Immersity AI / LeiaPix / Depthy |
| Product Hunt (already listed) | https://www.producthunt.com/products/gifsy | — | dofollow | Complete the profile (gallery, maker bios, "alternatives" section), add Immersity/Depthy as "alternatives to" |
| Hacker News — Show HN | https://news.ycombinator.com/show | Free | dofollow | Angle: "depth model runs in the browser (ONNX Runtime Web), embeddable iframe"; precedent: "Show HN: 3D-Parallax" (item 25643097) |
| Futurepedia | https://www.futurepedia.io/ | $247–497 paid only | dofollow | **Skip** at this budget |
| SourceForge / Slashdot alternatives pages | https://sourceforge.net/software/product/Immersity-AI/alternatives · https://slashdot.org/software/p/Immersity-AI/alternatives · https://sourceforge.net/software/product/LeiaPix-Converter/alternatives | Free vendor listing | nofollow-ish | Create a SourceForge software listing so Gifsy appears on these already-ranking pages |
| G2 / Capterra | https://www.g2.com/ · https://www.capterra.com/ | Free | nofollow | Low priority; entity signal only |

Also (from run 01 and this run): https://www.aixploria.com/en/immersity-ai-leiapix/
(AIxploria lists "26 alternatives" — submit a tool), https://topai.tools/alternatives/immersity-ai
(submit a tool), https://www.ebool.com/alternatives/parallax-3d.

### "Alternatives" listicles worth pitching (editorial niche edits)

| Target | URL | Contact path | Pitch angle |
|---|---|---|---|
| Animagen — "Top 10 Immersity AI (Originally Leiapix) Alternatives" (3,200 w, updated Jun 2025, all 10 tools linked) | https://www.3dpicmaker.com/blog/leiapix-immersity-alternatives.html | contact@animagen.com ("Animagen Team") | They are a competitor, so pitch as "the only *embeddable/interactive* option — your list has Depthy as the sole interactive viewer and nothing that embeds". Low odds (20%), high value |
| leaveit2ai — "Immersity AI Review (2026): Is the LeiaPix 3D converter still free?" | https://leaveit2ai.com/ai-tools/image/immersity-ai | site contact form | Reviewer already questions Immersity's status; offer Gifsy as the free-tier, one-time-price alternative |
| vidau.ai — "AI Like Immersity Free: 7+ Essential Tools" | https://www.vidau.ai/ai-like-immersity-free-4-essential-tools-to-know/ | site contact | "Free, no-account, runs in browser" fits their framing |
| Scrollsequence — "Converting 2D images to fake 3D immersive content" | https://v2.scrollsequence.com/converting-2d-images-to-fake-3d-immersive-content/ | WordPress plugin vendor, contact page | They sell scroll effects to web builders; Gifsy is a complementary embed |
| Sygnal KB — "Image 2.5D Parallax Effects" (Webflow agency, recommends Depth Anything + hand-rolled WebGL) | https://www.sygnal.com/kb/image-25d-parallax-effects | /contact, LinkedIn, X | Best single target found: a Webflow agency article that walks readers through building exactly what Gifsy ships. Pitch: "for readers who don't want to write the shader, here's a hosted iframe version" |
| Memberstack — "Cloneable Webflow parallax animation templates" | https://www.memberstack.com/blog/cloneable-webflow-parallax-animation-templates | marketing team | Only after the cloneable exists (§c) |
| Waxy.org — "Turning photos into 2.5D parallax animations with ML" (2019, still ranks) | https://waxy.org/2019/11/turning-photos-into-2-5d-parallax-animations-with-machine-learning/ | Andy Baio, public email | Long shot; ask for an "update: browser-native tools now exist" note |

Realistic conversion at DR 0–5: 10–15% → 1–2 of these in 90 days. Send after
the comparison page and explainer exist so there is a URL worth citing.

## (b) The "Made with Gifsy" badge as a link mechanic

### What the code does today (and why it earns nothing)

- The embed snippet users copy is a bare iframe:
  `<iframe src="https://www.gifsy.fun/embed/<id>" …>` (`app/s/[id]/scene-client.tsx:30`,
  `components/CreateWorkshop.tsx:605`).
- The badge is an `<a href="/?ref=…" target="_blank" rel="noreferrer">Made with Gifsy</a>`
  rendered **inside the iframe document** (`components/SceneViewer.tsx:380-389`),
  i.e. on `gifsy.fun/embed/<id>`, which is `noindex`.
- Consequence: the only link is gifsy.fun → gifsy.fun. Crawlers attribute iframe
  content to the iframe's own URL, not the host page. **The host site passes no
  link equity, no anchor, nothing.** The badge is purely a click/awareness
  mechanic right now. It should stay for that reason, but it is not a backlink.

### Google's rule on widget links

Google's guidelines and Search Console messaging explicitly list "widget links"
(keyword-rich, hidden or low-quality links embedded in widgets distributed
across sites) as link spam; the sanctioned fix is `rel="nofollow"` or removing
the link (Search Engine Land coverage of Google's widget-link reminder). The
distinction Google draws is **user control**: a link the site owner did not
choose and cannot edit is not an endorsement. A forced followed link in the
embed snippet is therefore a red flag for a new domain, doubly so if it ever
carried "3D photo maker" as anchor.

### How to make it a followed link safely

Make the link something the host owner *chooses* and *can edit*, in the host
page's own HTML, with a branded anchor. Concretely:

1. **Add an optional "credit line" toggle to the embed code UI** (`scene-client.tsx`
   and `CreateWorkshop.tsx`). Default off for Pro; for Free scenes default it
   *on* but plainly editable, e.g.

   ```html
   <iframe src="https://www.gifsy.fun/embed/abc" style="width:100%;height:500px;border:0" loading="lazy" title="3D photo"></iframe>
   <p class="gifsy-credit"><a href="https://www.gifsy.fun/?ref=embed" rel="nofollow">Made with Gifsy</a></p>
   ```

   Ship it `rel="nofollow"` by default. Nofollow has been a *hint* since 2020,
   the host owner can strip the attribute, and Google's own guidance is
   satisfied. This is the Unsplash/Spline pattern: attribution the publisher
   controls.
2. **Offer an explicit "link back and get featured" trade** (see §c/§d): sites
   that keep a followed credit line can submit their page to a "Made with Gifsy"
   showcase in `/gallery`. That is a reciprocal link, but a natural, low-volume,
   user-initiated one — the same shape as "built with Webflow" showcases. Cap it
   (curated, <20 sites) so it never looks like a scheme.
3. **Terms wording**: `app/terms/page.tsx` currently forbids hiding the in-iframe
   badge on Free scenes. Keep that for the *in-iframe* mark; do **not** make the
   HTML credit line mandatory — a mandatory followed link is exactly the widget
   pattern Google penalises.
4. **Keep the in-iframe badge** as is (it drives clicks and referral tracking),
   but note in analytics that `brand_clicked` is a traffic signal, not SEO.

### Anchor to use

- Anchor: **"Made with Gifsy"** or **"Gifsy"** (branded). Never "3D photo maker",
  "interactive 3D photo", or any target keyword.
- Link target: homepage (`/`), with `?ref=embed` for attribution. Do not point
  it at `/create` or `/pricing` (money-page concentration is another red flag).
- Because every credit line uses the same anchor, keep total volume low and
  organic; identical anchors from dozens of sites in one month is a SpamBrain
  pattern. At the current scale (handful of Free embeds) this is not a concern.

## (c) Webflow / Framer community surfaces

| Surface | URL | What to ship | Link outcome |
|---|---|---|---|
| Made in Webflow — Cloneables | https://webflow.com/made-in-webflow/cloneables ("Submit Cloneable": name, description, docs URL) | "3D Photo Hero (Gifsy embed)" cloneable: hero section with Embed element + Gifsy iframe, responsive height, poster fallback; docs page on gifsy.fun (`/guides/webflow`) | Cloneable page on webflow.com links to the docs URL (DR 90+). Also gets a `*.webflow.io` live link |
| Made in Webflow — Showcase | https://webflow.com/made-in-webflow/showcase | Rebuild a Gifsy demo/landing in Webflow and showcase it | Profile + site link |
| FlowRadar | https://www.flowradar.com/ ("Add resource" in footer) — categories https://www.flowradar.com/cloneable-categories/parallax and /image | Submit the cloneable; links go to a FlowRadar expert profile, which can hold the gifsy.fun URL | 1 RD, plus placement on the parallax category page that already ranks |
| Flowfav | https://www.flowfav.com/ | Same cloneable | 1 RD |
| Showcased.webflow.io | https://showcased.webflow.io/ | Same | 1 RD (small) |
| Webflow Forum | https://discourse.webflow.com/ (thread "Background Hero Image Parallax Scroll?" /t/51357 and similar) | Answer existing parallax/3D-image threads with the cloneable; no link drops without an answer | UGC links (nofollow), referral traffic, NavBoost |
| Webflow Marketplace (Apps) | https://developers.webflow.com/apps/docs/marketplace-guidelines · https://help.webflow.com/hc/en-us/articles/33961398704915 | Later (month 4+): a Designer Extension that inserts a Gifsy scene. Review 10–15 business days, 2FA + staging site required | Permanent integration-page link; highest value in this table but most effort |
| Framer Gallery | https://www.framer.com/community/gallery/ — how-to: https://www.framer.com/help/articles/publish-site-to-gallery/ | Submit a Framer site using a Gifsy embed (portfolio category: https://www.framer.com/community/gallery/categories/portfolio/) | Gallery card links to the live site; profile can link to gifsy.fun |
| Framer Community — Site Showcase | https://www.framer.community/c/showcase | Post the site with a short process write-up | UGC link + traffic |
| Framer Marketplace (components/templates) | https://www.framer.com/help/articles/get-visibility-in-the-community/ (only content with visual media appears in "Hype"; use video) | Free "3D Photo Embed" component (code component wrapping the iframe with height/poster props) and a portfolio template using it | Marketplace listing links to creator + docs |
| Memberstack cloneable roundup | https://www.memberstack.com/blog/cloneable-webflow-parallax-animation-templates | Pitch inclusion once the cloneable exists | Editorial link, DR 60+ |

Guides on gifsy.fun (`/guides/webflow`, `/guides/framer`, `/guides/squarespace`)
are the landing targets for all of the above — this dovetails with run 01's
"embed 3D photo on website" cluster. Build the guides first; every community
submission needs a docs URL.

## (d) Linkable assets Gifsy can build

Ordered by link-earning potential per hour:

1. **"How a 3D photo works: depth map + matte + two planes" explainer** (already
   in the README backlog). Why it earns links: the existing top results
   (Sygnal KB, Waxy 2019, Alan Zucconi's parallax-shader post, arpatech blog)
   are either code-heavy or dated; nobody shows the *pipeline* with real
   intermediate images. 3-layer upgrade: (1) 2026 models (Depth Anything V2/V3
   in ONNX Runtime Web), (2) first-party screenshots of Gifsy's actual depth map,
   subject matte and displaced planes, plus an "honest failure cases" section,
   (3) an inline live demo the reader can drag. Target linkers: Webflow/Framer
   agency KBs, creative-coding blogs, university media-tech help pages (Emerson
   College has a "Creating a Parallax 2.5D Scene" article — `.edu` resource-page
   target). Named byline required (open question in README).
2. **Interactive demo scenes as standalone URLs** (the live embeddable demos
   already exist). Make 3–5 of them indexable at stable URLs (e.g.
   `/demo/portrait`, `/demo/architecture`), each with a caption, the embed code,
   and OG image. These are what people link to when they say "look at this".
   Decision needed on indexing `/s/[id]` (README open question): keep UGC out,
   but index a curated `/demo/*` set.
3. **The `/gallery`** — currently pre-rendered clips (per `CommunityShowcase.tsx`
   comment). Upgrade path: a "Made with Gifsy" section listing real customer
   sites (with their permission) — this is the reciprocal half of the badge
   trade in §b and the kind of page Webflow/Framer folks bookmark and share.
4. **Open-source the viewer** (or a thin `<gifsy-scene>` web component / npm
   package). The repo is "all rights reserved" with 0 stars; open-source unlocks
   awesome-lists (awesome-webgl, awesome-threejs, awesome-creative-coding),
   "open-source alternative to Immersity" roundups, and Dev.to/Hashnode
   write-ups — each a distinct link source type, which diversifies the profile.
5. **A small data piece** (Month 3+): "What fails in single-image depth: 200
   photos scored" — original data is the #1 link magnet in the playbook and
   Gifsy generates it as a by-product.

## (e) Red flags for a new domain — do not do these

- **Forced followed link in the embed snippet or any keyword anchor in the
  badge** — textbook widget-link spam (Google's explicit example); the fix
  Google prescribes is nofollow. Ship the credit line nofollow/optional (§b).
- **Mass directory submission** ("100+ free AI directories" lists, Fiverr
  "500 backlinks"): 50+ links in month 1 from a DR-0 domain trips `hostAge`
  scrutiny; most of those directories have no traffic. Cap at the ~12 curated
  ones above.
- **Paid directory "verified" tiers** (Futurepedia $247–497, SaaSHub paid
  dofollow) — not worth it at this stage; the money buys one link.
- **Reciprocal link rings / "I'll add you to my alternatives page if you add
  me"** with competitors (Animagen etc.) — fine to be listed, do not exchange.
- **Exact-match anchors anywhere** ("3D photo maker", "Immersity alternative")
  for the first 6 months; keep ≤3–5% overall, realistically 0 this quarter.
- **Wikidata entry now** — will be deleted for non-notability and burns
  credibility for a later attempt.
- **Press-release wires** — the playbook allows them for entity signals, but
  with a brand-name collision a wire release titled "Gifsy" mostly muddies the
  entity. If used, headline "Gifsy (gifsy.fun)" and lead with "interactive 3D
  photo embed".
- **Skyscraper outreach and guest posting before month 4** — the playbook rates
  skyscraper ⭐⭐ at DR 0–10; DR-70 blogs will not open the email. Build the
  assets first.
- **All links to the homepage** — spread targets: `/` (40–50%), guides +
  explainer (30–40%), `/create` / `/pricing` (≤10–20%).
- **A single-country monoculture** — the founder network may skew to one
  country; mix in the global directories and platform links above.

## Anchor text guidance (prescriptive; no backlink data available)

| Category | Target share | Gifsy-specific examples |
|---|---|---|
| Branded | 40–55% | "Gifsy", "Made with Gifsy", "Gifsy 3D", "gifsy.fun" |
| Naked URL | 15–20% | "https://www.gifsy.fun", "https://www.gifsy.fun/guides/webflow" |
| Generic | 15–20% | "this tool", "the embed guide", "here" |
| Partial match | 10–15% | "Gifsy's interactive 3D photo embed", "embed a 3D photo in Webflow with Gifsy" |
| Exact match | ≤3–5%, aim 0% this quarter | "3D photo maker", "Immersity alternative" — do not request |

Directory listings and the badge are naturally branded, so the first 30 links
will land ~80% branded, which is normal for Foundation. Partial-match anchors
should come only from editorial contexts (Sygnal KB, listicles) where the writer
chooses the phrase.

## Velocity guardrails

| Window | Target new referring domains | Source mix |
|---|---|---|
| Month 1 (Oct 2026) | 15–25 | entity profiles + curated directories + PH/GitHub cleanup; spread profile creation over 2 weeks |
| Months 2–3 | 5–10 / mo | community surfaces (Webflow/Framer), first listicle wins, testimonial/vendor showcase links, Show HN |
| Months 4–6 | 8–15 / mo | explainer + guides outreach, Memberstack/FlowRadar editorial, first guest post (DR 20–40 Webflow/Framer blogs), badge credit lines trickling in |
| Month 7+ | 10–20 / mo | Webflow Marketplace app, podcast guesting, open-source channels |

Red lines: never >50 RDs in a month; never >3 identical non-branded anchors in a
month; no month where one source type is >60% of new links after month 1; log
every link (date, domain, country, type, anchor, category) in a sheet from day
one (`link-velocity-redflags.md` tracking section).

## 30-day action list

1. Add Organization + SoftwareApplication JSON-LD with `sameAs`; add social/GitHub links to footer (`app/layout.tsx`).
2. Create X, LinkedIn, YouTube, Crunchbase, Wellfound, Medium, Dev.to; one post each; consistent name "Gifsy" + description "interactive 3D photo embeds".
3. Fix GitHub: website field, topics (`depth-estimation`, `parallax`, `threejs`, `onnxruntime-web`, `webflow`, `framer`), decide on an OSS license or split the viewer out.
4. Complete Product Hunt profile; add "alternatives" relations to Immersity AI, LeiaPix, Depthy.
5. Submit to Toolify, TAAFT, Uneed, DevHunt, Fazier, TinyLaunch, Smol Launch, AlternativeTo, SourceForge, AIxploria, topai.tools (spread over 2 weeks).
6. Ship the optional credit-line toggle (nofollow default, branded anchor) — 1 dev session.
7. Publish `/guides/webflow` and `/guides/framer` (run 01 cluster) — prerequisite for step 8.
8. Build and submit the Webflow cloneable + Framer Gallery site; submit to FlowRadar/Flowfav.
9. Post Show HN ("depth model runs in your browser; embeddable iframe").
10. Draft the explainer; pitch Sygnal KB and the Animagen/leaveit2ai/vidau listicles only once the comparison page and explainer are live.

## Sources

- https://www.producthunt.com/products/gifsy
- https://github.com/e-man07/gifsy
- https://www.gifsy.fun/
- Repo: `components/SceneViewer.tsx`, `app/embed/[id]/embed-client.tsx`, `app/s/[id]/scene-client.tsx`, `components/CreateWorkshop.tsx`, `app/terms/page.tsx`, `app/sitemap.ts`
- https://smollaunch.com/best-of/best-directories-to-submit-ai-tool-2026
- https://launchboosts.com/blog/top-ai-tool-directories-to-submit-your-startup
- https://directoryready.com/blog/best-ai-tool-directories-to-submit-to
- https://www.3dpicmaker.com/blog/leiapix-immersity-alternatives.html
- https://leaveit2ai.com/ai-tools/image/immersity-ai
- https://www.vidau.ai/ai-like-immersity-free-4-essential-tools-to-know/
- https://sourceforge.net/software/product/Immersity-AI/alternatives
- https://slashdot.org/software/p/Immersity-AI/alternatives
- https://topai.tools/alternatives/immersity-ai
- https://www.aixploria.com/en/immersity-ai-leiapix/
- https://www.toolify.ai/alternative/leiapix-ai
- https://www.ebool.com/alternatives/parallax-3d
- https://v2.scrollsequence.com/converting-2d-images-to-fake-3d-immersive-content/
- https://www.sygnal.com/kb/image-25d-parallax-effects
- https://waxy.org/2019/11/turning-photos-into-2-5d-parallax-animations-with-machine-learning/
- https://support.emerson.edu/hc/en-us/articles/31346352709787-Creating-a-Parallax-2-5D-Scene
- https://www.alanzucconi.com/2019/01/01/parallax-shader/
- https://webflow.com/made-in-webflow/cloneables
- https://webflow.com/made-in-webflow/showcase
- https://www.flowradar.com/cloneable-categories/parallax
- https://www.flowfav.com/
- https://www.memberstack.com/blog/cloneable-webflow-parallax-animation-templates
- https://discourse.webflow.com/t/background-hero-image-parallax-scroll/51357
- https://developers.webflow.com/apps/docs/marketplace-guidelines
- https://help.webflow.com/hc/en-us/articles/33961398704915-Webflow-Marketplace-overview
- https://www.framer.com/help/articles/publish-site-to-gallery/
- https://www.framer.com/help/articles/get-visibility-in-the-community/
- https://www.framer.com/community/gallery/
- https://www.framer.community/c/showcase
- https://news.ycombinator.com/item?id=25643097
- https://searchengineland.com/google-reminds-webmasters-widget-links-webmaster-guidelines-258393
- https://pi-datametrics.com/blog/googles-widget-linking-reminder-next-google-update/
- https://learn.g2.com/google-link-guidelines

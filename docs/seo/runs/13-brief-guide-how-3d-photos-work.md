# Run 13 — content-brief: `/guides/how-3d-photos-work`

Date: 2026-09-17 · Skill: `content-brief` (definition/explainer template) · Cluster: run 06,
spoke 4 (the information-gain / E-E-A-T anchor). Context: `_brief-context.md`.

Author: TBD (named founder byline planned, not yet confirmed — see README open questions).

## Method

- SERP reads (Google, US): "how do 3D photos work", "depth map photo explained parallax
  2.5D", "3D photo effect explained depth map how it works", "monocular depth estimation
  explained single image", "Apple spatial photos how they work iPhone depth".
- Fetched and read: Meta Tech blog (2019), TechCrunch (2018), Alan Zucconi parts 1 + 2,
  Sygnal KB "Image 2.5D Parallax Effects", Looking Glass "Depth Maps", Shotkit,
  ExpertPhotography, Ultralytics MDE guide, MacRumors "Spatial Scenes", official
  Depth Anything V2 / LaMa / DIS repos (for canonical citation URLs).
- Repo read for technical exactness: `lib/depth.ts`, `lib/depth-split/client.ts`,
  `lib/rendering/refine.ts`, `lib/rendering/scene.ts`, `lib/inpaint/lama.ts`,
  `lib/showcase.ts`, `components/CreateWorkshop.tsx`, `app/privacy/page.tsx`,
  `gifsy-3d-handoff.md` §4 ("Why 2.5D instead of true 3D") and §39.
- Not available in this tooling: PAA boxes, snippet holder, AI Overview presence. Check
  manually before writing (README "Manual checks").

## Target keyword analysis

| | |
|---|---|
| Primary | **how do 3D photos work** |
| Secondary | depth map photo · 2.5D parallax · 3D photo effect explained · monocular depth estimation |
| Dominant intent | **Informational**, mixed sub-intents (see below) |
| Apparent difficulty | **Moderate**. Page 1 is old-but-authoritative (Meta 2019, TechCrunch 2018, Zucconi 2019) plus generic photography magazines (Shotkit, ExpertPhotography). No result is written after 2024 except Sygnal's KB and the iOS 26 Spatial Scenes how-tos. Nobody on page 1 has a live, current pipeline to show. |
| Realistic 3-month position | 15–30 for the primary (aged incumbents, no freshness); top 10 for "3D photo effect explained" and "2.5D parallax" long-tails, which are thinner. |
| Content type | **definition / explainer** (H1 "What is… / How do…", paragraph snippet, `TechArticle` + `FAQPage` + `BreadcrumbList`) |

**The SERP splits three ways**, and the article must name all three in the first 100 words
so it matches the query no matter which the searcher meant:

1. **Stereo photography** (two lenses, one per eye) — Shotkit, ExpertPhotography, Quora,
   Owl3D. Oldest meaning; "3D camera", anaglyph, wigglegram.
2. **Phone "3D photos"** — Facebook 3D Photos (2018–2020), Apple Spatial Photos (Vision
   Pro-only stereo pairs) and iOS 26 Spatial Scenes (single photo → depth → parallax on
   tilt). Meta Tech blog, TechCrunch, MacRumors, AppleInsider.
3. **Depth-parallax / 2.5D from one photo** — Zucconi, Sygnal, Looking Glass, the AI-tool
   blogs. This is Gifsy's meaning and where the page should win.

Core entities that must appear (5–8, not a 50-word NLP list): depth map · monocular depth
estimation · parallax · subject matte (alpha / cut-out) · inpainting · disocclusion ·
height-field (bas-relief) · WebGL / Three.js.

## SERP competitive intelligence

| # | URL | ~Words | Format | Key sections | What it misses |
|---|---|---|---|---|---|
| 1 | tech.facebook.com/reality-labs/2019/10/3d-photos-how-they-work-and-how-anyone-can-take-them/ | 2,200 | Explainer + shooting tips (2019) | 3D photo essentials; how to create; tips (18 in–10 ft range, hair/glass/motion fail, landscapes need foreground) | Dual-camera stereo only; "3D model from the gradient" hand-waved; no AI monocular depth, no matte, no inpainting; the product it explains no longer exists in Stories. |
| 2 | techcrunch.com/2018/06/07/how-facebooks-new-3d-photos-work/ | 2,100 | Tech journalism (2018) | Dual camera → depth map → mesh → "torn" edges → CNN hallucinates occluded pixels; "artifacts and weirdness if you look closely" | Only prose, no intermediate images; mesh-based (not two planes); 8 years old; no single-image path. |
| 3 | shotkit.com/3d-photography/ | 2,900 | Magazine guide | Stereoscopic, anaglyph in Photoshop, "How to take a 3D picture on Facebook", app list (LucidPix), FAQ | Depth map = "white close, black far" and stops; no pipeline; heavy affiliate/app padding. |
| 4 | expertphotography.com/3d-photography | 2,500 | Magazine guide | Stereoscope history, rocking/tripod/mirror-splitter methods | Pure stereo; no parallax, no depth estimation. |
| 5 | alanzucconi.com/2019/01/01/facebook-3d-photos/ (+ /parallax-shader/) | 1,800 + 2,000 | Developer tutorial (Unity) | Parallax as pixel shifting; UV displacement shader; depth map generation from dual cameras | Single-plane UV shift ("only a cheap approximation"); no matte, no inpainting, no discussion of edge smear; Unity not web. **Cite as prior art**, as run 06 says. |
| 6 | sygnal.com/kb/image-25d-parallax-effects | 3,500 | Agency KB (current) | 5 ways to get a depth map (Depth Anything V2/V3, MiDaS, portrait mode, stereo, Z-depth, hand-painted); WebGL shader; limitations; tuning table | Closest competitor and the run 08 link target. Single displaced plane; no subject separation, no inpainting; no screenshots of failure modes; no data-flow/privacy angle. |
| 7 | blog.lookingglassfactory.com/depth-maps-how-software-encodes-3d-space/ | 1,800 | Definition | What a depth map is; portrait mode, LiDAR, medical, Facebook, Looking Glass | Notes "no set standard" for near/far polarity — worth adopting as a fact; nothing on rendering. |
| 8 | ultralytics.com/blog/what-is-monocular-depth-estimation-an-overview | 3,500 | CV explainer | MiDaS, DPT, ZoeDepth, Depth Anything V2; relative vs metric depth | Zero mention of photos/parallax; robotics audience. Use its relative-vs-metric distinction. |
| 9 | macrumors.com/how-to/ios-3d-lock-screen-effect-spatial-scenes/ | 550 | How-to | Spatial Scenes = separate subject + depth map + parallax on tilt; iPhone 12+ | No explanation of how; but proves Apple ships the same three-stage idea (separation → depth → parallax). |

Average of the top 5 ≈ 2,300 words → target **2,200–2,500 words**. Run 06 said 2,200; do
not pad past ~2,500. Depth comes from the screenshots, not word count.

## Content gap analysis (what this page can say that none of the nine do)

1. **Real intermediate artefacts from a live pipeline.** No result shows the depth map, the
   matte, and the subject-painted-out backdrop for the *same* photo. TechCrunch describes
   them; nobody shows them. This is the information-gain core — four first-party screenshots.
2. **Why edges smear, and what is done about it.** Zucconi admits the technique is "a cheap
   approximation"; Sygnal has a limitations list. Neither explains the halo (depth bleeding
   across the silhouette) or the fix (edge-aware refine + matte-authoritative silhouette).
3. **Why two planes, not a mesh.** Facebook's 2018 pipeline tore a mesh; Zucconi displaces a
   single plane. Nobody explains the middle path (subject plane + backdrop plane) or why a
   single displaced plane reads as "a sheet tilting".
4. **The honest cone.** No page gives a number for how far you can orbit a single-image
   depth scene before it breaks. Gifsy has one (±23° / ±13°) and the QA reasoning behind it.
5. **Disambiguation.** Nobody puts stereo photo / Facebook 3D photo / Apple Spatial Photo vs
   Spatial Scene / 3D model (GLB) / 3D video (MP4 parallax export) / interactive 2.5D embed
   in one table. The SERP fragmentation *is* the opportunity.
6. **Data flow.** No competitor says what leaves the device. Gifsy's split-model design is
   unusual and checkable.
7. **Relative depth, not metres** (Ultralytics has it, nobody in the photo SERP does) — and
   the practical consequence: percentile normalisation, contrast S-curve.
8. **"You don't need portrait mode."** Meta/TechCrunch pages are dual-camera-first; iOS 26
   and Depth Anything make that obsolete. State it plainly (run 06 spoke note).

Sub-topics 2+ competitors cover that must not be skipped: depth map polarity convention
(white = near) · why fine hair/glass/water fail · "it's an illusion, not real 3D" ·
Facebook 3D photos as the thing people remember.

## The pipeline the writer must describe (technically exact — from the repo)

Plain-English chain, in this order, used as the H2 spine:

**photo → depth map → subject matte → inpainted backdrop → two displaced planes → camera
orbit.**

Facts per stage. Everything below is verified in code on 2026-09-17; if a number changes,
the constant name is given so it can be re-checked.

### Stage 1 — Depth map (monocular depth estimation)

- Model: **Depth Anything V2 Small**, fp16 ONNX export, run in the browser with
  onnxruntime-web (WASM/WebGPU). 24.8 M parameters, Apache-2.0 (the only V2 size under a
  permissive licence — Base/Large/Giant are CC-BY-NC). Cite the paper (arXiv 2406.09414,
  NeurIPS 2024) and repo.
- It is a **ViT with 14-px patches**: the photo is resized keeping aspect ratio so the long
  edge is ≤ 518 px and *both* dimensions are rounded to a multiple of 14 (`INPUT_SIZE`,
  `preprocess()` in `lib/depth.ts`). On capable devices (≥ 8 GB memory and ≥ 8 cores,
  `depthWorkingSize()`) the 3D path uses a **770 px** pass (`THREED_INPUT_SIZE`) so the
  later edge refine has more real detail to work with. Cost grows ~quadratically, which is
  why it's device-gated.
- Output is **relative depth**, not metres (say this — Ultralytics is the only page that
  does). It is normalised to 0..1 using a **robust 0.5 / 99.5 percentile** min/max so a few
  outlier pixels can't flatten the whole map (`estimateDepthGrid()`). Convention on Gifsy:
  **brighter = closer** (Looking Glass correctly notes there is no universal standard —
  mention it once).
- **Split model.** The network is cut in two (`scripts/split-depth-model.py`): the browser
  always runs the encoder (44.3 MB, public, cached). The DPT head runs locally on Pro, or on
  the server on Free — the free tier POSTs the encoder's boundary activations, not the
  image. The free path clamps the working size so those activations fit the request limit
  (`remoteSafeWorkingSize`, ≤ 1,100 patches ≈ 3.4 MB); Pro keeps the full 770.
  *Writer: say "on Free the depth pass runs at a slightly lower resolution" only if you want
  to; it's true but not the point of this page.*

### Stage 2 — Subject matte

- Model: **ISNet** (from the DIS project, "Highly Accurate Dichotomous Image Segmentation",
  ECCV 2022), via `@imgly/background-removal`, fp16, entirely in the browser. Produces a
  per-pixel alpha (the cut-out).
- Clean-up (`cleanCutout()` in `refine.ts`): alpha below 24/255 is dropped (fringe), islands
  smaller than 5 % of the largest region are erased (a crumb, a blade of grass), then a 1-px
  feather. The matte is kept **full-frame**, registered to the image and depth — never
  cropped — because the 3D layers must line up.
- Segmentation is an enhancement, not a requirement: if ISNet finds nothing to isolate the
  scene falls back to **depth-only** (one displaced plane) — the app literally shows
  "Depth-only view — segmentation couldn't separate a subject". This is the honest way to
  explain why some photos "look flat".

### Stage 2½ — Refining the depth with the matte (the part nobody writes about)

`refineDepthGrid()` in `lib/rendering/refine.ts`, all CPU, once per generation:

- **Guided filter** (He et al.) using the photo's luminance as the guide: depth edges are
  snapped onto real image edges. Radius = 2 % of the short edge, clamped 3–16 px; ε = 4e-3.
- **Halo removal.** The raw depth "bleeds" a soft halo into background pixels hugging the
  subject, which renders as a fuzzy cardboard cut-out. Pixels inside the subject *plus* a
  contamination band around it are marked unknown; background depth is extrapolated inward
  through that band with a push-pull pyramid; then the subject's own relief is kept inside
  the alpha and lifted forward by a small fixed amount (`SUBJECT_FORWARD = 0.06`) so it
  always leads the backdrop.
- **Depth contrast S-curve.** Real photos bunch depth in the mid-range, which reads flat once
  displaced. A smootherstep remap (`DEPTH_CONTRAST = 0.35`) steepens the middle so
  near/mid/far separate — more *perceived* depth without more displacement (which is what
  causes artefacts). Then renormalise to full 0..1.

### Stage 3 — Inpainted backdrop

- Why: when the subject slides, the pixels it used to cover become visible
  (**disocclusion**). Without a fill you see a smeared ghost of the subject.
- **Preview (in browser):** a push-pull fill — the subject region plus a thin band is treated
  as a hole and filled from surrounding background (`inpaintBackground()`). Sharp version is
  the backdrop's base map; a blurred copy is used for the optional background-blur control.
- **Publish (server, once):** **LaMa** ("Resolution-robust Large Mask Inpainting with Fourier
  Convolutions", WACV 2022; big-lama, Carve/LaMa-ONNX fp32 export) paints the subject out
  properly. Fixed **512×512** input, image letterboxed to preserve aspect, mask 1 = erase,
  fill mapped back to source resolution (`lib/inpaint/lama.ts`). It runs at publish, not in
  the viewer, and only once — the published scene ships the baked `-bg` file.
- Why it matters visibly: `lib/showcase.ts` notes the push-pull fallback "leaves a flat
  smeared rectangle in the gap parallax opens up beside the subject", worst on landscapes.
  That is the screenshot comparison to make (see Screenshot plan).

### Stage 4 — Two displaced planes (Three.js)

- **Two `PlaneGeometry` meshes, 150×150 segments each** (`GEO_SEGMENTS`): a backdrop plane
  (textured with the inpainted fill, 8 % overscan so a slide never reveals a gutter) and a
  subject plane (photo × matte alpha), each vertex-displaced by the refined depth in a custom
  `ShaderMaterial`. A third thin mesh is the **contact shadow**: a soft black copy of the
  silhouette sitting 0.03 units in front of the backdrop, lagging the subject so a gap opens
  under it as it moves (strength `0.35 × 0.45`).
- Why two planes and not a mesh (from `gifsy-3d-handoff.md` §4 and `lib/showcase.ts`):
  hidden surfaces don't exist in one photo; mesh topology from a single depth map gets ugly
  at every silhouette; GLB export is a different product. And **depth without separation
  isn't legibly 3D** — one displaced plane "reads as a flat sheet tilting rather than a
  subject standing in front of a background". Two planes give the strongest depth cue there
  is: subject moving against background.
- Why not a single shifted plane like Zucconi's shader: the depth step at the silhouette
  stretches the texture into a horizontal smear. Gifsy slides the subject plane
  **near-rigidly** (`FG_RELIEF_XY = 0.15`) so its feathered edge translates instead of
  stretching.
- **Cover-fit camera.** The plane is 1.6 units on its long side; the camera is placed at the
  exact distance that makes the plane cover the viewport (`coverDistance()`), with an 8 %
  bleed at rest (`COVER_REST = 0.92`) to hide the sway, and it eases in on hover
  (`COVER_HOVER = 0.84`). Subject-only scenes use contain-fit instead so feet/cans aren't
  cropped.
- Two motion modes: **hover parallax** (pointer → depth-weighted XY offset; the subject
  responds ~3× more than the backdrop, `PARALLAX_FG 0.34` vs `PARALLAX_BG 0.1`, pivoting on
  depth `0.4`) and **orbit / "Spin"** (grab-to-drag steers a real camera arc around the
  displaced relief — actual perspective and self-occlusion, not a shader slide).

### Stage 5 — Camera orbit and the honest cone

- `ORBIT_MAX_THETA = 0.4 rad ≈ 23°` azimuth, `ORBIT_MAX_PHI = 0.22 rad ≈ 13°` elevation.
- Why: a single-image depth map is a **one-sided height-field** (a bas-relief). It has no back
  and no side surfaces, so past a shallow cone the stretched silhouette edges smear. Verified
  against real frames (`qa-3d/verify`): at ±32° / ±19° a frame-filling cartoon smeared its
  outer third; the tighter cone keeps a held drag inside the honest zone.
- The camera radius is 0.85× the cover distance because a plane tilted to the cone's corner
  foreshortens by cos(0.4)·cos(0.22) ≈ 0.896 — any larger and the viewport sees past the
  plane's corner. (Good "we hit this bug" first-person detail — the old 0.9 showed a bare
  corner at every orbit extreme.)
- **The viewer never runs AI.** A published embed loads image + depth + mask + backdrop and
  draws them with WebGL. The AI ran once, at creation; everything after is GPU at 60 fps.

## Recommended outline

Working H1 (definition template; keeps the primary phrase and the three-way disambiguation):

**H1: How do 3D photos work? Depth maps, mattes and two planes, explained**

Word budget ≈ 2,300. Primary keyword: H1, first 100 words, two H2s. Hub link in the first
40 % (≈ before word 900).

1. **Intro + snippet paragraph (no H2, or H2 "What a 3D photo actually is")** — *featured
   snippet target, paragraph format, 40–60 words*, e.g.: "A 3D photo is a single 2D image that
   moves as if it had depth. Software estimates how far every pixel is from the camera (a
   depth map), separates the subject from the background, fills in what the subject was
   hiding, then shifts the layers by different amounts as you move — parallax — so your eyes
   read depth." Then one paragraph naming the three meanings (stereo pairs, phone "3D
   photos", depth-parallax) and stating this article covers the third, which is what
   Facebook 3D Photos, iOS 26 Spatial Scenes and Gifsy all do. **Hub link here**, anchor
   "using interactive 3D photos on a website" → `/guides/interactive-3d-photos-for-websites`.
2. **H2: The pipeline in one line** — the six-step chain as an ordered list (list-snippet
   candidate for "3D photo effect explained"), one sentence each, with a single composite
   figure: photo | depth | matte | backdrop, side by side.
3. **H2: Step 1 — The depth map: how software guesses distance from one photo** — monocular
   depth estimation defined in a 40-word paragraph (secondary-keyword snippet); relative vs
   metric; 14-px patches; 518/770 working size; percentile normalisation; brighter = closer;
   "you don't need portrait mode or a dual camera — Meta's 2018 pipeline did, this doesn't".
   Cite Depth Anything V2. **Screenshot A.**
4. **H2: Step 2 — The subject matte: deciding what's in front** — ISNet; full-frame alpha;
   fringe/island clean-up; the depth-only fallback and what it looks like. **Screenshot B.**
   H3: **Why the raw depth map has a halo, and how the matte fixes it** — guided filter,
   halo band, subject-forward lift, S-curve. **Screenshot C (raw vs refined depth crop).**
5. **H2: Step 3 — The backdrop: painting the subject out** — disocclusion explained;
   push-pull preview vs LaMa at publish; 512 letterbox; why this is the step that stops
   smearing. Cite LaMa. **Screenshot D.** Link "which photos produce the best depth" →
   `/guides/best-photos-for-3d-effect` here (busy backgrounds are the inpainter's hard case).
6. **H2: Step 4 — Two planes, not a mesh** — the Three.js scene; contact shadow; cover-fit
   camera; why not a mesh (Facebook tore meshes in 2018; hidden surfaces don't exist); why
   not one plane (sheet-tilting, edge smear); prior-art link to Zucconi. **Figure: exploded
   diagram of backdrop / shadow / subject planes** (can be a simple SVG, not a screenshot).
7. **H2: Step 5 — The orbit, and why it stops at 23°** — hover vs Spin; height-field; the
   cone numbers and the QA story; the 0.85 cover-radius bug. **Screenshot E (orbit extreme).**
8. **H2: What 3D photos can't do (honest limits)** — bullet list, list-snippet candidate:
   height-field (no back, no sides, no 360°); ±23° / ±13° cone; frame-filling subjects
   (fox at 52 % of frame smeared; subjects clipped by the frame edge tear on first drag —
   from `lib/showcase.ts`); busy or low-separation backgrounds (matte and inpaint both
   struggle); ≥ 640 px long edge (app warns below that: "depth has less detail to work
   with"); Meta's 2019 list still holds — hair, glass, water, motion blur, low light.
   Link → `/guides/best-photos-for-3d-effect` again if not already; it's the failure gallery.
9. **H2: 3D photo vs 3D model vs 3D video vs spatial photo** — the table (below). Link
   `/alternatives/immersity-ai` from the "3D video" row ("most 3D photo tools export an
   MP4 — see how the makers compare") and `/guides/embed-3d-photo-on-website` from the
   interactive row.
10. **H2: What leaves your browser (and what doesn't)** — the approved data-flow statement
    (below), verbatim; link `/privacy`; later link "what stays in your browser" →
    `/guides/3d-photo-privacy-in-browser` when it exists.
11. **H2: Frequently asked questions** — 6–8 (below), each answer 40–90 words.
12. **Closing CTA** — "make a 3D photo from your own image" → `/create`; the viewer needs no
    AI so the reader can drag a live scene on this page (inline embed of one demo scene from
    `lib/showcase.ts` — `dog-field` or `product-cans` — is the E-E-A-T proof; ask eng for a
    non-subject-only demo with a backdrop so the disocclusion is visible).

### Disambiguation table (H2 9)

| | Stereo / anaglyph photo | Facebook 3D Photo (2018–20) | Apple Spatial Photo | iOS 26 Spatial Scene | 3D model (GLB/USDZ) | 3D photo video (MP4) | Interactive 2.5D photo (this page) |
|---|---|---|---|---|---|---|---|
| Input | Two photos, one per eye | Dual-camera portrait (later single via AI) | Two lenses, iPhone 15 Pro+ | One photo | Photos/scans or a generator | One photo | One photo |
| Depth source | Your eyes fuse it | Stereo depth map | Stereo pair | AI depth map | Real geometry | AI depth map | AI depth map + subject matte |
| Hidden areas | n/a | CNN "hallucinated" | n/a | Generated | Modelled | Inpainted, then baked into video | Inpainted once (LaMa), baked into the scene |
| Viewable range | Fixed | Small parallax in feed / VR | Vision Pro only | Tilt the phone | Full 360° | Whatever the render chose | ±23° / ±13° cone, live |
| Interactive on a web page | No | No (feature retired) | No | No | Yes, heavy viewer | No (it's a video) | Yes, iframe, no AI at view time |
| Where it belongs | Prints, VR | Nostalgia | Vision Pro library | Lock screen, Photos | Product/AR | Reels, TikTok | Website hero, portfolio |

Keep the rows factual and concede where video wins (works everywhere, no iframe) — the
video-vs-interactive decision page (run 06 spoke 7) owns the argument.

### Approved data-flow statement (H2 10) — use these words

> Your photo stays in the browser. On the free plan, the depth model is split in two: your
> browser runs the first half on the photo, and the intermediate activations it produces
> — not the photo — are sent to our server for the second half, then the depth map comes
> back. On Pro, both halves run on your device and the depth step is fully local. When you
> publish, the finished scene — the processed image, its depth map, the subject mask and
> the generated backdrop — is uploaded so it can be embedded, and at that point your image
> and mask are also sent once to the inpainting step. Published scenes are public.

Do **not** write "works offline" for the whole flow: publishing hits the inpaint server and
the upload. Acceptable: "3D depth runs fully on your device on Pro (offline after the first
download)". Do not soften the "published scenes are public" line.

### FAQ (H2 11) — 6–8 questions, answers 40–90 words, mirrored in `FAQPage`

1. **Do I need a portrait-mode or dual-camera photo?** No. Monocular depth estimation
   predicts depth from a single ordinary JPEG. Facebook's 2018 3D Photos needed a
   dual-camera depth map; today's models (Depth Anything V2) don't. Portrait-mode depth
   isn't used even if it's present.
2. **Is a 3D photo a real 3D model?** No — it's a height-field: one surface with depth
   pushed into it, plus a separate subject layer. There's no back or sides, so you can't
   rotate it 360°. A 3D model (GLB) has real geometry all round. (Link the table.)
3. **What is a depth map?** A grayscale image where each pixel's brightness is its estimated
   distance from the camera. On Gifsy brighter = closer; other tools flip it. It's
   *relative* depth — near vs far — not metres.
4. **Why do the edges look stretched or smeared?** Because a single-image scene is a
   height-field: when the camera goes too far round, the silhouette edge has to cover
   surfaces the photo never saw. That's why the orbit is capped at about ±23° and why
   frame-filling subjects and subjects cut off by the frame edge look worst.
5. **How is this different from Facebook 3D photos or iPhone Spatial Scenes?** Same idea —
   separate subject, estimate depth, parallax on motion — but those live inside one app.
   An interactive 2.5D photo is a web page element you can embed anywhere, and (on Gifsy)
   it's a live scene, not a video.
6. **Does the 3D photo run AI while people look at it?** No. The models run once when the
   scene is created; a published scene ships an image, a depth map, a mask and a backdrop
   and draws them with WebGL. It loads in seconds and runs at 60 fps.
7. **Is my photo uploaded to make it 3D?** (Use the approved statement, shortened: photo
   stays in the browser; Free sends activations, not the photo; Pro fully local; publishing
   uploads the finished scene and makes it public.)
8. **What photo resolution do I need?** At least ~640 px on the long edge; below that the
   depth pass has little detail and the result is soft. The depth model works at 518 px
   (770 px on capable devices), so a 4K source doesn't add depth detail — but it does give
   a crisper subject matte and texture.

## Screenshot plan (the information-gain core — real app, one photo throughout)

Use **one photo for A–E** so the reader can follow a pixel through the pipeline. Choose a
subject that sits well inside the frame with visible background (per `lib/showcase.ts`:
subject share well under half the frame, not clipped by any edge, receding background).
The current demo set is subject-only; shoot or pick a new scene *with* a backdrop so D and
E show disocclusion. Save as WebP, ≤ 200 KB each, real alt text.

| ID | What to capture | How |
|---|---|---|
| A | **The depth map** — grayscale, brighter = closer | `depthGridToCanvas()` output of the *raw* grid (before refine). Caption the working size printed in the console (`[3D] … grid WxH`). |
| B | **The matte** — subject on checkerboard/transparency, full-frame | The cleaned cut-out (`cleanCutout()`); show one crop of a hair/fur edge. |
| C | **Raw vs refined depth**, one crop at the subject edge | Left: raw map with the soft halo; right: `refineDepthGrid()` output with the edge snapped to the silhouette. This pairing is the single most "nobody else has this" image. |
| D | **The backdrop with the subject painted out** — two versions | Left: browser push-pull fill (preview); right: LaMa fill from the published scene's `-bg` asset. Caption: the flat rectangle vs a plausible background. |
| E | **An orbit extreme** — Spin mode dragged to the corner of the cone | Published viewer at (θ ≈ 23°, φ ≈ 13°). Optionally a second frame from a dev build past the cone (e.g. 32°) showing the smear, labelled "why we cap it". |
| F | **Exploded plane diagram** (SVG, not a screenshot) | Backdrop plane (overscan) → contact shadow → subject plane, with the camera and the cone drawn. |

Optional: a 3-second GIF/WebM of hover parallax vs Spin. Made with `/tools/gif` if useful.

## Hub & spoke architecture

- **Role:** spoke 4 of the run 06 cluster; the explainer both hub chapters ("what an
  interactive 3D photo is", "how it works in 60 seconds") link down to.
- **Links out (in body, in this order):**
  1. Hub — `/guides/interactive-3d-photos-for-websites`, anchor "using interactive 3D photos
     on a website", in the intro/section 1 (first 40 %). ≤ 3 hub links total.
  2. `/guides/best-photos-for-3d-effect` — anchor "which photos produce the best depth"
     (run 06 slug; the task's `/guides/best-photos-for-3d` isn't a planned route — use the
     run 06 slug, and link it only once that page is live; batch 3, month 3).
  3. `/guides/embed-3d-photo-on-website` — anchor "the full iframe embed guide", from the
     disambiguation table's interactive row and/or the "viewer never runs AI" paragraph.
  4. `/alternatives/immersity-ai` — anchor "how the 3D photo makers compare" from the 3D
     video row (they export MP4).
  5. `/create` — CTA anchor "make a 3D photo from your own image", after the limits section
     and at the end.
  6. `/privacy` from the data-flow section; later `/guides/3d-photo-privacy-in-browser`
     ("what stays in your browser") and `/compare/3d-photo-video-vs-interactive-embed` when
     they exist (run 06 map: 4 → hub · 6 · 13 · 7).
- **Links in (add on publish day):** hub chapters 2 and 4; `/` "how it works" section (run 06
  says a body link → spoke 4); `/create` explainer paragraph; spokes 6, 7, 13, 14 when
  written. Show HN once this page exists (README backlog).
- "Related guides" block only *after* the body so template links never precede the hub link.

## Technical optimisation

- **URL:** `/guides/how-3d-photos-work` · breadcrumb Home › Guides › How 3D photos work.
- **Title (58):** `How Do 3D Photos Work? Depth Maps & Parallax Explained | Gifsy`
  Alt (55): `How 3D Photos Work: Depth Map, Matte, Two Planes | Gifsy`
- **Meta (156):** `How a single photo becomes an interactive 3D scene: AI depth map, subject
  matte, inpainted backdrop, two displaced planes. Real pipeline screenshots and honest limits.`
- **Snippet formats:** paragraph under the H1 (primary); ordered list in H2 2 ("3D photo
  effect explained"); paragraph under H2 3 ("monocular depth estimation"); bullet list in
  H2 8; table in H2 9.
- **Schema:** `TechArticle` (headline = H1, author TBD, `datePublished`/`dateModified`,
  `image` = screenshot A or F, `about`: DefinedTerm "depth map", `proficiencyLevel:
  Beginner`) + `FAQPage` + `BreadcrumbList`. No `HowTo` — it's an explainer, not a task.
- `alternates.canonical`, per-page `openGraph.url`, add to `app/sitemap.ts`
  (`changeFrequency: monthly`, priority 0.7), shared `<GuideLayout>` with byline/updated
  date/breadcrumbs (README backlog).
- Server-render every word — this page cannot repeat the tool-page mistake (run 04/05).
  The inline live demo is client-rendered; the copy around it must not be.

### JSON-LD drafts

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.gifsy.fun/" },
    { "@type": "ListItem", "position": 2, "name": "Guides", "item": "https://www.gifsy.fun/guides" },
    { "@type": "ListItem", "position": 3, "name": "How 3D photos work", "item": "https://www.gifsy.fun/guides/how-3d-photos-work" }
  ]
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "How do 3D photos work? Depth maps, mattes and two planes, explained",
  "description": "How a single photo becomes an interactive 3D scene: AI depth map, subject matte, inpainted backdrop, two displaced planes in WebGL, and the limits of single-image depth.",
  "proficiencyLevel": "Beginner",
  "about": [
    { "@type": "DefinedTerm", "name": "Depth map" },
    { "@type": "DefinedTerm", "name": "Monocular depth estimation" },
    { "@type": "DefinedTerm", "name": "2.5D parallax" }
  ],
  "image": "https://www.gifsy.fun/guides/how-3d-photos-work/opengraph-image",
  "author": { "@type": "Person", "name": "TBD", "url": "https://www.gifsy.fun/about" },
  "publisher": { "@type": "Organization", "name": "Gifsy", "url": "https://www.gifsy.fun" },
  "datePublished": "2026-10-XX",
  "dateModified": "2026-10-XX",
  "mainEntityOfPage": "https://www.gifsy.fun/guides/how-3d-photos-work",
  "citation": [
    "https://arxiv.org/abs/2406.09414",
    "https://arxiv.org/abs/2109.07161",
    "https://arxiv.org/abs/2203.03041"
  ]
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Do I need a portrait-mode or dual-camera photo to make a 3D photo?",
      "acceptedAnswer": { "@type": "Answer", "text": "No. Monocular depth estimation predicts depth from a single ordinary photo. Facebook's 2018 3D Photos needed a dual-camera depth map; current models such as Depth Anything V2 do not, and portrait-mode depth data is not used even when present." } },
    { "@type": "Question", "name": "Is a 3D photo a real 3D model?",
      "acceptedAnswer": { "@type": "Answer", "text": "No. A 3D photo is a height-field: one surface with depth pushed into it, plus a separate subject layer. It has no back or sides, so it cannot be rotated 360 degrees. A 3D model (GLB or USDZ) has real geometry all the way round." } },
    { "@type": "Question", "name": "What is a depth map?",
      "acceptedAnswer": { "@type": "Answer", "text": "A depth map is a grayscale image in which each pixel's brightness represents its estimated distance from the camera. On Gifsy, brighter means closer; other tools use the opposite convention. It encodes relative depth (near versus far), not distances in metres." } },
    { "@type": "Question", "name": "Why do the edges of a 3D photo look stretched or smeared?",
      "acceptedAnswer": { "@type": "Answer", "text": "A single-image scene is a height-field, so when the camera moves too far around it, the silhouette has to cover surfaces the photo never captured and the texture stretches. That is why the orbit is capped at roughly ±23° horizontally and ±13° vertically, and why frame-filling or edge-clipped subjects look worst." } },
    { "@type": "Question", "name": "How is this different from Facebook 3D photos or iPhone Spatial Scenes?",
      "acceptedAnswer": { "@type": "Answer", "text": "The idea is the same: separate the subject, estimate depth, and shift layers as you move. Facebook 3D Photos and iOS Spatial Scenes only exist inside those apps. An interactive 2.5D photo is a web element you can embed on any site, and on Gifsy it is a live WebGL scene rather than a video." } },
    { "@type": "Question", "name": "Does a 3D photo run AI while people look at it?",
      "acceptedAnswer": { "@type": "Answer", "text": "No. The depth, matte and inpainting models run once when the scene is created. A published scene ships an image, a depth map, a subject mask and a backdrop, and the viewer draws them with WebGL, so it loads in seconds and runs at 60 fps without any model download." } },
    { "@type": "Question", "name": "Is my photo uploaded to make it 3D?",
      "acceptedAnswer": { "@type": "Answer", "text": "Your photo stays in the browser. On the free plan, intermediate depth-model activations (not the photo) are sent to the server for the second half of the model; on Pro the depth step is fully local. Publishing uploads the finished scene (image, depth, mask, backdrop) and it becomes public." } },
    { "@type": "Question", "name": "What photo resolution do I need for a 3D photo?",
      "acceptedAnswer": { "@type": "Answer", "text": "Around 640 px on the long edge or more. Below that the depth model has little detail to work with and the result looks soft. The depth pass itself runs at 518 px, or 770 px on capable devices, so a much larger source mainly improves the subject matte and texture rather than the depth." } }
  ]
}
```

Keep FAQ answers on the page identical to the JSON-LD text.

## E-E-A-T signals required

- **Experience:** first-person process notes from the repo, with real numbers — the 44.3 MB
  encoder, the 4.5 MB request limit that broke free-plan 770 px generations in production
  (413) until the working size was clamped, the 0.9 → 0.85 orbit-radius corner bug, the fox
  that filled 52 % of its frame and smeared, the hiker shot that "tore apart on the first
  drag". These are the sentences an AI can't fabricate; use 3–4, not all.
- **Expertise:** the refine section (guided filter, halo band, S-curve) and the cone
  derivation. Name the constants once in a footnote so a developer can verify.
- **Authoritativeness:** the page should become the run 08 linkable asset (Show HN, sygnal
  KB niche-edit, awesome-list once the viewer is open-sourced). Cite primary sources only.
- **Trust:** the data-flow statement in the approved words; a visible "updated" date; every
  screenshot from the real app with the source photo credited; the depth-only fallback and
  the limits section admit failure modes. No stats, testimonials or user counts.
- Byline: Author TBD. Do not invent credentials.

### External citations (canonical URLs)

| Use | URL |
|---|---|
| Depth Anything V2 — paper (NeurIPS 2024) | https://arxiv.org/abs/2406.09414 |
| Depth Anything V2 — official repo (sizes, Apache-2.0 for Small) | https://github.com/DepthAnything/Depth-Anything-V2 |
| Depth Anything V2 — project page | https://depth-anything-v2.github.io |
| LaMa — paper (WACV 2022) | https://arxiv.org/abs/2109.07161 |
| LaMa — official repo | https://github.com/advimman/lama |
| LaMa — ONNX export actually used | https://huggingface.co/Carve/LaMa-ONNX |
| ISNet / DIS — paper (ECCV 2022) | https://arxiv.org/abs/2203.03041 |
| ISNet / DIS — official repo | https://github.com/xuebinqin/DIS |
| Guided filter (He, Sun, Tang) | https://kaiminghe.github.io/eccv10/ (verify; else cite the ECCV 2010 / TPAMI 2013 paper title) |
| Prior art: Zucconi, "Inside Facebook 3D Photos" + "Parallax Shaders & Depth Maps" | https://www.alanzucconi.com/2019/01/01/facebook-3d-photos/ · https://www.alanzucconi.com/2019/01/01/parallax-shader/ |
| Meta, "3D photos: how they work" (dual-camera era; limits list) | https://tech.facebook.com/reality-labs/2019/10/3d-photos-how-they-work-and-how-anyone-can-take-them/ |
| TechCrunch, "How Facebook's new 3D photos work" (mesh + CNN hallucination, 2018) | https://techcrunch.com/2018/06/07/how-facebooks-new-3d-photos-work/ |
| Apple Support, Spatial Scenes / Spatial Photos (for the table) | https://support.apple.com/guide/apple-vision-pro/create-a-spatial-photo-view-scene-tan1be9a3a0b/visionos · https://support.apple.com/en-la/124145 |
| Three.js (renderer) | https://threejs.org/ |
| onnxruntime-web (in-browser inference) | https://onnxruntime.ai/docs/tutorials/web/ |

Do not link competitors' tool pages. Sygnal's KB is a link *target* (run 08), not a citation.

## Resource assessment

- **Effort:** Medium-High — ~2,300 words is 6–8 h of writing, but the screenshot set (A–F,
  incl. a dev-build frame past the cone and a backdrop-bearing demo scene) is another 4–6 h
  with engineering. Budget 12–14 h total.
- **Dependencies:** a demo scene *with* a backdrop; console access for the raw depth grid;
  a way to dump the raw (pre-refine) depth and the LaMa `-bg` asset; the shared
  `<GuideLayout>`; byline decision.
- **3-month target:** top 10 for "3D photo effect explained" and "2.5D parallax" long-tails;
  15–30 for "how do 3D photos work"; the page's real job is E-E-A-T + links for the hub.

## Anti-slop notes for the writer

- No "in today's digital world", no "unlock", no "seamless", no "revolutionary". Say what
  the code does.
- Never write "true 3D", "360°", "works offline" (whole flow), "AI-generated 3D model".
- Every stage section must contain one sentence the reader can only get here (a number
  from the repo, a failure the team hit, a screenshot).
- Keep the Facebook/Apple material to disambiguation and prior art — this is not a
  Facebook 3D photo tutorial (run 06 spoke 14 owns that).

## Sources read for this run

- https://tech.facebook.com/reality-labs/2019/10/3d-photos-how-they-work-and-how-anyone-can-take-them/
- https://techcrunch.com/2018/06/07/how-facebooks-new-3d-photos-work/
- https://shotkit.com/3d-photography/
- https://expertphotography.com/3d-photography
- https://www.alanzucconi.com/2019/01/01/facebook-3d-photos/
- https://www.alanzucconi.com/2019/01/01/parallax-shader/
- https://www.sygnal.com/kb/image-25d-parallax-effects
- https://blog.lookingglassfactory.com/depth-maps-how-software-encodes-3d-space/
- https://www.ultralytics.com/blog/what-is-monocular-depth-estimation-an-overview
- https://www.macrumors.com/how-to/ios-3d-lock-screen-effect-spatial-scenes/
- https://appleinsider.com/articles/25/11/07/spatial-scenes-spatial-photos-add-depth-to-your-memories-but-in-different-ways
- https://github.com/DepthAnything/Depth-Anything-V2
- https://arxiv.org/abs/2109.07161 · https://github.com/advimman/lama
- https://github.com/xuebinqin/DIS · https://arxiv.org/abs/2203.03041

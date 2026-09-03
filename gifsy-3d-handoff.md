# Gifsy 3D / Interactive Image Handoff
## Engineering + Product Specification for Incremental Implementation

**Project:** Gifsy  
**Current site:** https://gifsy-six.vercel.app/  
**Goal:** Incrementally evolve the existing browser-first GIF/sticker product into a browser-side image-to-2.5D/interactive-3D creation tool with embeddable outputs, while preserving the current GIF/sticker experience.

---

# 1. Executive Summary

Gifsy currently turns photos into GIFs and AI-generated stickers entirely in the browser.

Current public positioning:

> Turn any photo into a GIF or sticker.

Current flow:

1. Upload one or more images.
2. Choose GIF/sticker behavior.
3. Run local AI for depth/sticker processing.
4. Preview and customize.
5. Export GIF/sticker.
6. No uploads, no accounts, works offline after first load.

The next product direction should **not** attempt to create a photorealistic, watertight 3D asset from a single image.

Instead, build a high-quality **2.5D / depth-parallax engine**:

`Image -> Depth -> Segmentation -> Layer/Depth representation -> WebGL/WebGPU rendering -> Interactive scene`

This is substantially easier, cheaper, and more browser-friendly than true 3D reconstruction.

The product opportunity is:

> **Make any image move, feel 3D, and become embeddable.**

The same underlying pipeline can power:

- Depth GIFs
- Interactive parallax images
- Mouse-reactive 3D images
- Scroll-reactive images
- Auto-floating images
- Cinematic image loops
- Embeddable interactive scenes
- Eventually GLB/USDZ-style exports if there is demand

The core technical principle:

> **Use AI for image understanding. Use graphics code for the visual effect.**

Do not add more AI models unless a measurable visual problem requires one.

---

# 2. Current Product — DO NOT BREAK THIS

The current site has:

- GIF mode
- Sticker mode
- Animate one image
- Combine several images
- Upload PNG/JPG/WebP
- Local/browser-side processing
- Depth-based animation
- AI depth zoom
- Bounce
- Shake
- Pulse
- Spin
- Glitch
- FPS control
- Boomerang loop
- Forward/reverse playback
- GIF export
- Sticker generation
- Telegram sharing
- "Nothing uploaded" / privacy-first messaging
- Offline-after-first-load behavior

The current site explicitly states that the depth model moves pixels according to estimated camera distance and that the first run downloads two small AI models.

**Regression rule:** every existing GIF and sticker workflow must continue working after every incremental phase.

Source reviewed: https://gifsy-six.vercel.app/

---

# 3. Product Vision

## Working positioning

Primary:

> **Make your images move.**

Supporting capabilities:

> GIFs · Stickers · 3D · Parallax · Interactive embeds

Do not market the first version as "AI 3D model generation."

The technical product is closer to:

> **AI-powered depth + real-time 2.5D rendering**

This is more honest and more achievable.

---

# 4. Why 2.5D Instead of True 3D

A single RGB image does not contain enough information to reconstruct hidden geometry perfectly.

True single-image 3D reconstruction introduces difficult problems:

- Hidden surfaces do not exist in the source image.
- Object geometry is ambiguous.
- Texture completion becomes necessary.
- Camera calibration is unknown.
- Mesh topology can become ugly.
- Generated geometry can look plausible from one angle but fail at others.
- Browser inference becomes much heavier.
- Exporting a genuinely useful GLB is substantially more complex.

Gifsy does not need this initially.

For a web visual, a strong depth-aware parallax effect can look "3D" without creating a full 3D model.

Target:

**Perceived 3D > technically correct 3D**

---

# 5. Proposed Core Pipeline

```text
                    USER IMAGE
                        |
                        v
              +-------------------+
              | Preprocess Image   |
              | resize / normalize |
              +-------------------+
                        |
             +----------+----------+
             |                     |
             v                     v
       Depth Anything V2       ISNet / mask
             |                     |
             v                     v
        DEPTH MAP             SEGMENTATION
             |                     |
             +----------+----------+
                        |
                        v
             Scene Representation
          depth + RGB + alpha/layers
                        |
                        v
              Three.js Renderer
                        |
          +-------------+-------------+
          |             |             |
          v             v             v
       Mouse         Scroll         Auto
      Parallax       Parallax       Motion
          |             |             |
          +-------------+-------------+
                        |
                        v
              Export / Embed / Share
```

---

# 6. Recommended Model Strategy

## Model 1 — Depth Anything V2 Small

**Role:** depth estimation.

This should remain the primary depth model because Gifsy already uses Depth Anything V2.

Preferred hierarchy:

1. Depth Anything V2 Small
2. Quantized browser-compatible variant where quality remains acceptable
3. Larger model only as an optional future quality mode

Do NOT automatically jump to a larger model.

Browser product priority:

`download size -> initialization -> inference latency -> visual quality`

not simply benchmark accuracy.

ONNX Runtime's own guidance recommends tiny/small models for browser scenarios when possible.

Reference:
https://onnxruntime.ai/docs/tutorials/web/performance-diagnosis.html

---

## Model 2 — ISNet

**Role:** salient foreground/background segmentation.

Keep ISNet if the current implementation produces good masks.

It is useful for:

- foreground isolation
- subject/background separation
- layered parallax
- stronger subject movement
- background stabilization
- better depth animation around the subject

Do not replace ISNet just because another segmentation model exists.

Benchmark alternatives only if:

- masks are visibly poor,
- download size is too large,
- inference is too slow,
- browser compatibility is poor.

---

# 7. Do We Need More Models?

Initially: **NO.**

Depth Anything V2 + ISNet is enough to build the first serious 2.5D version.

Potential future models should be added only against specific problems.

Possible future additions:

### A. Person/object segmentation
Useful if generic saliency masks fail on portraits/product photography.

### B. Normal estimation
Could improve fake lighting and material response.

Only investigate after the base renderer is good.

### C. Inpainting
Useful if foreground extraction exposes holes in the background.

This is much more expensive and should NOT be part of MVP.

### D. Image-to-3D / mesh generation
Future research only.

Do not make it a dependency of the first 3D release.

---

# 8. Browser Runtime

Recommended baseline:

- TypeScript
- Existing frontend framework
- Three.js
- ONNX Runtime Web
- WebGPU when available
- WASM fallback
- Web Worker for inference
- OffscreenCanvas where practical
- IndexedDB / Cache Storage for model caching

ONNX Runtime Web supports WebGPU, WebGL, WebNN and WASM execution providers.

Reference:
https://onnxruntime.ai/docs/tutorials/web/

WebGPU reference:
https://onnxruntime.ai/docs/tutorials/web/ep-webgpu.html

---

# 9. Execution Provider Strategy

Recommended:

```text
WebGPU
   |
   +-- available -> use WebGPU
   |
   +-- unavailable -> WASM/SIMD fallback
   |
   +-- unsupported/failed -> graceful degraded mode
```

Do NOT assume WebGPU is universally available.

Current ONNX Runtime documentation shows WebGPU availability varies by browser/platform and recommends WASM for lightweight models and WebGPU for more compute-intensive workloads.

Reference:
https://onnxruntime.ai/docs/get-started/with-javascript/web.html

Important:

- Feature-detect WebGPU.
- Never crash if WebGPU initialization fails.
- Cache the chosen runtime path for the session.
- Surface a friendly "Using compatibility mode" state if necessary.

---

# 10. Model Loading Architecture

Never load AI models on the homepage.

Use lazy loading.

Recommended lifecycle:

```text
Homepage
   |
   | user uploads image
   v
Check capability
   |
   +-- cached models -> initialize immediately
   |
   +-- missing models -> download
   |
   v
Initialize inference worker
   |
   v
Run depth
   |
   v
Run segmentation
   |
   v
Release unnecessary intermediate buffers
   |
   v
Render
```

Show actual progress.

Bad:

> AI loading...

Better:

> Preparing 3D engine  
> Downloading depth model · 18 MB  
> Loading renderer  
> Estimating depth  
> Building scene

---

# 11. Model Caching

The first-run experience is critical.

Use browser storage so models are not downloaded repeatedly.

Potential approach:

- Cache Storage for model files
- IndexedDB for metadata/versioning
- Version model URLs
- Store model checksum/version
- Invalidate cache when model version changes

Example conceptual key:

```text
gifsy-models/
  depth-anything-v2-small-q8-v1
  isnet-v1
```

Never blindly cache forever.

Model manifest should contain:

```json
{
  "depth": {
    "version": "v1",
    "url": "...",
    "sizeBytes": 0,
    "sha256": "..."
  },
  "segmentation": {
    "version": "v1",
    "url": "...",
    "sizeBytes": 0,
    "sha256": "..."
  }
}
```

---

# 12. Quantization Strategy

Quantization is one of the most important optimization areas.

Test:

- FP32
- FP16
- INT8/Q8
- Q4 where supported and quality remains acceptable

For vision models, do not assume the smallest file is automatically best.

Measure:

1. Download size
2. Model initialization time
3. Peak memory
4. Inference time
5. GPU compatibility
6. Visual depth quality

Transformers.js documentation similarly recommends quantized models for constrained browser environments and lists common options including fp16, q8 and q4 depending on model/runtime support.

Reference:
https://huggingface.co/docs/transformers.js/en/index

---

# 13. ONNX -> ORT Optimization

Investigate converting ONNX models to ORT format.

ONNX Runtime documentation states that ORT format can improve:

- model binary size
- initialization speed
- peak memory usage

Reference:
https://onnxruntime.ai/docs/tutorials/web/build-web-app.html

This should be benchmarked rather than assumed.

Possible future optimization:

```text
PyTorch
  |
  v
ONNX
  |
  v
Graph optimization
  |
  v
ORT format
  |
  v
Browser runtime
```

---

# 14. Runtime Optimization

### Reuse sessions

Create the inference session once.

Do not recreate it for every frame.

Depth estimation should happen when the source image changes, not every animation frame.

Correct:

```text
UPLOAD
  -> DEPTH ONCE
  -> MASK ONCE
  -> CACHE RESULTS
  -> ANIMATE 60 FPS WITH GPU
```

Incorrect:

```text
FRAME 1 -> AI
FRAME 2 -> AI
FRAME 3 -> AI
...
```

The animation must be graphics-only after preprocessing.

---

# 15. Keep Data on GPU Where Possible

ONNX Runtime Web supports GPU tensors / IO binding for WebGPU.

This can reduce CPU <-> GPU copies.

Reference:
https://onnxruntime.ai/docs/tutorials/web/ep-webgpu.html

Investigate:

- GPU input buffers
- GPU output buffers
- preallocated tensors
- WebGPU texture sharing
- avoiding unnecessary readbacks

Rule:

> Never read the full depth map back to CPU if the renderer can consume it directly or via a GPU texture/buffer.

Do not prematurely over-engineer this. First build a correct version, then profile.

---

# 16. Image Preprocessing

Never run AI inference at the user's original 8K/12K resolution.

Use a bounded working resolution.

Suggested starting point:

```text
AI working resolution:
768px or 1024px max dimension
```

Then:

- preserve original image separately
- generate depth/mask at working resolution
- upscale/render using GPU
- optionally use higher-resolution AI only in a paid/export mode later

This massively reduces compute.

Benchmark:

- 512
- 768
- 1024
- 1280

Pick based on quality/latency.

---

# 17. 2.5D Rendering Architecture

Use Three.js.

Basic scene:

```text
PerspectiveCamera
      |
      v
Plane / dense grid mesh
      |
      +-- color texture
      +-- depth texture
      +-- alpha/mask
      |
      v
Custom ShaderMaterial
```

The depth texture controls vertex displacement or UV displacement.

Three.js supports displacement maps where texture values reposition mesh vertices.

Reference:
https://threejs.org/docs/pages/MeshDepthMaterial.html

For Gifsy, a custom shader is preferable because you need direct control over:

- depth scale
- camera movement
- edge behavior
- mask blending
- blur
- lighting
- distortion
- parallax strength

---

# 18. Renderer MVP

Build these presets first:

### 1. Gentle 3D

Small camera movement.

### 2. Mouse Tilt

Camera follows pointer.

### 3. Scroll Depth

Camera moves with page scroll.

### 4. Float

Slow automatic camera movement.

### 5. Cinematic

Slow X/Y camera drift + subtle depth.

### 6. Push In

Camera slowly approaches the subject.

Do not build 30 effects initially.

Build 5–6 excellent presets.

---

# 19. Foreground / Background Layering

Basic version:

```text
RGB texture
+
depth texture
```

Better version:

```text
Background
Foreground
Depth
Mask
```

Use segmentation to create a foreground layer.

This allows:

- subject moves more
- background moves less
- subject stays visually stable
- background can be blurred
- stronger 3D perception

This is likely to look substantially better than raw depth displacement.

---

# 20. Edge / Disocclusion Problem

This is one of the biggest technical walls.

When the camera moves, pixels that were previously hidden become visible.

Example:

```text
Original:

████████████
████ PERSON
████████████

Camera shifts right:

       ????
████ PERSON
```

The `????` represents pixels that never existed in the source image.

Without handling this, users will see:

- stretched pixels
- black holes
- ugly edges
- texture tearing

MVP mitigation:

1. Keep camera movement small.
2. Clamp displacement.
3. Feather edges.
4. Use background blur.
5. Use segmentation-aware compositing.
6. Add a procedural fill for tiny holes.

Do NOT add an AI inpainting model initially.

---

# 21. "3D Strength" Control

Expose a simple user-facing control:

```text
3D Strength
Low --------●-------- High
```

Internally control:

- displacement scale
- camera translation
- perspective
- layer separation

Never let users create extreme geometry by default.

Safe range is more important than maximum range.

---

# 22. Camera Model

Do not expose raw Three.js parameters initially.

Create a normalized scene configuration:

```ts
type SceneConfig = {
  perspective: number
  depthStrength: number
  cameraX: number
  cameraY: number
  motionMode: "mouse" | "scroll" | "auto" | "static"
  motionSpeed: number
  foregroundStrength: number
  backgroundBlur: number
  edgeFeather: number
}
```

The UI maps friendly controls to these values.

This keeps the renderer stable even if implementation changes.

---

# 23. New Product Flow

Add a third creation mode.

Current:

```text
GIF
STICKER
```

New:

```text
GIF
STICKER
3D
```

3D flow:

```text
Upload
   ↓
Prepare
   ↓
Depth + segmentation
   ↓
Interactive preview
   ↓
Customize
   ↓
Publish / Export
```

---

# 24. 3D Editor UI

Keep it extremely simple.

## Main preview

Large canvas.

## Controls

### Depth

- Strength
- Focus

### Motion

- Mouse
- Scroll
- Auto
- Static

### Style

- Natural
- Cinematic
- Tilt
- Float

### Background

- Original
- Blur
- Dark
- Transparent

### Output

- Embed
- GIF
- MP4/WebM if supported
- Image

---

# 25. Embed Product

This is the most important monetization experiment.

After creating a scene:

> **Publish**

Gifsy generates:

```text
gifsy.app/s/abc123
```

Then:

```html
<gifsy-scene
  src="abc123"
  width="100%"
  height="500">
</gifsy-scene>
```

or an iframe fallback:

```html
<iframe
  src="https://gifsy.app/embed/abc123"
  loading="lazy"
  style="width:100%;height:500px;border:0">
</iframe>
```

The embed should be a lightweight renderer.

Do NOT ship AI models to embed visitors.

The AI work happens once when the creator generates the scene.

---

# 26. Critical Architecture Decision: Creator vs Viewer

Separate the systems.

## Creator

Heavy:

- AI models
- depth inference
- segmentation
- scene generation
- editing

## Viewer

Light:

- scene configuration
- optimized textures
- WebGL/WebGPU renderer
- interaction

This means the person embedding a Gifsy scene does NOT need to download Depth Anything.

This is essential for monetization.

---

# 27. Scene Storage

A published scene should contain something conceptually like:

```json
{
  "version": 1,
  "image": "optimized-image.webp",
  "depth": "depth.webp",
  "mask": "mask.webp",
  "config": {
    "depthStrength": 0.35,
    "motionMode": "mouse",
    "motionSpeed": 0.2,
    "backgroundBlur": 0.1
  }
}
```

The exact backend/storage technology can remain flexible.

Important:

> Store the generated assets, not the original AI computation.

---

# 28. Asset Optimization

For published scenes:

- WebP/AVIF for RGB
- compressed single-channel depth texture where practical
- compressed alpha/mask
- responsive resolutions
- lazy loading
- no original 10K image unless explicitly required

Generate multiple variants:

```text
thumbnail
480
768
1024
1536
```

Viewer selects appropriate asset based on viewport.

---

# 29. Performance Budget

Initial targets:

### Creator

- First model download: ideally < 30 MB per model after quantization
- Subsequent loads: cached
- Depth inference: target < 2–5 sec on a normal modern laptop
- Preview: target 30–60 FPS
- No AI inference during animation

These are targets, not guarantees.

Measure on:

- MacBook
- Windows laptop
- iPhone
- Android
- integrated GPU
- discrete GPU
- no-WebGPU browser

### Viewer

Target:

- < 1–3 MB initial scene payload where practical
- lazy image loading
- 60 FPS on modern desktop
- graceful degradation on mobile

---

# 30. Browser Compatibility Strategy

### Tier 1

WebGPU:

- best inference path
- best rendering path where available

### Tier 2

WebGL + WASM:

- compatibility path
- smaller/less demanding use cases

### Tier 3

Static fallback:

If everything fails:

> Your browser can't run interactive 3D. Download the generated GIF instead.

Never make browser compatibility a hard failure.

---

# 31. Worker Architecture

Do not run AI inference on the UI thread.

Recommended:

```text
Main Thread
   |
   +-- UI
   +-- Three.js renderer
   |
   v
Web Worker
   |
   +-- ONNX Runtime
   +-- preprocessing
   +-- depth
   +-- segmentation
   |
   v
Transferable / GPU-friendly output
```

Use:

- Web Workers
- transferable ArrayBuffers
- OffscreenCanvas where beneficial

The UI should remain responsive while models initialize.

---

# 32. Memory Management

This will become a major issue.

Explicitly dispose:

- Three.js textures
- geometries
- materials
- render targets
- GPU buffers
- old image bitmaps
- temporary tensors
- ONNX sessions when no longer needed

Never retain:

```text
original full-res image
+
resized image
+
depth tensor
+
depth canvas
+
mask tensor
+
mask canvas
+
GPU texture
```

unless necessary.

Use one source of truth per processing stage.

---

# 33. Avoid Unnecessary AI

Bad architecture:

```text
Depth model
Segmentation model
Normal model
Inpainting model
Super resolution model
3D reconstruction model
Lighting model
```

This creates:

- huge downloads
- long startup
- memory pressure
- compatibility problems
- difficult debugging

Better:

```text
Depth
+
Segmentation
+
GPU graphics
```

Use graphics tricks for the rest.

---

# 34. Incremental Build Plan

## Phase 0 — Baseline / instrumentation

Before changing visuals:

- record current bundle size
- record current model sizes
- record current inference time
- record current GIF generation time
- record memory usage
- add browser capability detection
- add performance logging in development
- create regression checklist

No user-facing changes.

---

## Phase 1 — Extract existing depth pipeline

Refactor current depth GIF code into reusable modules:

```text
models/
  depth/
  segmentation/

inference/
  runtime.ts
  depth.ts
  segmentation.ts

scene/
  depth-map.ts
  mask.ts

renderer/
  renderer.ts
  shaders/

export/
  gif.ts
```

Goal:

The GIF depth effect and 3D effect share the same inference output.

---

## Phase 2 — Build basic 2.5D renderer

Input:

- RGB
- depth

Output:

- interactive canvas

Features:

- camera tilt
- depth strength
- static / mouse

No publishing.

---

## Phase 3 — Add segmentation

Input:

- RGB
- depth
- mask

Add:

- foreground/background layers
- stronger subject movement
- background blur
- edge feathering

Benchmark visual quality.

---

## Phase 4 — Presets

Add:

- Gentle 3D
- Mouse Tilt
- Float
- Cinematic
- Push In
- Scroll Depth

Each preset should just produce a SceneConfig.

---

## Phase 5 — Export

Add:

- GIF
- WebM where supported
- static image
- shareable scene config

Do not block existing GIF export.

---

## Phase 6 — Publish

Add:

```text
Publish
```

Generate:

```text
gifsy.app/s/<id>
```

Build viewer route:

```text
/s/[id]
```

Viewer does not download AI models.

---

## Phase 7 — Embed

Create:

```text
/embed/<id>
```

and a copyable embed snippet.

Start with iframe because it is the simplest reliable integration.

Later build a custom web component.

---

## Phase 8 — Monetization experiment

Free:

- limited published scenes
- Gifsy badge/watermark
- basic presets

Pro:

- unlimited scenes
- no branding
- premium presets
- custom sizing
- high-resolution export
- more embeds

Do not build billing until people actually use the publishing/embedding feature.

---

# 35. Monetization Hypothesis

The monetizable object is NOT the AI inference.

The monetizable object is:

> **Publishing and embedding interactive visuals.**

Potential customers:

- designers
- developers
- portfolios
- agencies
- SaaS landing pages
- product launches
- creators
- ecommerce/product pages

Potential pricing to test:

### Free
$0

### Pro
~$9/month

### Studio
~$19–29/month

### Agency
~$49+/month

Do not treat these prices as validated. They are experiment starting points.

---

# 36. Product Analytics

Track events without uploading user images.

Useful events:

```text
image_uploaded
gif_started
gif_exported
sticker_generated
3d_started
depth_completed
3d_preview_completed
scene_published
embed_copied
scene_shared
upgrade_clicked
```

For performance:

```text
webgpu_available
webgpu_failed
wasm_fallback
depth_model_load_ms
depth_inference_ms
segmentation_inference_ms
scene_render_fps
scene_payload_bytes
```

Never upload the user's image for analytics.

---

# 37. Important UX Principle

The current product's strongest promise is:

> **Your image stays on your device.**

Do not casually break that promise.

For local generation:

```text
Image
 -> browser
 -> AI
 -> output
```

For publishing:

make it explicit that publishing requires uploading generated assets.

Use copy such as:

> Generated locally. Nothing leaves your device until you publish.

This distinction is important.

---

# 38. Technical Research Backlog

Before choosing a final architecture, benchmark these.

## Depth

- Depth Anything V2 Small FP32
- Depth Anything V2 Small FP16
- Depth Anything V2 Small INT8/Q8
- ORT format variant

Questions:

- quality difference?
- model size?
- initialization?
- WebGPU inference?
- WASM inference?
- mobile performance?

---

## Segmentation

Benchmark:

- current ISNet
- smaller saliency model
- lightweight person segmentation model

Only replace ISNet if it wins on the combined metric:

`quality + size + latency + compatibility`

---

## Rendering

Compare:

1. displacement mesh
2. custom shader UV parallax
3. layered planes
4. hybrid layered + displacement

Expected best approach:

**hybrid**

```text
background plane
+
foreground plane
+
depth displacement
+
mask
```

---

# 39. Research: True 3D Future

Do NOT implement initially.

Investigate later:

- single-image 3D reconstruction
- Gaussian splatting from one image
- depth-to-mesh
- monocular normal estimation
- GLB generation
- USDZ generation

The question to answer is:

> Does a generated 3D asset provide enough additional value to justify significantly higher compute and complexity?

If not, stay with 2.5D.

---

# 40. Security / Abuse Considerations

Published scenes are user-generated content.

Plan for:

- file type validation
- maximum image size
- maximum pixel count
- upload limits
- rate limiting
- storage quotas
- malicious SVG rejection if SVG is ever supported
- EXIF stripping
- content moderation only if publishing becomes public/discoverable

Do not allow arbitrary HTML/JS inside scene configurations.

---

# 41. SEO / Sharing

Published scenes should have:

- title
- description
- preview image
- Open Graph image
- canonical URL

Example:

```text
gifsy.app/s/abc123
```

Social preview:

```text
[static preview]
"Made with Gifsy"
```

This creates another viral loop:

```text
Create
  ↓
Publish
  ↓
Share
  ↓
Visitor
  ↓
Try Gifsy
  ↓
Create
```

---

# 42. Viral Loop

The product should make the output itself marketing.

Every shared scene should have a subtle:

> Made with Gifsy

CTA.

Free users get the branding.

Paid users remove it.

This turns every published scene into acquisition.

---

# 43. Recommended First Demo

The first 3D release should be visually impressive but technically narrow.

Demo:

```text
Upload portrait
       ↓
"Make 3D"
       ↓
2–3 sec processing
       ↓
Photo becomes interactive
       ↓
Move mouse
       ↓
Subject has depth
       ↓
Click Publish
       ↓
Copy Embed
```

This is the video to post.

Potential social hook:

> I built a tool that turns any photo into an interactive 3D image — entirely in the browser.

The technical story is strong because there is no AI API cost.

---

# 44. Definition of Done for MVP

The MVP is done when all of these are true:

- [ ] Existing GIF workflow still works.
- [ ] Existing sticker workflow still works.
- [ ] Depth model can be reused by 3D.
- [ ] Segmentation can be reused by 3D.
- [ ] 3D preview works without a server-side AI API.
- [ ] WebGPU path works.
- [ ] WASM fallback works.
- [ ] AI inference does not block UI.
- [ ] Models are cached after first download.
- [ ] Animation does not rerun AI inference.
- [ ] Mouse parallax works.
- [ ] Auto motion works.
- [ ] Depth strength works.
- [ ] Foreground/background layering works.
- [ ] Edge artifacts are acceptable at default settings.
- [ ] Published scene can be viewed without AI models.
- [ ] Embed code works on a separate test site.
- [ ] Scene assets are optimized.
- [ ] No original image is uploaded during local generation.
- [ ] Basic performance metrics are recorded.
- [ ] Mobile fallback is graceful.

---

# 45. What NOT to Build Yet

Do not build:

- full 3D reconstruction
- 3D mesh editor
- AI texture generation
- AI inpainting
- AI relighting
- 3D model marketplace
- team collaboration
- complicated accounts
- complex billing
- analytics dashboard
- custom domains
- advanced timeline editor
- 20+ effects
- native mobile app

First prove:

> People want to turn their images into interactive visuals and embed them.

---

# 46. Suggested Code Organization

Adapt this to the existing repository rather than blindly restructuring it.

```text
src/
  features/
    gif/
    sticker/
    depth/
    three-d/
    publish/
    embed/

  lib/
    inference/
      runtime.ts
      model-loader.ts
      depth.ts
      segmentation.ts

    rendering/
      scene.ts
      camera.ts
      shaders/
      presets.ts

    media/
      image.ts
      export.ts
      compression.ts

    storage/
      model-cache.ts
      scene-cache.ts

  workers/
    inference.worker.ts
```

The exact folder structure is secondary.

The architectural separation is what matters.

---

# 47. Coding-Agent Instructions

When handing this document to Claude Code / Codex / another coding agent:

## Rule 1

**Inspect the existing codebase before changing anything.**

Do not rewrite the application.

## Rule 2

**Preserve existing GIF and sticker behavior.**

## Rule 3

Implement one phase at a time.

## Rule 4

After each phase:

- run build
- run tests
- manually test existing workflows
- inspect bundle changes
- inspect model loading
- verify browser fallback

## Rule 5

Do not add dependencies without explaining why they are necessary.

## Rule 6

Do not replace existing models until benchmarking proves the replacement is better.

## Rule 7

Prefer browser-native APIs and existing dependencies.

## Rule 8

Do not introduce an AI API.

The initial architecture must remain:

> **local/browser inference**

## Rule 9

Never run AI inference every animation frame.

## Rule 10

Profile before optimizing.

---

# 48. Agent Prompt — Phase 1

Use this as the first coding-agent instruction:

> Inspect the existing Gifsy repository and understand the current GIF, sticker, depth, model-loading, export, and UI architecture before modifying anything.
>
> Do not rewrite the application.
>
> The goal of this phase is to refactor the existing depth inference pipeline into reusable modules so that both the current GIF depth animation and a future 2.5D renderer can consume the same depth output.
>
> Preserve every current feature and UI behavior.
>
> First produce a short architecture report describing:
> - current framework
> - current model files
> - model loading path
> - execution provider
> - image preprocessing
> - depth inference
> - sticker inference
> - GIF rendering
> - export path
> - current caching behavior
> - likely performance bottlenecks
>
> Then propose the smallest safe refactor.
>
> Do not implement 3D yet.
>
> After implementation, verify the existing GIF and sticker flows.

---

# 49. Agent Prompt — Phase 2

> Using the architecture established in Phase 1, add a minimal browser-side 2.5D renderer.
>
> Requirements:
> - Reuse the existing depth model.
> - Do not add a server-side AI API.
> - Do not run inference during animation.
> - Use Three.js or the existing rendering stack if already present.
> - Render the original image with a depth-aware effect.
> - Add mouse-based camera movement.
> - Add a depth-strength control.
> - Keep the feature behind a new 3D mode.
> - Do not modify the existing GIF/sticker behavior.
>
> First implement the simplest correct version.
>
> Do not add segmentation, publishing, billing, or additional AI models yet.
>
> Measure:
> - model load time
> - inference time
> - renderer FPS
> - memory behavior
>
> Then report the results.

---

# 50. Agent Prompt — Phase 3

> Add segmentation-aware foreground/background parallax to the existing 2.5D renderer.
>
> Reuse the existing ISNet implementation if possible.
>
> Do not introduce a new segmentation model unless the current model cannot satisfy the requirement.
>
> The scene should support:
> - foreground layer
> - background layer
> - depth displacement
> - background blur
> - edge feathering
>
> Focus on visual quality and artifact reduction.
>
> Do not add inpainting or a larger AI model.
>
> Benchmark before and after segmentation.

---

# 51. Agent Prompt — Phase 4

> Add scene presets and a normalized SceneConfig model.
>
> Presets:
> - Gentle 3D
> - Mouse Tilt
> - Float
> - Cinematic
> - Push In
> - Scroll Depth
>
> The renderer must consume SceneConfig rather than hardcoded UI values.
>
> Keep the UI minimal.
>
> Do not add publishing or accounts yet.

---

# 52. Agent Prompt — Phase 5

> Implement scene publishing architecture.
>
> Separate creator and viewer.
>
> Creator:
> - performs local AI inference
> - generates optimized RGB/depth/mask assets
> - saves scene configuration
>
> Viewer:
> - downloads only optimized scene assets
> - does not download AI models
> - renders the scene
>
> Add a shareable scene route.
>
> Keep the architecture provider-agnostic so storage/backend can change later.
>
> Do not build billing.

---

# 53. Agent Prompt — Phase 6

> Add an embeddable viewer.
>
> Start with an iframe implementation because reliability is more important than developer ergonomics at this stage.
>
> Requirements:
> - responsive
> - lazy-loadable
> - no AI models
> - lightweight assets
> - mouse interaction
> - mobile touch fallback
> - configurable width/height
>
> Generate a copyable embed snippet.
>
> Test the embed on a separate HTML page outside the Gifsy application.

---

# 54. Agent Prompt — Optimization Pass

> Profile the full browser pipeline.
>
> Measure:
> - JavaScript bundle size
> - model download size
> - model initialization time
> - depth inference time
> - segmentation inference time
> - peak memory
> - render FPS
> - published scene payload size
>
> Test:
> - WebGPU
> - WASM
> - quantized models
> - reduced inference resolution
> - ORT format
> - GPU-resident tensors where practical
>
> Do not optimize based on assumptions.
>
> Produce a table of measurements before changing anything.
>
> Then implement only optimizations that materially improve UX.

---

# 55. Research References

## ONNX Runtime Web

Browser inference:
https://onnxruntime.ai/docs/tutorials/web/

WebGPU:
https://onnxruntime.ai/docs/tutorials/web/ep-webgpu.html

Browser support:
https://onnxruntime.ai/docs/get-started/with-javascript/web.html

Performance diagnosis:
https://onnxruntime.ai/docs/tutorials/web/performance-diagnosis.html

Web build/minimal runtime:
https://onnxruntime.ai/docs/build/web.html

## Transformers.js

https://huggingface.co/docs/transformers.js/en/index

Useful for researching browser-compatible transformer models and quantization patterns.

## Three.js

Depth/displacement:
https://threejs.org/docs/pages/MeshDepthMaterial.html

---

# 56. Open Research Questions

Before production launch, answer:

1. Which Depth Anything V2 variant gives the best quality/MB ratio?
2. Does Q8 materially hurt depth quality?
3. Is FP16 available/reliable across the target WebGPU browsers?
4. Can the current ISNet model run acceptably on mobile?
5. Is segmentation necessary for most images?
6. Can a heuristic mask fallback work for low-end devices?
7. What inference resolution gives the best quality/latency tradeoff?
8. Can depth outputs remain GPU-resident through the renderer?
9. Should the creator renderer use WebGPU or Three.js WebGL initially?
10. What is the smallest viable viewer payload?
11. How bad are disocclusion artifacts at different camera angles?
12. Is layered parallax better than pure displacement?
13. Should published scenes store depth as an image texture or a compressed binary texture?
14. Does AVIF materially reduce viewer payload compared with WebP?
15. What is the best mobile interaction model?
16. Is iframe sufficient for initial customer adoption?
17. Do users actually want embeds, or do they prefer downloadable MP4/GIF?
18. Will users pay for watermark removal?
19. What percentage of users reach "Publish"?
20. What percentage copy the embed?
21. What percentage return to create another scene?

---

# 57. Product Experiment Priority

Do not optimize for "building the biggest feature."

Optimize for learning.

Priority order:

```text
1. Does 2.5D look impressive?
          ↓
2. Do people create it?
          ↓
3. Do people publish it?
          ↓
4. Do people embed it?
          ↓
5. Do other people interact with it?
          ↓
6. Will creators pay for more?
```

If step 2 fails, stop.

If step 3 is strong, invest in publishing.

If step 4 is strong, build the embed platform.

If step 5 is strong, build viral distribution.

If step 6 is strong, build SaaS infrastructure.

---

# 58. Final Technical Recommendation

The recommended initial stack is:

```text
Existing Gifsy
      +
Depth Anything V2 Small
      +
ISNet
      +
ONNX Runtime Web
      +
WebGPU
      +
WASM fallback
      +
Three.js
      +
Custom shaders
      +
Web Workers
      +
Browser model caching
```

The most important optimization is architectural:

```text
AI:
  expensive but runs ONCE

Graphics:
  cheap and runs EVERY FRAME
```

That distinction makes the product feasible.

---

# 59. Final Product Recommendation

Build this as an evolution of Gifsy:

```text
GIF
STICKER
3D
```

Underneath:

```text
ONE IMAGE UNDERSTANDING PIPELINE
```

Then multiple outputs:

```text
                 IMAGE
                   |
          +--------+--------+
          |        |        |
         GIF    STICKER     3D
                            |
                  +---------+---------+
                  |                   |
               EXPORT              EMBED
```

The long-term opportunity is not "another AI image tool."

It is:

> **A lightweight browser-native visual transformation and interactive-image platform.**

Start with 2.5D.

Prove the embed use case.

Only then consider true 3D reconstruction.

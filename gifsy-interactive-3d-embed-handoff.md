# Gifsy — Interactive 2.5D Embed Handoff

## Purpose

Evolve Gifsy from its current GIF/sticker/depth workflows into a browser-created **interactive 2.5D image** product that can be embedded on other websites.

The output should not initially be a GLB or video. The canonical output is a lightweight scene bundle:

```text
scene/
├── image.webp
├── depth.webp
├── mask.webp
└── scene.json
```

The visitor loads these assets and a lightweight Three.js/WebGL renderer. The visitor does **not** run Depth Anything V2 or ISNet.

---

## 1. Product Vision

The user uploads one image:

```text
IMAGE
  ↓
Depth Anything V2
  +
ISNet
  ↓
DEPTH MAP + MASK
  ↓
2.5D SCENE
  ↓
PUBLISH
  ↓
EMBED
```

The desired result is:

> An image that feels 3D when the visitor hovers, moves the cursor, scrolls, or interacts with it.

This is **perceived 3D**, not complete single-image 3D reconstruction.

Do not make true 3D reconstruction a dependency of the MVP.

---

## 2. Current Product Must Not Break

Preserve all existing Gifsy functionality:

- GIF generation
- sticker generation
- depth-based GIF effects
- existing exports
- local/browser-side processing
- existing model loading
- existing UI behavior

The new feature should appear as an additional mode:

```text
GIF
STICKER
3D
```

Do not rewrite the existing application.

---

# 3. Recommended Technical Architecture

### Creator

```text
Upload
  ↓
Resize / normalize
  ↓
Depth Anything V2 Small
  ↓
Depth map
  ↓
ISNet
  ↓
Foreground mask
  ↓
2.5D renderer
  ↓
Preview
  ↓
Publish
```

### Viewer

```text
Load scene.json
  ↓
Load optimized RGB
  ↓
Load depth
  ↓
Load mask
  ↓
Three.js/WebGL
  ↓
Pointer interaction
  ↓
60 FPS rendering
```

There is **no AI inference in the viewer**.

This is a hard architectural requirement.

---

# 4. Why 2.5D Instead of True 3D

A single image cannot perfectly reveal hidden geometry.

True single-image 3D reconstruction introduces:

- hidden-surface ambiguity
- missing textures
- mesh topology problems
- camera ambiguity
- much heavier models
- higher memory requirements
- worse browser compatibility

Gifsy can create a convincing result with:

```text
RGB
+
Depth
+
Segmentation
+
Camera movement
+
GPU shader displacement
=
Convincing 3D illusion
```

Optimize for **visual quality**, not technical purity.

---

# 5. Canonical Scene Format

Use an asset bundle rather than a rendered video.

Example:

```text
scene/
├── image.webp
├── depth.webp
├── mask.webp
└── scene.json
```

Also benchmark AVIF for RGB.

`scene.json` example:

```json
{
  "version": 1,
  "image": "image.webp",
  "depth": "depth.webp",
  "mask": "mask.webp",
  "width": 1200,
  "height": 800,
  "render": {
    "depthStrength": 0.35,
    "perspective": 0.8,
    "maxRotation": 7,
    "maxZoom": 1.05,
    "foregroundStrength": 1.15,
    "backgroundStrength": 0.35,
    "backgroundBlur": 0.08,
    "edgeFeather": 0.02
  },
  "interaction": {
    "mode": "hover",
    "rotation": true,
    "zoom": true,
    "cursorFollow": true,
    "smoothing": 0.12
  }
}
```

Version the schema.

Do not expose internal renderer implementation details as the public scene API.

---

# 6. Model Strategy

## Depth

Keep **Depth Anything V2 Small** as the first choice.

Benchmark:

- FP32
- FP16
- INT8/Q8
- other supported quantized variants
- ORT format

Choose based on:

```text
visual quality
+
model size
+
initialization time
+
inference time
+
memory
+
browser compatibility
```

Do not automatically use the largest model.

## Segmentation

Keep the current **ISNet** implementation.

Only replace it if another model wins on the combined metric:

```text
quality + size + latency + compatibility
```

## More models?

Not for MVP.

Do not add normal estimation, inpainting, image-to-3D, or mesh generation until a specific visual problem proves that another model is required.

---

# 7. Model Optimization

Priority order:

1. Quantization
2. Lazy loading
3. Browser caching
4. Session reuse
5. Reduced inference resolution
6. Web Workers
7. ORT format
8. GPU-resident tensors where practical

Benchmark quantized variants rather than assuming.

Recommended initial AI working resolution:

```text
768px or 1024px maximum dimension
```

Benchmark:

```text
512
768
1024
1280
```

Keep the original image separately.

---

# 8. Browser Runtime

Preferred creator inference:

```text
WebGPU
   ↓
if unavailable
   ↓
WASM
   ↓
if unsupported
   ↓
graceful static/GIF fallback
```

Use ONNX Runtime Web.

References:

- https://onnxruntime.ai/docs/tutorials/web/
- https://onnxruntime.ai/docs/tutorials/web/ep-webgpu.html
- https://onnxruntime.ai/docs/get-started/with-javascript/web.html

Never assume WebGPU exists.

---

# 9. Model Loading

Never download AI models on the homepage.

Lazy-load when the user enters the 3D workflow.

Use model caching with versioned keys.

Conceptually:

```text
gifsy-models/
  depth-v2-small-q8-v1
  isnet-v1
```

Use Cache Storage and/or IndexedDB metadata.

Do not redownload models on every session.

Show meaningful progress:

```text
Preparing 3D
Downloading depth engine
Loading segmentation engine
Estimating depth
Building scene
```

---

# 10. Worker Architecture

Inference must not block the UI.

```text
MAIN THREAD
  ├── UI
  └── preview renderer

WORKER
  ├── ONNX Runtime
  ├── preprocessing
  ├── depth inference
  └── segmentation
```

Use transferable buffers where beneficial.

Do not run AI inference every animation frame.

Correct:

```text
IMAGE
 ↓
AI ONCE
 ↓
DEPTH + MASK
 ↓
GPU RENDERING
 ↓
60 FPS
```

---

# 11. Three.js Renderer

Use Three.js unless the current project already has an equivalent GPU renderer that is clearly better to reuse.

Start with:

```text
PerspectiveCamera
      ↓
Dense Plane/Grid
      ↓
Custom ShaderMaterial
      ├── RGB texture
      ├── Depth texture
      └── Mask texture
```

The shader should control:

- depth displacement
- parallax
- foreground/background response
- edge behavior
- optional blur
- optional lighting

The animation must happen on the GPU.

Reference:

https://threejs.org/docs/

---

# 12. SceneConfig

Use a normalized renderer configuration:

```ts
type SceneConfig = {
  depthStrength: number
  perspective: number
  maxRotation: number
  maxZoom: number
  foregroundStrength: number
  backgroundStrength: number
  backgroundBlur: number
  edgeFeather: number

  interaction: {
    mode: "static" | "hover" | "cursor" | "scroll" | "auto"
    smoothing: number
    rotation: boolean
    zoom: boolean
  }
}
```

UI should modify this configuration.

Do not hardcode renderer behavior into UI components.

---

# 13. Hover Interaction

Normalize pointer coordinates:

```text
x = -1 ... +1
y = -1 ... +1
```

Map pointer position to camera targets.

Conceptually:

```ts
targetRotationY = pointerX * maxRotation
targetRotationX = pointerY * maxRotation
```

Smoothly interpolate toward the target.

Do not snap the camera directly to the cursor.

The movement should feel physical and premium.

---

# 14. Hover Zoom

On pointer enter:

```text
zoom target = ~1.05
```

On pointer leave:

```text
zoom target = 1.00
```

Start around:

```text
1.03x–1.08x
```

and benchmark.

Combine subtle zoom with parallax rather than using an aggressive zoom.

---

# 15. Cursor Depth

The important visual effect is that different depth regions respond differently.

Conceptually:

```text
near depth       → strongest movement
medium depth     → medium movement
far depth        → weak movement
background       → minimal movement
```

For a dog portrait:

```text
nose        → strongest
eyes/head   → medium
body        → lower
background  → very low
```

This is what makes it feel like a 3D image rather than a flat image being rotated.

---

# 16. Foreground / Background Layers

Use the ISNet mask.

Conceptual:

```text
BACKGROUND
  ↓
small depth response

FOREGROUND
  ↓
stronger depth response
```

The foreground should respond slightly more strongly to camera movement.

This should significantly improve perceived depth.

---

# 17. Mask Cleanup

Do not use the raw segmentation output as final alpha.

Pipeline:

```text
ISNet
  ↓
normalize
  ↓
soft threshold
  ↓
morphological cleanup
  ↓
small-hole removal
  ↓
edge feather
  ↓
anti-aliased alpha
```

Be careful with fur/hair.

Do not aggressively erode the mask.

---

# 18. Depth Processing

Recommended:

```text
Raw depth
  ↓
normalize
  ↓
optional smoothing
  ↓
contrast remap
  ↓
clamp
  ↓
depth texture
```

Expose only:

```text
3D Strength
Low ─────────●──────── High
```

Do not expose raw depth parameters to normal users.

---

# 19. Disocclusion / Edge Problem

This is expected when moving the camera around a single image.

Symptoms:

- stretched pixels
- holes
- black borders
- tearing
- ugly subject outlines

First solve using:

1. constrained camera movement
2. depth clamping
3. mask dilation
4. mask feathering
5. background blur
6. background expansion
7. edge color extension
8. conservative perspective

Do **not** immediately add an inpainting model.

Only research inpainting if these techniques are insufficient.

---

# 20. Interaction Presets

Build a small number of excellent presets.

### Gentle 3D

Very subtle movement.

### Hover Tilt

Cursor controls X/Y rotation.

### Hover Zoom

Pointer enter creates a subtle push-in.

### Cursor Depth

Depth regions respond differently to pointer position.

### Float

Slow automatic motion.

### Cinematic

Very slow camera drift.

### Scroll

Scroll controls camera position.

Do not build dozens of effects initially.

---

# 21. Recommended Default

Default interaction:

> **Hover Tilt + subtle Zoom + Depth Parallax**

Pointer enters:

```text
zoom 1.00 → ~1.05
```

Pointer moves:

```text
camera follows pointer
```

Depth controls relative movement.

Pointer leaves:

```text
smooth return to neutral
```

The result should feel premium, not gimmicky.

---

# 22. Mobile

Desktop:

```text
hover / cursor
```

Mobile:

```text
touch drag
```

Fallback:

```text
automatic subtle motion
```

Do not require device orientation for MVP.

---

# 23. Creator vs Viewer

This separation is essential.

## Creator

Heavy:

- AI inference
- depth
- segmentation
- scene generation
- editing
- export

## Viewer

Light:

- scene JSON
- optimized textures
- renderer
- interaction

The viewer should never download Depth Anything V2.

---

# 24. Published Scene

A published scene should conceptually contain:

```text
id
version
createdAt
width
height
imageAsset
depthAsset
maskAsset
thumbnail
config
```

Store optimized browser-ready assets.

Do not store raw AI tensors unless there is a specific requirement.

---

# 25. Asset Optimization

For published scenes:

RGB:

- benchmark WebP
- benchmark AVIF

Depth:

- compact single-channel representation where practical

Mask:

- compact single-channel/alpha representation

Generate responsive variants:

```text
480
768
1024
1536
```

Choose based on viewport.

Do not serve a huge image to a tiny embed.

---

# 26. Embedding — Version 1

Use an iframe first.

Example:

```html
<iframe
  src="https://gifsy.app/embed/abc123"
  width="600"
  height="500"
  loading="lazy"
  style="border:0">
</iframe>
```

Iframe advantages:

- no React conflicts
- no Vue conflicts
- no CSS collisions
- no bundler conflicts
- no dependency conflicts
- Gifsy controls the entire viewer

The host site only embeds the viewer.

---

# 27. Embedding — Version 2

Later provide a Web Component:

```html
<script src="https://gifsy.app/embed.js"></script>

<gifsy-scene
  scene="abc123"
  interaction="hover"
  height="500">
</gifsy-scene>
```

Keep the public API small.

Do not expose internal Three.js objects.

Reference:

https://developer.mozilla.org/en-US/docs/Web/API/Web_components

---

# 28. Embed URL

Use:

```text
https://gifsy.app/embed/[sceneId]
```

Share URL:

```text
https://gifsy.app/s/[sceneId]
```

The share page can include:

- interactive scene
- preview
- title
- description
- CTA
- social metadata

---

# 29. Privacy

Preserve the current local-processing promise.

Local generation:

```text
Image
 ↓
browser
 ↓
AI
 ↓
output
```

Publishing:

```text
generated assets
 ↓
uploaded only when user chooses Publish
```

Communicate clearly:

> Generated locally. Nothing leaves your device until you publish.

---

# 30. Monetization

Do not monetize AI inference first.

Monetize:

- publishing
- embeds
- branding removal
- usage
- advanced interactions

Potential structure:

### Free

- limited published scenes
- basic interactions
- Gifsy branding

### Pro

- unlimited scenes
- no Gifsy branding
- advanced interactions
- higher-resolution assets
- more embed usage

### Studio / Agency

- multiple projects
- client work
- higher usage
- white-label options

These are hypotheses. Validate behavior before locking pricing.

---

# 31. Viral Loop

Free embeds should have subtle branding:

> Made with Gifsy

Flow:

```text
Creator
 ↓
Creates 3D scene
 ↓
Embeds it
 ↓
Visitor sees it
 ↓
Made with Gifsy
 ↓
Visitor tries Gifsy
 ↓
Creates another scene
```

The embedded output itself becomes acquisition.

---

# 32. Implementation Phases

## Phase 0 — Inspect and instrument

Before changing behavior:

- inspect current repository
- identify model files
- identify inference runtime
- identify caching
- identify preprocessing
- identify GIF/sticker pipelines
- record bundle size
- record model size
- record inference time
- record memory

No user-facing feature changes.

---

## Phase 1 — Reusable inference

Extract reusable:

```text
model loader
depth inference
segmentation inference
preprocessing
caching
```

Current GIF must continue to use it successfully.

---

## Phase 2 — Basic 2.5D

Add:

```text
3D mode
```

Implement:

- RGB texture
- depth texture
- perspective camera
- shader
- depth strength
- mouse tilt

No publishing yet.

---

## Phase 3 — Segmentation

Add:

- foreground
- background
- mask cleanup
- edge feathering
- background blur
- layered parallax

Use existing ISNet.

---

## Phase 4 — Interaction

Add:

- hover tilt
- hover zoom
- cursor depth
- smoothing
- return-to-neutral

This is the first major "wow" milestone.

---

## Phase 5 — Presets

Add the seven interaction presets described above.

---

## Phase 6 — Export

Preserve current GIF export.

Optionally add:

- WebM
- MP4 where technically appropriate
- static image

Interactive scene remains the canonical format.

---

## Phase 7 — Publish

Create:

```text
/s/[sceneId]
```

Generate optimized scene assets.

---

## Phase 8 — Embed

Create:

```text
/embed/[sceneId]
```

Add copyable iframe code.

Test on an external HTML page.

---

## Phase 9 — Monetization

Only after measuring:

- 3D creation
- publishing
- sharing
- embed copying
- embed usage

Then introduce paid limits.

---

# 33. Performance Targets

Initial engineering targets:

### Creator

- model ideally under ~30 MB each after optimization
- cached after first load
- depth inference roughly 2–5 seconds on a modern laptop
- smooth preview after inference
- zero AI inference during animation

These are targets, not guarantees.

### Viewer

- small initial payload
- responsive assets
- lazy loading
- 30–60 FPS where hardware allows
- zero AI model downloads
- minimal CPU processing

Benchmark real devices.

---

# 34. Performance Rule

Never:

```text
frame
 ↓
AI
 ↓
render
```

Always:

```text
image
 ↓
AI once
 ↓
depth + mask
 ↓
GPU rendering
 ↓
60 FPS
```

AI understands the image.

The GPU handles the animation.

---

# 35. Benchmark Suite

Keep fixed test images:

1. Dog portrait
2. Human portrait
3. Product
4. Car
5. Building
6. Landscape
7. Food
8. Illustration
9. Screenshot
10. Complex-background portrait

Measure:

```text
depth quality
mask quality
edge quality
parallax quality
artifact severity
inference time
memory
FPS
scene payload
```

The dog image should remain a permanent regression test.

---

# 36. Model Benchmark Table

Coding agent should eventually produce:

| Test | Resolution | Model | Runtime | Depth ms | Mask ms | Memory | FPS | Visual Score |
|---|---:|---|---|---:|---:|---:|---:|---:|
| Dog | 768 | V2 Small Q8 | WebGPU | TBD | TBD | TBD | TBD | TBD |
| Dog | 1024 | V2 Small Q8 | WebGPU | TBD | TBD | TBD | TBD | TBD |
| Dog | 768 | V2 Small FP16 | WebGPU | TBD | TBD | TBD | TBD | TBD |
| Dog | 768 | V2 Small Q8 | WASM | TBD | TBD | TBD | TBD | TBD |

Do not choose a model based on assumptions.

---

# 37. Security / Limits

When publishing becomes available:

- validate file types
- enforce maximum pixel count
- enforce upload limits
- rate-limit publishing
- enforce storage quotas
- strip EXIF where appropriate
- never execute user-provided HTML/JS
- version scene schemas

If public discovery is added later, investigate moderation and abuse handling.

---

# 38. What NOT to Build Yet

Do not build:

- true 3D reconstruction
- GLB generation as primary output
- Gaussian splatting
- AI inpainting
- AI relighting
- texture generation
- mesh editor
- 3D marketplace
- collaboration
- complicated billing
- analytics dashboard
- custom domains
- native apps
- dozens of effects

First prove the interaction.

---

# 39. Coding-Agent Rules

When handing this document to Claude Code/Codex/etc.:

1. Inspect the existing repository before modifying it.
2. Do not rewrite the application.
3. Preserve GIF and sticker workflows.
4. Implement phases one at a time.
5. Build and test after every phase.
6. Do not introduce an AI API.
7. Do not replace existing models without benchmarks.
8. Never run AI inference every animation frame.
9. Never ship AI models to scene viewers.
10. Do not add backend infrastructure before publishing requires it.
11. Prefer existing dependencies.
12. Profile before optimizing.
13. Report architectural changes before making large refactors.
14. Keep the 3D feature modular so it can be removed without damaging GIF/sticker functionality.

---

# 40. Phase 1 Agent Prompt

> Inspect the existing Gifsy repository before changing anything.
>
> Understand:
> - GIF workflow
> - sticker workflow
> - depth workflow
> - model loading
> - inference runtime
> - caching
> - preprocessing
> - export
> - UI architecture
>
> Do not rewrite the application.
>
> Extract a reusable local inference pipeline for Depth Anything V2 and ISNet so current GIF generation and future 2.5D rendering can consume the same depth/mask outputs.
>
> First provide a short architecture report and identify the smallest safe refactor.
>
> Then implement only that refactor.
>
> Build and verify existing GIF and sticker workflows.

---

# 41. Phase 2 Agent Prompt

> Add a new 3D mode to Gifsy.
>
> This is NOT true 3D reconstruction.
>
> Build a browser-side 2.5D depth-aware renderer using the existing Depth Anything V2 output.
>
> Requirements:
> - Three.js or the existing renderer
> - GPU-based rendering
> - RGB texture
> - depth texture
> - perspective camera
> - custom shader or equivalent depth displacement
> - depth-strength control
> - mouse tilt
> - no AI inference during animation
> - no server-side AI API
>
> Do not implement publishing, billing, or additional AI models.
>
> Preserve GIF and sticker functionality.
>
> Measure inference time and renderer FPS.

---

# 42. Phase 3 Agent Prompt

> Improve the 2.5D renderer using the existing ISNet segmentation output.
>
> Add:
> - foreground/background layers
> - mask cleanup
> - edge feathering
> - background blur
> - stronger foreground parallax
> - conservative disocclusion handling
>
> Do not add an inpainting model.
>
> Compare visual quality against the single-layer implementation.
>
> Keep the renderer based on SceneConfig.

---

# 43. Phase 4 Agent Prompt

> Add premium interaction to the existing 2.5D renderer.
>
> Implement:
> - hover tilt
> - hover zoom
> - cursor-following depth
> - smooth interpolation
> - return to neutral on pointer leave
>
> Default behavior should be subtle.
>
> Test the dog benchmark image and at least five other image types.

---

# 44. Phase 5 Agent Prompt

> Build published scene architecture.
>
> Creator:
> - local inference
> - optimized RGB/depth/mask assets
> - SceneConfig
> - publish
>
> Viewer:
> - scene JSON
> - optimized textures
> - Three.js renderer
> - pointer interaction
> - zero AI models
>
> Implement the viewer route first.
>
> Keep storage modular.

---

# 45. Phase 6 Agent Prompt

> Add an iframe embed system.
>
> Create:
>
> `/embed/[sceneId]`
>
> It must:
> - load scene assets
> - render the 2.5D scene
> - support hover interaction
> - support responsive sizing
> - lazy-load
> - avoid AI inference
> - work independently of the host framework
>
> Add:
>
> "Copy embed code"
>
> Generate a tested iframe snippet.
>
> Test it on a standalone external HTML page.

---

# 46. Phase 7 Agent Prompt

> Add a Web Component wrapper after iframe embedding is stable.
>
> Proposed API:
>
> `<gifsy-scene scene="abc123" interaction="hover"></gifsy-scene>`
>
> Keep the API minimal.
>
> Do not expose internal Three.js configuration directly.
>
> Preserve iframe compatibility.

---

# 47. Research References

ONNX Runtime Web:

https://onnxruntime.ai/docs/tutorials/web/

https://onnxruntime.ai/docs/tutorials/web/ep-webgpu.html

https://onnxruntime.ai/docs/get-started/with-javascript/web.html

Three.js:

https://threejs.org/docs/

Web Components:

https://developer.mozilla.org/en-US/docs/Web/API/Web_components

iframe:

https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe

Transformers.js:

https://huggingface.co/docs/transformers.js/en/index

---

# 48. Open Research Questions

Before production architecture is locked:

1. Best Depth Anything V2 browser variant?
2. Q8 vs FP16 visual quality?
3. ORT format size improvement?
4. Best inference resolution?
5. Best mask postprocessing?
6. Can ISNet run comfortably on mobile?
7. WebGPU reliability across target browsers?
8. WASM fallback quality and speed?
9. Best rendering approach: displacement, UV parallax, layers, or hybrid?
10. Best depth texture encoding?
11. WebP vs AVIF for RGB?
12. Maximum useful camera movement before artifacts appear?
13. Is procedural hole filling enough?
14. Does iframe perform well on mobile?
15. Touch vs automatic motion on mobile?
16. Best scene payload size?
17. Which interaction users prefer?
18. What percentage of users publish?
19. What percentage copy embeds?
20. What percentage of embeds receive interaction?
21. Will users pay for removing branding?

---

# 49. Product Validation

Track:

```text
3d_started
3d_processing_completed
3d_preview_interacted
3d_preset_selected
scene_published
scene_shared
embed_copied
embed_loaded
embed_interacted
upgrade_clicked
```

Performance:

```text
webgpu_available
webgpu_failed
wasm_fallback
depth_load_ms
depth_inference_ms
mask_inference_ms
scene_render_fps
scene_payload_bytes
```

Do not upload source images for analytics.

---

# 50. MVP Definition of Done

- [ ] Existing GIF works.
- [ ] Existing sticker works.
- [ ] Depth pipeline is reusable.
- [ ] ISNet pipeline is reusable.
- [ ] 3D mode exists.
- [ ] Depth-aware rendering works.
- [ ] Hover tilt works.
- [ ] Hover zoom works.
- [ ] Cursor depth works.
- [ ] Foreground/background separation works.
- [ ] Edges are acceptable.
- [ ] Disocclusion is controlled.
- [ ] No AI runs during animation.
- [ ] Models are cached.
- [ ] WebGPU works where supported.
- [ ] WASM fallback exists.
- [ ] Scene can be published.
- [ ] Viewer does not load AI models.
- [ ] iframe embed works externally.
- [ ] Responsive assets exist.
- [ ] Basic performance instrumentation exists.

---

# 51. Final Architecture

```text
                    GIFSY CREATOR
                         |
                       IMAGE
                         |
            +------------+------------+
            |                         |
            v                         v
      Depth Anything V2             ISNet
            |                         |
            v                         v
       DEPTH MAP                  MASK MAP
            |                         |
            +------------+------------+
                         |
                         v
                   2.5D ENGINE
                         |
              +----------+----------+
              |                     |
              v                     v
           Preview               Publish
                                    |
                                    v
                              Scene Assets
                                    |
                       +------------+------------+
                       |                         |
                       v                         v
                   Share URL                 Embed URL
                                                 |
                                                 v
                                           HOST WEBSITE
                                                 |
                                                 v
                                             Three.js
                                                 |
                                                 v
                                    Hover / Cursor / Scroll
```

The key distinction:

```text
CREATION
AI-heavy
Depth + segmentation
        ↓
Scene assets

VIEWING
AI-free
Assets + GPU renderer
        ↓
Interactive 3D
```

---

# 52. Final Recommendation

Build Gifsy around:

> **Turn any image into an interactive 3D image.**

Technically implement:

> **Depth-aware 2.5D rendering**

Use:

**Depth Anything V2 Small + ISNet + Three.js + custom shaders**

Store:

**RGB + depth + mask + SceneConfig**

Embed initially with:

**iframe**

Eventually offer:

**`<gifsy-scene>` Web Component**

Default interaction:

**Hover Tilt + subtle Zoom + Depth Parallax**

The first milestone is not monetization.

The first milestone is:

> **Take a normal image, move the mouse over it, and make it look so convincingly 3D that people immediately want to try it.**

# Gifsy

**Make your images move.** Turn any photo into a GIF, a sticker, or a live, embeddable 3D scene — with the AI running in your browser.

Live at **[gifsy.fun](https://www.gifsy.fun)** · Source: [github.com/e-man07/gifsy](https://github.com/e-man07/gifsy)

---

## Table of contents

- [What it does](#what-it-does)
- [How the 3D works (and why it isn't "3D model generation")](#how-the-3d-works)
- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Routes](#routes)
- [Plans, metering and the split depth model](#plans-metering-and-the-split-depth-model)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [External services](#external-services)
- [Database](#database)
- [Scripts and offline tooling](#scripts-and-offline-tooling)
- [Deployment](#deployment)
- [Design notes and conventions](#design-notes-and-conventions)
- [License](#license)

---

## What it does

Gifsy has three creative modes, all starting from an ordinary PNG/JPG/WebP:

| Mode | Where it runs | Account? | Output |
| --- | --- | --- | --- |
| **GIF** — animate one photo (zoom, bounce, shake, pulse, spin, glitch) or stitch several into a loop; FPS, boomerang and reverse controls | 100 % in the browser | No | `.gif` download |
| **Sticker** — AI background removal, edge cleanup, outline, drop shadow, caption | 100 % in the browser | No | transparent PNG, or a 512×512 WebP sized for Telegram sticker packs |
| **3D** — monocular depth + subject segmentation → interactive 2.5D parallax scene with seven motion presets (Orbit, Gentle, Mouse Tilt, Float, Cinematic, Push In, Scroll Depth) | Browser for the AI; server only for storage and (on Free) the last 10 % of the depth model | Yes, for 3D and publishing | a public share page at `/s/<id>` and an `<iframe>` embed at `/embed/<id>` |

Published 3D scenes ship **no AI model to the viewer** — an embed is just an image + depth map + subject cut-out + baked backdrop rendered with a small Three.js shader, so it loads on any site in seconds. That is also what lets the landing page open with live, draggable scenes above the fold.

GIFs and stickers are unlimited and free on every plan and never touch a server. The paid product is the 3D embed.

## How the 3D works

Gifsy does **not** try to reconstruct a watertight mesh from one photo. It builds a high-quality 2.5D scene:

```
photo ─▶ depth map (Depth Anything V2 small, fp16)
     ─▶ subject matte (ISNet via @imgly/background-removal)
     ─▶ LaMa inpaint of the subject-removed backdrop (server, once, at publish)
     ─▶ two displaced planes in WebGL (Three.js) driven by pointer / scroll / auto-drift
```

Principles the codebase follows (from the product handoff docs in the repo root):

- **AI for image understanding, graphics code for the effect.** No new models are added unless a measurable visual problem requires one.
- **The viewer never runs AI.** It consumes finished assets only.
- **Creation stays local and anonymous.** Accounts exist only for publishing and billing.
- **Don't break GIF/sticker.** Every 3D phase must leave the original workflows working.

Rendering lives in `lib/rendering/` and is shared by the creator preview (`components/ThreeDPreview.tsx`) and the lightweight published viewer (`components/SceneViewer.tsx`) so the two never drift.

## Architecture

```
┌──────────────────────── Browser ────────────────────────┐
│ onnxruntime-web (WASM)                                   │
│  • depth encoder  (44 MB, public, Cache Storage)         │
│  • depth head     (5.4 MB — Pro only, fetched once)      │
│  • ISNet matte    (@imgly/background-removal)            │
│ gifenc → GIF   |  Canvas → sticker  |  Three.js → 3D     │
│ IndexedDB write-through cache of published scenes        │
└───────────────┬───────────────────────────┬──────────────┘
                │ Free: POST activations    │ publish assets
                ▼                           ▼
┌──────────── Next.js 16 (App Router, Node runtime) ───────┐
│ /api/depth/head      runs the head, meters free quota    │
│ /api/models/depth-head serves head weights to Pro        │
│ /api/inpaint         LaMa (onnxruntime-web WASM, ~200 MB)│
│ /api/scenes          writes assets + scene.json to Blob  │
│ /api/scenes/[id]     public manifest, CORS-open, cached  │
│ /api/asset/[id]/[f]  cached proxy in front of Blob       │
│ /api/dodo/*          checkout + webhook → plan sync      │
│ proxy.ts             Supabase session refresh            │
└──────┬──────────────┬──────────────────┬─────────────────┘
       ▼              ▼                  ▼
  Supabase        Vercel Blob        Dodo Payments
  (auth, profiles, (scene assets,    (one-time $29 Pro)
   scenes index)    depth encoder)
```

**Stack:** Next.js 16.3 (App Router, `proxy.ts` instead of `middleware.ts`), React 19, TypeScript, Tailwind CSS 4, Three.js 0.160, onnxruntime-web, gifenc, Supabase (`@supabase/ssr`), `@vercel/blob`, `@vercel/analytics`, Dodo Payments + Standard Webhooks, `sharp`.

> **Note for contributors and AI agents:** this Next.js version has breaking changes from what most training data describes. Read `node_modules/next/dist/docs/` before writing framework code — see `AGENTS.md`.

## Repository layout

```
app/                    App Router pages, API routes, metadata (OG image, sitemap, robots)
  page.tsx              landing page: video hero, live persona scenes, community marquee
  create/               3D workshop (needs a session)
  tools/gif, tools/sticker  free, account-less workshops
  s/[id]/               public share page for a published scene (+ per-scene OG image)
  embed/[id]/           bare canvas meant for third-party <iframe>s (noindex, canonical → /s)
  scenes/, gallery/     your published scenes / curated showcase
  pricing/, account/, login/, privacy/, terms/, refund/
  api/                  see "Routes" below
  auth/confirm, auth/signout
components/             UI (workshops, SceneViewer, ThreeDPreview, nav, plan cards, dialogs)
lib/
  gif.ts, sticker.ts, export.ts, image.ts     browser-side GIF/sticker pipeline
  depth.ts, depth-split/, inference/, model-cache.ts   ONNX depth pipeline + caching
  inpaint/lama.ts       server-only LaMa inpainting
  rendering/            shared Three.js scene, shaders, presets, subject fitting
  publish/              SceneRecord model, provider-agnostic store (Blob + IndexedDB), creator flow
  billing/              plan catalogue (client-safe), Dodo client, checkout, launch offer
  supabase/             browser/server/admin clients, session middleware, key helpers
  showcase.ts, gallery.ts   curated landing/gallery content
models/depth-head.onnx  the withheld half of the depth model (bundled into the function)
supabase/migrations/    SQL schema (profiles, scenes, quota), applied in order
supabase/templates/     branded auth emails + SMTP/DNS setup notes
scripts/                offline asset baking, model splitting, showcase capture
proxy.ts                Next 16 middleware: keeps the Supabase session fresh
next.config.ts          ONNX runtime tracing, dev-origin allow-list
gifsy-3d-handoff.md, gifsy-interactive-3d-embed-handoff.md   product/engineering specs
```

## Routes

### Pages

| Path | Purpose |
| --- | --- |
| `/` | Landing page |
| `/tools/gif`, `/tools/sticker` | Free workshops, no account (`?mode=combine` for multi-image GIFs) |
| `/create` | 3D workshop |
| `/s/[id]` | Share page for a published scene, with copyable embed code |
| `/embed/[id]` | Iframe-only viewer (`<iframe src="https://www.gifsy.fun/embed/<id>" style="width:100%;height:500px;border:0" loading="lazy"></iframe>`) |
| `/scenes` | The signed-in user's published scenes |
| `/gallery` | Curated pre-rendered showcase clips |
| `/pricing`, `/account`, `/login` | Billing and auth |
| `/privacy`, `/terms`, `/refund` | Legal |

### API

| Method & path | Auth | What it does |
| --- | --- | --- |
| `POST /api/depth/head` | session | Runs the DPT head on encoder activations. **This is the meter** for free 3D generations. |
| `GET /api/models/depth-head` | Pro | Serves the 5.4 MB head weights so Pro runs the whole model locally/offline. Free → 403. |
| `GET /api/generations` | session | Read-only preflight: plan + generations used. |
| `POST /api/inpaint` | session | LaMa inpaint of the subject-removed background (`maxDuration = 300`, cold start downloads ~200 MB). No GET on purpose — an unauthenticated self-test was a denial-of-wallet hole. |
| `POST /api/scenes` | session | Persists image/depth/mask/background/thumb + `scene.json` to Vercel Blob under `scenes/<id>/`. |
| `GET /api/scenes/[id]` | public | Returns the manifest with asset URLs rewritten to the proxy below. CORS-open, immutable cache. |
| `GET /api/asset/[id]/[field]` | public | Cached proxy in front of Blob (a page with ~32 embeds was tripping Blob's firewall). |
| `POST /api/dodo/checkout` | session | Creates a Dodo checkout for the one-time Pro product. |
| `POST /api/dodo/webhook` | signature | Verifies Standard Webhooks signature; `payment.succeeded` grants Pro, `refund.succeeded` revokes. |
| `GET /auth/confirm`, `POST /auth/signout` | — | Supabase email confirmation and sign-out. |

`proxy.ts` skips `/embed/*` and `/api/scenes/*` entirely — embeds are public and must never depend on a viewer session.

## Plans, metering and the split depth model

| | Free | Pro ($29, one-time, never renews) |
| --- | --- | --- |
| GIFs & stickers | Unlimited, no account | Unlimited |
| 3D generations | `FREE_GENERATION_LIMIT` = 3 lifetime | Unlimited |
| Where the depth head runs | Server (`/api/depth/head`) | Your device — works offline, activations never leave the browser |
| Publishing & embeds | Unlimited, with a Gifsy badge | Unlimited, no badge, commercial use |

The plan catalogue in `lib/billing/plans.ts` is both the marketing copy and the enforced limits, so the pricing page cannot drift from the checks.

**Why the model is split.** Because the whole pipeline runs client-side, a "have you got quota?" call is advisory — a user could patch it out. `scripts/split-depth-model.py` therefore cuts Depth Anything V2 Small at the encoder/DPT-head boundary (six tensors cross it). The browser always gets the 44 MB encoder, which only emits intermediate activations; a free account physically cannot finish a depth map without `POST /api/depth/head`, which is where the generation is counted. Pro accounts fetch the 5.4 MB head from `/api/models/depth-head` once and run everything locally — handing Pro the weights is a feature (speed, offline, privacy), not a leak.

Model downloads are stored in the Cache Storage API (`lib/model-cache.ts`) because Hugging Face serves models with `no-store`.

## Getting started

### Prerequisites

- Node.js 20+ (Vercel default is 24)
- A Supabase project
- A Vercel Blob store (for publishing)
- Optional: a Dodo Payments account (billing), a public URL for the LaMa ONNX model (inpainting), Python 3 + `uv` (offline scripts), `ffmpeg` (showcase capture)

### Install and run

```bash
git clone git@github.com:e-man07/gifsy.git
cd gifsy
npm install
# create .env.local — see "Environment variables" below
npm run dev
```

Open <http://localhost:3000>. GIF and sticker modes work with **no configuration at all** — models are downloaded on first use. `next.config.ts` allows private-network dev origins so you can test on a phone over LAN.

3D creation additionally needs Supabase (for a session) and `BLOB_READ_WRITE_TOKEN` (to publish — without it publishing returns 503 and nothing persists).

### Scripts

| Command | |
| --- | --- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Environment variables

| Variable | Required for | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | auth, 3D | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | auth, 3D | Browser-safe key (`sb_publishable_…`). Legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` still accepted. |
| `SUPABASE_URL`, `SUPABASE_SECRET_KEY` | webhooks, admin | Server-only (`sb_secret_…`). Legacy `SUPABASE_SERVICE_ROLE_KEY` still accepted. |
| `DATABASE_URL`, `DIRECT_URL` | migrations | Pooler (transaction) and session-mode URLs |
| `BLOB_READ_WRITE_TOKEN` | publishing | Vercel Blob store token |
| `NEXT_PUBLIC_DEPTH_ENCODER_URL` | optional | Override the public encoder URL for a self-hosted deployment |
| `LAMA_MODEL_URL` | inpainting | URL of the big-lama ONNX model (~200 MB); publishing degrades gracefully without it |
| `DODO_PAYMENTS_API_KEY`, `DODO_PAYMENTS_WEBHOOK_KEY`, `DODO_PRODUCT_PRO`, `DODO_ENVIRONMENT` | billing | `DODO_PRODUCT_PRO` **must be a one-time product**, not a subscription |
| `NEXT_PUBLIC_SITE_URL` | production | Canonical origin for OG/canonical/embed URLs. Falls back to `VERCEL_PROJECT_PRODUCTION_URL`, then `localhost:3000`. |
| `RESEND_API_KEY` | auth email | Used as the SMTP password in Supabase — see `supabase/templates/README.md` |

## External services

- **Supabase** — auth (email confirmation), `profiles` (plan), `scenes` index, generation quota. RLS is on; the webhook uses the secret key to bypass it.
- **Vercel Blob** — public scene assets plus the depth encoder. Always accessed through `/api/asset/…` from pages so bursts don't trip Blob's firewall.
- **Dodo Payments** — one-time Pro purchase. Webhooks are verified with the Standard Webhooks spec; legacy `subscription.*` events are still honoured for any lingering monthly accounts.
- **Resend** (via Supabase custom SMTP) — branded auth emails. Setup, DNS records and gotchas are documented in `supabase/templates/README.md`.
- **Vercel Analytics** — page views and `embed_copied` / `scene_shared` events.

## Database

Migrations live in `supabase/migrations/` and are plain SQL, applied in order:

| File | |
| --- | --- |
| `0001_init.sql` | `profiles` (auto-created per auth user via trigger), `scenes`, RLS policies |
| `0002_lock_plan_escalation.sql` | Users cannot upgrade their own `plan` column |
| `0003_two_tier_plans.sql` | Collapse to free/pro |
| `0004_scene_thumbnails.sql` | 400 px thumbnail asset for grids |
| `0005_generation_quota.sql`, `0006_claim_generation.sql` | Lifetime 3D generation counter + atomic claim function |

Apply with `psql "$DIRECT_URL" -f supabase/migrations/000N_*.sql` or paste into the Supabase SQL editor.

## Scripts and offline tooling

| Script | Purpose |
| --- | --- |
| `scripts/split-depth-model.py` | Splits Depth Anything V2 Small into `depth-encoder.onnx` (public, → Blob) and `depth-head.onnx` (→ `models/`). Re-run whenever the base model export changes. |
| `scripts/make-demo-assets.py` | Bakes depth / matte / backdrop for the landing-page demo scenes **with the exact same models and constants the browser uses**, so the demos are honestly "what you get from your own photo". |
| `scripts/capture-showcase.mjs` | Records each community scene's auto-orbit from the WebGL canvas in headless Chromium and loops it with ffmpeg for `/public/showcase`. |

Python scripts are run from a `uv` venv (usage is at the top of each file). `qa-3d/` is a git-ignored scratch directory for render-verification harnesses.

## Deployment

The site deploys to Vercel with zero extra configuration beyond the env vars above. Things that are already handled in `next.config.ts` and worth knowing before changing:

- `onnxruntime-web` is loaded via `createRequire` at runtime, so it is kept in `serverExternalPackages` and force-included (plus its runtime deps and `models/depth-head.onnx`) in the `/api/inpaint`, `/api/depth/head` and `/api/models/depth-head` function bundles via `outputFileTracingIncludes`.
- All API routes run on the **Node.js** runtime (Fluid Compute) — never edge; Blob and WASM ORT need Node APIs.
- `/api/inpaint` sets `maxDuration = 300` for the cold model download.
- Set `NEXT_PUBLIC_SITE_URL` on the custom domain so copied embed snippets and OG cards point at `gifsy.fun`, not a preview URL.

## Design notes and conventions

- **Visual direction:** hybrid pixel + clean UI — Pixelify Sans wordmark, hard ink offset shadows, palette tokens in `app/globals.css` (ink `#0e2438`, sky `#2e9bf0`, grass, background `#eaf4ff`).
- **Comments explain *why*.** Most non-obvious files open with a header describing the decision and what it replaced; keep that habit.
- **Provider-agnostic seams.** Scene storage sits behind `SceneStore` (`lib/publish/store.ts`) so the backend can change without touching the UI.
- **Never block GIF/sticker on a server.** The depth GIF effect was removed precisely because it silently consumed the metered 3D quota.
- **SEO:** `/embed/[id]` is `noindex` with a canonical to `/s/[id]`; share pages generate their own OG image.

## License

Private — all rights reserved. © Gifsy.

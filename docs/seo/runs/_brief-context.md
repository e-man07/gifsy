# Shared context for content-brief runs (read this first)

Project: Gifsy, https://www.gifsy.fun, repo /Users/e-man/myprojects/gif (Next.js 16 App Router).
Product: one photo → interactive 2.5D depth-parallax "3D photo" made in the browser
(Depth Anything V2 Small depth map + ISNet subject matte + LaMa-inpainted backdrop, baked
once at publish + Three.js two-plane renderer with grab-to-orbit "Spin"). Creator gets a
share page /s/<id> and an <iframe> embed /embed/<id>; the visitor's page stays live and
interactive, no video, no AI runs for the viewer (assets only, loads in seconds).
Plans: Free = 3 lifetime 3D generations, unlimited publishing, "Gifsy" badge on embeds.
Pro = $9 one-time, never renews: unlimited generations, no badge, commercial use, depth
model runs fully locally. Free no-account GIF maker (/tools/gif) and Telegram sticker
maker (/tools/sticker) are a separate always-free funnel, 100% in-browser.
ICP #1 = Webflow/Framer/no-code builders; #2 = portfolio creators. Ruled out: ecommerce/
AR, 3D mesh generation (Meshy/Tripo) — never target that intent.

HONESTY CONSTRAINTS (must be reflected in any brief):
- The PHOTO stays in the browser. On Free, intermediate depth-model activations (not the
  photo) are sent to the server for the second half of the model. Pro runs fully local.
  Publishing uploads the finished scene (image/depth/mask/backdrop) and it becomes public.
- Never claim "works offline" for the whole flow — publishing hits the inpaint server.
- Immersity for Web is STILL SOLD (free = watermark/720p/non-commercial; $4.99–$99.99/mo
  credits); only its homepage now sells displays. No Immersity plan offers an embed.
- Single-image depth is a 2.5D height-field: honest cone ≈ ±23° orbit, not 360°.
  Frame-filling subjects and busy/low-separation backgrounds work worst; ≥640px sources.
- Sticker tool is Telegram-only (512×512 WebP ≤512 KB, @Stickers bot). No WhatsApp.
- No fabricated stats, testimonials, or user counts.

Prior research: docs/seo/README.md (decisions + backlog) and docs/seo/runs/01–08.
URL conventions: /guides/<slug> how-tos & explainers; /alternatives/<tool> listicles;
/compare/<slug> head-to-heads. Byline: a named founder byline is planned but NOT yet
confirmed — write "Author: TBD" in the brief. **UPDATE 2026-09-17: byline confirmed — Aman Jha (founder, x.com/WhyParabola) + Priyanshu Tiwari (co-founder, x.com/priyanshudotsol). Read README "Decisions from the user".**

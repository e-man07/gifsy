"use client";

// Real, draggable 3D scenes running on the landing page — not recorded clips.
//
// Each card mounts a full SceneViewer over a pre-baked image + depth pair (see
// lib/showcase.ts). No AI model is downloaded to render these, so this is the
// cheapest possible way to let a visitor feel the product before uploading.
//
// Cost control: a scene only mounts once its card scrolls into view, and each
// card paints its poster JPG immediately underneath, so the section costs a
// visitor who never scrolls exactly nothing, and never reflows.

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Hand } from "lucide-react";
import { loadImage } from "@/lib/image";
import { presetConfig } from "@/lib/rendering/presets";
import { DEFAULT_SCENE_CONFIG, type SceneConfig } from "@/lib/rendering/types";
import {
  DEMO_SCENES,
  demoBgSrc,
  demoDepthSrc,
  demoImageSrc,
  demoMaskSrc,
  type DemoScene,
} from "@/lib/showcase";

const SceneViewer = dynamic(
  () => import("./SceneViewer").then((m) => m.SceneViewer),
  { ssr: false },
);

// "orbit" is the app's own default preset, so what a visitor drags here is
// exactly what they'd get from their own photo.
const DEMO_CONFIG: SceneConfig = {
  ...DEFAULT_SCENE_CONFIG,
  ...presetConfig("orbit"),
};

/** subjectOnly rides on the config, same as it does for a published scene. */
function configFor(scene: DemoScene): SceneConfig {
  return scene.subjectOnly
    ? { ...DEMO_CONFIG, subjectOnly: true }
    : DEMO_CONFIG;
}

export function LiveScenes() {
  return (
    // One row of all four on wide screens — the section reads as a single strip
    // of "here are four different kinds of photo", which splitting it into rows
    // loses.
    //
    // 2-up on phones, not 1-up: full-width cards made this section about three
    // and a half screens tall, so the fourth scene was somewhere nobody
    // scrolled to. A horizontal carousel would have been worse — swiping it is
    // the same gesture as dragging a scene, so the two would fight.
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-8 sm:gap-y-10 xl:grid-cols-4">
      {DEMO_SCENES.map((scene, i) => (
        <LiveScene key={scene.id} scene={scene} priority={i === 0} />
      ))}
    </div>
  );
}

function LiveScene({
  scene,
  priority,
}: {
  scene: DemoScene;
  priority: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(priority);
  const [assets, setAssets] = useState<{
    image: HTMLImageElement;
    depth: HTMLImageElement;
    mask: HTMLImageElement;
    background: HTMLImageElement | null;
  } | null>(null);
  const [failed, setFailed] = useState(false);

  // Mount the renderer only when the card is near the viewport.
  useEffect(() => {
    if (inView) return;
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "250px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView]);

  useEffect(() => {
    if (!inView || assets) return;
    let cancelled = false;
    (async () => {
      try {
        // The mask is the foreground layer — without it the scene is one flat
        // displaced plane and reads as a tilting sheet, not a subject in front
        // of a background.
        // A cut-out never draws a backdrop, so don't spend the bytes fetching
        // one for it.
        const [image, depth, mask, background] = await Promise.all([
          loadImage(demoImageSrc(scene.id)),
          loadImage(demoDepthSrc(scene.id)),
          loadImage(demoMaskSrc(scene.id)),
          scene.subjectOnly
            ? Promise.resolve<HTMLImageElement | null>(null)
            : loadImage(demoBgSrc(scene.id)),
        ]);
        if (!cancelled) setAssets({ image, depth, mask, background });
      } catch {
        // Leave the poster showing rather than an empty box.
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [inView, assets, scene.id, scene.subjectOnly]);

  return (
    <figure className="flex flex-col">
      {/* Deliberately no card chrome — no border, no panel, no caption bar.
          A framed thumbnail reads as "picture of a thing"; sitting bare on the
          section background it reads as an object you can grab, and nothing
          crops the subject as it swings. */}
      <div
        ref={boxRef}
        // aspect-[4/5] on phones: every demo subject is upright, so a portrait
        // box frames them with less dead width and is shorter than the
        // landscape one. From sm up it returns to the baked assets' own ratio —
        // the literal 578/420 here mirrors DEMO_ASPECT in lib/showcase.ts,
        // which a Tailwind arbitrary value can't interpolate. Either way the box
        // is reserved before the renderer mounts, so nothing reflows.
        className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl sm:aspect-[578/420]"
      >
        {/* Poster underneath: paints instantly, and remains the graceful
            fallback if WebGL is unavailable or an asset fails to load. Skipped
            for a subject-only scene — the whole point there is that nothing
            opaque sits behind the cut-out. */}
        {!scene.subjectOnly && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={demoImageSrc(scene.id)}
            alt={scene.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {assets && !failed && (
          <div className="absolute inset-0">
            <SceneViewer
              image={assets.image}
              depth={assets.depth}
              mask={assets.mask}
              background={assets.background}
              config={configFor(scene)}
              surface="landing"
              showBrand={false}
              className="h-full w-full"
            />
          </div>
        )}

        <span className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-ink/80 px-1.5 py-0.5 font-pixel text-[9px] uppercase tracking-wide text-cloud sm:px-2 sm:py-1 sm:text-[10px]">
          <Hand className="h-3 w-3" strokeWidth={2.5} aria-hidden />
          Drag me
        </span>
      </div>

      {/* Stacked on phones — side by side, these two collide in a ~180px card. */}
      <figcaption className="mt-2 flex flex-col gap-0.5 sm:mt-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
        <span className="font-pixel text-xs text-foreground sm:text-sm">{scene.title}</span>
        <span className="font-pixel text-[9px] uppercase tracking-wide text-muted sm:text-[10px]">
          {scene.blurb}
        </span>
      </figcaption>
    </figure>
  );
}

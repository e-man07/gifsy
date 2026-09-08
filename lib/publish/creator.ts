// Creator-side publishing: run the (already-computed) depth grid and cutout
// through asset optimization, wrap everything in a SceneRecord, and persist it
// via the provider-agnostic store. No AI runs here — the AI already ran once
// on the creator's device.

import type { DepthGrid } from "@/lib/depth";
import { depthGridToCanvas } from "@/lib/depth";
import type { SceneConfig } from "@/lib/rendering/types";
import { canvasToBlob, getCtx, imageToCanvas, makeCanvas } from "@/lib/image";
import { sceneStore } from "./store";
import { newSceneId } from "./scene-id";
import type { PublishResult, SceneAsset, SceneRecord } from "./types";

/**
 * Bake a clean subject-removed backdrop by sending the image + subject mask to
 * the server LaMa inpaint route (runs once, here at publish — never in the
 * viewer). Returns a WebP asset, or null if inpaint is unavailable/failed so the
 * viewer transparently falls back to the client-side push-pull fill.
 */
async function inpaintBackgroundAsset(
  image: HTMLImageElement,
  cutout: HTMLImageElement,
): Promise<SceneAsset | null> {
  try {
    const canvas = imageToCanvas(image, 1024);
    const w = canvas.width;
    const h = canvas.height;
    const rgba = getCtx(canvas).getImageData(0, 0, w, h).data; // RGBA

    const mcanvas = makeCanvas(w, h);
    getCtx(mcanvas).drawImage(cutout, 0, 0, w, h);
    const cData = getCtx(mcanvas).getImageData(0, 0, w, h).data;
    const mask = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) mask[i] = cData[i * 4 + 3]; // subject alpha = hole

    const form = new FormData();
    form.set("width", String(w));
    form.set("height", String(h));
    form.set("image", new Blob([new Uint8Array(rgba.buffer)]), "image.bin");
    form.set("mask", new Blob([mask]), "mask.bin");

    const res = await fetch("/api/inpaint", { method: "POST", body: form });
    if (!res.ok) return null;
    const out = new Uint8Array(await res.arrayBuffer());
    if (out.length !== w * h * 4) return null;

    const outCanvas = makeCanvas(w, h);
    const octx = getCtx(outCanvas);
    const id = octx.createImageData(w, h);
    id.data.set(out);
    octx.putImageData(id, 0, 0);
    const blob = await canvasToBlob(outCanvas, "image/webp", 0.9);
    return { blob, mime: "image/webp" };
  } catch {
    return null; // any failure → viewer uses push-pull
  }
}

/** Long edge of the grid thumbnail. The /scenes and /gallery cells render at
 *  roughly 200–260 CSS px, so 400 covers a 2x display with no upscaling. */
const THUMB_LONG_EDGE = 400;

/**
 * A small WebP preview of the colour image, for the account and gallery grids.
 * Those grids used to load the full 1440px hero image into a ~240px cell —
 * about an order of magnitude more bytes per cell than needed, paid on every
 * grid view. q0.8 is fine at this size.
 *
 * Never throws: a scene is perfectly publishable without a thumbnail, and the
 * grids fall back to the full image when one is absent.
 */
async function thumbAsset(image: HTMLImageElement): Promise<SceneAsset | null> {
  try {
    const blob = await canvasToBlob(imageToCanvas(image, THUMB_LONG_EDGE), "image/webp", 0.8);
    return { blob, mime: "image/webp" };
  } catch {
    return null;
  }
}

export interface PublishOptions {
  image: HTMLImageElement;
  depthGrid: DepthGrid;
  cutout?: HTMLImageElement | null;
  config: SceneConfig;
  onProgress?: (fraction: number) => void;
}

/**
 * Optimize the creator's outputs into publishable assets, build a SceneRecord,
 * and persist it.
 *
 * Returns the saved record AND where it landed. Callers must check
 * `persistence`: "local" means the server write failed and the scene is not
 * actually published, so no share link or embed code should be offered.
 */
export async function publishScene(opts: PublishOptions): Promise<PublishResult> {
  const { image, depthGrid, cutout, config, onProgress } = opts;

  // Step 1/3 — color image as WebP (≤1440 long edge); q0.90 for a crisp hero asset.
  // 1440 keeps large-display heroes sharp (ICP #1's use case) at ~150–350KB WebP.
  onProgress?.(0.1);
  const imageBlob = await canvasToBlob(imageToCanvas(image, 1440), "image/webp", 0.9);

  // Step 2/3 — grayscale depth map as PNG (lossless). WebP block artifacts on the
  // depth map surface as banding/ripples in the displaced mesh, so the embed looked
  // worse than the creator's own preview; the refined depth is smooth grayscale, so
  // PNG stays small (tens of KB) while preserving the Phase-1 refinement through publish.
  onProgress?.(0.5);
  const depthBlob = await canvasToBlob(depthGridToCanvas(depthGrid), "image/png");

  // Step 3/3 — subject mask (alpha PNG, lossless so edges stay clean) and, when a
  // subject exists, the LaMa-inpainted backdrop (baked here, once, server-side).
  let mask: SceneAsset | null = null;
  let background: SceneAsset | null = null;
  if (cutout) {
    const maskCanvas = imageToCanvas(cutout, 1024);
    const maskBlob = await canvasToBlob(maskCanvas, "image/png");
    mask = { blob: maskBlob, mime: "image/png" };
    onProgress?.(0.65);
    background = await inpaintBackgroundAsset(image, cutout);
  }

  const record: SceneRecord = {
    id: newSceneId(),
    version: 1,
    image: { blob: imageBlob, mime: "image/webp" },
    depth: { blob: depthBlob, mime: "image/png" },
    mask,
    background,
    thumb: await thumbAsset(image),
    config,
    createdAt: Date.now(),
  };

  onProgress?.(0.85);
  const result = await sceneStore.save(record);
  onProgress?.(1);
  return { ...result, record };
}

/** Resolve a scene id to its stored record (or null). */
export async function loadScene(id: string): Promise<SceneRecord | null> {
  return sceneStore.get(id);
}

// GIF creation: animate a single image with effects, add real depth, or stitch
// several images into a loop. Uses a single global color palette for the
// single-image paths so frames don't flicker between near-identical colors.
import { drawCover, getCtx, makeCanvas, refineCutout, type Ctx2D } from "./image";

export type GifEffect =
  | "depth"
  | "zoom"
  | "bounce"
  | "shake"
  | "pulse"
  | "spin"
  | "glitch";

export const GIF_EFFECTS: {
  id: GifEffect;
  label: string;
  ai?: boolean;
}[] = [
  { id: "depth", label: "Depth", ai: true },
  { id: "zoom", label: "Zoom" },
  { id: "bounce", label: "Bounce" },
  { id: "shake", label: "Shake" },
  { id: "pulse", label: "Pulse" },
  { id: "spin", label: "Spin" },
  { id: "glitch", label: "Glitch" },
];

interface Frame {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  delay: number;
}

// Deterministic pseudo-random so glitch frames still loop reproducibly.
function seeded(seed: number) {
  let s = seed + 1;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/** Draw one animation frame for `effect` at normalized time t ∈ [0,1). */
function drawEffectFrame(
  ctx: Ctx2D,
  img: HTMLImageElement,
  effect: GifEffect,
  t: number,
  size: number,
) {
  const phase = t * Math.PI * 2;
  const osc = 0.5 - 0.5 * Math.cos(phase); // 0 → 1 → 0, smooth ease in/out, loops

  switch (effect) {
    case "zoom":
      drawCover(ctx, img, size, 1.08 + 0.22 * osc);
      break;
    case "pulse":
      drawCover(ctx, img, size, 1.02 + 0.12 * osc);
      break;
    case "bounce": {
      const amp = size * 0.07;
      const y = -amp * Math.abs(Math.sin(phase));
      drawCover(ctx, img, size, 1.16, 0, y);
      break;
    }
    case "shake": {
      const amp = size * 0.02;
      drawCover(
        ctx,
        img,
        size,
        1.12,
        amp * Math.sin(phase * 3),
        amp * Math.cos(phase * 2),
      );
      break;
    }
    case "spin":
      drawCover(ctx, img, size, 1.5, 0, 0, phase);
      break;
    case "glitch": {
      drawCover(ctx, img, size, 1.05);
      const rand = seeded(Math.round(t * 1000));
      // Chromatic aberration
      const shift = 3 + Math.round(osc * 6);
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.5;
      drawCover(ctx, img, size, 1.05, shift, 0);
      drawCover(ctx, img, size, 1.05, -shift, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      // Displaced horizontal slices
      const slices = 4;
      for (let i = 0; i < slices; i++) {
        if (rand() < 0.5) continue;
        const sy = Math.floor(rand() * size);
        const sh = 6 + Math.floor(rand() * (size * 0.08));
        const dx = (rand() - 0.5) * size * 0.12;
        const slice = ctx.getImageData(0, sy, size, Math.min(sh, size - sy));
        ctx.putImageData(slice, dx, sy);
      }
      break;
    }
    default:
      // "depth" is rendered by makeDepthGif; fall back to a gentle zoom here.
      drawCover(ctx, img, size, 1.08 + 0.22 * osc);
  }
}

/** Draw a contained subject centered in a square, with offset + scale (for parallax). */
function drawForeground(
  ctx: Ctx2D,
  src: HTMLCanvasElement,
  size: number,
  offsetX: number,
  offsetY: number,
  scale: number,
) {
  const pad = size * 0.12;
  const avail = size - pad * 2;
  const base = Math.min(avail / src.width, avail / src.height);
  const s = base * scale;
  const dw = src.width * s;
  const dh = src.height * s;
  ctx.drawImage(
    src,
    (size - dw) / 2 + offsetX,
    (size - dh) / 2 + offsetY,
    dw,
    dh,
  );
}

/** Sample pixels across every frame and quantize once → one shared palette. */
function buildGlobalPalette(
  frames: Frame[],
  quantize: (rgba: Uint8ClampedArray, colors: number) => number[][],
): number[][] {
  const stride = 4; // sample 1 of every 4 pixels to keep this fast
  let cap = 0;
  for (const f of frames) cap += Math.ceil(f.data.length / 4 / stride) + 1;
  const sample = new Uint8ClampedArray(cap * 4);
  let o = 0;
  for (const f of frames) {
    const d = f.data;
    for (let i = 0; i < d.length; i += 4 * stride) {
      sample[o] = d[i];
      sample[o + 1] = d[i + 1];
      sample[o + 2] = d[i + 2];
      sample[o + 3] = d[i + 3];
      o += 4;
    }
  }
  return quantize(sample.subarray(0, o) as Uint8ClampedArray, 256);
}

/** Ping-pong the frame sequence (forward then back) for a seamless boomerang. */
function withBoomerang(frames: Frame[], on?: boolean): Frame[] {
  if (!on || frames.length < 3) return frames;
  const out = frames.slice();
  for (let i = frames.length - 2; i >= 1; i--) out.push({ ...frames[i] });
  return out;
}

async function encodeFrames(
  frames: Frame[],
  globalPalette = false,
): Promise<Blob> {
  const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
  const gif = GIFEncoder();

  if (globalPalette) {
    // One palette for all frames → no color flicker, smaller file. The palette
    // is written as the global color table on the first frame; later frames
    // omit it and reuse it. repeat defaults to 0 = loop forever.
    const palette = buildGlobalPalette(frames, quantize);
    let first = true;
    for (const f of frames) {
      const index = applyPalette(f.data, palette);
      gif.writeFrame(
        index,
        f.width,
        f.height,
        first ? { palette, delay: f.delay } : { delay: f.delay },
      );
      first = false;
    }
  } else {
    // Per-frame palettes (local color tables) — better when frames differ a
    // lot, e.g. a slideshow of unrelated photos.
    for (const f of frames) {
      const palette = quantize(f.data, 256);
      const index = applyPalette(f.data, palette);
      gif.writeFrame(index, f.width, f.height, { palette, delay: f.delay });
    }
  }

  gif.finish();
  return new Blob([gif.bytes() as BlobPart], { type: "image/gif" });
}

export interface AnimateOptions {
  size?: number;
  frames?: number;
  fps?: number;
  background?: string; // "transparent" or a CSS color
  boomerang?: boolean;
  onProgress?: (fraction: number) => void;
}

/** Turn a single image into an animated GIF using the chosen effect. */
export async function makeAnimatedGif(
  img: HTMLImageElement,
  effect: GifEffect,
  opts: AnimateOptions = {},
): Promise<Blob> {
  const size = opts.size ?? 480;
  const frameCount = opts.frames ?? 30; // more frames = smoother motion
  const fps = opts.fps ?? 20;
  const delay = Math.round(1000 / fps);
  const canvas = makeCanvas(size);
  const ctx = getCtx(canvas);
  const frames: Frame[] = [];

  for (let i = 0; i < frameCount; i++) {
    ctx.clearRect(0, 0, size, size);
    if (opts.background && opts.background !== "transparent") {
      ctx.fillStyle = opts.background;
      ctx.fillRect(0, 0, size, size);
    }
    drawEffectFrame(ctx, img, effect, i / frameCount, size);
    frames.push({
      data: ctx.getImageData(0, 0, size, size).data,
      width: size,
      height: size,
      delay,
    });
    opts.onProgress?.((i + 1) / frameCount);
  }
  return encodeFrames(withBoomerang(frames, opts.boomerang), true);
}

export interface DepthOptions {
  size?: number;
  frames?: number;
  fps?: number;
  intensity?: number; // 0..1 motion strength
  boomerang?: boolean;
  onProgress?: (fraction: number) => void;
}

/**
 * Give a single photo real depth: the AI-cut subject floats in sharp focus
 * over a soft, blurred copy of the original that drifts the opposite way
 * (parallax). Reads far more "alive" than moving a flat image.
 */
export async function makeDepthGif(
  original: HTMLImageElement,
  cutoutImg: HTMLImageElement,
  opts: DepthOptions = {},
): Promise<Blob> {
  const size = opts.size ?? 480;
  const frameCount = opts.frames ?? 30;
  const fps = opts.fps ?? 24;
  const delay = Math.round(1000 / fps);
  const intensity = opts.intensity ?? 1;
  const canvas = makeCanvas(size);
  const ctx = getCtx(canvas);
  const frames: Frame[] = [];

  const subject = refineCutout(cutoutImg, { threshold: 20, feather: 1 });
  const swayX = size * 0.04 * intensity;
  const floatY = size * 0.035 * intensity;
  const blur = Math.max(2, Math.round(size * 0.03));

  for (let i = 0; i < frameCount; i++) {
    const t = i / frameCount;
    const phase = t * Math.PI * 2;
    const bob = 0.5 - 0.5 * Math.cos(phase); // 0 → 1 → 0

    const fgX = swayX * Math.sin(phase);
    const fgY = -floatY * bob;
    const fgScale = 1.0 + 0.03 * bob; // gentle "breathing"

    ctx.clearRect(0, 0, size, size);

    // Background: blurred, zoomed original drifting opposite the subject.
    ctx.save();
    ctx.filter = `blur(${blur}px) brightness(0.85) saturate(1.08)`;
    drawCover(ctx, original, size, 1.4, -fgX * 0.45, -fgY * 0.45);
    ctx.restore();

    // Foreground: sharp subject with a soft contact shadow for separation.
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = size * 0.045;
    ctx.shadowOffsetY = size * 0.02;
    drawForeground(ctx, subject, size, fgX, fgY, fgScale);
    ctx.restore();

    frames.push({
      data: ctx.getImageData(0, 0, size, size).data,
      width: size,
      height: size,
      delay,
    });
    opts.onProgress?.((i + 1) / frameCount);
  }
  return encodeFrames(withBoomerang(frames, opts.boomerang), true);
}

export interface SlideshowOptions {
  size?: number;
  perFrameMs?: number;
  background?: string;
  onProgress?: (fraction: number) => void;
}

/** Stitch multiple images into a looping slideshow GIF. */
export async function makeSlideshowGif(
  imgs: HTMLImageElement[],
  opts: SlideshowOptions = {},
): Promise<Blob> {
  const size = opts.size ?? 480;
  const delay = opts.perFrameMs ?? 600;
  const canvas = makeCanvas(size);
  const ctx = getCtx(canvas);
  const frames: Frame[] = [];

  for (let k = 0; k < imgs.length; k++) {
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle =
      opts.background && opts.background !== "transparent"
        ? opts.background
        : "#ffffff";
    ctx.fillRect(0, 0, size, size);
    drawCover(ctx, imgs[k], size);
    frames.push({
      data: ctx.getImageData(0, 0, size, size).data,
      width: size,
      height: size,
      delay,
    });
    opts.onProgress?.((k + 1) / imgs.length);
  }
  // Diverse photos: per-frame palettes keep each image's colors accurate.
  return encodeFrames(frames, false);
}

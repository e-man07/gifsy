// GIF creation: animate a single image with effects, add real depth, or stitch
// several images into a loop. Uses a single global color palette for the
// single-image paths so frames don't flicker between near-identical colors.
import { blurAlpha, drawCover, getCtx, makeCanvas, refineCutout, type Ctx2D } from "./image";

// "depth" was removed: it was the one GIF effect that called the server's
// metered depth-head route (same one 3D uses), silently requiring an account
// and sharing 3D's free-generation quota — directly contradicting "GIFs &
// stickers always free". `makeDepthGif`/`estimateDepth` are left in place
// below in case a real depth-based GIF renderer comes back later, but nothing
// calls them now.
export type GifEffect =
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
      // Unreachable for any current GifEffect — kept as a safe fallback.
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
 * Real-depth GIF from a single photo. Requires a depth map (see
 * `estimateDepth` in lib/depth.ts): every background pixel is displaced by how
 * close it is to the camera, the AI-cut subject floats sharp on top, and a
 * blurred copy of the original hides the reveal behind it.
 */
export async function makeDepthGif(
  original: HTMLImageElement,
  cutoutImg: HTMLImageElement,
  opts: DepthOptions = {},
  depthMap?: HTMLCanvasElement,
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

  // With a depth map: per-pixel displaced layer over a static blurred
  // backdrop. Without one, fall back to the old two-plane sway.
  const layer = depthMap ? buildDepthLayer(original, cutoutImg, depthMap) : null;
  const backdrop = layer ? buildBackdrop(original, size, blur) : null;
  const maps = layer ? buildPixelMaps(size, layer.gw, layer.gh) : null;
  const backdropData = backdrop
    ? getCtx(backdrop).getImageData(0, 0, size, size).data!
    : null;

  for (let i = 0; i < frameCount; i++) {
    const t = i / frameCount;
    const phase = t * Math.PI * 2;
    const bob = 0.5 - 0.5 * Math.cos(phase); // 0 → 1 → 0

    const fgX = swayX * Math.sin(phase);
    const fgY = -floatY * bob;
    const fgScale = 1.0 + 0.03 * bob; // gentle "breathing"

    ctx.clearRect(0, 0, size, size);

    if (layer && backdrop && backdropData && maps) {
      renderDepthFrame(
        ctx,
        layer,
        backdropData,
        maps,
        size,
        Math.sin(phase),
        -bob,
        intensity,
      );
    } else {
      // Legacy fallback: blurred, zoomed original drifting opposite the subject.
      ctx.save();
      ctx.filter = `blur(${blur}px) brightness(0.85) saturate(1.08)`;
      drawCover(ctx, original, size, 1.4, -fgX * 0.45, -fgY * 0.45);
      ctx.restore();
    }

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

/**
 * The background layer at depth-grid resolution: the original cover-zoomed
 * 12% so displaced sampling never runs out of pixels at the edges, with the
 * subject carved out (transparent) so the blurred backdrop shows through.
 */
interface DepthLayer {
  gw: number;
  gh: number;
  depth: Float32Array; // 0..1, closer = 1
  dMean: number; // mean depth of the background (parallax pivot)
  src: Uint8ClampedArray; // RGBA, subject region transparent
}

function buildDepthLayer(
  original: HTMLImageElement,
  cutoutImg: HTMLImageElement,
  depthMap: HTMLCanvasElement,
): DepthLayer {
  const gw = depthMap.width;
  const gh = depthMap.height;

  const dd = getCtx(depthMap).getImageData(0, 0, gw, gh).data;
  const depth = new Float32Array(gw * gh);
  for (let i = 0; i < gw * gh; i++) depth[i] = dd[i * 4] / 255;

  const src = makeCanvas(gw, gh);
  const sctx = getCtx(src);
  const base = Math.max(gw / original.naturalWidth, gh / original.naturalHeight);
  const s = base * 1.12;
  const dw = original.naturalWidth * s;
  const dh = original.naturalHeight * s;
  sctx.drawImage(original, (gw - dw) / 2, (gh - dh) / 2, dw, dh);

  // Subject mask at grid resolution: de-halo + feather, same as refineCutout.
  const mask = makeCanvas(gw, gh);
  getCtx(mask).drawImage(cutoutImg, 0, 0, gw, gh);
  const md = getCtx(mask).getImageData(0, 0, gw, gh).data;
  for (let i = 0; i < gw * gh; i++) {
    if (md[i * 4 + 3] < 20) md[i * 4 + 3] = 0;
  }
  blurAlpha(md, gw, gh, 1);

  const sd = sctx.getImageData(0, 0, gw, gh).data;
  const srcPx = new Uint8ClampedArray(sd);
  let sum = 0;
  let wsum = 0;
  for (let i = 0; i < gw * gh; i++) {
    const m = md[i * 4 + 3] / 255;
    srcPx[i * 4 + 3] = 255 - md[i * 4 + 3];
    const w = 1 - m * 0.85; // pivot on the background, ignore the subject
    sum += depth[i] * w;
    wsum += w;
  }
  return { gw, gh, depth, dMean: sum / wsum, src: srcPx };
}

/** Static blurred backdrop that fills holes the displacement reveals. */
function buildBackdrop(
  original: HTMLImageElement,
  size: number,
  blur: number,
): HTMLCanvasElement {
  const c = makeCanvas(size);
  const ctx = getCtx(c);
  ctx.filter = `blur(${blur}px) brightness(0.85) saturate(1.08)`;
  drawCover(ctx, original, size, 1.35);
  return c;
}

/** Per-output-pixel mapping into the depth grid (frame-invariant). */
function buildPixelMaps(size: number, gw: number, gh: number) {
  const n = size * size;
  const x0 = new Int32Array(n);
  const y0 = new Int32Array(n);
  const fx = new Float32Array(n);
  const fy = new Float32Array(n);
  for (let y = 0; y < size; y++) {
    const gyf = ((y + 0.5) * gh) / size - 0.5;
    const gy = gyf < 0 ? 0 : gyf;
    const gyI = gy | 0;
    const fyv = gy - gyI;
    for (let x = 0; x < size; x++) {
      const gxf = ((x + 0.5) * gw) / size - 0.5;
      const gx = gxf < 0 ? 0 : gxf;
      const i = y * size + x;
      x0[i] = gx | 0;
      y0[i] = gyI;
      fx[i] = gx - (gx | 0);
      fy[i] = fyv;
    }
  }
  return { x0, y0, fx, fy };
}

/**
 * Composite one frame: backdrop, then the photo displaced per-pixel by its
 * depth — near pixels follow the subject's motion, far pixels drift the other
 * way, so the motion reads as real parallax. Integer math + packed writes to
 * keep the 480² × 58-frame loop fast.
 */
function renderDepthFrame(
  ctx: Ctx2D,
  layer: DepthLayer,
  backdrop: Uint8ClampedArray,
  maps: { x0: Int32Array; y0: Int32Array; fx: Float32Array; fy: Float32Array },
  size: number,
  dirX: number,
  dirY: number,
  intensity: number,
) {
  const { gw, gh, depth, dMean, src } = layer;
  const img = ctx.createImageData(size, size);
  const out = img.data;
  const out32 = new Uint32Array(out.buffer);
  const disp = size * 0.05 * intensity;
  const sxScale = gw / size;
  const syScale = gh / size;
  const maxX = gw - 1;
  const maxY = gh - 1;

  for (let y = 0; y < size; y++) {
    const gyf = ((y + 0.5) * gh) / size - 0.5;
    let gxf = 0.5 * sxScale - 0.5;
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const gx0 = maps.x0[i];
      const gy0 = maps.y0[i];
      const gx1 = Math.min(gx0 + 1, maxX);
      const gy1 = Math.min(gy0 + 1, maxY);
      const fxi = maps.fx[i];
      const fyi = maps.fy[i];
      const i00 = gy0 * gw + gx0;
      const i10 = gy0 * gw + gx1;
      const i01 = gy1 * gw + gx0;
      const i11 = gy1 * gw + gx1;
      const d =
        depth[i00] * (1 - fxi) * (1 - fyi) +
        depth[i10] * fxi * (1 - fyi) +
        depth[i01] * (1 - fxi) * fyi +
        depth[i11] * fxi * fyi;

      const ox = (d - dMean) * disp * dirX;
      const oy = (d - dMean) * disp * dirY;

      const sx0 = gxf - ox * sxScale;
      const sx = sx0 < 0 ? 0 : sx0 > maxX ? maxX : sx0;
      const sxI = sx | 0;
      const tx = sx - sxI;
      const sxI1 = sxI === maxX ? maxX : sxI + 1;
      const sy0 = gyf - oy * syScale;
      const sy = sy0 < 0 ? 0 : sy0 > maxY ? maxY : sy0;
      const syI = sy | 0;
      const ty = sy - syI;
      const syI1 = syI === maxY ? maxY : syI + 1;

      const a = (syI * gw + sxI) * 4;
      const b = (syI * gw + sxI1) * 4;
      const c = (syI1 * gw + sxI) * 4;
      const d2 = (syI1 * gw + sxI1) * 4;
      const w00 = (1 - tx) * (1 - ty);
      const w10 = tx * (1 - ty);
      const w01 = (1 - tx) * ty;
      const w11 = tx * ty;
      const sr = src[a] * w00 + src[b] * w10 + src[c] * w01 + src[d2] * w11;
      const sg = src[a + 1] * w00 + src[b + 1] * w10 + src[c + 1] * w01 + src[d2 + 1] * w11;
      const sb = src[a + 2] * w00 + src[b + 2] * w10 + src[c + 2] * w01 + src[d2 + 2] * w11;
      const sa = src[a + 3] * w00 + src[b + 3] * w10 + src[c + 3] * w01 + src[d2 + 3] * w11;

      // out = bd + (sr - bd) * (sa / 255), integer-rounded and packed.
      const o = i * 4;
      const br = backdrop[o];
      const bg = backdrop[o + 1];
      const bb = backdrop[o + 2];
      out32[i] =
        0xff000000 |
        (((bb * 255 + (sb - bb) * sa + 127) >> 8) << 16) |
        (((bg * 255 + (sg - bg) * sa + 127) >> 8) << 8) |
        ((br * 255 + (sr - br) * sa + 127) >> 8);

      gxf += sxScale;
    }
  }
  ctx.putImageData(img, 0, 0);
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

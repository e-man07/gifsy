// Phase 1 asset refinement — squeeze production-grade assets out of the two
// models we already run (Depth Anything V2 + ISNet), with zero extra inference.
//
// The raw depth map is smooth but its edges bleed across object boundaries (a
// soft "halo"), which reads as a fuzzy cardboard cutout in 3D. Here we:
//   • sharpen depth edges onto real image edges with a guided filter,
//   • replace the halo around the subject with extrapolated background depth
//     and lift the subject forward, using the pixel-accurate ISNet alpha,
//   • fill the disocclusion hole behind the subject with real surrounding
//     background (push-pull) instead of a blurred ghost of the subject,
//   • de-halo the subject matte without cropping (3D needs it full-frame).
// All CPU, all one-time at generate/build; the GIF/sticker paths are untouched.

import type { DepthGrid } from "@/lib/depth";
import { blurAlpha, getCtx, imageToCanvas, makeCanvas } from "@/lib/image";

// ── Separable box blur over a single float plane (average, edge-clamped) ─────
function boxBlur(src: Float32Array, w: number, h: number, r: number): Float32Array {
  if (r < 1) return Float32Array.from(src);
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  // Horizontal pass with a running sum.
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let sum = 0;
    for (let x = 0; x <= r && x < w; x++) sum += src[row + x];
    let count = Math.min(r, w - 1) + 1;
    for (let x = 0; x < w; x++) {
      tmp[row + x] = sum / count;
      const add = x + r + 1;
      const rem = x - r;
      if (add < w) { sum += src[row + add]; count++; }
      if (rem >= 0) { sum -= src[row + rem]; count--; }
    }
  }
  // Vertical pass.
  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let y = 0; y <= r && y < h; y++) sum += tmp[y * w + x];
    let count = Math.min(r, h - 1) + 1;
    for (let y = 0; y < h; y++) {
      out[y * w + x] = sum / count;
      const add = y + r + 1;
      const rem = y - r;
      if (add < h) { sum += tmp[(add) * w + x]; count++; }
      if (rem >= 0) { sum -= tmp[(rem) * w + x]; count--; }
    }
  }
  return out;
}

// ── Guided filter (He et al.): edge-preserving smoothing of `input`, with
// edges transferred from `guide`. Both planes are 0..1. ──────────────────────
function guidedFilter(
  guide: Float32Array,
  input: Float32Array,
  w: number,
  h: number,
  r: number,
  eps: number,
): Float32Array {
  const n = w * h;
  const meanI = boxBlur(guide, w, h, r);
  const meanP = boxBlur(input, w, h, r);
  const II = new Float32Array(n);
  const IP = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    II[i] = guide[i] * guide[i];
    IP[i] = guide[i] * input[i];
  }
  const corrI = boxBlur(II, w, h, r);
  const corrIP = boxBlur(IP, w, h, r);
  const a = new Float32Array(n);
  const b = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const varI = corrI[i] - meanI[i] * meanI[i];
    const covIP = corrIP[i] - meanI[i] * meanP[i];
    a[i] = covIP / (varI + eps);
    b[i] = meanP[i] - a[i] * meanI[i];
  }
  const meanA = boxBlur(a, w, h, r);
  const meanB = boxBlur(b, w, h, r);
  const q = new Float32Array(n);
  for (let i = 0; i < n; i++) q[i] = meanA[i] * guide[i] + meanB[i];
  return q;
}

interface Level {
  val: Float32Array[];
  wt: Float32Array;
  w: number;
  h: number;
}

/** Halve a push-pull level: weighted average of each 2×2 block. */
function downsample(lvl: Level): Level {
  const nw = Math.max(1, Math.ceil(lvl.w / 2));
  const nh = Math.max(1, Math.ceil(lvl.h / 2));
  const k = lvl.val.length;
  const val = Array.from({ length: k }, () => new Float32Array(nw * nh));
  const wt = new Float32Array(nw * nh);
  for (let y = 0; y < nh; y++) {
    for (let x = 0; x < nw; x++) {
      let sw = 0;
      let count = 0;
      const acc = new Float64Array(k);
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const sx = x * 2 + dx;
          const sy = y * 2 + dy;
          if (sx >= lvl.w || sy >= lvl.h) continue;
          const si = sy * lvl.w + sx;
          const wv = lvl.wt[si];
          count++;
          sw += wv;
          for (let c = 0; c < k; c++) acc[c] += lvl.val[c][si] * wv;
        }
      }
      const o = y * nw + x;
      if (sw > 0) for (let c = 0; c < k; c++) val[c][o] = acc[c] / sw;
      wt[o] = count > 0 ? sw / count : 0;
    }
  }
  return { val, wt, w: nw, h: nh };
}

/**
 * Fill low-confidence regions of one or more float planes from surrounding
 * known pixels (push-pull pyramid). `known` is 1 where a pixel is trustworthy,
 * 0 where it's a hole to fill. Known pixels are preserved.
 */
function pushPullFill(
  planes: Float32Array[],
  w: number,
  h: number,
  known: Float32Array,
): Float32Array[] {
  const levels: Level[] = [
    { val: planes.map((p) => Float32Array.from(p)), wt: Float32Array.from(known), w, h },
  ];
  while (levels[levels.length - 1].w > 1 || levels[levels.length - 1].h > 1) {
    levels.push(downsample(levels[levels.length - 1]));
  }
  const k = planes.length;
  // Pull: coarse → fine, filling holes from the level above (nearest sample).
  for (let l = levels.length - 2; l >= 0; l--) {
    const fine = levels[l];
    const coarse = levels[l + 1];
    for (let y = 0; y < fine.h; y++) {
      for (let x = 0; x < fine.w; x++) {
        const i = y * fine.w + x;
        const w0 = fine.wt[i];
        if (w0 >= 1) continue;
        const ci = Math.min(coarse.h - 1, y >> 1) * coarse.w + Math.min(coarse.w - 1, x >> 1);
        const cw = coarse.wt[ci];
        if (cw <= 0) continue;
        const fill = 1 - w0;
        for (let c = 0; c < k; c++) fine.val[c][i] = fine.val[c][i] * w0 + coarse.val[c][ci] * fill;
        fine.wt[i] = Math.min(1, w0 + cw * fill);
      }
    }
  }
  return levels[0].val;
}

/** Sample an image's luminance into a w×h float plane (0..1). */
function luminanceAt(img: HTMLImageElement, w: number, h: number): Float32Array {
  const c = makeCanvas(w, h);
  getCtx(c).drawImage(img, 0, 0, w, h);
  const d = getCtx(c).getImageData(0, 0, w, h).data;
  const out = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    out[i] = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255;
  }
  return out;
}

/** Sample a cutout's alpha into a w×h float plane (0..1). */
function alphaAt(cutout: HTMLImageElement, w: number, h: number): Float32Array {
  const c = makeCanvas(w, h);
  getCtx(c).drawImage(cutout, 0, 0, w, h);
  const d = getCtx(c).getImageData(0, 0, w, h).data;
  const out = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) out[i] = d[i * 4 + 3] / 255;
  return out;
}

const SUBJECT_FORWARD = 0.06; // small guaranteed pop so the subject leads the backdrop

// Real scenes tend to bunch their depth in the mid-range, which reads flat once
// displaced. A gentle S-curve steepens the mid-range so near/mid/far separate —
// more *perceived* 3D without more displacement (which is what causes artifacts).
// 0 = linear/off; ~0.35 is a subtle, safe default. Tune here after eyeballing.
const DEPTH_CONTRAST = 0.35;

/** smootherstep blend: 6x⁵−15x⁴+10x³ steepens the middle, preserves 0→0 / 1→1. */
function contrastRemap(v: number, amount: number): number {
  const s = v * v * v * (v * (v * 6 - 15) + 10);
  return v * (1 - amount) + s * amount;
}

/**
 * Refine a raw depth grid into one whose edges follow the image and whose
 * subject sits cleanly in front of a halo-free background. When a cutout is
 * present, the ISNet alpha is the authority for the silhouette.
 */
export function refineDepthGrid(
  grid: DepthGrid,
  image: HTMLImageElement,
  cutout?: HTMLImageElement | null,
): DepthGrid {
  const { width: w, height: h } = grid;
  const guide = luminanceAt(image, w, h);
  const r = Math.max(3, Math.min(16, Math.round(Math.min(w, h) * 0.02)));
  const q = guidedFilter(guide, grid.data, w, h, r, 4e-3);

  if (cutout) {
    const alpha = alphaAt(cutout, w, h);
    // The depth halo lives in *background* pixels hugging the subject, so those
    // pixels can't be trusted even though ISNet calls them background. Treat the
    // subject plus a contamination band around it as unknown, and extrapolate
    // real background depth inward from beyond that band (push-pull). Then keep
    // model relief inside the subject, the halo-free fill outside it, blended by
    // the crisp alpha edge — and lift the subject forward for a guaranteed pop.
    const band = boxBlur(alpha, w, h, r);
    const known = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) known[i] = band[i] < 0.12 ? 1 : 0;
    const bgFill = pushPullFill([Float32Array.from(q)], w, h, known)[0];
    for (let i = 0; i < w * h; i++) {
      const a = alpha[i];
      q[i] = bgFill[i] * (1 - a) + (q[i] + SUBJECT_FORWARD) * a;
    }
  }

  // Robust renormalize back to full 0..1 so displacement uses the whole range.
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < q.length; i++) {
    if (q[i] < lo) lo = q[i];
    if (q[i] > hi) hi = q[i];
  }
  const span = Math.max(hi - lo, 1e-6);
  const out = new Float32Array(q.length);
  for (let i = 0; i < q.length; i++) {
    const n = Math.max(0, Math.min(1, (q[i] - lo) / span));
    out[i] = contrastRemap(n, DEPTH_CONTRAST);
  }
  return { data: out, width: w, height: h };
}

/**
 * De-halo a raw subject cutout without cropping (3D needs it registered to the
 * full-frame image/depth). Clears the faint background fringe, then feathers.
 * Returns an RGBA canvas at a bounded working resolution.
 */
export function cleanCutout(cutout: HTMLImageElement, maxDim = 1024): HTMLCanvasElement {
  const base = imageToCanvas(cutout, maxDim);
  const w = base.width;
  const h = base.height;
  const ctx = getCtx(base);
  const id = ctx.getImageData(0, 0, w, h);
  const d = id.data;
  for (let i = 0; i < w * h; i++) {
    if (d[i * 4 + 3] < 24) d[i * 4 + 3] = 0; // drop near-transparent halo
  }
  dropStrayIslands(d, w, h);
  blurAlpha(d, w, h, 1); // soft anti-aliased edge
  ctx.putImageData(id, 0, 0);
  return base;
}

/**
 * Erase opaque regions far smaller than the main subject.
 *
 * Segmentation regularly keeps a scrap of background — a blade of grass beside
 * the dog, a crumb on the table. Behind a backdrop nobody notices. On a
 * subject-only cut-out (config.subjectOnly) it floats in mid-air with nothing
 * around it, which reads as a glitch. One pass of connected-component labelling
 * over the alpha; anything under 5% of the largest region goes.
 *
 * Threshold is deliberately relative, not absolute: a subject can legitimately
 * have several parts (two cans, a person and their bag), and those are within
 * an order of magnitude of each other. True debris is orders smaller.
 */
function dropStrayIslands(d: Uint8ClampedArray, w: number, h: number): void {
  const label = new Int32Array(w * h).fill(-1);
  const sizes: number[] = [];
  const solid = (p: number) => d[p * 4 + 3] > 40;
  const stack: number[] = [];

  for (let p = 0; p < w * h; p++) {
    if (label[p] !== -1 || !solid(p)) continue;
    const id = sizes.length;
    let n = 0;
    label[p] = id;
    stack.push(p);
    while (stack.length) {
      const q = stack.pop() as number;
      n++;
      const x = q % w;
      const y = (q / w) | 0;
      if (x > 0 && label[q - 1] === -1 && solid(q - 1)) { label[q - 1] = id; stack.push(q - 1); }
      if (x < w - 1 && label[q + 1] === -1 && solid(q + 1)) { label[q + 1] = id; stack.push(q + 1); }
      if (y > 0 && label[q - w] === -1 && solid(q - w)) { label[q - w] = id; stack.push(q - w); }
      if (y < h - 1 && label[q + w] === -1 && solid(q + w)) { label[q + w] = id; stack.push(q + w); }
    }
    sizes.push(n);
  }
  if (sizes.length < 2) return; // single region — nothing to prune

  let max = 0;
  for (const n of sizes) if (n > max) max = n;
  const cutoff = max * 0.05;
  for (let p = 0; p < w * h; p++) {
    const l = label[p];
    if (l !== -1 && sizes[l] < cutoff) d[p * 4 + 3] = 0;
  }
}

/**
 * Build the backdrop used to fill disocclusion holes. With a cutout, the
 * subject region is filled from surrounding background (push-pull) so parallax
 * reveals plausible background rather than a blurred ghost of the subject;
 * without one, it falls back to a plain blur of the whole image.
 *
 * `blurPx` controls the final soften: the default (8) de-emphasizes the backdrop
 * and hides fill seams; `0` skips it entirely, yielding a *sharp* subject-removed
 * fill. The scene uses the sharp fill as the background's base map so the subject
 * can slide far without ever revealing its own baked-in twin, and the blurred one
 * for the stylistic background-blur control (see scene.ts).
 */
export function inpaintBackground(
  image: HTMLImageElement,
  cutout?: HTMLImageElement | null,
  opts: { maxDim?: number; blurPx?: number } = {},
): HTMLCanvasElement {
  const { maxDim = 1024, blurPx = 8 } = opts;
  const base = imageToCanvas(image, maxDim);
  const w = base.width;
  const h = base.height;

  if (cutout) {
    const ctx = getCtx(base);
    const id = ctx.getImageData(0, 0, w, h);
    const d = id.data;
    const alpha = alphaAt(cutout, w, h);
    // Exclude the subject *and* a thin contamination band around it, so the fill
    // samples clean background rather than the subject's colored edge fringe.
    const band = boxBlur(alpha, w, h, Math.max(2, Math.round(Math.min(w, h) * 0.01)));
    const R = new Float32Array(w * h);
    const G = new Float32Array(w * h);
    const B = new Float32Array(w * h);
    const known = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) {
      R[i] = d[i * 4];
      G[i] = d[i * 4 + 1];
      B[i] = d[i * 4 + 2];
      known[i] = band[i] < 0.1 ? 1 : 0; // trustworthy background = away from the subject
    }
    const [Rf, Gf, Bf] = pushPullFill([R, G, B], w, h, known);
    for (let i = 0; i < w * h; i++) {
      d[i * 4] = Rf[i];
      d[i * 4 + 1] = Gf[i];
      d[i * 4 + 2] = Bf[i];
      d[i * 4 + 3] = 255;
    }
    ctx.putImageData(id, 0, 0);
  }

  // Sharp subject-removed fill (bg base) — no final blur.
  if (blurPx <= 0) return base;

  // Soften so the backdrop de-emphasizes and any fill seams disappear.
  const out = makeCanvas(w, h);
  const octx = getCtx(out);
  octx.filter = `blur(${blurPx}px)`;
  octx.drawImage(base, 0, 0);
  return out;
}

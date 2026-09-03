// Server-only LaMa (big-lama) inpainting via onnxruntime-web's WASM backend —
// no native binaries, no GPU. Runs ONCE at publish to bake a clean, structurally
// correct subject-removed background, so the published viewer never smears at
// parallax (it just samples a real background instead of the push-pull ghost).
//
// Contract (verified against Carve/LaMa-ONNX): fixed 512×512; inputs `image`
// [1,3,512,512] RGB /255 NCHW and `mask` [1,1,512,512] with 1 = hole (erase);
// output `output` [1,3,512,512] RGB already in 0..255. We letterbox to 512 to
// preserve aspect, then map the fill back to the source resolution.
//
// The session + WASM runtime are cached in module scope so warm invocations skip
// the ~200 MB model download and re-init.

import { createRequire } from "node:module";
import * as path from "node:path";
import type * as Ort from "onnxruntime-web";

const S = 512; // LaMa is a fixed-size export
const MODEL_URL =
  process.env.LAMA_MODEL_URL ??
  "https://huggingface.co/Carve/LaMa-ONNX/resolve/main/lama_fp32.onnx";

// Load onnxruntime-web at RUNTIME via CJS require, not a static import: the Next
// bundler otherwise rewrites its internal module loading and breaks the WASM
// backend ("[externals]" not found). createRequire from the project root
// resolves the real node_modules build untouched. Cached after first load.
let ortMod: typeof Ort | null = null;
function loadOrt(): typeof Ort {
  if (!ortMod) {
    const require = createRequire(path.join(process.cwd(), "index.js"));
    ortMod = require("onnxruntime-web") as typeof Ort;
  }
  return ortMod;
}

// onnxruntime-web loads its WASM runtime with dynamic import(); under Node that
// must be a local file path (Node's ESM loader rejects https:). Point it at the
// package's own dist/ directory so the .mjs/.wasm are found locally.
function ortWasmDir(): string {
  const require = createRequire(path.join(process.cwd(), "index.js"));
  return path.dirname(require.resolve("onnxruntime-web")) + path.sep;
}

export interface Rgba {
  data: Uint8Array | Uint8ClampedArray; // RGBA, row-major
  width: number;
  height: number;
}
export interface Gray {
  data: Uint8Array | Uint8ClampedArray; // one byte per pixel; >threshold = subject/hole
  width: number;
  height: number;
}

let sessionPromise: Promise<Ort.InferenceSession> | null = null;

/** Fetch the model once and cache the WASM session for warm reuse. */
function getSession(): Promise<Ort.InferenceSession> {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const ort = loadOrt();
      ort.env.wasm.wasmPaths = ortWasmDir();
      ort.env.wasm.numThreads = 1; // serverless: no worker threads, keep it portable
      const res = await fetch(MODEL_URL);
      if (!res.ok) throw new Error(`LaMa model fetch failed: ${res.status}`);
      const bytes = new Uint8Array(await res.arrayBuffer());
      return ort.InferenceSession.create(bytes, { executionProviders: ["wasm"] });
    })().catch((e) => {
      sessionPromise = null; // let a later call retry a transient fetch/init failure
      throw e;
    });
  }
  return sessionPromise;
}

/** Nearest-edge-clamped sample of a source coordinate (handles letterbox pad). */
function clamp(v: number, hi: number): number {
  return v < 0 ? 0 : v > hi ? hi : v;
}

export interface InpaintOptions {
  /** Grow the hole a few px (in 512-space) to swallow the subject's edge fringe. */
  dilate?: number;
  /** Mask luminance/alpha threshold (0..255) above which a pixel counts as subject. */
  threshold?: number;
}

/**
 * Inpaint the region marked by `mask` out of `image`, returning an opaque RGBA
 * background at the original resolution with the subject replaced by plausible
 * reconstructed background.
 */
export async function inpaintBackground(
  image: Rgba,
  mask: Gray,
  opts: InpaintOptions = {},
): Promise<Rgba> {
  const { dilate = 4, threshold = 128 } = opts;
  const { width: W, height: H } = image;

  // Letterbox the source into 512×512 (contain), replicating edge pixels into the
  // pad so the model never sees a hard black border it might treat as content.
  const scale = S / Math.max(W, H);
  const sw = Math.max(1, Math.round(W * scale));
  const sh = Math.max(1, Math.round(H * scale));
  const ox = Math.floor((S - sw) / 2);
  const oy = Math.floor((S - sh) / 2);

  const imgT = new Float32Array(3 * S * S); // NCHW planar
  const maskT = new Float32Array(S * S);
  for (let y = 0; y < S; y++) {
    const syf = (y - oy) / scale;
    const sy = clamp(Math.round(syf), H - 1);
    const inY = y >= oy && y < oy + sh;
    for (let x = 0; x < S; x++) {
      const sxf = (x - ox) / scale;
      const sx = clamp(Math.round(sxf), W - 1);
      const si = (sy * W + sx) * 4;
      const o = y * S + x;
      imgT[o] = image.data[si] / 255;
      imgT[S * S + o] = image.data[si + 1] / 255;
      imgT[2 * S * S + o] = image.data[si + 2] / 255;
      // Pad area is known background (0); inside, subject → hole (1).
      const inX = x >= ox && x < ox + sw;
      if (inX && inY) {
        const mi = clamp(Math.round(syf), mask.height - 1) * mask.width + clamp(Math.round(sxf), mask.width - 1);
        maskT[o] = mask.data[mi] >= threshold ? 1 : 0;
      }
    }
  }

  // Cheap separable max-dilation of the hole to cover the subject's edge fringe.
  if (dilate > 0) dilateInPlace(maskT, S, S, dilate);

  const ort = loadOrt();
  const session = await getSession();
  const res = await session.run({
    image: new ort.Tensor("float32", imgT, [1, 3, S, S]),
    mask: new ort.Tensor("float32", maskT, [1, 1, S, S]),
  });
  const out = res[session.outputNames[0]].data as Float32Array; // RGB 0..255, NCHW

  // Map the 512 fill back to source resolution, compositing so pixels outside the
  // (dilated) hole keep their exact originals and only the hole shows LaMa output.
  const result = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) {
    const ly = clamp(Math.round(oy + y * scale), S - 1);
    for (let x = 0; x < W; x++) {
      const lx = clamp(Math.round(ox + x * scale), S - 1);
      const lo = ly * S + lx;
      const di = (y * W + x) * 4;
      const inHole = maskT[lo] > 0.5;
      if (inHole) {
        result[di] = out[lo];
        result[di + 1] = out[S * S + lo];
        result[di + 2] = out[2 * S * S + lo];
      } else {
        result[di] = image.data[di];
        result[di + 1] = image.data[di + 1];
        result[di + 2] = image.data[di + 2];
      }
      result[di + 3] = 255;
    }
  }
  return { data: result, width: W, height: H };
}

/** In-place separable box max filter (grows 1-regions by `r` px). */
function dilateInPlace(m: Float32Array, w: number, h: number, r: number): void {
  const tmp = new Float32Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let k = -r; k <= r; k++) {
        const xx = x + k;
        if (xx >= 0 && xx < w) v = Math.max(v, m[y * w + xx]);
      }
      tmp[y * w + x] = v;
    }
  for (let x = 0; x < w; x++)
    for (let y = 0; y < h; y++) {
      let v = 0;
      for (let k = -r; k <= r; k++) {
        const yy = y + k;
        if (yy >= 0 && yy < h) v = Math.max(v, tmp[yy * w + x]);
      }
      m[y * w + x] = v;
    }
}

// Monocular depth estimation with Depth Anything V2 (small, fp16) running
// fully client-side via onnxruntime-web. Produces a normalized depth grid
// (Float32Array, 0..1, larger = closer) that both the GIF depth effect and
// any future 2.5D renderer consume; `estimateDepth` renders it as a
// grayscale canvas where brighter pixels are closer to the camera.

import { getCtx, makeCanvas } from "./image";
import { getOrt, loadSession } from "./inference/session";

export type DepthModel = "depth-anything-v2-small-fp16";

export interface DepthProgress {
  stage: "download" | "compute";
  fraction: number; // 0..1
}

/** A normalized depth map: one 0..1 float per pixel, larger = closer. */
export interface DepthGrid {
  data: Float32Array;
  width: number;
  height: number;
}

/** Render a normalized depth grid to a grayscale canvas (brighter = closer). */
export function depthGridToCanvas(grid: DepthGrid): HTMLCanvasElement {
  const c = makeCanvas(grid.width, grid.height);
  const ctx = getCtx(c);
  const id = ctx.createImageData(grid.width, grid.height);
  const d = id.data;
  for (let i = 0; i < grid.width * grid.height; i++) {
    const g = Math.round(Math.max(0, Math.min(1, grid.data[i])) * 255);
    const o = i * 4;
    d[o] = g;
    d[o + 1] = g;
    d[o + 2] = g;
    d[o + 3] = 255;
  }
  ctx.putImageData(id, 0, 0);
  return c;
}

// Model weights are fetched from the Hugging Face CDN on first use, then
// browser-cached. The image itself never leaves the machine. To self-host,
// drop the .onnx into `public/` and point this URL at it.
// NB: the int8-quantized export uses ConvInteger ops that onnxruntime-web's
// WASM backend doesn't implement, so we ship the fp16 build instead.
const MODEL_URLS: Record<DepthModel, string> = {
  "depth-anything-v2-small-fp16":
    "https://huggingface.co/onnx-community/depth-anything-v2-small/resolve/main/onnx/model_fp16.onnx",
};

const INPUT_SIZE = 518; // longest edge fed to the model (any multiple-of-14 size works)
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];
const MAX_OUTPUT_DIM = 512; // depth canvas long edge
const THREED_INPUT_SIZE = 770; // higher-res depth pass for 3D (multiple of 14)

/**
 * Device-aware working resolution for the 3D depth pass. A larger grid lets the
 * guided-filter refine inject real image-edge detail into the relief (crisper
 * silhouettes), but inference + refine cost grow ~quadratically — so only
 * capable devices opt into the bigger pass; everything else keeps 518.
 */
export function depthWorkingSize(): number {
  if (typeof navigator === "undefined") return INPUT_SIZE;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;
  return mem >= 8 && cores >= 8 ? THREED_INPUT_SIZE : INPUT_SIZE;
}

/**
 * Resize the image keeping its aspect ratio, long edge ≤ 518, both dims
 * rounded to the model's 14px patch multiple (the export accepts any
 * multiple-of-14 size and returns depth at the same resolution).
 */
function preprocess(
  img: HTMLImageElement,
  ort: typeof import("onnxruntime-web"),
  size = INPUT_SIZE,
) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const scale = Math.min(size / w, size / h);
  const iw = Math.max(14, Math.round((w * scale) / 14) * 14);
  const ih = Math.max(14, Math.round((h * scale) / 14) * 14);

  const src = makeCanvas(w, h);
  const sctx = getCtx(src);
  sctx.drawImage(img, 0, 0);
  const sd = sctx.getImageData(0, 0, w, h).data;

  const data = new Float32Array(3 * iw * ih);
  for (let c = 0; c < 3; c++) {
    const plane = data.subarray(c * iw * ih, (c + 1) * iw * ih);
    for (let y = 0; y < ih; y++) {
      const syf = ((y + 0.5) * h) / ih - 0.5;
      const sy = syf < 0 ? 0 : syf > h - 1 ? h - 1 : syf;
      const syI = sy | 0;
      const ty = sy - syI;
      const syI1 = Math.min(syI + 1, h - 1);
      for (let x = 0; x < iw; x++) {
        const sxf = ((x + 0.5) * w) / iw - 0.5;
        const sx = sxf < 0 ? 0 : sxf > w - 1 ? w - 1 : sxf;
        const sxI = sx | 0;
        const tx = sx - sxI;
        const sxI1 = Math.min(sxI + 1, w - 1);
        const i00 = (syI * w + sxI) * 4 + c;
        const i10 = (syI * w + sxI1) * 4 + c;
        const i01 = (syI1 * w + sxI) * 4 + c;
        const i11 = (syI1 * w + sxI1) * 4 + c;
        const v =
          sd[i00] * (1 - tx) * (1 - ty) +
          sd[i10] * tx * (1 - ty) +
          sd[i01] * (1 - tx) * ty +
          sd[i11] * tx * ty;
        plane[y * iw + x] = (v / 255 - MEAN[c]) / STD[c];
      }
    }
  }
  return { tensor: new ort.Tensor("float32", data, [1, 3, ih, iw]), iw, ih };
}

/**
 * Estimate a normalized depth grid for an image at the model's working
 * resolution. This is the shared inference output: run it once per image,
 * cache it, and hand it to whichever renderer needs it.
 */
export async function estimateDepthGrid(
  img: HTMLImageElement,
  onProgress?: (p: DepthProgress) => void,
  model: DepthModel = "depth-anything-v2-small-fp16",
  workingSize: number = INPUT_SIZE,
): Promise<DepthGrid> {
  const session = await loadSession(MODEL_URLS[model], {
    label: "the depth model",
    onProgress: (p) => onProgress?.({ stage: "download", fraction: p.fraction }),
  });
  const { tensor, iw, ih } = preprocess(img, await getOrt(), workingSize);

  onProgress?.({ stage: "compute", fraction: 1 });
  const inputName = session.inputNames[0];
  const outputName = session.outputNames[0];
  const result = await session.run({ [inputName]: tensor });
  const raw = result[outputName].data as Float32Array; // [ih, iw], larger = closer
  if (raw.length !== iw * ih) {
    throw new Error(`Unexpected depth output size: ${raw.length}`);
  }

  // Robust min/max so a few outliers don't flatten the map, then normalize
  // to 0..1 in place.
  const sorted = raw.slice().sort();
  const lo = sorted[Math.floor(sorted.length * 0.005)];
  const hi = sorted[Math.ceil(sorted.length * 0.995)];
  const span = Math.max(hi - lo, 1e-6);
  for (let i = 0; i < raw.length; i++) {
    raw[i] = (raw[i] - lo) / span;
  }
  return { data: raw, width: iw, height: ih };
}

/**
 * Estimate a depth map for an image. Returns a grayscale canvas at the
 * image's aspect ratio (long edge ≤ 512) where brighter = closer.
 */
export async function estimateDepth(
  img: HTMLImageElement,
  onProgress?: (p: DepthProgress) => void,
  model: DepthModel = "depth-anything-v2-small-fp16",
): Promise<HTMLCanvasElement> {
  const { data, width: iw, height: ih } = await estimateDepthGrid(img, onProgress, model);

  // Scale up to the output canvas (long edge ≤ 512).
  const scale = Math.min(MAX_OUTPUT_DIM / iw, MAX_OUTPUT_DIM / ih);
  const ow = Math.max(1, Math.round(iw * scale));
  const oh = Math.max(1, Math.round(ih * scale));
  const out = makeCanvas(ow, oh);
  const octx = getCtx(out);
  const id = octx.createImageData(ow, oh);
  const od = id.data;
  for (let y = 0; y < oh; y++) {
    const syf = ((y + 0.5) * ih) / oh - 0.5;
    const sy = syf < 0 ? 0 : syf > ih - 1 ? ih - 1 : syf;
    const syI = sy | 0;
    const ty = sy - syI;
    const syI1 = Math.min(syI + 1, ih - 1);
    for (let x = 0; x < ow; x++) {
      const sxf = ((x + 0.5) * iw) / ow - 0.5;
      const sx = sxf < 0 ? 0 : sxf > iw - 1 ? iw - 1 : sxf;
      const sxI = sx | 0;
      const tx = sx - sxI;
      const sxI1 = Math.min(sxI + 1, iw - 1);
      const i00 = syI * iw + sxI;
      const i10 = syI * iw + sxI1;
      const i01 = syI1 * iw + sxI;
      const i11 = syI1 * iw + sxI1;
      const v =
        data[i00] * (1 - tx) * (1 - ty) +
        data[i10] * tx * (1 - ty) +
        data[i01] * (1 - tx) * ty +
        data[i11] * tx * ty;
      const g = Math.round(v * 255);
      const o = (y * ow + x) * 4;
      od[o] = g;
      od[o + 1] = g;
      od[o + 2] = g;
      od[o + 3] = 255;
    }
  }
  octx.putImageData(id, 0, 0);
  return out;
}

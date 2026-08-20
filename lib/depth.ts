// Monocular depth estimation with Depth Anything V2 (small, fp16) running
// fully client-side via onnxruntime-web. Returns a grayscale canvas where
// brighter pixels are closer to the camera.

import type * as ort from "onnxruntime-web";
import { getCtx, makeCanvas } from "./image";

export type DepthModel = "depth-anything-v2-small-fp16";

export interface DepthProgress {
  stage: "download" | "compute";
  fraction: number; // 0..1
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

// onnxruntime-web fetches its WASM binaries from the versioned CDN path.
// Keep in sync with the `onnxruntime-web` version in package.json.
const WASM_PATH = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/";

const INPUT_SIZE = 518; // longest edge fed to the model (any multiple-of-14 size works)
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];
const MAX_OUTPUT_DIM = 512; // depth canvas long edge

let sessionPromise: Promise<ort.InferenceSession> | null = null;
let sessionModel: DepthModel | null = null;

/** onnxruntime-web is ~390KB; load it lazily so it stays out of the main bundle. */
async function loadOrt(): Promise<typeof ort> {
  const { default: ort } = await import("onnxruntime-web");
  return ort;
}

async function loadSession(
  model: DepthModel,
  onProgress?: (p: DepthProgress) => void,
): Promise<ort.InferenceSession> {
  if (sessionPromise && sessionModel === model) return sessionPromise;
  sessionPromise = (async () => {
    const ort = await loadOrt();
    ort.env.wasm.wasmPaths = WASM_PATH;
    const res = await fetch(MODEL_URLS[model]);
    if (!res.ok) {
      throw new Error(
        `Could not download the depth model (HTTP ${res.status}). Check your connection and try again.`,
      );
    }
    const total = Number(res.headers.get("content-length")) || 0;
    const reader = res.body?.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    if (reader) {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total > 0) onProgress?.({ stage: "download", fraction: received / total });
      }
    } else {
      chunks.push(new Uint8Array(await res.arrayBuffer()));
    }
    onProgress?.({ stage: "download", fraction: 1 });
    const buffer = await new Blob(chunks as BlobPart[]).arrayBuffer();
    return ort.InferenceSession.create(buffer, {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    });
  })();
  sessionModel = model;
  return sessionPromise;
}

/**
 * Resize the image keeping its aspect ratio, long edge ≤ 518, both dims
 * rounded to the model's 14px patch multiple (the export accepts any
 * multiple-of-14 size and returns depth at the same resolution).
 */
function preprocess(img: HTMLImageElement, ort: typeof import("onnxruntime-web")) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const scale = Math.min(INPUT_SIZE / w, INPUT_SIZE / h);
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
 * Estimate a depth map for an image. Returns a grayscale canvas at the
 * image's aspect ratio (long edge ≤ 512) where brighter = closer.
 */
export async function estimateDepth(
  img: HTMLImageElement,
  onProgress?: (p: DepthProgress) => void,
  model: DepthModel = "depth-anything-v2-small-fp16",
): Promise<HTMLCanvasElement> {
  const session = await loadSession(model, onProgress);
  const { tensor, iw, ih } = preprocess(img, await loadOrt());

  onProgress?.({ stage: "compute", fraction: 1 });
  const inputName = session.inputNames[0];
  const outputName = session.outputNames[0];
  const result = await session.run({ [inputName]: tensor });
  const raw = result[outputName].data as Float32Array; // [1, ih, iw], larger = closer
  if (raw.length !== iw * ih) {
    throw new Error(`Unexpected depth output size: ${raw.length}`);
  }

  // Robust min/max so a few outliers don't flatten the map.
  const sorted = raw.slice().sort();
  const lo = sorted[Math.floor(sorted.length * 0.005)];
  const hi = sorted[Math.ceil(sorted.length * 0.995)];
  const span = Math.max(hi - lo, 1e-6);

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
        raw[i00] * (1 - tx) * (1 - ty) +
        raw[i10] * tx * (1 - ty) +
        raw[i01] * (1 - tx) * ty +
        raw[i11] * tx * ty;
      const g = Math.round(((v - lo) / span) * 255);
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
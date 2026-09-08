// Server-side execution of the depth model's DPT head.
//
// This is the half of the depth model a free account's browser never receives.
// The client runs the encoder locally and uploads the six boundary tensors; we
// run the head and return the depth map. That is what makes the per-generation
// server call structurally required rather than advisory: patch out the call
// and the client has activations, not depth, and therefore no 3D scene.
//
// Weights ship inside the function (models/depth-head.onnx, 5.4MB) rather than
// living in Blob: no cold-start download, no URL that could be fetched, and no
// second store to provision. See scripts/split-depth-model.py for how the file
// is produced and verified.
//
// Runtime notes mirror lib/inpaint/lama.ts, which already runs ONNX on the
// server: onnxruntime-web must be required at runtime (the bundler otherwise
// rewrites its module loading and breaks the WASM backend), and its WASM assets
// must be resolved from a local directory because Node's ESM loader rejects
// https: for dynamic import.

import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs/promises";
import type * as Ort from "onnxruntime-web";

/** The four hooked ViT feature stages crossing the encoder/head boundary. */
export const FEATURE_INPUTS = [
  "/Slice_1_output_0",
  "/Slice_2_output_0",
  "/Slice_3_output_0",
  "/Slice_4_output_0",
] as const;

/** Patch-grid height and width, as int64 scalars. */
export const GRID_H_INPUT = "/Div_output_0";
export const GRID_W_INPUT = "/Div_1_output_0";
export const DEPTH_OUTPUT = "predicted_depth";

/** ViT-Small hidden size — the only feature width this head accepts. */
export const FEATURE_DIM = 384;
/** The model's patch size; every input dimension is a multiple of it. */
export const PATCH = 14;
/** Longest edge the client is allowed to ask for (lib/depth.ts THREED_INPUT_SIZE). */
export const MAX_EDGE = 770;

let ortMod: typeof Ort | null = null;
function loadOrt(): typeof Ort {
  if (!ortMod) {
    const require = createRequire(path.join(process.cwd(), "index.js"));
    ortMod = require("onnxruntime-web") as typeof Ort;
  }
  return ortMod;
}

function ortWasmDir(): string {
  const require = createRequire(path.join(process.cwd(), "index.js"));
  return path.dirname(require.resolve("onnxruntime-web")) + path.sep;
}

let sessionPromise: Promise<Ort.InferenceSession> | null = null;

/** Build the head session once and reuse it across warm invocations. */
function getSession(): Promise<Ort.InferenceSession> {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const ort = loadOrt();
      ort.env.wasm.wasmPaths = ortWasmDir();
      ort.env.wasm.numThreads = 1; // serverless: no worker threads
      const bytes = new Uint8Array(
        await fs.readFile(path.join(process.cwd(), "models", "depth-head.onnx")),
      );
      return ort.InferenceSession.create(bytes, { executionProviders: ["wasm"] });
    })().catch((e) => {
      sessionPromise = null; // let a later request retry a transient failure
      throw e;
    });
  }
  return sessionPromise;
}

export interface HeadRequest {
  /** Four fp16 feature planes, each `tokens * FEATURE_DIM` values. */
  features: Uint16Array[];
  /** Padded input height in pixels (multiple of PATCH). */
  height: number;
  /** Padded input width in pixels (multiple of PATCH). */
  width: number;
}

/**
 * Run the head. Returns depth as Float32, row-major `height * width`, in the
 * model's own scale (larger = closer); the caller normalises.
 */
export async function runDepthHead({
  features,
  height,
  width,
}: HeadRequest): Promise<Float32Array> {
  const ort = loadOrt();
  const session = await getSession();

  const gridH = height / PATCH;
  const gridW = width / PATCH;

  const feed: Record<string, Ort.Tensor> = {};
  FEATURE_INPUTS.forEach((name, i) => {
    // float16 tensors are carried as raw bit patterns in a Uint16Array.
    feed[name] = new ort.Tensor("float16", features[i], [
      1,
      gridH * gridW,
      FEATURE_DIM,
    ]);
  });
  feed[GRID_H_INPUT] = new ort.Tensor("int64", BigInt64Array.from([BigInt(gridH)]), []);
  feed[GRID_W_INPUT] = new ort.Tensor("int64", BigInt64Array.from([BigInt(gridW)]), []);

  const result = await session.run(feed);
  const depth = result[DEPTH_OUTPUT].data as Float32Array;
  if (depth.length !== height * width) {
    throw new Error(
      `head returned ${depth.length} values, expected ${height * width}`,
    );
  }
  return depth;
}

/** Reject anything that isn't a shape this head can run, before touching WASM. */
export function validateDims(height: number, width: number, tokens: number): string | null {
  if (!Number.isInteger(height) || !Number.isInteger(width)) return "Dimensions must be integers.";
  if (height < PATCH || width < PATCH) return "Dimensions too small.";
  if (height > MAX_EDGE || width > MAX_EDGE) return `Dimensions exceed ${MAX_EDGE}px.`;
  if (height % PATCH !== 0 || width % PATCH !== 0) {
    return `Dimensions must be multiples of ${PATCH}.`;
  }
  const expected = (height / PATCH) * (width / PATCH);
  if (tokens !== expected) {
    return `Token count ${tokens} does not match ${height}x${width} (expected ${expected}).`;
  }
  return null;
}

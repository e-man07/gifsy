// Client side of the split depth model.
//
// The browser always runs the encoder (44.3MB, public, cached). Finishing the
// depth map needs the DPT head, and which side runs it depends on the plan:
//
//   Pro  — fetch the head weights once from /api/models/depth-head and run
//          everything locally. Fast, offline-capable, and no activation data
//          leaves the device.
//   Free — POST the boundary activations to /api/depth/head, which meters the
//          generation and returns the depth map. The head weights are never
//          delivered, so this call cannot be skipped: without it the browser
//          has activations, not depth.
//
// See scripts/split-depth-model.py for how the two halves are produced.

import { getOrt, loadSession } from "@/lib/inference/session";
import { cachedFetch } from "@/lib/model-cache";
import type * as Ort from "onnxruntime-web";

/** Public URL of the encoder half. Overridable for a self-hosted deployment. */
export const ENCODER_URL =
  process.env.NEXT_PUBLIC_DEPTH_ENCODER_URL ??
  "https://jihaaklzhpgvaczi.public.blob.vercel-storage.com/models/depth-encoder.onnx";

const HEAD_WEIGHTS_URL = "/api/models/depth-head";
const HEAD_RUN_URL = "/api/depth/head";
const USAGE_URL = "/api/generations";

/** Boundary tensor names — must match scripts/split-depth-model.py. */
const FEATURE_OUTPUTS = [
  "/Slice_1_output_0",
  "/Slice_2_output_0",
  "/Slice_3_output_0",
  "/Slice_4_output_0",
] as const;
const GRID_H_OUTPUT = "/Div_output_0";
const GRID_W_OUTPUT = "/Div_1_output_0";
const DEPTH_OUTPUT = "predicted_depth";

const PATCH = 14;
const FEATURE_DIM = 384;

/** Thrown when a free account is out of 3D generations (HTTP 402). */
export class QuotaExhaustedError extends Error {
  readonly remaining = 0;
  constructor(message: string) {
    super(message);
    this.name = "QuotaExhaustedError";
  }
}

/** Thrown when 3D is attempted without a session (HTTP 401). */
export class SignInRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SignInRequiredError";
  }
}

export interface GenerationUsage {
  plan: "free" | "pro" | null;
  used: number;
  limit: number | null;
  remaining: number | null;
  localHead: boolean;
}

let usagePromise: Promise<GenerationUsage> | null = null;

/** Plan + quota for this session. Cached; call `refreshUsage()` after a change. */
export function getUsage(): Promise<GenerationUsage> {
  if (!usagePromise) {
    usagePromise = fetch(USAGE_URL, { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<GenerationUsage>) : Promise.reject(r.status)))
      .catch(() => ({
        // Network trouble shouldn't block a Pro user's local run or hide the
        // real error from a free user — assume free and let the head route be
        // authoritative.
        plan: "free" as const,
        used: 0,
        limit: null,
        remaining: null,
        localHead: false,
      }));
  }
  return usagePromise;
}

export function refreshUsage(): void {
  usagePromise = null;
}

/** Remaining free generations after the most recent run; null = unlimited. */
let lastRemaining: number | null = null;
export function generationsRemaining(): number | null {
  return lastRemaining;
}

// ── Local head (Pro) ──────────────────────────────────────────────────────
let headSession: Promise<Ort.InferenceSession> | null = null;

async function getLocalHead(): Promise<Ort.InferenceSession> {
  if (!headSession) {
    headSession = (async () => {
      const ort = await getOrt();
      const res = await cachedFetch(HEAD_WEIGHTS_URL);
      if (!res.ok) throw new Error(`head weights unavailable (${res.status})`);
      const bytes = new Uint8Array(await res.arrayBuffer());
      return ort.InferenceSession.create(bytes, { executionProviders: ["wasm"] });
    })().catch((e) => {
      headSession = null;
      throw e;
    });
  }
  return headSession;
}

// ── Remote head (free, metered) ───────────────────────────────────────────
async function runRemoteHead(
  features: Uint16Array[],
  height: number,
  width: number,
): Promise<Float32Array> {
  const tokens = (height / PATCH) * (width / PATCH);
  const form = new FormData();
  form.set("meta", JSON.stringify({ height, width, tokens }));
  features.forEach((f, i) => {
    // Copy into its own ArrayBuffer: onnxruntime may hand back a view into a
    // shared/pooled buffer, which is not a valid BlobPart.
    const bytes = new Uint8Array(new Uint8Array(f.buffer, f.byteOffset, f.byteLength));
    form.set(`f${i}`, new Blob([bytes], { type: "application/octet-stream" }), `f${i}.bin`);
  });

  const res = await fetch(HEAD_RUN_URL, { method: "POST", body: form });

  if (res.status === 401) {
    throw new SignInRequiredError("Sign in to make a 3D scene.");
  }
  if (res.status === 402) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    lastRemaining = 0;
    throw new QuotaExhaustedError(body.error ?? "You're out of free 3D generations.");
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Depth generation failed (${res.status}).`);
  }

  const remainingHeader = res.headers.get("X-Generations-Remaining");
  const remaining = remainingHeader === null ? null : Number(remainingHeader);
  lastRemaining = remaining === null || remaining < 0 ? null : remaining;

  const buf = await res.arrayBuffer();
  const expected = height * width * 4;
  if (buf.byteLength !== expected) {
    throw new Error(
      `Depth response was ${buf.byteLength} bytes, expected ${expected}.`,
    );
  }
  return new Float32Array(buf);
}

/**
 * Run the encoder locally, then finish on whichever side holds the head.
 * `pixelValues` is the preprocessed [1, 3, height, width] float32 tensor.
 */
export async function runSplitDepth(
  pixelValues: Ort.Tensor,
  height: number,
  width: number,
  onDownloadProgress?: (fraction: number) => void,
): Promise<Float32Array> {
  const encoder = await loadSession(ENCODER_URL, {
    label: "the depth model",
    onProgress: (p) => onDownloadProgress?.(p.fraction),
  });

  const encoded = await encoder.run({ [encoder.inputNames[0]]: pixelValues });
  const features = FEATURE_OUTPUTS.map(
    (name) => encoded[name].data as Uint16Array,
  );

  const tokens = (height / PATCH) * (width / PATCH);
  for (const [i, f] of features.entries()) {
    if (f.length !== tokens * FEATURE_DIM) {
      throw new Error(
        `Encoder plane ${i} has ${f.length} values, expected ${tokens * FEATURE_DIM}.`,
      );
    }
  }

  const { localHead } = await getUsage();

  if (localHead) {
    try {
      const ort = await getOrt();
      const session = await getLocalHead();
      const feed: Record<string, Ort.Tensor> = {};
      FEATURE_OUTPUTS.forEach((name, i) => {
        feed[name] = new ort.Tensor("float16", features[i], [1, tokens, FEATURE_DIM]);
      });
      feed[GRID_H_OUTPUT] = encoded[GRID_H_OUTPUT];
      feed[GRID_W_OUTPUT] = encoded[GRID_W_OUTPUT];
      const out = await session.run(feed);
      lastRemaining = null; // Pro: unlimited
      return out[DEPTH_OUTPUT].data as Float32Array;
    } catch (e) {
      // A Pro user whose local head can't load or run still gets their scene:
      // fall through to the server, which never refuses a paid plan.
      console.warn("Local depth head failed; using the server instead.", e);
    }
  }

  return runRemoteHead(features, height, width);
}

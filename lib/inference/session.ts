// Shared ONNX Runtime Web plumbing for browser-side inference: lazy runtime
// loading and cached, progress-reporting model session creation. Kept generic
// so every AI feature (depth today, segmentation/3D later) shares one loading
// path instead of each re-implementing fetch/cache/retry logic.

import type * as ort from "onnxruntime-web";
import { cachedFetch, evictCached } from "../model-cache";

// onnxruntime-web fetches its WASM binaries from the versioned CDN path.
// Keep in sync with the `onnxruntime-web` version in package.json.
const WASM_PATH = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/";

let ortPromise: Promise<typeof ort> | null = null;

/** onnxruntime-web is ~390KB; load it lazily so it stays out of the main bundle. */
export async function getOrt(): Promise<typeof ort> {
  if (!ortPromise) {
    ortPromise = import("onnxruntime-web").then((m) => m.default);
  }
  return ortPromise;
}

export interface SessionProgress {
  stage: "download";
  fraction: number; // 0..1
}

export interface SessionOptions {
  /** Human-readable model name used in error messages, e.g. "the depth model". */
  label?: string;
  onProgress?: (p: SessionProgress) => void;
}

// One session per model URL for the lifetime of the page. Inference sessions
// are expensive to build; reuse them across runs (and across features).
const sessions = new Map<string, Promise<ort.InferenceSession>>();

/**
 * Create (or reuse) an InferenceSession for the ONNX model at `url`.
 * The weights are fetched through the persistent model cache with download
 * progress, and a corrupt cached copy is evicted and retried once.
 */
export function loadSession(url: string, opts: SessionOptions = {}) {
  const existing = sessions.get(url);
  if (existing) return existing;
  const created = createSession(url, opts);
  sessions.set(url, created);
  return created;
}

async function createSession(
  url: string,
  { label = "AI model", onProgress }: SessionOptions,
): Promise<ort.InferenceSession> {
  const ort = await getOrt();
  ort.env.wasm.wasmPaths = WASM_PATH;
  const res = await cachedFetch(url);
  if (!res.ok) {
    throw new Error(
      `Could not download ${label} (HTTP ${res.status}). Check your connection and try again.`,
    );
  }
  const buffer = await readBody(res, onProgress);
  try {
    return await createOrtSession(ort, buffer);
  } catch (e) {
    // The cached copy may be stale/corrupt — evict it and retry once.
    await evictCached(url);
    const retry = await cachedFetch(url);
    if (!retry.ok) throw e;
    const retryBuffer = await retry.arrayBuffer();
    return createOrtSession(ort, retryBuffer);
  }
}

function createOrtSession(ort: typeof import("onnxruntime-web"), buffer: ArrayBuffer) {
  return ort.InferenceSession.create(buffer, {
    executionProviders: ["wasm"],
    graphOptimizationLevel: "all",
  });
}

/** Consume a response body chunk-by-chunk so callers can show real progress. */
async function readBody(
  res: Response,
  onProgress?: (p: SessionProgress) => void,
): Promise<ArrayBuffer> {
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
  return new Blob(chunks as BlobPart[]).arrayBuffer();
}

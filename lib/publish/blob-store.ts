// Client-side SceneStore backed by the server (Vercel Blob) via the /api/scenes
// route handlers. This is the source of truth that makes a published scene
// resolve on *any* device or website — unlike the IndexedDB store, which only
// sees the browser that created the scene.
//
// Blob writes need a server-only token, so `save` POSTs the assets to the route
// handler; `get` reads the manifest (public JSON) and fetches the public asset
// URLs it points at. No AI is ever loaded here — only the stored files move.

import type { SceneStore } from "./store";
import type { SaveResult, SceneAssetRef, SceneManifest, SceneRecord } from "./types";

function filenameFor(field: string, mime: string): string {
  const ext = mime === "image/webp" ? "webp" : mime === "image/png" ? "png" : "bin";
  return `${field}.${ext}`;
}

async function fetchAsset(ref: SceneAssetRef): Promise<{ blob: Blob; mime: string }> {
  const res = await fetch(ref.url);
  if (!res.ok) throw new Error(`Asset fetch failed (${res.status}).`);
  return { blob: await res.blob(), mime: ref.mime };
}

export const serverSceneStore: SceneStore = {
  async save(record: SceneRecord): Promise<SaveResult> {
    const form = new FormData();
    form.set("id", record.id);
    form.set("version", String(record.version));
    form.set("createdAt", String(record.createdAt));
    form.set("config", JSON.stringify(record.config));
    form.set("image", record.image.blob, filenameFor("image", record.image.mime));
    form.set("depth", record.depth.blob, filenameFor("depth", record.depth.mime));
    if (record.mask) {
      form.set("mask", record.mask.blob, filenameFor("mask", record.mask.mime));
    }
    if (record.background) {
      form.set("background", record.background.blob, filenameFor("background", record.background.mime));
    }
    if (record.thumb) {
      form.set("thumb", record.thumb.blob, filenameFor("thumb", record.thumb.mime));
    }

    const res = await fetch("/api/scenes", { method: "POST", body: form });
    if (!res.ok) {
      let message = `Publish failed (${res.status}).`;
      try {
        const body = (await res.json()) as { error?: string };
        if (body?.error) message = body.error;
      } catch {
        // non-JSON error body; keep the status-based message
      }
      throw new Error(message);
    }
    return { persistence: "server" };
  },

  async get(id: string): Promise<SceneRecord | null> {
    const res = await fetch(`/api/scenes/${encodeURIComponent(id)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Scene load failed (${res.status}).`);

    const manifest = (await res.json()) as SceneManifest;
    const [image, depth, mask, background] = await Promise.all([
      fetchAsset(manifest.assets.image),
      fetchAsset(manifest.assets.depth),
      manifest.assets.mask ? fetchAsset(manifest.assets.mask) : Promise.resolve(null),
      manifest.assets.background ? fetchAsset(manifest.assets.background) : Promise.resolve(null),
    ]);

    return {
      id: manifest.id,
      version: 1,
      image,
      depth,
      mask,
      background,
      config: manifest.config,
      createdAt: manifest.createdAt,
      watermark: manifest.watermark,
    };
  },
};

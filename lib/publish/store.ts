// Provider-agnostic scene storage (handoff §52: "Keep the architecture
// provider-agnostic so storage/backend can change later").
//
// The active store is a composite: the server (Vercel Blob, via `serverSceneStore`)
// is the source of truth so a published scene resolves on *any* device or site,
// and IndexedDB is a write-through local cache + offline fallback. Both sit behind
// this same `SceneStore` interface — the seam — so the UI never changes.

import type { SceneRecord } from "./types";
import { serverSceneStore } from "./blob-store";

export interface SceneStore {
  save(record: SceneRecord): Promise<void>;
  get(id: string): Promise<SceneRecord | null>;
}

const DB_NAME = "gifsy-scenes";
const STORE_NAME = "scenes";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const indexedDbSceneStore: SceneStore = {
  async save(record: SceneRecord) {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(record);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async get(id: string) {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const rec = await request<SceneRecord | undefined>(store.get(id));
    return rec ?? null;
  },
};

/**
 * Composite store used by the app. Saves write through to the server (so the
 * scene is shareable everywhere) and mirror to IndexedDB (offline + instant
 * local reads); a save fails only if *both* fail. Reads prefer the server and
 * fall back to the local cache, so behavior degrades to today's local-only mode
 * when no Blob store is provisioned yet — no regression.
 */
export const serverBackedSceneStore: SceneStore = {
  async save(record: SceneRecord) {
    let serverOk = false;
    try {
      await serverSceneStore.save(record);
      serverOk = true;
    } catch (err) {
      // Server unavailable (e.g. Blob store not provisioned): keep a local copy
      // so the scene still works on this device.
      console.warn("Scene save to server failed; kept a local copy.", err);
    }
    try {
      await indexedDbSceneStore.save(record);
    } catch (err) {
      if (!serverOk) throw err; // both failed → surface it to the publish UI
      console.warn("Local scene cache write failed; server copy is saved.", err);
    }
  },

  async get(id: string) {
    try {
      const remote = await serverSceneStore.get(id);
      if (remote) return remote;
    } catch {
      // Fall through to the local cache (offline, or server unavailable).
    }
    try {
      return await indexedDbSceneStore.get(id);
    } catch {
      return null;
    }
  },
};

/** The active store. */
export const sceneStore: SceneStore = serverBackedSceneStore;

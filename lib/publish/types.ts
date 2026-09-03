// Published-scene data model. A scene stores the *generated assets* — never
// the original AI computation (handoff §27). The viewer only needs these
// files, never the depth model.

import type { SceneConfig } from "@/lib/rendering/types";

export interface SceneAsset {
  blob: Blob;
  mime: string;
}

export interface SceneRecord {
  id: string;
  version: 1;
  /** Optimized color image (WebP). */
  image: SceneAsset;
  /** Grayscale depth map, brighter = closer (WebP). */
  depth: SceneAsset;
  /** AI-cut subject with alpha (PNG/WebP); null when segmentation was skipped. */
  mask: SceneAsset | null;
  /** LaMa-inpainted subject-removed backdrop, baked once at publish (WebP);
   *  null when segmentation was skipped or inpaint was unavailable — the viewer
   *  then falls back to the client-side push-pull fill. */
  background?: SceneAsset | null;
  config: SceneConfig;
  createdAt: number;
  /** Owner's-plan watermark flag carried from the manifest (default on). */
  watermark?: boolean;
}

/** A stored asset addressed by public URL instead of an inline blob. */
export interface SceneAssetRef {
  url: string;
  mime: string;
}

/**
 * Server-side manifest persisted at `scenes/<id>/scene.json`. Carries the scene
 * config plus public URLs to the three assets, so any device/site can resolve a
 * scene by id without the original blobs (the id → data record for the store).
 */
export interface SceneManifest {
  id: string;
  version: 1;
  config: SceneConfig;
  createdAt: number;
  /** Whether the "Made with Gifsy" mark shows on this scene. Set by the owner's
   *  plan at publish (free → true). Optional so pre-auth v1 scenes default on. */
  watermark?: boolean;
  assets: {
    image: SceneAssetRef;
    depth: SceneAssetRef;
    mask: SceneAssetRef | null;
    /** LaMa-inpainted backdrop; absent on scenes published before Phase 3-4. */
    background?: SceneAssetRef | null;
  };
}

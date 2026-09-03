"use client";

// Loads a published scene by id and decodes its stored assets into images the
// viewer can consume directly. Used by the share and embed routes.

import { useEffect, useState } from "react";
import { loadScene } from "./creator";
import type { SceneRecord } from "./types";
import { loadImage } from "@/lib/image";

export interface DecodedScene {
  record: SceneRecord;
  image: HTMLImageElement;
  depth: HTMLImageElement;
  mask: HTMLImageElement | null;
  background: HTMLImageElement | null;
}

export function useScene(id: string): {
  scene: DecodedScene | null;
  loading: boolean;
} {
  const [scene, setScene] = useState<DecodedScene | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const record = await loadScene(id);
        if (!record) return;
        const [image, depth, mask, background] = await Promise.all([
          loadImage(record.image.blob),
          loadImage(record.depth.blob),
          record.mask ? loadImage(record.mask.blob) : Promise.resolve<HTMLImageElement | null>(null),
          record.background
            ? loadImage(record.background.blob)
            : Promise.resolve<HTMLImageElement | null>(null),
        ]);
        if (!cancelled) setScene({ record, image, depth, mask, background });
      } catch {
        // leave scene null → "not found" state
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { scene, loading };
}

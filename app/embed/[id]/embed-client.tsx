"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useScene } from "@/lib/publish/use-scene";

const SceneViewer = dynamic(() => import("@/components/SceneViewer").then((m) => m.SceneViewer), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-background" />,
});

// Minimal embed surface: no page chrome, responsive, lazy-loaded, no AI models.
export function EmbedClient({ id }: { id: string }) {
  const { scene, loading } = useScene(id);

  // The root layout paints an opaque body, which would show as a rectangle
  // inside the host's iframe and defeat a subject-only scene. Clearing it is
  // safe for every scene: a normal scene still paints its own backdrop.
  useEffect(() => {
    const { documentElement: html, body } = document;
    const prev = [html.style.background, body.style.background];
    html.style.background = "transparent";
    body.style.background = "transparent";
    return () => {
      html.style.background = prev[0];
      body.style.background = prev[1];
    };
  }, []);

  if (loading || !scene) {
    // No opaque placeholder: the scene may turn out to be subject-only, and a
    // coloured box flashing first is exactly what this mode exists to avoid.
    return <div className="h-full w-full" />;
  }

  return (
    <SceneViewer
      image={scene.image}
      depth={scene.depth}
      mask={scene.mask}
      background={scene.background}
      config={scene.record.config}
      surface="embed"
      showBrand={scene.record.watermark !== false}
      className="h-[100dvh] w-full"
    />
  );
}

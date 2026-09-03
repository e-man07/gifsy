"use client";

import dynamic from "next/dynamic";
import { useScene } from "@/lib/publish/use-scene";

const SceneViewer = dynamic(() => import("@/components/SceneViewer").then((m) => m.SceneViewer), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-background" />,
});

// Minimal embed surface: no page chrome, responsive, lazy-loaded, no AI models.
export function EmbedClient({ id }: { id: string }) {
  const { scene, loading } = useScene(id);

  if (loading || !scene) {
    return <div className="h-full w-full bg-background" />;
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

"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useScene } from "@/lib/publish/use-scene";

const SceneViewer = dynamic(() => import("@/components/SceneViewer").then((m) => m.SceneViewer), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-background" />,
});

// Minimal embed surface: no page chrome, responsive, lazy-loaded, no AI models.
export function EmbedClient({ id, poster }: { id: string; poster?: string | null }) {
  const { scene, loading } = useScene(id);
  // Poster stays until the viewer has actually painted a frame. Measured on a
  // customer page: assets plus the three.js chunk plus WebGL init left the
  // iframe empty for ten seconds on a cold load, which on someone else's site
  // is a hole in their layout.
  const [ready, setReady] = useState(false);

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

  // The poster is the scene's own artwork (matte for subject-only, thumbnail
  // otherwise), so it is never an opaque box behind a cut-out. Slightly blurred
  // and scaled: it cannot match the renderer's subject framing exactly, and a
  // soft stand-in reads as an image resolving rather than as a jump.
  const posterLayer = poster ? (
    // The poster is a Blob-hosted asset already sized for this purpose (a 7.5KB
    // thumbnail, or the matte). Routing it through next/image would put an
    // optimisation hop in front of the fastest paint we have, which is the
    // whole point of it.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={poster}
      alt=""
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full scale-[0.92] object-contain blur-[2px] transition-opacity duration-500 ${
        ready ? "opacity-0" : "opacity-100"
      }`}
    />
  ) : null;

  if (loading || !scene) {
    // Poster only — no coloured placeholder. A subject-only scene exists to
    // avoid exactly that box.
    return <div className="relative h-[100dvh] w-full">{posterLayer}</div>;
  }

  return (
    // h-[100dvh], not h-full: inside a host's iframe there is no ancestor with a
    // resolved height for a percentage to work from, so h-full collapses to 0
    // and nothing paints. This is why the viewer sized itself this way before
    // the poster layer was added.
    <div className="relative h-[100dvh] w-full">
      {posterLayer}
    <SceneViewer
      onReady={() => setReady(true)}
      image={scene.image}
      depth={scene.depth}
      mask={scene.mask}
      background={scene.background}
      config={scene.record.config}
      surface="embed"
      showBrand={scene.record.watermark !== false}
      className="h-full w-full"
    />
    </div>
  );
}

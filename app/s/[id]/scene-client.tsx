"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import { Check, Code, Copy } from "lucide-react";
import { useScene } from "@/lib/publish/use-scene";
import type { SceneConfig } from "@/lib/rendering/types";
import { embedOrigin } from "@/lib/site-url";

const SceneViewer = dynamic(() => import("@/components/SceneViewer").then((m) => m.SceneViewer), {
  ssr: false,
  loading: () => (
    <div className="hud-sm flex h-[360px] items-center justify-center rounded-xl bg-background text-sm font-semibold text-muted">
      Loading scene…
    </div>
  ),
});

export function SceneClient({ id }: { id: string }) {
  const { scene, loading } = useScene(id);
  const [copied, setCopied] = useState<"url" | "code" | null>(null);

  // Canonical domain when configured — a copied embed must not hardcode a
  // preview deployment's URL. See lib/site-url.ts.
  const origin = embedOrigin();
  const shareUrl = `${origin}/s/${id}`;
  const embedUrl = `${origin}/embed/${id}`;
  const embedCode = `<iframe src="${embedUrl}" style="width:100%;height:500px;border:0" loading="lazy"></iframe>`;

  const copy = async (text: string, kind: "url" | "code") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      track(kind === "code" ? "embed_copied" : "scene_shared", { id });
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  const config = useMemo<SceneConfig | null>(() => scene?.record.config ?? null, [scene]);

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="hud-sm animate-pulse rounded-xl bg-panel px-6 py-4 font-pixel text-sm text-muted">
          Loading scene…
        </div>
      </main>
    );
  }

  if (!scene || !config || scene.record.id !== id) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="hud rounded-2xl bg-panel p-8 text-center">
          <p className="font-pixel text-lg text-foreground">Scene not found</p>
          <p className="mt-2 text-sm text-muted">
            We couldn&apos;t load this scene. The link may be wrong, or the scene may have been removed.
          </p>
          <Link href="/" className="btn-pixel mt-5 inline-block rounded-xl bg-sky px-5 py-2.5 font-pixel text-sm text-cloud">
            Make your own
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:py-12">
      <div className="hud overflow-hidden rounded-2xl bg-panel p-4 sm:p-5">
        <SceneViewer
          image={scene.image}
          depth={scene.depth}
          mask={scene.mask}
          background={scene.background}
          config={config}
          surface="share"
          showBrand={scene.record.watermark !== false}
          className="h-[60vh] min-h-[320px] w-full rounded-xl"
        />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <div className="hud rounded-2xl bg-panel p-5">
          <p className="font-pixel text-xs uppercase tracking-wide text-muted">Share</p>
          <div className="mt-2 flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="hud-sm w-full rounded-lg bg-background px-3 py-2 text-sm font-semibold text-foreground outline-none"
            />
            <button
              onClick={() => copy(shareUrl, "url")}
              className="btn-pixel flex shrink-0 items-center gap-1.5 rounded-lg bg-sky px-3 py-2 font-pixel text-xs text-cloud"
            >
              {copied === "url" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied === "url" ? "Copied" : "Copy"}
            </button>
          </div>

          <p className="mt-5 font-pixel text-xs uppercase tracking-wide text-muted">Embed</p>
          <div className="relative mt-2">
            <pre className="hud-sm overflow-x-auto rounded-lg bg-background p-3 text-xs leading-relaxed text-foreground">
              <code>{embedCode}</code>
            </pre>
            <button
              onClick={() => copy(embedCode, "code")}
              className="btn-pixel absolute right-2 top-2 flex items-center gap-1.5 rounded-lg bg-sky px-2.5 py-1.5 font-pixel text-[10px] text-cloud"
            >
              {copied === "code" ? <Check className="h-3.5 w-3.5" /> : <Code className="h-3.5 w-3.5" />}
              {copied === "code" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs font-semibold text-muted">
          Move your mouse over the scene to look around. This page only loads the image assets — no AI models.
        </p>
      </div>
    </main>
  );
}

"use client";

// The 3D creation flow, extracted out of the homepage into its own page so
// picking a photo actually navigates somewhere instead of auto-scrolling the
// same page down to a "workshop" section. GIF and Sticker stay exactly where
// they were, on the homepage — this component is 3D-only.
//
// The customize step used to be 7 presets + 5 sliders + 4 motion buttons + 2
// toggles. Motion is now permanently "Orbit" (the one that actually reads as
// 3D — see the project's prior "doesn't look like 3D" fix) and every slider
// is fixed at the already-tuned Orbit-preset values. The only choice left is
// the one that visibly changes the result: keep the background, or cut the
// subject out onto a transparent one.

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, Box, Check, Code, Copy, Download, Link2, Play } from "lucide-react";
import { track } from "@vercel/analytics";
import { Source, Uploader } from "@/components/Uploader";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import type { ThreeDPreviewHandle } from "@/components/ThreeDPreview";
import { loadImage } from "@/lib/image";
import { cutout } from "@/lib/sticker";
import { estimateDepthGrid, depthWorkingSize, type DepthGrid } from "@/lib/depth";
import type { MotionMode, SceneConfig } from "@/lib/rendering/types";
import { presetConfig } from "@/lib/rendering/presets";
import { refineDepthGrid } from "@/lib/rendering/refine";
import { analyzeSubject, subjectAdvice } from "@/lib/rendering/subject-fit";
import {
  generationsRemaining,
  getUsage,
  refreshUsage,
  QuotaExhaustedError,
  SignInRequiredError,
} from "@/lib/depth-split/client";
import { downloadBlob } from "@/lib/export";
import { publishScene } from "@/lib/publish/creator";
import type { PublishResult } from "@/lib/publish/types";
import { embedOrigin } from "@/lib/site-url";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { takePendingUpload } from "@/lib/pending-upload";

const ThreeDPreview = dynamic(() => import("@/components/ThreeDPreview").then((m) => m.ThreeDPreview), {
  ssr: false,
  loading: () => (
    <div className="card-sm flex h-[360px] w-full items-center justify-center rounded-xl bg-surface text-sm font-semibold text-muted">
      Loading 3D engine…
    </div>
  ),
});

// Same values the old "Orbit 3D" preset defaulted to — no retuning, just no
// longer user-adjustable.
const ORBIT = presetConfig("orbit");
const FIXED_LOOK = {
  depthStrength: ORBIT.depthStrength ?? 0.6,
  motionMode: (ORBIT.motionMode ?? "orbit") as MotionMode,
  motionSpeed: ORBIT.motionSpeed ?? 0.35,
  perspective: ORBIT.perspective ?? 0.7,
  foregroundStrength: ORBIT.foregroundStrength ?? 0.85,
  backgroundBlur: ORBIT.backgroundBlur ?? 0.35,
  edgeFeather: ORBIT.edgeFeather ?? 0.5,
  shadowStrength: ORBIT.shadowStrength ?? 0.45,
} as const;

type Look = "background" | "cutout";

export function CreateWorkshop() {
  // Lazy initializer, not an effect: picks up a photo handed off from the
  // homepage's hero uploader on first render. Safe under SSR too — the
  // server's own module instance never has a pending file, so `file` is
  // always null there and `URL.createObjectURL` (browser-only) never runs.
  // A direct visit to /create with nothing pending just falls through to the
  // empty Uploader below.
  const [sources, setSources] = useState<Source[]>(() => {
    const file = takePendingUpload()?.[0];
    return file ? [{ file, url: URL.createObjectURL(file) }] : [];
  });
  const [threedImage, setThreedImage] = useState<HTMLImageElement | null>(null);
  const [threedGrid, setThreedGrid] = useState<DepthGrid | null>(null);
  const [threedCutout, setThreedCutout] = useState<HTMLImageElement | null>(null);
  const [threedNotes, setThreedNotes] = useState<string[]>([]);
  const [look, setLook] = useState<Look>("background");
  const [published, setPublished] = useState<PublishResult | null>(null);
  const [generationsLeft, setGenerationsLeft] = useState<number | null>(null);
  const [copied, setCopied] = useState<"url" | "code" | null>(null);
  const threedRef = useRef<ThreeDPreviewHandle>(null);

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const resetScene = useCallback(() => {
    setThreedGrid(null);
    setThreedImage(null);
    setThreedCutout(null);
    setThreedNotes([]);
    setPublished(null);
    setLook("background");
  }, []);

  const addFiles = useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;
      setSources((prev) => {
        prev.forEach((s) => URL.revokeObjectURL(s.url));
        return [{ file, url: URL.createObjectURL(file) }];
      });
      resetScene();
      setError(null);
    },
    [resetScene],
  );

  const removeFile = useCallback(() => {
    setSources((prev) => {
      prev.forEach((s) => URL.revokeObjectURL(s.url));
      return [];
    });
    resetScene();
  }, [resetScene]);

  const buildSceneConfig = (): SceneConfig => ({
    ...FIXED_LOOK,
    cameraX: 0,
    cameraY: 0,
    // Only meaningful with a subject to isolate; never persist it otherwise
    // or the published scene renders empty.
    subjectOnly: look === "cutout" && !!threedCutout,
    // "popout" keeps the whole photo visible without cropping whenever a
    // subject exists (both looks want this); "window" only applies to the
    // depth-only fallback where segmentation found nothing to isolate.
    framing: threedCutout ? "popout" : "window",
  });

  /**
   * Read-only preflight so we can refuse before spending ~1s of the user's
   * CPU on the encoder. Not the enforcement point — the depth head route is,
   * because that is the request a client cannot skip.
   */
  async function preflight3D(): Promise<
    | { ok: true }
    | { ok: false; reason: "sign-in" }
    | { ok: false; reason: "quota" }
  > {
    let usage: Awaited<ReturnType<typeof getUsage>>;
    try {
      usage = await getUsage();
    } catch {
      return { ok: true }; // let the authoritative route decide
    }
    if (usage.plan === null) return { ok: false, reason: "sign-in" };
    if (usage.remaining !== null && usage.remaining <= 0) {
      return { ok: false, reason: "quota" };
    }
    return { ok: true };
  }

  async function handleGenerate3D() {
    if (sources.length === 0) {
      setError("Add a photo first.");
      return;
    }
    resetScene();
    setBusy(true);
    setProgress(null);
    setError(null);
    try {
      const pre = await preflight3D();
      if (!pre.ok) {
        if (pre.reason === "sign-in") {
          // Full navigation: a fresh load guarantees the session is in place
          // when they come back, same as the publish path.
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.assign("/login?next=/create");
          return;
        }
        setUpgradeOpen(true);
        return;
      }
      track("3d_started", {
        webgl: typeof document !== "undefined"
          ? !!(document.createElement("canvas").getContext("webgl2") || document.createElement("canvas").getContext("webgl"))
          : false,
      });
      const t0 = performance.now();
      const img = await loadImage(sources[0].file);
      setThreedImage(img);
      // Low-res guard: a crisp 3D clip needs real detail to displace.
      const longEdge = Math.max(img.naturalWidth, img.naturalHeight);
      setThreedNotes(
        longEdge < 640
          ? [
              `Small source (${img.naturalWidth}×${img.naturalHeight}px) — depth has less detail to work with, so expect a softer result. ~640px on the long edge or more reads crisper.`,
            ]
          : [],
      );
      const t1 = performance.now();
      let cut: HTMLImageElement | null = null;
      try {
        const pngRaw = await cutout(sources[0].file, (p) => {
          setStatus(
            p.stage === "download"
              ? "Loading AI model (first time only)…"
              : "Separating subject…",
          );
          setProgress(p.fraction);
        });
        cut = await loadImage(pngRaw);
      } catch {
        // Segmentation is an enhancement, not a requirement — fall back to depth-only.
        console.warn("[3D] segmentation failed, using depth-only");
      }
      const t2 = performance.now();
      setThreedCutout(cut);
      if (cut) {
        const fit = analyzeSubject(cut);
        const advice = subjectAdvice(fit);
        if (advice) {
          track("subject_fit_warning", {
            clipped: fit.clipped,
            coverage: Math.round(fit.coverage * 100),
          });
          setThreedNotes((prev) => [...prev, advice]);
        }
      }
      const grid = await estimateDepthGrid(
        img,
        (p) => {
          setStatus(
            p.stage === "download"
              ? "Loading depth model (first time only)…"
              : "Estimating depth…",
          );
          setProgress(p.stage === "download" ? p.fraction : null);
        },
        depthWorkingSize(),
      );
      const t3 = performance.now();
      setGenerationsLeft(generationsRemaining());
      refreshUsage();
      setStatus("Sharpening depth…");
      setProgress(null);
      const refined = refineDepthGrid(grid, img, cut);
      const t4 = performance.now();
      setThreedGrid(refined);
      const depthMs = Math.round(t3 - t2);
      const segMs = cut ? Math.round(t2 - t1) : 0;
      const refineMs = Math.round(t4 - t3);
      console.info(`[3D] loadImage ${Math.round(t1 - t0)}ms segmentation ${cut ? segMs : "skipped"}ms depth ${depthMs}ms refine ${refineMs}ms total ${Math.round(t4 - t0)}ms grid ${refined.width}x${refined.height}`);
      track("depth_completed", { depth_inference_ms: depthMs, segmentation_inference_ms: segMs });
    } catch (e) {
      if (e instanceof SignInRequiredError) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/login?next=/create");
        return;
      }
      if (e instanceof QuotaExhaustedError) {
        refreshUsage();
        setGenerationsLeft(0);
        setUpgradeOpen(true);
        return;
      }
      setError(e instanceof Error ? e.message : "Something went wrong. Try another image.");
    } finally {
      setBusy(false);
      setStatus("");
      setProgress(null);
    }
  }

  // ── 3D export — reuses the live scene, no re-inference ──────────
  async function exportThreeDGif() {
    const api = threedRef.current;
    if (!api) return;
    setBusy(true);
    setStatus("Rendering 3D GIF…");
    setProgress(0);
    try {
      const blob = await api.captureGif({ frames: 30, fps: 20, size: 480, onProgress: setProgress });
      downloadBlob(blob, "3d.gif");
    } catch (e) {
      setError(e instanceof Error ? e.message : "GIF export failed.");
    } finally {
      setBusy(false);
      setStatus("");
      setProgress(null);
    }
  }

  async function exportThreeDPng() {
    const api = threedRef.current;
    if (!api) return;
    setBusy(true);
    setStatus("Exporting still…");
    try {
      const blob = await api.captureStill({ size: 1024 });
      downloadBlob(blob, "3d.png");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Image export failed.");
    } finally {
      setBusy(false);
      setStatus("");
      setProgress(null);
    }
  }

  async function exportThreeDWebm() {
    const api = threedRef.current;
    if (!api) return;
    setBusy(true);
    setStatus("Recording WebM…");
    try {
      const blob = await api.captureWebm({ duration: 3 });
      if (blob) downloadBlob(blob, "3d.webm");
      else setError("WebM export isn't supported in this browser — try GIF instead.");
    } catch {
      setError("WebM export failed.");
    } finally {
      setBusy(false);
      setStatus("");
      setProgress(null);
    }
  }

  function exportThreeDConfig() {
    if (!threedGrid || !threedImage || !sources[0]) return;
    const config: SceneConfig = buildSceneConfig();
    const payload = {
      version: 1,
      source: sources[0].file.name,
      imageSize: `${threedImage.naturalWidth}x${threedImage.naturalHeight}`,
      depthGrid: `${threedGrid.width}x${threedGrid.height}`,
      config,
      generatedAt: new Date().toISOString(),
    };
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }), "gifsy-scene.json");
  }

  async function handlePublish() {
    if (!threedImage || !threedGrid) return;
    // Publishing (unlike creation) needs an account — send them to sign in
    // and back. Creation stayed fully local up to this point.
    const {
      data: { user },
    } = await createSupabaseClient().auth.getUser();
    if (!user) {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/login?next=/create");
      return;
    }
    setBusy(true);
    setStatus("Optimizing assets…");
    setProgress(0);
    try {
      const result = await publishScene({
        image: threedImage,
        depthGrid: threedGrid,
        cutout: threedCutout,
        config: buildSceneConfig(),
        onProgress: setProgress,
      });
      setPublished(result);
      if (result.persistence === "server") {
        track("scene_published", { id: result.record.id });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publishing failed.");
    } finally {
      setBusy(false);
      setStatus("");
      setProgress(null);
    }
  }

  async function copyText(text: string, kind: "url" | "code") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      if (kind === "code") track("embed_copied");
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  }

  const webmOk =
    typeof window !== "undefined" &&
    typeof window.MediaRecorder !== "undefined" &&
    typeof HTMLCanvasElement !== "undefined" &&
    "captureStream" in HTMLCanvasElement.prototype;

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
      <UpgradeDialog open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />

      <div className="card rounded-2xl bg-panel p-5 sm:p-7">
        <h1 className="font-editorial text-3xl text-foreground">
          AI 3D photo animation, made in your browser
        </h1>
        {/* First-paint explainer. Honest data flow: the photo stays here; on
            Free the depth head runs server-side on activations; publishing
            uploads the finished scene. */}
        <p className="mt-2 text-sm text-muted">
          Drop in one photo. A depth model turns it into a 3D scene and a second model lifts the
          subject off the background. Drag to look around — the AI runs once, then it&apos;s pure
          graphics at 60 fps. Export a GIF, PNG or WebM, or publish it and paste the iframe into
          your site. 3D needs a free account; the photo stays in your browser while the scene is
          made, and only the finished scene is uploaded when you publish.
        </p>

        <div className="mt-5">
          <Uploader
            multiple={false}
            sources={sources}
            onAdd={addFiles}
            onRemove={removeFile}
            onClear={removeFile}
          />
        </div>

        {sources.length === 0 && (
          <p className="mt-3 rounded-xl bg-sky/10 px-4 py-3 text-sm font-semibold text-sky-deep">
            ↑ Add a photo to begin.
          </p>
        )}

        {sources.length > 0 && (
          <div className="mt-5 flex flex-col gap-4">
            <p className="flex items-start gap-2 rounded-xl bg-sky/10 px-3.5 py-2.5 text-xs font-semibold text-sky-deep">
              <Box className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
              <span>
                Choose a look, then generate. On the free plan one step of the depth model runs on our server, fed with intermediate numbers rather than the photo; Pro runs the whole model on your device. Nothing is uploaded until you publish.
              </span>
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setLook("background")}
                className={`flex flex-col items-start gap-1 rounded-xl border-2 px-4 py-3.5 text-left transition ${
                  look === "background"
                    ? "border-ink bg-sky text-cloud"
                    : "border-transparent bg-surface text-foreground hover:border-ink/25"
                }`}
              >
                <span className="font-display text-sm">With background</span>
                <span className={`text-xs leading-snug ${look === "background" ? "text-cloud/80" : "text-muted"}`}>
                  Keeps the whole photo — the subject lifts with depth over its own backdrop.
                </span>
              </button>
              <button
                type="button"
                onClick={() => threedCutout && setLook("cutout")}
                disabled={!threedCutout}
                className={`flex flex-col items-start gap-1 rounded-xl border-2 px-4 py-3.5 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  look === "cutout"
                    ? "border-ink bg-sky text-cloud"
                    : "border-transparent bg-surface text-foreground hover:border-ink/25"
                }`}
              >
                <span className="font-display text-sm">Cutout (transparent)</span>
                <span className={`text-xs leading-snug ${look === "cutout" ? "text-cloud/80" : "text-muted"}`}>
                  {threedCutout
                    ? "Subject only — floats on whatever colour your page has."
                    : "Needs a subject — this photo's background couldn't be separated."}
                </span>
              </button>
            </div>

            <button
              onClick={handleGenerate3D}
              disabled={busy}
              className="btn rounded-xl bg-grass py-3.5 font-display text-lg uppercase tracking-wide text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? (
                status || "Working…"
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Play className="h-5 w-5 fill-current" strokeWidth={2.5} aria-hidden />
                  Make 3D
                </span>
              )}
            </button>

            {busy && (
              <div className="card-sm h-3 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full bg-gradient-to-r from-sky to-grass transition-all"
                  style={{ width: progress === null ? "40%" : `${Math.round(progress * 100)}%` }}
                />
              </div>
            )}

            {error && (
              <p className="card-sm rounded-xl bg-petal/15 px-4 py-3 text-sm font-bold text-petal">
                {error}
              </p>
            )}
          </div>
        )}
      </div>

      {threedGrid && threedImage && (
        <div className="card popin mt-8 flex flex-col gap-4 rounded-2xl bg-panel p-6">
          <ThreeDPreview
            ref={threedRef}
            image={threedImage}
            depthGrid={threedGrid}
            config={buildSceneConfig()}
            cutout={threedCutout}
          />
          <p className="text-center text-sm font-semibold text-muted">
            Interactive — move your mouse over the scene. The AI ran once; everything else is GPU at 60 fps.{" "}
            {!threedCutout
              ? "Depth-only view — segmentation couldn't separate a subject."
              : look === "cutout"
                ? "Background removed — the subject will sit on whatever colour your page has."
                : "The subject floats over a blurred backdrop."}
          </p>
          {threedNotes.length > 0 && (
            <ul className="card-sm flex flex-col gap-2 rounded-xl bg-surface px-4 py-3">
              {threedNotes.map((note) => (
                <li key={note} className="flex items-start gap-2 text-left text-xs leading-relaxed text-muted">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sun" strokeWidth={2.5} aria-hidden />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={exportThreeDGif}
              disabled={busy}
              className="btn flex items-center gap-2 rounded-xl bg-sky px-4 py-2 font-display text-sm text-cloud disabled:opacity-40"
            >
              <Download className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              GIF
            </button>
            <button
              onClick={exportThreeDPng}
              disabled={busy}
              className="btn flex items-center gap-2 rounded-xl bg-sky px-4 py-2 font-display text-sm text-cloud disabled:opacity-40"
            >
              <Download className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              PNG
            </button>
            <button
              onClick={exportThreeDWebm}
              disabled={busy || !webmOk}
              className="btn flex items-center gap-2 rounded-xl bg-sky px-4 py-2 font-display text-sm text-cloud disabled:opacity-40"
            >
              <Download className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              WebM
            </button>
            <button
              onClick={exportThreeDConfig}
              disabled={busy}
              className="btn flex items-center gap-2 rounded-xl bg-panel px-4 py-2 font-display text-sm text-ink ring-2 ring-ink disabled:opacity-40"
            >
              <Download className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              Scene JSON
            </button>
          </div>
          <button
            onClick={handlePublish}
            disabled={busy}
            className="btn flex w-full items-center justify-center gap-2 rounded-xl bg-grass py-3 font-display text-sm uppercase tracking-wide text-ink disabled:opacity-40"
          >
            <Link2 className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            Publish
          </button>

          {published?.persistence === "local" && (
            <div className="flex flex-col gap-2 rounded-xl bg-surface p-4">
              <p className="flex items-center gap-1.5 font-display text-xs uppercase tracking-wide text-sun">
                <AlertTriangle className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                Not published
              </p>
              <p className="text-[11px] font-semibold leading-relaxed text-muted">
                The scene was kept on this device only, so there is no share link or embed yet
                — and clearing your browser data would lose it. Try publishing again.
              </p>
              {published.error ? (
                <p className="text-[11px] leading-relaxed text-muted/80">{published.error}</p>
              ) : null}
            </div>
          )}

          {published?.persistence === "server" && (
            <div className="flex flex-col gap-3 rounded-xl bg-surface p-4">
              <p className="flex items-center gap-1.5 font-display text-xs uppercase tracking-wide text-grass">
                <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                Published
              </p>
              <div className="flex items-center gap-2">
                <span className="shrink-0 font-display text-[10px] uppercase tracking-wide text-muted">Link</span>
                <input
                  readOnly
                  value={`${embedOrigin()}/s/${published.record.id}`}
                  onFocus={(e) => e.currentTarget.select()}
                  className="card-sm w-full min-w-0 rounded-lg bg-panel px-2.5 py-1.5 text-xs font-semibold text-foreground outline-none"
                />
                <button
                  onClick={() => copyText(`${embedOrigin()}/s/${published.record.id}`, "url")}
                  className="btn flex shrink-0 items-center gap-1 rounded-lg bg-sky px-2.5 py-1.5 font-display text-[10px] text-cloud"
                >
                  {copied === "url" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied === "url" ? "Done" : "Copy"}
                </button>
              </div>
              <div className="relative">
                <pre className="card-sm overflow-x-auto rounded-lg bg-panel p-2.5 text-[11px] leading-relaxed text-foreground">
                  <code>{`<iframe src="${embedOrigin()}/embed/${published.record.id}" style="width:100%;height:500px;border:0" loading="lazy"></iframe>`}</code>
                </pre>
                <button
                  onClick={() =>
                    copyText(
                      `<iframe src="${embedOrigin()}/embed/${published.record.id}" style="width:100%;height:500px;border:0" loading="lazy"></iframe>`,
                      "code",
                    )
                  }
                  className="btn absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-sky px-2 py-1 font-display text-[10px] text-cloud"
                >
                  {copied === "code" ? <Check className="h-3 w-3" /> : <Code className="h-3 w-3" />}
                  {copied === "code" ? "Done" : "Copy"}
                </button>
              </div>
              <p className="text-center text-[11px] font-semibold text-muted">
                Live on any device — it&apos;s in <a href="/scenes" className="underline hover:text-foreground">My scenes</a>.
              </p>
            </div>
          )}
          <p className="text-center font-display text-[11px] uppercase tracking-wide text-muted">
            {generationsLeft === null
              ? "Rendered on your device. Your photo never leaves it."
              : `${generationsLeft} free 3D generation${generationsLeft === 1 ? "" : "s"} left`}
          </p>
        </div>
      )}
    </div>
  );
}

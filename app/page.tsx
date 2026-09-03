"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Source, Uploader } from "@/components/Uploader";
import { ImportGuide } from "@/components/ImportGuide";
import dynamic from "next/dynamic";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { AccountMenu } from "@/components/AccountMenu";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { loadImage } from "@/lib/image";
import {
  GIF_EFFECTS,
  GifEffect,
  makeAnimatedGif,
  makeDepthGif,
  makeSlideshowGif,
} from "@/lib/gif";
import { composeSticker, cutout } from "@/lib/sticker";
import { estimateDepth, estimateDepthGrid, depthWorkingSize, type DepthGrid } from "@/lib/depth";
import { downloadBlob, toStickerWebp } from "@/lib/export";
import type { MotionMode, SceneConfig } from "@/lib/rendering/types";
import { PRESETS, presetConfig, type PresetId } from "@/lib/rendering/presets";
import { refineDepthGrid } from "@/lib/rendering/refine";
import type { ThreeDPreviewHandle } from "@/components/ThreeDPreview";

const ThreeDPreview = dynamic(() => import("@/components/ThreeDPreview").then((m) => m.ThreeDPreview), {
  ssr: false,
  loading: () => <div className="hud-sm flex h-[360px] w-full items-center justify-center rounded-xl bg-background text-sm font-semibold text-muted">Loading 3D engine…</div>,
});
import {
  Activity,
  ArrowDown,
  ArrowDownUp,
  Box,
  Check,
  ChevronDown,
  Clapperboard,
  Code,
  Copy,
  Download,
  Film,
  Images,
  Layers,
  Link2,
  type LucideIcon,
  MousePointer2,
  Play,
  Rotate3d,
  RotateCw,
  Sparkles,
  Tv,
  Vibrate,
  Wand2,
  ZoomIn,
} from "lucide-react";
import { publishScene } from "@/lib/publish/creator";
import type { SceneRecord } from "@/lib/publish/types";

// Each animation effect gets a glyph that reads at a glance in the picker.
const EFFECT_ICON: Record<GifEffect, LucideIcon> = {
  depth: Wand2,
  zoom: ZoomIn,
  bounce: ArrowDownUp,
  shake: Vibrate,
  pulse: Activity,
  spin: RotateCw,
  glitch: Tv,
};

type Mode = "gif" | "sticker" | "3d";
type GifMode = "animate" | "combine";

interface ResultFile {
  blob: Blob;
  url: string;
  label: string;
}

interface Result {
  kind: Mode;
  preview: string; // url shown in the preview pane
  transparent: boolean;
  files: ResultFile[];
  note: string;
  sticker?: { png: Blob; webp: Blob };
}

// First render should already read as clearly 3D, so all 3D state initializes from
// the default preset rather than timid hand-picked values (which never matched it).
const DEFAULT_PRESET_ID: PresetId = "orbit";
const DEFAULT_3D = presetConfig(DEFAULT_PRESET_ID);

export default function Home() {
  const [mode, setMode] = useState<Mode>("gif");
  const [gifMode, setGifMode] = useState<GifMode>("animate");
  const [sources, setSources] = useState<Source[]>([]);

  const [effect, setEffect] = useState<GifEffect>("depth");
  const [fps, setFps] = useState(20);
  const [slideMs, setSlideMs] = useState(600);
  const [boomerang, setBoomerang] = useState(true);

  const [outline, setOutline] = useState(16);
  const [outlineColor, setOutlineColor] = useState("#ffffff");
  const [shadow, setShadow] = useState(true);
  const [caption, setCaption] = useState("");

  // 3D state — depthGrid is the shared inference output (runs once, cheap graphics every frame)
  const [threedImage, setThreedImage] = useState<HTMLImageElement | null>(null);
  const [threedGrid, setThreedGrid] = useState<DepthGrid | null>(null);
  const [threedCutout, setThreedCutout] = useState<HTMLImageElement | null>(null);
  const [threedNote, setThreedNote] = useState<string | null>(null); // soft, non-blocking quality heads-up (e.g. low-res source)
  const [depthStrength, setDepthStrength] = useState(DEFAULT_3D.depthStrength ?? 0.5);
  const [motionMode, setMotionMode] = useState<MotionMode>(DEFAULT_3D.motionMode ?? "mouse");
  const [foregroundStrength, setForegroundStrength] = useState(DEFAULT_3D.foregroundStrength ?? 0.7);
  const [backgroundBlur, setBackgroundBlur] = useState(DEFAULT_3D.backgroundBlur ?? 0.15);
  const [edgeFeather, setEdgeFeather] = useState(DEFAULT_3D.edgeFeather ?? 0.4);
  const [perspective, setPerspective] = useState(DEFAULT_3D.perspective ?? 0.6);
  const [motionSpeed, setMotionSpeed] = useState(DEFAULT_3D.motionSpeed ?? 0.2);
  const [shadowStrength, setShadowStrength] = useState(DEFAULT_3D.shadowStrength ?? 0.35);
  const [preset, setPreset] = useState<PresetId>(DEFAULT_PRESET_ID);

  const [published, setPublished] = useState<SceneRecord | null>(null);
  const [copied, setCopied] = useState<"url" | "code" | null>(null);

  const threedRef = useRef<ThreeDPreviewHandle>(null);

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const workshopRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Respect reduced-motion: freeze the ambient hero video on its poster frame.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      videoRef.current?.pause();
    }
  }, []);

  const multiple = mode === "gif" && gifMode === "combine";

  const goToWorkshop = useCallback(() => {
    workshopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const resetResult = useCallback(() => {
    setResult((prev) => {
      prev?.files.forEach((f) => URL.revokeObjectURL(f.url));
      return null;
    });
    setError(null);
  }, []);

  const resetThreeD = useCallback(() => {
    setThreedGrid(null);
    setThreedImage(null);
    setThreedCutout(null);
    setThreedNote(null);
    setPublished(null);
  }, []);

  const addFiles = useCallback(
    (files: File[]) => {
      resetResult();
      resetThreeD();
      const next = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
      setSources((prev) => (multiple ? [...prev, ...next] : next.slice(0, 1)));
      requestAnimationFrame(goToWorkshop);
    },
    [multiple, resetResult, resetThreeD, goToWorkshop],
  );

  const removeFile = useCallback((index: number) => {
    setSources((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return copy;
    });
    resetThreeD();
  }, [resetThreeD]);

  const clearFiles = useCallback(() => {
    setSources((prev) => {
      prev.forEach((s) => URL.revokeObjectURL(s.url));
      return [];
    });
    resetResult();
    resetThreeD();
  }, [resetResult, resetThreeD]);

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    resetResult();
    resetThreeD();
    // 3D and animate are single-image; trim excess if switching in.
    if (next === "3d" || (next === "gif" && gifMode === "animate")) {
      setSources((p) => p.slice(0, 1));
    }
  };

  async function handleGenerate() {
    resetResult();
    if (mode === "3d") resetThreeD();
    if (sources.length === 0) {
      setError("Add a photo first.");
      return;
    }
    setBusy(true);
    setProgress(null);
    try {
      if (mode === "gif") {
        if (gifMode === "animate") {
          if (effect === "depth") {
            const pngRaw = await cutout(sources[0].file, (p) => {
              setStatus(
                p.stage === "download"
                  ? "Loading AI model (first time only)…"
                  : "Separating subject…",
              );
              setProgress(p.fraction);
            });
            const [orig, cut] = await Promise.all([
              loadImage(sources[0].file),
              loadImage(pngRaw),
            ]);
            const depthMap = await estimateDepth(orig, (p) => {
              setStatus(
                p.stage === "download"
                  ? "Loading depth model (first time only)…"
                  : "Estimating depth…",
              );
              setProgress(p.stage === "download" ? p.fraction : null);
            });
            setStatus("Rendering depth…");
            setProgress(null);
            const blob = await makeDepthGif(
              orig,
              cut,
              { fps, boomerang, onProgress: setProgress },
              depthMap,
            );
            finish({
              kind: "gif",
              blob,
              filename: "depth.gif",
              label: "Download GIF",
              transparent: false,
              note: "Send it anywhere — GIFs animate in Telegram, Discord, iMessage and more.",
            });
          } else {
            setStatus("Rendering frames…");
            const img = await loadImage(sources[0].file);
            const blob = await makeAnimatedGif(img, effect, {
              fps,
              boomerang,
              onProgress: setProgress,
            });
            finish({
              kind: "gif",
              blob,
              filename: `animated-${effect}.gif`,
              label: "Download GIF",
              transparent: false,
              note: "Send it anywhere — GIFs animate in Telegram, Discord, iMessage and more.",
            });
          }
        } else {
          if (sources.length < 2) {
            setError("Add at least 2 images to combine.");
            setBusy(false);
            return;
          }
          setStatus("Building slideshow…");
          const imgs = await Promise.all(sources.map((s) => loadImage(s.file)));
          const blob = await makeSlideshowGif(imgs, {
            perFrameMs: slideMs,
            onProgress: setProgress,
          });
          finish({
            kind: "gif",
            blob,
            filename: "slideshow.gif",
            label: "Download GIF",
            transparent: false,
            note: "Send it anywhere — GIFs animate in Telegram, Discord, iMessage and more.",
          });
        }
        } else if (mode === "3d") {
        // 3D path — depth + segmentation, both run once; graphics every frame.
        resetThreeD();
        track("3d_started", {
          webgl: typeof document !== "undefined"
            ? !!(document.createElement("canvas").getContext("webgl2") || document.createElement("canvas").getContext("webgl"))
            : false,
        });
        // eslint-disable-next-line react-hooks/purity
        const t0 = performance.now();
        const img = await loadImage(sources[0].file);
        setThreedImage(img);
        // Low-res guard: a crisp 3D clip needs real detail to displace. Depth runs
        // at ~518–770px and publishes up to 1440px, so a small source gets upscaled
        // and reads mushy (the classic "why is my clip bad" case). Warn, don't block —
        // the scene still renders; the user just knows why it looks soft.
        const longEdge = Math.max(img.naturalWidth, img.naturalHeight);
        setThreedNote(
          longEdge < 640
            ? `This image is small (${img.naturalWidth}×${img.naturalHeight}px), so the 3D clip may look soft — 3D needs detail to work with. For a crisp result use an original at least ~640px on the long edge (1000px+ is ideal).`
            : null,
        );
        // eslint-disable-next-line react-hooks/purity
        const t1 = performance.now();
        // Phase 3: subject/background separation via existing ISNet (no new model).
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
          // Segmentation is an enhancement, not a requirement (§50) — fall back to depth-only.
          console.warn("[3D] segmentation failed, using depth-only");
        }
        // eslint-disable-next-line react-hooks/purity
        const t2 = performance.now();
        setThreedCutout(cut);
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
          undefined,
          depthWorkingSize(), // crisper relief on capable devices; 518 elsewhere
        );
        // eslint-disable-next-line react-hooks/purity
        const t3 = performance.now();
        // Phase 1: refine depth against the image + subject alpha (no new model) —
        // snaps depth edges to the true silhouette and strips the halo before render.
        setStatus("Sharpening depth…");
        setProgress(null);
        const refined = refineDepthGrid(grid, img, cut);
        // eslint-disable-next-line react-hooks/purity
        const t4 = performance.now();
        setThreedGrid(refined);
        // Measurements for handoff §54 — visible in devtools, not user-facing.
        const depthMs = Math.round(t3 - t2);
        const segMs = cut ? Math.round(t2 - t1) : 0;
        const refineMs = Math.round(t4 - t3);
        console.info(`[3D] loadImage ${Math.round(t1 - t0)}ms segmentation ${cut ? segMs : "skipped"}ms depth ${depthMs}ms refine ${refineMs}ms total ${Math.round(t4 - t0)}ms grid ${refined.width}x${refined.height}`);
        track("depth_completed", { depth_inference_ms: depthMs, segmentation_inference_ms: segMs });
      } else {
        const pngRaw = await cutout(sources[0].file, (p) => {
          setStatus(
            p.stage === "download"
              ? "Loading AI model (first time only)…"
              : "Removing background…",
          );
          setProgress(p.fraction);
        });
        setStatus("Adding outline…");
        setProgress(null);
        const png = await composeSticker(pngRaw, {
          outline,
          outlineColor,
          shadow,
          text: caption,
        });
        const webp = await toStickerWebp(png);
        const pngUrl = URL.createObjectURL(png);
        setResult({
          kind: "sticker",
          preview: pngUrl,
          transparent: true,
          note: "512×512 and transparent — the right size for Telegram stickers. See how to import below.",
          sticker: { png, webp },
          files: [
            { blob: png, url: pngUrl, label: "Download PNG" },
            {
              blob: webp,
              url: URL.createObjectURL(webp),
              label: "Download WebP (sticker)",
            },
          ],
        });
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Something went wrong. Try another image.",
      );
    } finally {
      setBusy(false);
      setStatus("");
      setProgress(null);
    }
  }

  function finish(args: {
    kind: Mode;
    blob: Blob;
    filename: string;
    label: string;
    transparent: boolean;
    note: string;
  }) {
    const url = URL.createObjectURL(args.blob);
    setResult({
      kind: args.kind,
      preview: url,
      transparent: args.transparent,
      note: args.note,
      files: [{ blob: args.blob, url, label: args.label }],
    });
  }

  // ── 3D export (Phase 5) — reuses the live scene, no re-inference ──────────
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
    const config: SceneConfig = {
      perspective,
      depthStrength,
      cameraX: 0,
      cameraY: 0,
      motionMode,
      motionSpeed,
      foregroundStrength,
      backgroundBlur,
      edgeFeather,
      shadowStrength,
    };
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

  const buildSceneConfig = (): SceneConfig => ({
    perspective,
    depthStrength,
    cameraX: 0,
    cameraY: 0,
    motionMode,
    motionSpeed,
    foregroundStrength,
    backgroundBlur,
    edgeFeather,
    shadowStrength,
  });

  async function handlePublish() {
    if (!threedImage || !threedGrid) return;
    // Publishing (unlike creation) needs an account — send them to sign in and
    // back. Creation stayed fully local up to this point.
    const {
      data: { user },
    } = await createSupabaseClient().auth.getUser();
    if (!user) {
      // Full navigation is intentional here — a fresh load guarantees the new
      // session is in place when they return to publish.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/login?next=/");
      return;
    }
    setBusy(true);
    setStatus("Optimizing assets…");
    setProgress(0);
    try {
      const record = await publishScene({
        image: threedImage,
        depthGrid: threedGrid,
        cutout: threedCutout,
        config: buildSceneConfig(),
        onProgress: setProgress,
      });
      setPublished(record);
      track("scene_published", { id: record.id });
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

  const canGenerate = !busy && sources.length >= (multiple ? 2 : 1);

  return (
    <main className="flex flex-1 flex-col">
      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section
        id="top"
        className="relative isolate flex min-h-[92vh] flex-col justify-center overflow-hidden"
      >
        <video
          ref={videoRef}
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          poster="/bgm-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
        >
          <source src="/bgm.mp4" type="video/mp4" />
        </video>
        {/* Legibility scrims */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/85 via-ink/40 to-transparent" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/50 via-transparent to-ink/30" />

        {/* Nav */}
        <nav className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 sm:px-8">
          <a
            href="#top"
            className="flex items-center gap-1 font-pixel text-2xl text-cloud drop-shadow-[2px_2px_0_var(--ink)]"
          >
            GIFSY
            <Play
              className="h-5 w-5 fill-sun text-sun"
              strokeWidth={2.5}
              aria-hidden
            />
          </a>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/gallery"
              className="font-pixel text-sm text-cloud drop-shadow-[1px_1px_0_var(--ink)] hover:text-sun"
            >
              Gallery
            </Link>
            <a
              href="#how"
              className="hidden font-pixel text-sm text-cloud drop-shadow-[1px_1px_0_var(--ink)] hover:text-sun sm:block"
            >
              How it works
            </a>
            <AccountMenu />
            <button
              onClick={goToWorkshop}
              className="btn-pixel flex items-center gap-1.5 rounded-full bg-sky px-4 py-2 font-pixel text-sm text-cloud"
            >
              Start
              <ArrowDown className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </button>
          </div>
        </nav>

        {/* Hero content */}
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-5 pb-16 pt-28 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-xl">
            <p className="font-pixel text-xs uppercase tracking-[0.2em] text-sun drop-shadow-[1px_1px_0_var(--ink)]">
              In your browser · nothing uploaded
            </p>
            <h1 className="mt-3 font-pixel text-4xl leading-[1.08] text-cloud drop-shadow-[3px_3px_0_var(--ink)] sm:text-5xl md:text-6xl">
              Turn any photo into a <span className="text-sun">GIF</span>,{" "}
              <span className="text-grass">sticker</span>, or{" "}
              <span className="text-sky">3D</span>.
            </h1>
            <p className="mt-4 max-w-md text-base font-semibold text-cloud/95 drop-shadow-[1px_1px_0_rgba(4,16,29,0.9)] sm:text-lg">
              Give a single shot real depth, loop a few together, cut a clean sticker, or turn a photo into an interactive 3D scene — all locally, in seconds.
            </p>

            {/* Controls: mode + (for GIF) sub-mode — one compact, light row */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <div className="hud-sm inline-flex gap-0.5 rounded-lg bg-cloud/95 p-0.5">
                {(["gif", "sticker", "3d"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-pixel text-xs transition ${
                      mode === m ? "bg-sky text-cloud" : "text-ink hover:bg-ink/5"
                    }`}
                  >
                    {m === "gif" ? (
                      <Film className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                    ) : m === "sticker" ? (
                      <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                    ) : (
                      <Box className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                    )}
                    {m === "gif" ? "GIF" : m === "sticker" ? "Sticker" : "3D"}
                  </button>
                ))}
              </div>

              {mode === "gif" && (
                <div className="hud-sm inline-flex gap-0.5 rounded-lg bg-cloud/95 p-0.5">
                  {(
                    [
                      { gm: "animate", label: "Animate one", Icon: Clapperboard },
                      { gm: "combine", label: "Combine several", Icon: Images },
                    ] as { gm: GifMode; label: string; Icon: LucideIcon }[]
                  ).map(({ gm, label, Icon }) => (
                    <button
                      key={gm}
                      onClick={() => {
                        setGifMode(gm);
                        resetResult();
                        if (gm === "animate") setSources((p) => p.slice(0, 1));
                      }}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-pixel text-xs transition ${
                        gifMode === gm
                          ? "bg-sky text-cloud"
                          : "text-ink hover:bg-ink/5"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Upload */}
            <div className="mt-4 max-w-sm">
              <Uploader
                multiple={multiple}
                sources={sources}
                onAdd={addFiles}
                onRemove={removeFile}
                onClear={clearFiles}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-pixel text-[11px] uppercase tracking-wide text-cloud/85 drop-shadow-[1px_1px_0_var(--ink)]">
              {["Private", "Free", "Works offline after first load"].map((t) => (
                <span key={t} className="flex items-center gap-1">
                  <Check
                    className="h-3.5 w-3.5 text-grass"
                    strokeWidth={3}
                    aria-hidden
                  />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <button
          onClick={goToWorkshop}
          className="absolute bottom-4 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1 font-pixel text-xs uppercase tracking-widest text-cloud/80 drop-shadow-[1px_1px_0_var(--ink)] hover:text-sun"
        >
          <ChevronDown className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          Customize
        </button>
      </section>

      {/* ─────────────────────────── STEPS ─────────────────────────── */}
      <section id="how" className="border-y-[3px] border-ink bg-panel">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 px-5 py-8 sm:grid-cols-3 sm:px-8">
          {[
            ["1", "Upload", "Drop a photo — or a few. It never leaves your device."],
            ["2", "Customize", "Pick an effect or sticker style and tune it live."],
            ["3", "Download", "Save the GIF or sticker, or send it to Telegram."],
          ].map(([n, title, desc]) => (
            <div key={n} className="flex items-start gap-3">
              <span className="hud-sm flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky font-pixel text-lg text-cloud">
                {n}
              </span>
              <div>
                <h3 className="font-pixel text-base text-foreground">{title}</h3>
                <p className="text-sm text-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────── WORKSHOP ─────────────────────────── */}
      <section
        ref={workshopRef}
        id="make"
        className="mx-auto w-full max-w-2xl scroll-mt-4 px-5 py-12 sm:py-16"
      >
        <div className="hud rounded-2xl bg-panel p-5 sm:p-7">
          <h2 className="font-pixel text-2xl text-foreground">
            {mode === "gif" ? "Customize your GIF" : mode === "sticker" ? "Customize your sticker" : "Customize your 3D"}
          </h2>

          {sources.length === 0 && (
            <p className="mt-3 rounded-xl bg-sky/10 px-4 py-3 text-sm font-semibold text-sky-deep">
              ↑ Add a photo up top to begin, then choose your look here.
            </p>
          )}

          <div className="mt-5 flex flex-col gap-6">
            {/* Animate controls */}
            {mode === "gif" && gifMode === "animate" && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {GIF_EFFECTS.map((e) => {
                    const Icon = EFFECT_ICON[e.id];
                    return (
                      <button
                        key={e.id}
                        onClick={() => {
                          setEffect(e.id);
                          resetResult();
                        }}
                        className={`relative flex flex-col items-center gap-1 rounded-lg border-2 py-2.5 text-xs transition ${
                          effect === e.id
                            ? "border-ink bg-sky text-cloud"
                            : "border-transparent bg-background text-foreground hover:border-ink/25"
                        }`}
                      >
                        {e.ai && (
                          <span
                            className={`absolute right-1 top-1 rounded px-1 font-pixel text-[8px] leading-tight ${
                              effect === e.id
                                ? "bg-cloud/25 text-cloud"
                                : "bg-sky/15 text-sky-deep"
                            }`}
                          >
                            AI
                          </span>
                        )}
                        <Icon className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                        <span className="font-pixel">{e.label}</span>
                      </button>
                    );
                  })}
                </div>
                {effect === "depth" && (
                  <p className="flex items-start gap-2 rounded-xl bg-sky/10 px-3.5 py-2.5 text-xs font-semibold text-sky-deep">
                    <Wand2
                      className="mt-0.5 h-4 w-4 shrink-0"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                    <span>
                      A depth-estimation model scans the photo and moves each
                      pixel by how close it is to the camera — real parallax,
                      all in your browser. First run downloads two small AI
                      models.
                    </span>
                  </p>
                )}
                <Slider
                  label="Speed"
                  min={8}
                  max={30}
                  value={fps}
                  onChange={setFps}
                  format={(v) => `${v} fps`}
                />
                <Toggle
                  label="Boomerang loop"
                  hint="Play forward then reverse for a seamless loop"
                  checked={boomerang}
                  onChange={setBoomerang}
                />
              </div>
            )}

            {/* Combine controls */}
            {mode === "gif" && gifMode === "combine" && (
              <Slider
                label="Time per image"
                min={200}
                max={1500}
                step={50}
                value={slideMs}
                onChange={setSlideMs}
                format={(v) => `${(v / 1000).toFixed(2)}s`}
              />
            )}

            {/* Sticker controls */}
            {mode === "sticker" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Slider
                      label="Outline"
                      min={0}
                      max={40}
                      value={outline}
                      onChange={setOutline}
                      format={(v) => (v === 0 ? "none" : `${v}px`)}
                    />
                  </div>
                  <label className="flex flex-col items-center gap-1 font-pixel text-xs uppercase tracking-wide text-foreground">
                    Color
                    <input
                      type="color"
                      value={outlineColor}
                      onChange={(e) => setOutlineColor(e.target.value)}
                      className="hud-sm h-9 w-12 cursor-pointer rounded-lg bg-transparent"
                    />
                  </label>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="font-pixel text-xs uppercase tracking-wide text-foreground">
                    Caption (optional)
                  </span>
                  <input
                    type="text"
                    value={caption}
                    maxLength={24}
                    placeholder="e.g. LOL"
                    onChange={(e) => setCaption(e.target.value)}
                    className="hud-sm rounded-lg bg-panel px-3 py-2 font-semibold text-foreground outline-none focus-visible:ring-4 focus-visible:ring-sun"
                  />
                </label>
                <Toggle
                  label="Drop shadow"
                  hint="Adds a soft shadow so the sticker pops"
                  checked={shadow}
                  onChange={setShadow}
                />
              </div>
            )}

            {/* 3D controls — minimal Phase 2: presets, depth strength, motion */}
            {mode === "3d" && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setPreset(p.id);
                        if (p.config.depthStrength !== undefined) setDepthStrength(p.config.depthStrength);
                        if (p.config.motionMode) setMotionMode(p.config.motionMode);
                        if (p.config.foregroundStrength !== undefined) setForegroundStrength(p.config.foregroundStrength);
                        if (p.config.backgroundBlur !== undefined) setBackgroundBlur(p.config.backgroundBlur);
                        if (p.config.edgeFeather !== undefined) setEdgeFeather(p.config.edgeFeather);
                        if (p.config.perspective !== undefined) setPerspective(p.config.perspective);
                        if (p.config.motionSpeed !== undefined) setMotionSpeed(p.config.motionSpeed);
                        if (p.config.shadowStrength !== undefined) setShadowStrength(p.config.shadowStrength);
                        // Do not clear depthGrid — presets are graphics-only, no re-inference needed.
                      }}
                      className={`flex flex-col items-start gap-0.5 rounded-lg border-2 px-2.5 py-2 text-left transition ${
                        preset === p.id ? "border-ink bg-sky text-cloud" : "border-transparent bg-background text-foreground hover:border-ink/25"
                      }`}
                    >
                      <span className="font-pixel text-xs">{p.label}</span>
                      <span className={`text-[11px] leading-tight ${preset === p.id ? "text-cloud/80" : "text-muted"}`}>{p.hint}</span>
                    </button>
                  ))}
                </div>
                <p className="flex items-start gap-2 rounded-xl bg-sky/10 px-3.5 py-2.5 text-xs font-semibold text-sky-deep">
                  <Box className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                  <span>
                    A depth model turns your photo into a 3D scene, and a second model lifts the subject off the background. Move your mouse to look around — the AI runs once, then it&apos;s pure graphics at 60 fps. Nothing leaves your device.
                  </span>
                </p>
                <Slider
                  label="3D strength"
                  min={0}
                  max={1}
                  step={0.05}
                  value={depthStrength}
                  onChange={setDepthStrength}
                  format={(v) => `${Math.round(v * 100)}%`}
                />
                <Slider
                  label="Subject depth"
                  hint="How much more the subject moves vs the background"
                  min={0}
                  max={1}
                  step={0.05}
                  value={foregroundStrength}
                  onChange={setForegroundStrength}
                  format={(v) => `${Math.round(v * 100)}%`}
                />
                <Slider
                  label="Background blur"
                  hint="Softens the backdrop so the subject pops"
                  min={0}
                  max={1}
                  step={0.05}
                  value={backgroundBlur}
                  onChange={setBackgroundBlur}
                  format={(v) => `${Math.round(v * 100)}%`}
                />
                <Slider
                  label="Edge softness"
                  hint="Feathers the subject outline to hide seams"
                  min={0}
                  max={1}
                  step={0.05}
                  value={edgeFeather}
                  onChange={setEdgeFeather}
                  format={(v) => `${Math.round(v * 100)}%`}
                />
                <Slider
                  label="Pop / shadow"
                  hint="Contact shadow under the subject so it lifts off the background"
                  min={0}
                  max={1}
                  step={0.05}
                  value={shadowStrength}
                  onChange={setShadowStrength}
                  format={(v) => `${Math.round(v * 100)}%`}
                />
                <div className="flex flex-col gap-1.5">
                  <span className="font-pixel text-xs uppercase tracking-wide text-foreground">Motion</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(["orbit", "mouse", "auto", "static"] as MotionMode[]).map((mm) => (
                      <button
                        key={mm}
                        onClick={() => setMotionMode(mm)}
                        className={`flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 font-pixel text-xs transition ${
                          motionMode === mm ? "border-ink bg-sky text-cloud" : "border-transparent bg-background text-foreground hover:border-ink/25"
                        }`}
                      >
                        {mm === "orbit" ? <Rotate3d className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden /> : mm === "mouse" ? <MousePointer2 className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden /> : mm === "auto" ? <Layers className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden /> : <Box className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />}
                        {mm === "orbit" ? "Spin" : mm === "mouse" ? "Mouse" : mm === "auto" ? "Float" : "Static"}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-muted">{motionMode === "orbit" ? "Grab and spin the depth (drag to orbit)" : motionMode === "mouse" ? "Camera follows your pointer" : motionMode === "auto" ? "Slow automatic orbit" : "No movement"}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="btn-pixel rounded-xl bg-grass py-3.5 font-pixel text-lg uppercase tracking-wide text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? (
                status || "Working…"
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Play
                    className="h-5 w-5 fill-current"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                  {mode === "gif" ? "Make GIF" : mode === "sticker" ? "Make Sticker" : "Make 3D"}
                </span>
              )}
            </button>

            {busy && (
              <div className="hud-sm h-3 w-full overflow-hidden rounded-full bg-background">
                <div
                  className="h-full bg-gradient-to-r from-sky to-grass transition-all"
                  style={{
                    width:
                      progress === null ? "40%" : `${Math.round(progress * 100)}%`,
                  }}
                />
              </div>
            )}

            {error && (
              <p className="hud-sm rounded-xl bg-petal/15 px-4 py-3 text-sm font-bold text-petal">
                {error}
              </p>
            )}
          </div>
          </div>

        {mode === "3d" && threedGrid && threedImage && (
          <div className="hud popin mt-8 flex flex-col gap-4 rounded-2xl bg-panel p-6">
            <ThreeDPreview
              ref={threedRef}
              image={threedImage}
              depthGrid={threedGrid}
              config={buildSceneConfig()}
              cutout={threedCutout}
            />
            <p className="text-center text-sm font-semibold text-muted">
              Interactive — move your mouse over the scene. The AI ran once; everything else is GPU at 60 fps.{" "}
              {threedCutout ? "The subject floats over a blurred backdrop." : "Depth-only view — segmentation couldn't separate a subject."}
              {motionMode === "static" ? " Try Mouse or Float for movement." : ""}
            </p>
            {threedNote && (
              <p className="hud-sm rounded-xl bg-sun/20 px-4 py-3 text-center text-sm font-bold text-ink">
                {threedNote}
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={exportThreeDGif}
                disabled={busy}
                className="btn-pixel flex items-center gap-2 rounded-xl bg-sky px-4 py-2 font-pixel text-sm text-cloud disabled:opacity-40"
              >
                <Download className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                GIF
              </button>
              <button
                onClick={exportThreeDPng}
                disabled={busy}
                className="btn-pixel flex items-center gap-2 rounded-xl bg-sky px-4 py-2 font-pixel text-sm text-cloud disabled:opacity-40"
              >
                <Download className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                PNG
              </button>
              <button
                onClick={exportThreeDWebm}
                disabled={busy || !webmOk}
                className="btn-pixel flex items-center gap-2 rounded-xl bg-sky px-4 py-2 font-pixel text-sm text-cloud disabled:opacity-40"
              >
                <Download className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                WebM
              </button>
              <button
                onClick={exportThreeDConfig}
                disabled={busy}
                className="btn-pixel flex items-center gap-2 rounded-xl bg-panel px-4 py-2 font-pixel text-sm text-ink ring-2 ring-ink disabled:opacity-40"
              >
                <Download className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                Scene JSON
              </button>
            </div>
            <button
              onClick={handlePublish}
              disabled={busy}
              className="btn-pixel flex w-full items-center justify-center gap-2 rounded-xl bg-grass py-3 font-pixel text-sm uppercase tracking-wide text-ink disabled:opacity-40"
            >
              <Link2 className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              Publish
            </button>

            {published && (
              <div className="flex flex-col gap-3 rounded-xl bg-background p-4">
                <p className="flex items-center gap-1.5 font-pixel text-xs uppercase tracking-wide text-grass">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                  Published
                </p>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 font-pixel text-[10px] uppercase tracking-wide text-muted">Link</span>
                  <input
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/s/${published.id}`}
                    onFocus={(e) => e.currentTarget.select()}
                    className="hud-sm w-full min-w-0 rounded-lg bg-panel px-2.5 py-1.5 text-xs font-semibold text-foreground outline-none"
                  />
                  <button
                    onClick={() => copyText(`${window.location.origin}/s/${published.id}`, "url")}
                    className="btn-pixel flex shrink-0 items-center gap-1 rounded-lg bg-sky px-2.5 py-1.5 font-pixel text-[10px] text-cloud"
                  >
                    {copied === "url" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied === "url" ? "Done" : "Copy"}
                  </button>
                </div>
                <div className="relative">
                  <pre className="hud-sm overflow-x-auto rounded-lg bg-panel p-2.5 text-[11px] leading-relaxed text-foreground">
                    <code>{`<iframe src="${window.location.origin}/embed/${published.id}" style="width:100%;height:500px;border:0" loading="lazy"></iframe>`}</code>
                  </pre>
                  <button
                    onClick={() =>
                      copyText(
                        `<iframe src="${window.location.origin}/embed/${published.id}" style="width:100%;height:500px;border:0" loading="lazy"></iframe>`,
                        "code",
                      )
                    }
                    className="btn-pixel absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-sky px-2 py-1 font-pixel text-[10px] text-cloud"
                  >
                    {copied === "code" ? <Check className="h-3 w-3" /> : <Code className="h-3 w-3" />}
                    {copied === "code" ? "Done" : "Copy"}
                  </button>
                </div>
                <p className="text-center text-[11px] font-semibold text-muted">
                  Stored locally in your browser for now — a server-backed store can be added without changing anything else.
                </p>
              </div>
            )}
            <p className="text-center font-pixel text-[11px] uppercase tracking-wide text-muted">Generated locally. Nothing leaves your device until you publish.</p>
          </div>
        )}

        {result && (
          <div className="hud popin mt-8 flex flex-col items-center gap-5 rounded-2xl bg-panel p-6">
            <div
              className={`flex items-center justify-center rounded-xl p-4 ${
                result.transparent ? "checkerboard" : "bg-background"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.preview}
                alt="Your result"
                className="max-h-72 w-auto rounded-lg"
              />
            </div>
            <p className="text-center text-sm font-semibold text-muted">
              {result.note}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {result.files.map((f) => (
                <button
                  key={f.url}
                  onClick={() =>
                    downloadBlob(
                      f.blob,
                      f.label.includes("WebP")
                        ? "sticker.webp"
                        : f.label.includes("PNG")
                          ? "sticker.png"
                          : result.kind === "gif"
                            ? "animation.gif"
                            : "download",
                    )
                  }
                  className="btn-pixel flex items-center gap-2 rounded-xl bg-sky px-5 py-2.5 font-pixel text-sm text-cloud"
                >
                  <Download className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                  {f.label}
                </button>
              ))}
            </div>
            {result.kind === "sticker" && result.sticker && (
              <ImportGuide png={result.sticker.png} webp={result.sticker.webp} />
            )}
          </div>
        )}
      </section>

      <footer className="mt-auto border-t-[3px] border-ink bg-panel py-5 text-center font-pixel text-xs uppercase tracking-wide text-muted">
        Made in your browser · no uploads, no accounts
      </footer>
    </main>
  );
}

function Slider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  format,
  hint,
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex justify-between font-pixel text-xs uppercase tracking-wide text-foreground">
        {label}
        <span className="tabular-nums text-muted">{format(value)}</span>
      </span>
      {hint && <span className="-mt-1 text-xs text-muted">{hint}</span>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-sky"
      />
    </label>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 text-left"
    >
      <span className="flex flex-col">
        <span className="font-pixel text-xs uppercase tracking-wide text-foreground">
          {label}
        </span>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </span>
      <span
        className={`hud-sm relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-sky" : "bg-background"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full border-2 border-ink bg-cloud transition-all ${
            checked ? "left-[1.4rem]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

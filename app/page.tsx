"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Source, Uploader } from "@/components/Uploader";
import { ImportGuide } from "@/components/ImportGuide";
import dynamic from "next/dynamic";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { AccountMenu } from "@/components/AccountMenu";
import { Wordmark } from "@/components/Wordmark";
import { GalleryStrip } from "@/components/GalleryGrid";
import { LiveScenes } from "@/components/LiveScenes";
import { PlanCards } from "@/components/PlanCards";
import { GALLERY_COUNT } from "@/lib/gallery";
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
// Quoted in the hero badges so the landing page can't drift from /pricing.
import { FREE_GENERATION_LIMIT, PLAN_DISPLAY } from "@/lib/billing/plans";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import {
  generationsRemaining,
  getUsage,
  refreshUsage,
  QuotaExhaustedError,
  SignInRequiredError,
} from "@/lib/depth-split/client";
import { downloadBlob, toStickerWebp } from "@/lib/export";
import type { MotionMode, SceneConfig } from "@/lib/rendering/types";
import { PRESETS, presetConfig, type PresetId } from "@/lib/rendering/presets";
import { refineDepthGrid } from "@/lib/rendering/refine";
import { analyzeSubject, subjectAdvice } from "@/lib/rendering/subject-fit";
import type { ThreeDPreviewHandle } from "@/components/ThreeDPreview";

// Lightning geometry for the cinema section, in a 1000x500 viewBox scaled
// with "slice" so nothing is stretched — the centre of the box stays the
// centre of the frame, which is where both bolts land: (500, 250), on the
// subject. They enter from above rather than side-on; a bolt that travels
// horizontally in a straight-ish line reads as a laser, not weather. Many
// short segments with alternating overshoot is what makes it look struck.
const BOLT_LEFT =
  "M120 -30 L168 62 L138 88 L214 150 L182 168 L262 214 L236 230 L318 250 L300 264 L392 256 L376 268 L470 252 L500 250";
const BOLT_LEFT_FORKS =
  "M214 150 L160 198 M318 250 L296 322 M392 256 L436 208";
const BOLT_RIGHT =
  "M880 -30 L836 70 L866 96 L790 152 L822 172 L742 216 L768 232 L688 252 L706 266 L614 258 L630 270 L534 254 L500 250";
const BOLT_RIGHT_FORKS =
  "M790 152 L844 202 M688 252 L710 324 M614 258 L572 212";

const ThreeDPreview = dynamic(() => import("@/components/ThreeDPreview").then((m) => m.ThreeDPreview), {
  ssr: false,
  loading: () => <div className="hud-sm flex h-[360px] w-full items-center justify-center rounded-xl bg-background text-sm font-semibold text-muted">Loading 3D engine…</div>,
});
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowDownUp,
  ArrowRight,
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
import type { PublishResult } from "@/lib/publish/types";
import { embedOrigin } from "@/lib/site-url";

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
  // Opens in 3D: it's the product being sold, and the app's default state is
  // the loudest positioning signal on the page. GIF/sticker stay one click away.
  const [mode, setMode] = useState<Mode>("3d");
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
  // Soft, non-blocking quality heads-ups (low-res source, subject framing).
  // A list, not one string: these are independent findings and concatenating
  // them produced a six-line wall of text that read as nagging.
  const [threedNotes, setThreedNotes] = useState<string[]>([]);
  const [depthStrength, setDepthStrength] = useState(DEFAULT_3D.depthStrength ?? 0.5);
  const [motionMode, setMotionMode] = useState<MotionMode>(DEFAULT_3D.motionMode ?? "mouse");
  const [foregroundStrength, setForegroundStrength] = useState(DEFAULT_3D.foregroundStrength ?? 0.7);
  const [backgroundBlur, setBackgroundBlur] = useState(DEFAULT_3D.backgroundBlur ?? 0.15);
  const [edgeFeather, setEdgeFeather] = useState(DEFAULT_3D.edgeFeather ?? 0.4);
  const [perspective, setPerspective] = useState(DEFAULT_3D.perspective ?? 0.6);
  const [motionSpeed, setMotionSpeed] = useState(DEFAULT_3D.motionSpeed ?? 0.2);
  const [shadowStrength, setShadowStrength] = useState(DEFAULT_3D.shadowStrength ?? 0.35);
  const [preset, setPreset] = useState<PresetId>(DEFAULT_PRESET_ID);
  // Publish the subject alone on transparency so the embed composites onto the
  // host page. Off by default: it needs a clean matte, and most photos read
  // better with their backdrop.
  const [subjectOnly, setSubjectOnly] = useState(false);

  // The whole publish outcome, not just the record: a scene that only reached
  // IndexedDB must not be offered a share link or embed code.
  const [published, setPublished] = useState<PublishResult | null>(null);
  // Pop-out framing: show the whole backdrop with room around it so the lifted
  // subject crosses its edge, instead of looking through an over-filled window.
  //
  // ON by default for new scenes. Window framing crops the photo to fill the
  // frame, which quietly slices whatever runs to the edge — the reason a
  // product shot came out with the tops of the cans cut off. It only applies
  // when there is a subject to lift (buildSceneConfig enforces that), and it
  // does NOT change the renderer's default: a manifest with no `framing` field
  // still means "window", so every already-published scene is untouched.
  const [popout, setPopout] = useState(true);
  // Free 3D generations left after the most recent claim; null = unlimited (Pro)
  // or not yet known.
  const [generationsLeft, setGenerationsLeft] = useState<number | null>(null);
  const [copied, setCopied] = useState<"url" | "code" | null>(null);

  const threedRef = useRef<ThreeDPreviewHandle>(null);

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Shown instead of an error when a free account is out of 3D generations:
  // the red sentence it replaced named the limit but offered no way past it.
  const [upgradeOpen, setUpgradeOpen] = useState(false);
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
    setThreedNotes([]);
    setSubjectOnly(false);
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
        //
        // Metered. GIFs and stickers skip this entirely (unmetered, no
        // account). This preflight only saves wasted work — the real gate is
        // inside the depth call below, which the client cannot complete on its
        // own (see lib/depth-split/client.ts).
        const pre = await preflight3D();
        if (!pre.ok) {
          if (pre.reason === "sign-in") {
            // Full navigation: a fresh load guarantees the session is in place
            // when they come back, same as the publish path.
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.assign("/login?next=/");
            return;
          }
          setUpgradeOpen(true);
          setBusy(false);
          setStatus("");
          setProgress(null);
          return;
        }
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
        setThreedNotes(
          longEdge < 640
            ? [
                `Small source (${img.naturalWidth}×${img.naturalHeight}px) — depth has less detail to work with, so expect a softer result. ~640px on the long edge or more reads crisper.`,
              ]
            : [],
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
        // Pre-flight: warn BEFORE the depth pass, while the user is still
        // watching, if this photo's framing will smear when the scene tilts.
        // Cheap (one downscaled alpha pass) and non-blocking — the scene still
        // renders, the user just learns why it looks the way it does and what
        // to shoot differently. Appended to any low-res note from earlier.
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
          depthWorkingSize(), // crisper relief on capable devices; 518 elsewhere
        );
        // eslint-disable-next-line react-hooks/purity
        const t3 = performance.now();
        // The depth call reports what the server charged us (null on Pro, which
        // runs the head locally and is unlimited).
        setGenerationsLeft(generationsRemaining());
        refreshUsage(); // next preflight reads the new count
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
      // The depth head is the authoritative quota gate, so a refusal can arrive
      // mid-generation (after the local encoder has already run).
      if (e instanceof SignInRequiredError) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/login?next=/");
        return;
      }
      if (e instanceof QuotaExhaustedError) {
        refreshUsage(); // the server just told us we're out; drop the cached count
        setGenerationsLeft(0);
        // Same wall as the preflight, reached the other way: the head route
        // refuses mid-generation when the preflight was bypassed or stale.
        setUpgradeOpen(true);
        return;
      }
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
    // Only meaningful with a subject to isolate; never persist it otherwise or
    // the published scene renders empty.
    subjectOnly: subjectOnly && !!threedCutout,
    // Same rule: with no subject there is nothing to pop out of the frame, and
    // "window" is the default so older scenes are unaffected.
    framing: popout && !!threedCutout ? "popout" : "window",
  });

  /**
   * Read-only preflight so we can refuse before spending ~1s of the user's CPU
   * on the encoder. It is deliberately NOT the enforcement point — the depth
   * head route is, because that is the request a client cannot skip (a free
   * account's browser has no head weights, so it cannot finish alone). If this
   * check is bypassed or fails, the head route still refuses.
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

  const canGenerate = !busy && sources.length >= (multiple ? 2 : 1);

  return (
    <main className="flex flex-1 flex-col">
      <UpgradeDialog open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />

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

        {/* Nav. The section scrims above fade out to the right to reveal the
            tree art — which is exactly where these links sit, so the nav
            carries its own top-down scrim. */}
        <nav className="nav-scrim absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 px-5 py-4 sm:px-8">
          <Wordmark href="#top" />
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hidden on phones alongside "How it works" — the bar fits the
                wordmark, sign-in and the CTA and no more. Both routes stay
                reachable from the sections below and the footer. */}
            <Link
              href="/gallery"
              className="hero-text hidden font-pixel text-sm text-cloud hover:text-sun sm:block"
            >
              Gallery
            </Link>
            <a
              href="#how"
              className="hero-text hidden font-pixel text-sm text-cloud hover:text-sun sm:block"
            >
              How it works
            </a>
            <button
              onClick={goToWorkshop}
              className="btn-pixel order-1 flex items-center gap-1.5 rounded-full bg-sky px-4 py-2 font-pixel text-sm text-cloud"
            >
              Start
              <ArrowDown className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </button>
            {/* Same two links as above, for the phone hamburger — the inline
                copies are hidden below sm. */}
            <AccountMenu
              links={[
                { href: "/gallery", label: "Gallery" },
                { href: "#how", label: "How it works" },
              ]}
            />
          </div>
        </nav>

        {/* Hero content */}
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-5 pb-16 pt-28 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-xl">
            <p className="font-pixel text-xs uppercase tracking-[0.2em] text-sun drop-shadow-[1px_1px_0_var(--ink)]">
              For portfolios, product pages & hero sections
            </p>
            <h1 className="mt-3 font-pixel text-4xl leading-[1.08] text-cloud drop-shadow-[3px_3px_0_var(--ink)] sm:text-5xl md:text-6xl">
              Turn any photo into a{" "}
              <span className="text-sun">live 3D photo</span> you can{" "}
              <span className="text-sky">embed anywhere</span>.
            </h1>
            <p className="mt-4 max-w-md text-base font-semibold text-cloud/95 drop-shadow-[1px_1px_0_rgba(4,16,29,0.9)] sm:text-lg">
              Upload one image. Gifsy gives it real depth right here in your
              browser, then hands you an embed you can paste into Webflow,
              Framer or any site. GIFs and stickers are always free, no account.
            </p>

            {/* Controls: mode + (for GIF) sub-mode — one compact, light row */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <div className="hud-sm inline-flex gap-0.5 rounded-lg bg-cloud/95 p-0.5">
                {(["3d", "gif", "sticker"] as Mode[]).map((m) => (
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
              {[
                { figure: String(FREE_GENERATION_LIMIT), rest: "free 3D generations" },
                { figure: null, rest: "GIFs & stickers always free" },
                { figure: PLAN_DISPLAY.pro.price, rest: "once for unlimited 3D" },
              ].map(({ figure, rest }) => (
                <span key={rest} className="flex items-center gap-1">
                  <Check
                    className="h-3.5 w-3.5 text-grass"
                    strokeWidth={3}
                    aria-hidden
                  />
                  {/* Digits get .num — the pixel face draws "$29" as "$89". */}
                  {figure ? <span className="num normal-case">{figure}</span> : null}
                  {rest}
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

      {/* ────────────────────── LIVE DEMO SCENES ───────────────────── */}
      {/* Real, draggable scenes — not recordings. These render from pre-baked
          image+depth pairs, so they need no AI model and no upload: a visitor
          can feel the product seconds after landing, which is the moment the
          funnel used to lose them. */}
      <section className="border-t-[3px] border-ink bg-panel">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="mb-9 max-w-2xl">
            <p className="font-pixel text-xs uppercase tracking-[0.2em] text-sky-deep">
              Live, right here
            </p>
            <h2 className="mt-2 font-pixel text-2xl text-foreground sm:text-3xl">
              Real depth. Drag one and see.
            </h2>
            <p className="mt-2 text-sm text-muted sm:text-base">
              Not videos — these are rendering in your browser right now, the
              same thing you get from your own photo. Tilt one and the layers
              pull apart. Nothing to install, and nothing uploaded — making your
              own 3D scene just needs a free account.
            </p>
          </div>
          <LiveScenes />
        </div>
      </section>

      {/* ───────────────────── EMBEDDED SCENE ─────────────────────── */}
      {/* The one stretch of the page where a visitor watches instead of clicks,
          so it's staged like a screening: full-bleed, near-black, lit only by
          the spill off the frame and by the strikes. Every overlay in here is
          pointer-events-none — the scene itself still has to be draggable. */}
      <section className="cinema-room relative overflow-hidden border-y-[3px] border-ink">
        {/* Projector beam falling from above the screen. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-64 w-[140%] -translate-x-1/2 bg-[radial-gradient(50%_100%_at_50%_0%,rgba(190,225,255,0.16),rgba(190,225,255,0))]"
        />

        <div className="relative py-10 sm:py-16">
          <div className="mx-auto mb-6 max-w-6xl px-5 text-center sm:mb-9 sm:px-8">
            <p className="font-pixel text-xs uppercase tracking-[0.35em] text-sky">
              Now showing
            </p>
            <h2 className="mt-3 font-pixel text-2xl text-cloud drop-shadow-[0_2px_18px_rgba(46,155,240,0.45)] sm:text-4xl">
              One photo. Shot in three dimensions.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-cloud/60 sm:text-base">
              Live in the frame below — drag it. This is an embed, the same
              snippet you can paste into your own site.
            </p>
          </div>

          {/* Held to a 5xl stage rather than run edge to edge: the embed keeps
              the subject centred at its own scale, so every extra pixel of
              width is just more empty black either side of him. */}
          <div className="cinema-spill relative mx-auto w-full max-w-5xl px-4 sm:px-8">
            <div className="relative z-10 h-[52vh] min-h-[320px] w-full overflow-hidden border-[3px] border-ink bg-black sm:h-[clamp(420px,68vh,760px)] shadow-[0_0_90px_rgba(46,155,240,0.22)]">
              {/* Oversized on purpose. The embed sizes its subject to its own
                  viewport, and cross-origin we cannot zoom it — so we give the
                  iframe a box a bit over twice the size of the window it shows
                  through and centre it. The cut-out lands correspondingly
                  bigger; all that gets cropped is black margin. On a phone the
                  frame is already narrow enough to fill, so it stays 1:1 —
                  zooming there pushes him off both edges. */}
              <iframe
                src="https://www.gifsy.fun/embed/d41ee2f645"
                title="A 3D scene made with Gifsy"
                loading="lazy"
                className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 border-0 sm:h-[210%] sm:w-[210%]"
              />

              {/* ── Lightning ─────────────────────────────────────────────
                  Both bolts terminate on the subject at the centre of the
                  viewBox, so the strike reads as hitting him rather than
                  flickering off in the wings. Fitted, not cropped, so a narrow
                  phone frame still shows both bolts whole instead of just the
                  last few centimetres of each. Stroke widths are non-scaling,
                  so the bolt stays hairline at any frame size. */}
              <svg
                aria-hidden
                viewBox="0 0 1000 500"
                preserveAspectRatio="xMidYMid meet"
                className="bolt pointer-events-none absolute inset-0 z-30 h-full w-full"
                style={{ ["--bolt-cycle" as string]: "8s" }}
              >
                <g
                  fill="none"
                  stroke="#eaf6ff"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={BOLT_LEFT} strokeWidth="7" opacity="0.22" vectorEffect="non-scaling-stroke" />
                  <path d={BOLT_LEFT} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  <path d={BOLT_LEFT_FORKS} strokeWidth="1.25" opacity="0.75" vectorEffect="non-scaling-stroke" />
                </g>
              </svg>

              <svg
                aria-hidden
                viewBox="0 0 1000 500"
                preserveAspectRatio="xMidYMid meet"
                className="bolt pointer-events-none absolute inset-0 z-30 h-full w-full"
                style={{
                  ["--bolt-cycle" as string]: "6.4s",
                  ["--bolt-delay" as string]: "2.3s",
                }}
              >
                <g
                  fill="none"
                  stroke="#fff0f6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={BOLT_RIGHT} strokeWidth="7" opacity="0.2" vectorEffect="non-scaling-stroke" />
                  <path d={BOLT_RIGHT} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  <path d={BOLT_RIGHT_FORKS} strokeWidth="1.25" opacity="0.75" vectorEffect="non-scaling-stroke" />
                </g>
              </svg>

              {/* Impact bloom where the bolts land, plus the room lighting up
                  from that side. Screen-blended so it brightens the subject
                  instead of fogging a grey rectangle over him. */}
              <div
                aria-hidden
                className="bolt-flash pointer-events-none absolute left-1/2 top-1/2 z-20 h-[55%] w-[38%] -translate-x-1/2 -translate-y-1/2 mix-blend-screen bg-[radial-gradient(50%_50%_at_50%_50%,rgba(214,238,255,0.85),rgba(140,200,255,0.25)_45%,rgba(140,200,255,0))]"
                style={{ ["--bolt-cycle" as string]: "8s" }}
              />
              <div
                aria-hidden
                className="bolt-flash pointer-events-none absolute inset-y-0 left-0 z-20 w-2/3 mix-blend-screen bg-[radial-gradient(55%_65%_at_0%_40%,rgba(150,205,255,0.35),rgba(150,205,255,0))]"
                style={{ ["--bolt-cycle" as string]: "8s" }}
              />
              <div
                aria-hidden
                className="bolt-flash pointer-events-none absolute inset-y-0 right-0 z-20 w-2/3 mix-blend-screen bg-[radial-gradient(55%_65%_at_100%_55%,rgba(255,185,215,0.3),rgba(255,185,215,0))]"
                style={{
                  ["--bolt-cycle" as string]: "6.4s",
                  ["--bolt-delay" as string]: "2.3s",
                }}
              />

              {/* Film treatment over the top — never intercepting a drag. */}
              <div
                aria-hidden
                className="cinema-vignette pointer-events-none absolute inset-0 z-40"
              />
              <div
                aria-hidden
                className="cinema-grain pointer-events-none absolute -inset-8 z-40"
              />

              {/* Letterbox bars, thin enough to frame without cropping. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 z-40 h-6 bg-gradient-to-b from-black/85 to-transparent sm:h-10"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-6 bg-gradient-to-t from-black/85 to-transparent sm:h-10"
              />

              {/* Framing marks, the way a viewfinder brackets a shot. */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-4 top-4 z-50 h-7 w-7 border-l-2 border-t-2 border-cloud/40 sm:left-7 sm:top-7 sm:h-10 sm:w-10"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute right-4 top-4 z-50 h-7 w-7 border-r-2 border-t-2 border-cloud/40 sm:right-7 sm:top-7 sm:h-10 sm:w-10"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute bottom-4 left-4 z-50 h-7 w-7 border-b-2 border-l-2 border-cloud/40 sm:bottom-7 sm:left-7 sm:h-10 sm:w-10"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute bottom-4 right-4 z-50 h-7 w-7 border-b-2 border-r-2 border-cloud/40 sm:bottom-7 sm:right-7 sm:h-10 sm:w-10"
              />

              {/* Slate line, like a burned-in timecode. */}
              <p
                aria-hidden
                className="pointer-events-none absolute bottom-5 left-1/2 z-50 -translate-x-1/2 font-pixel text-[10px] uppercase tracking-[0.3em] text-cloud/50 sm:bottom-8 sm:text-xs"
              >
                Drag to look around
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────── SHOWCASE ────────────────────────── */}
      {/* Directly under the hero on purpose: a first-time visitor should see
          the 3D effect working on real photos BEFORE being asked for one of
          their own. These are recorded clips, so this costs no model download —
          and each card only fetches its video once it scrolls into view. */}
      <section className="border-t-[3px] border-ink bg-background">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-pixel text-xs uppercase tracking-[0.2em] text-sky-deep">
                Made with Gifsy
              </p>
              <h2 className="mt-2 font-pixel text-2xl text-foreground sm:text-3xl">
                Every one of these was a flat photo.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
                One image in, real depth out — no modeling, no plugins. Hit play
                on any of them, then drop in your own.
              </p>
            </div>
            <Link
              href="/gallery"
              className="hidden shrink-0 items-center gap-1.5 font-pixel text-sm text-sky-deep hover:text-sky sm:flex"
            >
              All {GALLERY_COUNT} scenes
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </Link>
          </div>

          <div className="mt-7">
            <GalleryStrip />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={goToWorkshop}
              className="btn-pixel inline-flex items-center gap-2 rounded-full bg-sky px-6 py-3 font-pixel text-base text-cloud"
            >
              Try it with your photo
              <ArrowDown className="h-5 w-5" strokeWidth={2.5} aria-hidden />
            </button>
            <Link
              href="/gallery"
              className="font-pixel text-sm text-sky-deep hover:text-sky sm:hidden"
            >
              See all {GALLERY_COUNT} scenes →
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── STEPS ─────────────────────────── */}
      <section id="how" className="border-y-[3px] border-ink bg-panel">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 px-5 py-8 sm:grid-cols-3 sm:px-8">
          {[
            [
              "1",
              "Upload",
              "Drop in a photo. Depth and cut-out run in your browser — your photo is never uploaded. 3D needs a free account.",
            ],
            [
              "2",
              "Customize",
              "Pick 3D, GIF or sticker, then tune the depth and motion live.",
            ],
            [
              "3",
              "Publish",
              "Paste the 3D embed into any site — or download the GIF or sticker.",
            ],
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
                    A depth model turns your photo into a 3D scene, and a second model lifts the subject off the background. Move your mouse to look around — the AI runs once, then it&apos;s pure graphics at 60 fps. 3D needs a free account; your photo stays on your device, and Pro runs the whole model locally.
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
                <Toggle
                  label="Pop out of the frame"
                  hint={
                    threedCutout
                      ? "Shows the whole photo with room around it, so the subject lifts past its edge instead of being cropped by a rectangle"
                      : "Needs a subject — this photo's background couldn't be separated"
                  }
                  checked={popout && !!threedCutout}
                  onChange={setPopout}
                  disabled={!threedCutout}
                />
                <Toggle
                  label="Cut out the background"
                  hint={
                    threedCutout
                      ? "Publishes the subject alone on a transparent background, so the embed sits on your page's own colour instead of in a box"
                      : "Needs a subject — this photo's background couldn't be separated"
                  }
                  checked={subjectOnly && !!threedCutout}
                  onChange={setSubjectOnly}
                  disabled={!threedCutout}
                />
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
              {!threedCutout
                ? "Depth-only view — segmentation couldn't separate a subject."
                : subjectOnly
                  ? "Background removed — the subject will sit on whatever colour your page has."
                  : "The subject floats over a blurred backdrop."}
              {motionMode === "static" ? " Try Mouse or Float for movement." : ""}
            </p>
            {threedNotes.length > 0 && (
              // bg-sun/20 with text-ink put dark text on a dark panel — legible
              // in the light theme, muddy in the dark one. A left-aligned list
              // on the page ground with a sun-coloured icon reads in both.
              <ul className="hud-sm flex flex-col gap-2 rounded-xl bg-background px-4 py-3">
                {threedNotes.map((note) => (
                  <li key={note} className="flex items-start gap-2 text-left text-xs leading-relaxed text-muted">
                    <AlertTriangle
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sun"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
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

            {published?.persistence === "local" && (
              <div className="flex flex-col gap-2 rounded-xl bg-background p-4">
                <p className="flex items-center gap-1.5 font-pixel text-xs uppercase tracking-wide text-sun">
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
              <div className="flex flex-col gap-3 rounded-xl bg-background p-4">
                <p className="flex items-center gap-1.5 font-pixel text-xs uppercase tracking-wide text-grass">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                  Published
                </p>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 font-pixel text-[10px] uppercase tracking-wide text-muted">Link</span>
                  <input
                    readOnly
                    value={`${embedOrigin()}/s/${published.record.id}`}
                    onFocus={(e) => e.currentTarget.select()}
                    className="hud-sm w-full min-w-0 rounded-lg bg-panel px-2.5 py-1.5 text-xs font-semibold text-foreground outline-none"
                  />
                  <button
                    onClick={() => copyText(`${embedOrigin()}/s/${published.record.id}`, "url")}
                    className="btn-pixel flex shrink-0 items-center gap-1 rounded-lg bg-sky px-2.5 py-1.5 font-pixel text-[10px] text-cloud"
                  >
                    {copied === "url" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied === "url" ? "Done" : "Copy"}
                  </button>
                </div>
                <div className="relative">
                  <pre className="hud-sm overflow-x-auto rounded-lg bg-panel p-2.5 text-[11px] leading-relaxed text-foreground">
                    <code>{`<iframe src="${embedOrigin()}/embed/${published.record.id}" style="width:100%;height:500px;border:0" loading="lazy"></iframe>`}</code>
                  </pre>
                  <button
                    onClick={() =>
                      copyText(
                        `<iframe src="${embedOrigin()}/embed/${published.record.id}" style="width:100%;height:500px;border:0" loading="lazy"></iframe>`,
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
                  Live on any device — it&apos;s in <a href="/scenes" className="underline hover:text-foreground">My scenes</a>.
                </p>
              </div>
            )}
            <p className="text-center font-pixel text-[11px] uppercase tracking-wide text-muted">
              {generationsLeft === null
                ? "Rendered on your device. Your photo never leaves it."
                : `${generationsLeft} free 3D generation${generationsLeft === 1 ? "" : "s"} left`}
            </p>
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

      {/* ─────────────────────────── PLANS ─────────────────────────── */}
      {/* Directly under the workshop on purpose: someone who has just made a
          scene — and watched the "N free 3D generations left" counter — is at
          the moment where the price is a real question. Same <PlanCards /> the
          /pricing page renders, so the two can never disagree. */}
      <section id="plans" className="scroll-mt-4 border-t-[3px] border-ink bg-panel">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto mb-9 max-w-2xl text-center">
            <p className="font-pixel text-xs uppercase tracking-[0.2em] text-sky-deep">
              Plans
            </p>
            <h2 className="mt-2 font-pixel text-2xl text-foreground sm:text-3xl">
              Keep going for {PLAN_DISPLAY.pro.price}, once.
            </h2>
            <p className="mt-2 text-sm text-muted sm:text-base">
              GIFs and stickers stay free and unlimited, no account needed. Pro
              lifts the {FREE_GENERATION_LIMIT}-generation limit on 3D, drops the
              badge, and runs the whole model on your own device.
            </p>
          </div>
          <PlanCards next="/#plans" freeHref="#make" />
        </div>
      </section>

      <footer className="mt-auto border-t-[3px] border-ink bg-panel py-5 text-center font-pixel text-xs uppercase tracking-wide text-muted">
        <p>Made in your browser · your photo never leaves your device</p>
        <nav className="mt-2 flex flex-wrap items-center justify-center gap-4">
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/gallery" className="hover:text-foreground">
            Gallery
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/refund" className="hover:text-foreground">
            Refunds
          </Link>
        </nav>
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
  disabled = false,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 text-left disabled:cursor-not-allowed disabled:opacity-50"
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

"use client";

// The GIF creation flow, extracted out of the homepage into its own page —
// same reasoning as CreateWorkshop for 3D: picking a photo should navigate
// somewhere, not auto-scroll the same page down to a "workshop" section.

import { useCallback, useState } from "react";
import {
  Activity,
  ArrowDownUp,
  Clapperboard,
  Download,
  Images,
  type LucideIcon,
  Play,
  RotateCw,
  Tv,
  Vibrate,
  ZoomIn,
} from "lucide-react";
import { Source, Uploader } from "@/components/Uploader";
import { Slider, Toggle } from "@/components/FormControls";
import { loadImage } from "@/lib/image";
import { GIF_EFFECTS, GifEffect, makeAnimatedGif, makeSlideshowGif } from "@/lib/gif";
import { downloadBlob } from "@/lib/export";
import { takePendingUpload } from "@/lib/pending-upload";

const EFFECT_ICON: Record<GifEffect, LucideIcon> = {
  zoom: ZoomIn,
  bounce: ArrowDownUp,
  shake: Vibrate,
  pulse: Activity,
  spin: RotateCw,
  glitch: Tv,
};

type GifMode = "animate" | "combine";

interface ResultFile {
  blob: Blob;
  url: string;
  label: string;
}

interface Result {
  preview: string;
  note: string;
  files: ResultFile[];
}

export function GifWorkshop({ initialGifMode }: { initialGifMode: GifMode }) {
  const [gifMode, setGifMode] = useState<GifMode>(initialGifMode);
  // Lazy initializer: picks up photo(s) handed off from the homepage's hero
  // uploader on first render — combine mode may have handed off several. A
  // direct visit to /tools/gif with nothing pending just falls through to the
  // empty Uploader below.
  const [sources, setSources] = useState<Source[]>(() => {
    const files = takePendingUpload();
    if (!files || files.length === 0) return [];
    const kept = initialGifMode === "combine" ? files : files.slice(0, 1);
    return kept.map((file) => ({ file, url: URL.createObjectURL(file) }));
  });

  const [effect, setEffect] = useState<GifEffect>("zoom");
  const [fps, setFps] = useState(20);
  const [slideMs, setSlideMs] = useState(600);
  const [boomerang, setBoomerang] = useState(true);

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const multiple = gifMode === "combine";

  const resetResult = useCallback(() => {
    setResult((prev) => {
      prev?.files.forEach((f) => URL.revokeObjectURL(f.url));
      return null;
    });
    setError(null);
  }, []);

  const addFiles = useCallback(
    (files: File[]) => {
      resetResult();
      const next = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
      setSources((prev) => (multiple ? [...prev, ...next] : next.slice(0, 1)));
    },
    [multiple, resetResult],
  );

  const removeFile = useCallback((index: number) => {
    setSources((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return copy;
    });
  }, []);

  const clearFiles = useCallback(() => {
    setSources((prev) => {
      prev.forEach((s) => URL.revokeObjectURL(s.url));
      return [];
    });
    resetResult();
  }, [resetResult]);

  const switchGifMode = (next: GifMode) => {
    if (next === gifMode) return;
    setGifMode(next);
    resetResult();
    // animate is single-image; trim excess if switching in.
    if (next === "animate") setSources((p) => p.slice(0, 1));
  };

  async function handleGenerate() {
    resetResult();
    if (sources.length === 0) {
      setError("Add a photo first.");
      return;
    }
    setBusy(true);
    setProgress(null);
    try {
      if (gifMode === "animate") {
        setStatus("Rendering frames…");
        const img = await loadImage(sources[0].file);
        const blob = await makeAnimatedGif(img, effect, {
          fps,
          boomerang,
          onProgress: setProgress,
        });
        finish(blob);
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
        finish(blob);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try another image.");
    } finally {
      setBusy(false);
      setStatus("");
      setProgress(null);
    }
  }

  function finish(blob: Blob) {
    const url = URL.createObjectURL(blob);
    setResult({
      preview: url,
      note: "Send it anywhere — GIFs animate in Telegram, Discord, iMessage and more.",
      files: [{ blob, url, label: "Download GIF" }],
    });
  }

  const canGenerate = !busy && sources.length >= (multiple ? 2 : 1);

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="card rounded-2xl bg-panel p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-editorial text-3xl text-foreground">Make your GIF</h1>
          <div className="inline-flex gap-0.5 rounded-full bg-ink/[0.06] p-0.5">
            {(
              [
                { gm: "animate", label: "Animate one", Icon: Clapperboard },
                { gm: "combine", label: "Combine several", Icon: Images },
              ] as { gm: GifMode; label: string; Icon: LucideIcon }[]
            ).map(({ gm, label, Icon }) => (
              <button
                key={gm}
                onClick={() => switchGifMode(gm)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-xs transition ${
                  gifMode === gm
                    ? "bg-white text-ink shadow-sm"
                    : "text-ink/55 hover:text-ink"
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <Uploader
            multiple={multiple}
            sources={sources}
            onAdd={addFiles}
            onRemove={removeFile}
            onClear={clearFiles}
          />
        </div>

        {sources.length === 0 && (
          <p className="mt-3 rounded-xl bg-sky/10 px-4 py-3 text-sm font-semibold text-sky-deep">
            ↑ Add a photo to begin.
          </p>
        )}

        <div className="mt-5 flex flex-col gap-6">
          {gifMode === "animate" && (
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
                          : "border-transparent bg-surface text-foreground hover:border-ink/25"
                      }`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                      <span className="font-display">{e.label}</span>
                    </button>
                  );
                })}
              </div>
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

          {gifMode === "combine" && (
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

          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="btn rounded-xl bg-grass py-3.5 font-display text-lg uppercase tracking-wide text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? (
              status || "Working…"
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Play className="h-5 w-5 fill-current" strokeWidth={2.5} aria-hidden />
                Make GIF
              </span>
            )}
          </button>

          {busy && (
            <div className="card-sm h-3 w-full overflow-hidden rounded-full bg-surface">
              <div
                className="h-full bg-gradient-to-r from-sky to-grass transition-all"
                style={{
                  width: progress === null ? "40%" : `${Math.round(progress * 100)}%`,
                }}
              />
            </div>
          )}

          {error && (
            <p className="card-sm rounded-xl bg-petal/15 px-4 py-3 text-sm font-bold text-petal">
              {error}
            </p>
          )}
        </div>
      </div>

      {result && (
        <div className="card popin mt-8 flex flex-col items-center gap-5 rounded-2xl bg-panel p-6">
          <div className="flex items-center justify-center rounded-xl bg-surface p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result.preview} alt="Your GIF" className="max-h-72 w-auto rounded-lg" />
          </div>
          <p className="text-center text-sm font-semibold text-muted">{result.note}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {result.files.map((f) => (
              <button
                key={f.url}
                onClick={() => downloadBlob(f.blob, "animation.gif")}
                className="btn flex items-center gap-2 rounded-xl bg-sky px-5 py-2.5 font-display text-sm text-cloud"
              >
                <Download className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

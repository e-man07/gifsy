"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Source, Uploader } from "@/components/Uploader";
import { ImportGuide } from "@/components/ImportGuide";
import { loadImage } from "@/lib/image";
import {
  GIF_EFFECTS,
  GifEffect,
  makeAnimatedGif,
  makeDepthGif,
  makeSlideshowGif,
} from "@/lib/gif";
import { composeSticker, cutout } from "@/lib/sticker";
import { estimateDepth } from "@/lib/depth";
import { downloadBlob, toStickerWebp } from "@/lib/export";
import {
  Activity,
  ArrowDown,
  ArrowDownUp,
  Check,
  ChevronDown,
  Clapperboard,
  Download,
  Film,
  Images,
  type LucideIcon,
  Play,
  RotateCw,
  Sparkles,
  Tv,
  Vibrate,
  Wand2,
  ZoomIn,
} from "lucide-react";

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

type Mode = "gif" | "sticker";
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

  const addFiles = useCallback(
    (files: File[]) => {
      resetResult();
      const next = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
      setSources((prev) => (multiple ? [...prev, ...next] : next.slice(0, 1)));
      requestAnimationFrame(goToWorkshop);
    },
    [multiple, resetResult, goToWorkshop],
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

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    resetResult();
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
            <a
              href="#how"
              className="hidden font-pixel text-sm text-cloud drop-shadow-[1px_1px_0_var(--ink)] hover:text-sun sm:block"
            >
              How it works
            </a>
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
              Turn any photo into a <span className="text-sun">GIF</span> or{" "}
              <span className="text-grass">sticker</span>.
            </h1>
            <p className="mt-4 max-w-md text-base font-semibold text-cloud/95 drop-shadow-[1px_1px_0_rgba(4,16,29,0.9)] sm:text-lg">
              Give a single shot real depth, loop a few together, or cut a clean
              sticker with AI — all locally, in seconds.
            </p>

            {/* Controls: mode + (for GIF) sub-mode — one compact, light row */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <div className="hud-sm inline-flex gap-0.5 rounded-lg bg-cloud/95 p-0.5">
                {(["gif", "sticker"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-pixel text-xs transition ${
                      mode === m ? "bg-sky text-cloud" : "text-ink hover:bg-ink/5"
                    }`}
                  >
                    {m === "gif" ? (
                      <Film className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                    ) : (
                      <Sparkles
                        className="h-3.5 w-3.5"
                        strokeWidth={2.5}
                        aria-hidden
                      />
                    )}
                    {m === "gif" ? "GIF" : "Sticker"}
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
            {mode === "gif" ? "Customize your GIF" : "Customize your sticker"}
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
                  {mode === "gif" ? "Make GIF" : "Make Sticker"}
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
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex justify-between font-pixel text-xs uppercase tracking-wide text-foreground">
        {label}
        <span className="tabular-nums text-muted">{format(value)}</span>
      </span>
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

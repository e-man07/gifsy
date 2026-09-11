"use client";

// The sticker creation flow, extracted out of the homepage into its own page —
// same reasoning as CreateWorkshop for 3D and GifWorkshop for GIF.

import { useCallback, useState } from "react";
import { Download, Play } from "lucide-react";
import { Source, Uploader } from "@/components/Uploader";
import { Slider, Toggle } from "@/components/FormControls";
import { ImportGuide } from "@/components/ImportGuide";
import { composeSticker, cutout } from "@/lib/sticker";
import { downloadBlob, toStickerWebp } from "@/lib/export";
import { takePendingUpload } from "@/lib/pending-upload";

interface ResultFile {
  blob: Blob;
  url: string;
  label: string;
}

interface Result {
  preview: string;
  note: string;
  files: ResultFile[];
  sticker: { png: Blob; webp: Blob };
}

export function StickerWorkshop() {
  // Lazy initializer: picks up a photo handed off from the homepage's hero
  // uploader on first render. A direct visit to /tools/sticker with nothing
  // pending just falls through to the empty Uploader below.
  const [sources, setSources] = useState<Source[]>(() => {
    const file = takePendingUpload()?.[0];
    return file ? [{ file, url: URL.createObjectURL(file) }] : [];
  });

  const [outline, setOutline] = useState(16);
  const [outlineColor, setOutlineColor] = useState("#ffffff");
  const [shadow, setShadow] = useState(true);
  const [caption, setCaption] = useState("");

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const resetResult = useCallback(() => {
    setResult((prev) => {
      prev?.files.forEach((f) => URL.revokeObjectURL(f.url));
      return null;
    });
    setError(null);
  }, []);

  const addFiles = useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;
      resetResult();
      setSources((prev) => {
        prev.forEach((s) => URL.revokeObjectURL(s.url));
        return [{ file, url: URL.createObjectURL(file) }];
      });
    },
    [resetResult],
  );

  const removeFile = useCallback(() => {
    setSources((prev) => {
      prev.forEach((s) => URL.revokeObjectURL(s.url));
      return [];
    });
    resetResult();
  }, [resetResult]);

  async function handleGenerate() {
    resetResult();
    if (sources.length === 0) {
      setError("Add a photo first.");
      return;
    }
    setBusy(true);
    setProgress(null);
    try {
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
        preview: pngUrl,
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try another image.");
    } finally {
      setBusy(false);
      setStatus("");
      setProgress(null);
    }
  }

  const canGenerate = !busy && sources.length >= 1;

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="card rounded-2xl bg-panel p-5 sm:p-7">
        <h1 className="font-editorial text-3xl text-foreground">Make your sticker</h1>

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
              <label className="flex flex-col items-center gap-1 font-display text-xs uppercase tracking-wide text-foreground">
                Color
                <input
                  type="color"
                  value={outlineColor}
                  onChange={(e) => setOutlineColor(e.target.value)}
                  className="card-sm h-9 w-12 cursor-pointer rounded-lg bg-transparent"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="font-display text-xs uppercase tracking-wide text-foreground">
                Caption (optional)
              </span>
              <input
                type="text"
                value={caption}
                maxLength={24}
                placeholder="e.g. LOL"
                onChange={(e) => setCaption(e.target.value)}
                className="card-sm rounded-lg bg-panel px-3 py-2 font-semibold text-foreground outline-none focus-visible:ring-4 focus-visible:ring-sun"
              />
            </label>
            <Toggle
              label="Drop shadow"
              hint="Adds a soft shadow so the sticker pops"
              checked={shadow}
              onChange={setShadow}
            />

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
                  Make Sticker
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
        )}
      </div>

      {result && (
        <div className="card popin mt-8 flex flex-col items-center gap-5 rounded-2xl bg-panel p-6">
          <div className="checkerboard flex items-center justify-center rounded-xl p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result.preview} alt="Your sticker" className="max-h-72 w-auto rounded-lg" />
          </div>
          <p className="text-center text-sm font-semibold text-muted">{result.note}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {result.files.map((f) => (
              <button
                key={f.url}
                onClick={() =>
                  downloadBlob(f.blob, f.label.includes("WebP") ? "sticker.webp" : "sticker.png")
                }
                className="btn flex items-center gap-2 rounded-xl bg-sky px-5 py-2.5 font-display text-sm text-cloud"
              >
                <Download className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                {f.label}
              </button>
            ))}
          </div>
          <ImportGuide png={result.sticker.png} webp={result.sticker.webp} />
        </div>
      )}
    </main>
  );
}

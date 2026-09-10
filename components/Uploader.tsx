"use client";

// The hero's upload card — shaped like a prompt box rather than a file input:
// a big click/drop target up top, and a control row along the bottom holding
// the mode switch (passed in as `controls`) and the primary action button.
//
// The card is deliberately light in BOTH colour schemes, so it uses explicit
// white/ink values instead of the --panel/--foreground tokens: it sits on the
// hero photo, not on the page background, and must not flip dark when the OS
// does.
//
// The outer element only carries the drag handlers. The click targets are real
// <button>s inside it, which keeps the interactive elements un-nested — a
// clickable wrapper around the mode buttons would swallow their clicks and is
// invalid besides.

import { useCallback, useRef, useState, type ReactNode } from "react";
import { ArrowUp, ImageUp, X } from "lucide-react";

export interface Source {
  file: File;
  url: string;
}

interface UploaderProps {
  multiple: boolean;
  sources: Source[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  onClear: () => void;
  /** Sits at the bottom-left of the card — the mode switch. */
  controls?: ReactNode;
}

export function Uploader({
  multiple,
  sources,
  onAdd,
  onRemove,
  onClear,
  controls,
}: UploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list) return;
      const images = Array.from(list).filter((f) => f.type.startsWith("image/"));
      if (images.length) onAdd(multiple ? images : images.slice(0, 1));
    },
    [multiple, onAdd],
  );

  const browse = () => inputRef.current?.click();
  const hasSources = sources.length > 0;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`w-full rounded-2xl p-3.5 text-left shadow-[0_8px_30px_rgba(4,16,29,0.12)] backdrop-blur-md transition-colors ${
        dragging
          ? "bg-white ring-2 ring-sky"
          : "bg-white/92 ring-1 ring-white/60"
      }`}
    >
      {/* Prompt — the main target, sized like a text area so the card reads as
          something you act into rather than a button. */}
      <button
        type="button"
        onClick={browse}
        className="w-full rounded-xl px-3 pb-9 pt-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-sky"
      >
        <span className="block text-base text-ink/45">
          {dragging
            ? "Drop it here…"
            : multiple
              ? "Drop photos here, or click to browse…"
              : "Drop a photo here, or click to browse…"}
        </span>
        <span className="mt-1 block text-xs text-ink/35">
          PNG · JPG · WebP
        </span>
      </button>

      {hasSources && (
        <div className="mb-1 flex flex-wrap items-center gap-2.5 px-3">
          {sources.map((s, i) => (
            <div key={s.url} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.url}
                alt={`upload ${i + 1}`}
                className="h-14 w-14 rounded-lg object-cover ring-1 ring-ink/10"
              />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-petal text-cloud shadow-[0_1px_4px_rgba(14,36,56,0.4)] transition group-hover:scale-110"
                aria-label={`Remove image ${i + 1}`}
              >
                <X className="h-3 w-3" strokeWidth={3} aria-hidden />
              </button>
              {multiple && (
                <span className="absolute bottom-1 left-1 rounded bg-ink/75 px-1.5 font-display text-[10px] text-cloud">
                  {i + 1}
                </span>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-ink/50 underline-offset-4 hover:text-ink hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* Control row */}
      <div className="flex items-center justify-between gap-2 px-1 pb-1">
        {controls ?? <span />}
        <button
          type="button"
          onClick={browse}
          aria-label="Choose a photo"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky text-cloud transition hover:bg-sky-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2"
        >
          {hasSources ? (
            <ImageUp className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          ) : (
            <ArrowUp className="h-4 w-4" strokeWidth={2.75} aria-hidden />
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

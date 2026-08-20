"use client";

import { useCallback, useRef, useState } from "react";
import { ImageDown, ImageUp, X } from "lucide-react";

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
}

export function Uploader({
  multiple,
  sources,
  onAdd,
  onRemove,
  onClear,
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

  const hasSources = sources.length > 0;

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
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
        className={`hud-sm flex cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-left outline-none transition-colors focus-visible:ring-4 focus-visible:ring-sun ${
          dragging ? "bg-sky text-cloud" : "bg-cloud/95 text-ink hover:bg-cloud"
        }`}
      >
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 border-ink bg-sun text-ink"
          aria-hidden
        >
          {dragging ? (
            <ImageDown className="h-5 w-5" strokeWidth={2.25} />
          ) : (
            <ImageUp className="h-5 w-5" strokeWidth={2.25} />
          )}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block font-pixel text-sm tracking-tight">
            {multiple ? "DROP PHOTOS" : "DROP A PHOTO"}
          </span>
          <span
            className={`block truncate text-xs font-semibold ${
              dragging ? "text-cloud/80" : "text-muted"
            }`}
          >
            {hasSources && !multiple
              ? "or tap to swap it out"
              : "or tap to browse · PNG · JPG · WebP"}
          </span>
        </span>
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

      {hasSources && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {sources.map((s, i) => (
            <div key={s.url} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.url}
                alt={`upload ${i + 1}`}
                className="hud-sm h-16 w-16 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-petal text-cloud transition group-hover:scale-110"
                aria-label={`Remove image ${i + 1}`}
              >
                <X className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
              </button>
              {multiple && (
                <span className="absolute bottom-1 left-1 rounded border border-ink bg-ink/80 px-1.5 font-pixel text-[10px] text-cloud">
                  {i + 1}
                </span>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={onClear}
            className="font-pixel text-xs uppercase tracking-wide text-cloud/90 underline-offset-4 hover:underline"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

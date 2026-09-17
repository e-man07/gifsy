"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Clapperboard, Film, Images, type LucideIcon, Sparkles } from "lucide-react";
import { Uploader } from "@/components/Uploader";
import { setPendingUpload } from "@/lib/pending-upload";

type Mode = "gif" | "sticker" | "3d";
type GifMode = "animate" | "combine";

// The hero's drop card with its 3D / GIF / Sticker switch — the other piece of
// the landing page that needs state. Every mode creates on its own page, so
// picking a file hands it off in memory and navigates there.
//
// Opens in 3D: it's the product being sold, and the default state is the
// loudest positioning signal on the page. GIF/sticker stay one click away.
export function HeroUploader() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("3d");
  const [gifMode, setGifMode] = useState<GifMode>("animate");
  const multiple = mode === "gif" && gifMode === "combine";

  const addFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      setPendingUpload(files);
      if (mode === "3d") router.push("/create");
      else if (mode === "gif") router.push(gifMode === "combine" ? "/tools/gif?mode=combine" : "/tools/gif");
      else router.push("/tools/sticker");
    },
    [mode, gifMode, router],
  );

  const pill = (active: boolean) =>
    `flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-xs transition ${
      active ? "bg-white text-ink shadow-sm" : "text-ink/55 hover:text-ink"
    }`;

  return (
    <div className="mt-11 w-full max-w-2xl">
      <Uploader
        multiple={multiple}
        sources={[]}
        onAdd={addFiles}
        onRemove={() => {}}
        onClear={() => {}}
        controls={
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="inline-flex gap-0.5 rounded-full bg-ink/[0.06] p-0.5">
              {(
                [
                  { m: "3d", label: "3D", Icon: Box },
                  { m: "gif", label: "GIF", Icon: Film },
                  { m: "sticker", label: "Sticker", Icon: Sparkles },
                ] as { m: Mode; label: string; Icon: LucideIcon }[]
              ).map(({ m, label, Icon }) => (
                <button key={m} type="button" onClick={() => setMode(m)} className={pill(mode === m)}>
                  <Icon className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                  {label}
                </button>
              ))}
            </div>

            {mode === "gif" && (
              <div className="inline-flex gap-0.5 rounded-full bg-ink/[0.06] p-0.5">
                {(
                  [
                    { gm: "animate", label: "Animate one", Icon: Clapperboard },
                    { gm: "combine", label: "Combine several", Icon: Images },
                  ] as { gm: GifMode; label: string; Icon: LucideIcon }[]
                ).map(({ gm, label, Icon }) => (
                  <button key={gm} type="button" onClick={() => setGifMode(gm)} className={pill(gifMode === gm)}>
                    <Icon className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}

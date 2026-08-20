"use client";

import { downloadBlob } from "@/lib/export";
import {
  ChevronDown,
  Download,
  Info,
  PartyPopper,
  Send,
} from "lucide-react";

interface ImportGuideProps {
  png: Blob;
  webp: Blob;
}

export function ImportGuide({ png, webp }: ImportGuideProps) {
  const openStickersBot = () => {
    // Telegram assembles the pack; we hand off the file + open its official bot.
    downloadBlob(png, "sticker.png");
    window.open("https://t.me/stickers", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-center font-pixel text-xs uppercase tracking-wide text-muted">
        Add it to a messaging app
      </p>

      {/* Telegram — fully works from the web */}
      <details className="hud-sm group rounded-xl bg-background p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-pixel text-sm text-foreground">
          <span className="flex items-center gap-2">
            <Send className="h-4 w-4" strokeWidth={2.5} aria-hidden /> Telegram
            <span className="rounded-full bg-grass/20 px-2 py-0.5 text-[11px] font-bold text-grass-deep">
              works from web
            </span>
          </span>
          <ChevronDown
            className="h-4 w-4 text-muted transition group-open:rotate-180"
            strokeWidth={2.5}
            aria-hidden
          />
        </summary>
        <div className="mt-3 flex flex-col gap-3 text-sm text-muted">
          <p>
            Telegram builds sticker packs through its official{" "}
            <strong className="text-foreground">@Stickers</strong> bot — no app
            needed. This gives you a shareable pack link anyone can add.
          </p>
          <button
            onClick={openStickersBot}
            className="btn-pixel flex items-center gap-2 self-start rounded-lg bg-sky px-4 py-2 font-pixel text-sm text-cloud"
          >
            <Download className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            Download + open @Stickers
          </button>
          <ol className="ml-4 list-decimal space-y-1.5">
            <li>
              In the @Stickers chat, send{" "}
              <code className="rounded bg-ink/10 px-1 text-foreground">/newpack</code>{" "}
              to start a <strong className="text-foreground">sticker</strong> pack
              — not{" "}
              <code className="rounded bg-ink/10 px-1 text-foreground">/newemojipack</code>{" "}
              — then give it a name.
            </li>
            <li>
              Send the downloaded image <strong className="text-foreground">as a file</strong>{" "}
              (attach → File), so Telegram keeps it at full 512×512 quality.
            </li>
            <li>
              When prompted, reply with one emoji to{" "}
              <strong className="text-foreground">tag</strong> the sticker (this
              just labels it — it&apos;s still a sticker).
            </li>
            <li>
              Repeat for more stickers, then send{" "}
              <code className="rounded bg-ink/10 px-1 text-foreground">/publish</code>{" "}
              and pick a short link name.
            </li>
            <li>
              You&apos;ll get a{" "}
              <code className="rounded bg-ink/10 px-1 text-foreground">t.me/addstickers/…</code>{" "}
              link — open it and tap{" "}
              <strong className="text-foreground">Add Stickers</strong>. Done{" "}
              <PartyPopper
                className="inline h-4 w-4 align-[-2px] text-grass"
                strokeWidth={2.5}
                aria-hidden
              />
            </li>
          </ol>
          <div className="flex items-start gap-2 rounded-lg border-2 border-ink/15 bg-sun/15 p-3 text-xs text-foreground">
            <Info
              className="mt-0.5 h-4 w-4 shrink-0 text-ink"
              strokeWidth={2.5}
              aria-hidden
            />
            <span>
              Got <strong>&ldquo;exactly 100×100 pixels&rdquo;</strong>? That&apos;s
              Telegram&apos;s <strong>custom-emoji</strong> size — you started an
              emoji pack. Send{" "}
              <code className="rounded bg-ink/10 px-1">/newpack</code> instead for
              a <strong>sticker</strong> pack; our 512×512 file is already the
              right size.
            </span>
          </div>
          <button
            onClick={() => downloadBlob(webp, "sticker.webp")}
            className="self-start text-xs text-muted underline underline-offset-2 hover:text-foreground"
          >
            Prefer WebP? Download that instead
          </button>
        </div>
      </details>
    </div>
  );
}

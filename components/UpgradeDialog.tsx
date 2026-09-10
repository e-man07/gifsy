"use client";

// The wall a free account hits when its 3D generations run out.
//
// It replaces a red sentence under the Make 3D button that said the limit was
// reached and then offered nothing — no price, no button, no way forward. The
// person most likely to pay is the one who just tried to generate, so this is
// the moment to show them the offer rather than making them go find /pricing.
//
// Deliberately Pro-only: they are already on Free, so a side-by-side
// comparison is noise. The tier copy still comes from lib/billing/plans.ts so
// this cannot advertise something the API doesn't enforce.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { startCheckout } from "@/lib/billing/checkout";
import { FREE_GENERATION_LIMIT, PLAN_DISPLAY } from "@/lib/billing/plans";

const PRO = PLAN_DISPLAY.pro;

export function UpgradeDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  // Escape closes, and the body doesn't scroll behind the overlay. Both are
  // restored on unmount so a mid-dialog navigation can't leave the page stuck.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const upgrade = async () => {
    setBusy(true);
    setErr(null);
    try {
      await startCheckout("pro");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4"
      // Clicks land on the overlay only when they miss the panel, so this is
      // the outside-click close without a document-level listener.
      onClick={(e) => {
        if (!panel.current?.contains(e.target as Node)) onClose();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-title"
        className="card popin relative w-full max-w-md rounded-2xl bg-panel p-6 sm:p-7"
      >
        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-1 text-muted transition-colors hover:text-foreground"
        >
          <X className="h-5 w-5" strokeWidth={2.5} aria-hidden />
        </button>

        <p className="font-display text-xs uppercase tracking-wide text-petal">
          Out of free 3D
        </p>
        <h2
          id="upgrade-title"
          className="mt-2 font-display text-2xl uppercase tracking-wide text-foreground"
        >
          That was your last one
        </h2>
        <p className="mt-2 text-sm text-muted">
          You&apos;ve used all {FREE_GENERATION_LIMIT} free 3D generations.
          GIFs and stickers stay unlimited and free — it&apos;s only 3D that
          needs Pro from here.
        </p>

        <div className="mt-5 flex items-end gap-1">
          {/* .num, not font-display: tabular, bold figures for the price. */}
          <span className="num text-4xl text-foreground">{PRO.price}</span>
          <span className="pb-1 text-sm font-semibold text-muted">
            {PRO.cadence}
          </span>
        </div>

        <ul className="mt-4 flex flex-col gap-2">
          {PRO.features.slice(1, 5).map((f) => (
            <li
              key={f}
              className="flex items-start gap-2 text-sm text-foreground"
            >
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-grass"
                strokeWidth={3}
                aria-hidden
              />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {err && (
          <p className="card-sm mt-4 rounded-lg bg-petal/15 px-3 py-2 text-sm font-bold text-petal">
            {err}
          </p>
        )}

        <button
          type="button"
          onClick={upgrade}
          disabled={busy}
          className="btn mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-sky py-3 font-display text-sm uppercase tracking-wide text-ink disabled:opacity-50"
        >
          {busy ? "Starting…" : "Get lifetime access"}
          {!busy && (
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          )}
        </button>

        <div className="mt-4 flex items-center justify-between text-xs text-muted">
          <button
            type="button"
            onClick={onClose}
            className="font-semibold underline hover:text-foreground"
          >
            Not now
          </button>
          <Link href="/pricing" className="underline hover:text-foreground">
            Compare plans
          </Link>
        </div>
      </div>
    </div>
  );
}

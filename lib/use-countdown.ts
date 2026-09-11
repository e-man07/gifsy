"use client";

// Ticks a fixed deadline down to the second. Shared by the pricing cards and
// the homepage offer banner so both read the exact same clock and can't drift
// out of sync with each other.

import { useEffect, useState } from "react";

function msLeft(endsAt: string): number {
  return new Date(endsAt).getTime() - Date.now();
}

function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/**
 * `active` flips to false (and stays false) the instant `endsAt` passes, so
 * callers can stop rendering offer copy without re-checking the clock
 * themselves.
 *
 * Starts at `null` rather than computing `msLeft(endsAt)` up front: this hook
 * runs during SSR too (it's called from ordinary client components, not a
 * ssr:false-only tree), and the server's `Date.now()` and the client's first
 * render happen a few hundred ms apart — resolving the real value immediately
 * would render a different countdown digit on each side and fail hydration.
 * Reporting `inactive` until the first effect runs keeps server and client
 * markup identical; the real countdown then appears a tick after mount.
 */
export function useCountdown(endsAt: string): { active: boolean; label: string } {
  const [remaining, setRemaining] = useState<number | null>(null);

  // Reschedules itself each tick rather than a single setInterval: ties the
  // effect's dependency directly to `remaining` so exhaustive-deps can verify
  // it, and stops on its own once the deadline passes instead of ticking a
  // dead countdown forever.
  useEffect(() => {
    if (remaining !== null && remaining <= 0) return;
    const id = setTimeout(() => setRemaining(msLeft(endsAt)), remaining === null ? 0 : 1000);
    return () => clearTimeout(id);
  }, [endsAt, remaining]);

  if (remaining === null) return { active: false, label: formatDuration(msLeft(endsAt)) };
  return { active: remaining > 0, label: formatDuration(remaining) };
}

"use client";

// "Tools" dropdown in every header: the three things Gifsy makes. Desktop
// only — on phones the same links are listed flat inside AccountMenu's
// hamburger (SiteNav and HomeNav pass TOOL_LINKS through), so there is one
// list and one place to add a tool.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { NavTone } from "@/components/AccountMenu";
import { TOOL_LINKS } from "@/lib/nav";

export function ToolsMenu({ tone = "dark" }: { tone?: NavTone }) {
  // Opens on hover (with a short grace period so the pointer can travel
  // down into the panel), and on click/keyboard for touch and a11y.
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  const show = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
    setOpen(true);
  };
  const hideSoon = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }, []);

  const btnCls =
    tone === "dark"
      ? "text-ink hover:text-sky-deep"
      : "text-cloud hover:text-white";

  return (
    <div
      ref={ref}
      className="relative hidden sm:block"
      onMouseEnter={show}
      onMouseLeave={hideSoon}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onFocus={show}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-1 py-2 font-display text-sm transition-colors ${btnCls}`}
      >
        Tools
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2.5} aria-hidden />
      </button>
      {open && (
        // pt-3 instead of mt-3: the gap between button and panel stays inside
        // the hover area, so the menu doesn't close while crossing it.
        <div className="absolute left-1/2 top-full z-30 -translate-x-1/2 pt-3">
          <div role="menu" className="card w-72 overflow-hidden rounded-xl bg-panel py-1">
            {TOOL_LINKS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 hover:bg-sky hover:text-cloud [&:hover_p]:text-cloud/80"
              >
                <span className="block font-display text-sm text-foreground [a:hover>&]:text-cloud">{t.label}</span>
                <p className="text-xs text-muted">{t.note}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  const btnCls =
    tone === "dark"
      ? "text-ink hover:text-sky-deep"
      : "text-cloud hover:text-white";

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-1 font-display text-sm transition-colors ${btnCls}`}
      >
        Tools
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2.5} aria-hidden />
      </button>
      {open && (
        <div role="menu" className="card absolute left-1/2 top-full z-30 mt-3 w-72 -translate-x-1/2 overflow-hidden rounded-xl bg-panel py-1">
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
      )}
    </div>
  );
}

"use client";

// Scroll parallax for a row of cards.
//
// Wrap a group and give each child a `data-drift` factor. As the group
// travels through the viewport, each child is offset vertically by
// (distance of the group's centre from the viewport centre) × factor, so
// cards with different factors slide past one another instead of moving as
// one block. Positive factors trail the scroll, negative ones lead it.
//
// The offset is written to the `translate` property so it composes with the
// `transform` the scroll reveal animates, and with any hover lift. Under
// prefers-reduced-motion nothing is written and the cards sit still at
// whatever static offset their classes give them.

import { useEffect, useRef, type ReactNode } from "react";

// Hard cap on the offset, so a very tall viewport never sends a card wild.
const MAX_OFFSET = 140;

export function ParallaxDrift({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-drift]")).map((el) => ({
      el,
      factor: Number(el.dataset.drift) || 0,
    }));
    if (items.length === 0) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = root.getBoundingClientRect();
      const delta = rect.top + rect.height / 2 - window.innerHeight / 2;
      for (const { el, factor } of items) {
        const y = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, delta * factor));
        el.style.translate = `0 ${y.toFixed(1)}px`;
      }
    };
    const schedule = () => {
      if (raf === 0) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
      for (const { el } of items) el.style.translate = "";
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

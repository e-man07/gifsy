"use client";

// Scroll reveals, driven by an attribute rather than a wrapper component.
//
// Mount this once per page and mark anything that should animate in with
// `data-reveal` (optionally `style={{ "--reveal-delay": "80ms" }}` to stagger
// a row of cards). The hidden state lives in globals.css so the markup stays
// a plain attribute — wrapping elements in a <Reveal> component would have
// meant extra divs inside the masonry columns and grid tracks, which changes
// how those lay out.
//
// Two things this deliberately does:
//   - Reveals once and then unobserves. Re-hiding on scroll-up makes a long
//     page feel like it is flickering rather than settling.
//   - Honours prefers-reduced-motion by showing everything immediately and
//     never observing at all.
//
// Nothing above the fold should carry `data-reveal`: the server sends the
// hidden state, so an element in the initial viewport would flash in after
// hydration. Below the fold there is nothing to see until you scroll anyway.

import { useEffect } from "react";

export function ScrollReveal() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    if (els.length === 0) return;

    const show = (el: Element) => el.classList.add("is-visible");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach(show);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target);
          io.unobserve(entry.target);
        }
      },
      // Fires a little before the element is fully on screen, so the motion
      // finishes about when it reaches a comfortable reading position.
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}

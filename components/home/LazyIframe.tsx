"use client";

// An <iframe> that is only put in the DOM once its box is about to scroll
// into view.
//
// loading="lazy" is not enough here. The embed is same-origin, so its
// Three.js viewer (a ~475 KB chunk plus ~2.4 MB of scene textures) boots on
// this page's main thread — and Chrome's lazy threshold (1250–2500 px)
// pulled it in while the hero was still rendering. On a phone that was a
// 3.6 s long task and most of the page's blocking time. Mounting on
// intersection instead means the visitor who never scrolls this far never
// pays for it, and the one who does gets it a screen early.
//
// The wrapper keeps the same box either way, so nothing shifts when the
// frame arrives. Without JS the <noscript> copy still loads it.

import { useEffect, useRef, useState } from "react";

type Props = Omit<React.IframeHTMLAttributes<HTMLIFrameElement>, "loading"> & {
  /** How far ahead of the viewport to start loading. */
  rootMargin?: string;
};

export function LazyIframe({ rootMargin = "320px 0px", className, ...rest }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || near) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(host);
    return () => io.disconnect();
  }, [near, rootMargin]);

  return (
    <div ref={hostRef} className={className}>
      {near ? (
        <iframe {...rest} className="h-full w-full border-0" />
      ) : (
        <noscript>
          <iframe {...rest} loading="lazy" className="h-full w-full border-0" />
        </noscript>
      )}
    </div>
  );
}

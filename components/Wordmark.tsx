// The Gifsy lockup: pixel "G" mark + wordmark, used in every page header.
//
// The mark already contains the play triangle, so it replaces the separate
// lucide <Play> glyph the three headers each used to render alongside the text.
// Static import so Next emits width/height and a hashed, immutable URL.

import Image from "next/image";
import Link from "next/link";
import logo from "@/public/gifsy-logo.png";

const CLS =
  "flex items-center gap-2 font-pixel text-2xl text-cloud drop-shadow-[2px_2px_0_var(--ink)]";

export function Wordmark({ href = "/" }: { href?: string }) {
  const inner = (
    <>
      <Image
        src={logo}
        alt=""
        width={34}
        height={34}
        priority
        className="h-[34px] w-[34px]"
      />
      GIFSY
    </>
  );

  // In-page anchors (the landing header's scroll-to-top) stay plain anchors;
  // everything else routes.
  return href.startsWith("#") ? (
    <a href={href} className={CLS}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={CLS}>
      {inner}
    </Link>
  );
}

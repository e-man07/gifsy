// The Gifsy lockup: pixel "G" mark + wordmark, used in every page header.
//
// The mark already contains the play triangle, so it replaces the separate
// lucide <Play> glyph the three headers each used to render alongside the text.
// Static import so Next emits width/height and a hashed, immutable URL.

import Image from "next/image";
import Link from "next/link";
import logo from "@/public/gifsy-logo.png";

// Smaller on phones: at text-2xl the lockup alone took roughly a third of a
// 390px bar, which is what pushed the nav links into each other. `shrink-0`
// keeps flex from squeezing the glyphs instead of the gaps.
const CLS =
  "flex shrink-0 items-center gap-1.5 font-pixel text-xl text-cloud drop-shadow-[2px_2px_0_var(--ink)] sm:gap-2 sm:text-2xl";

export function Wordmark({ href = "/" }: { href?: string }) {
  const inner = (
    <>
      <Image
        src={logo}
        alt=""
        width={34}
        height={34}
        priority
        className="h-7 w-7 sm:h-[34px] sm:w-[34px]"
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

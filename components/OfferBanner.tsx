"use client";

// A launch-week callout for the homepage: lifetime Pro at a steep temporary
// discount. Renders nothing once OFFER_ENDS_AT passes — same deadline
// PlanCards' Pro card counts down to, so the two can't say different things.
//
// Rendered inside the fixed header stack in app/page.tsx, directly above the
// nav pill — not as a normal-flow section — so it reads as a persistent
// announcement bar rather than a banner that interrupts the hero photo
// mid-scroll.

import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { OFFER_ENDS_AT, OFFER_PRICE } from "@/lib/billing/offer";
import { PLAN_DISPLAY } from "@/lib/billing/plans";
import { useCountdown } from "@/lib/use-countdown";

export function OfferBanner() {
  const offer = useCountdown(OFFER_ENDS_AT);
  if (!offer.active) return null;

  return (
    <section className="relative overflow-hidden border-b border-ink/10 bg-sun">
      <div className="offer-shimmer pointer-events-none absolute inset-0 z-0" aria-hidden />
      {/* Single centered cluster — not "text left + pills right". Everything
          lives in one flex-wrap row that stays centered at every width, so
          the timer reads as part of the offer (not a gap-filler in between)
          and the bar can stay short: ~32-36px instead of ~44px. */}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-3 py-[9px] sm:px-6 sm:py-[9px]">
        <p className="inline-flex flex-wrap items-center justify-center gap-x-1.5 text-center font-display text-[12.5px] leading-none text-ink sm:text-[13px]">
          <span className="inline-flex items-center gap-1">
            <Flame className="offer-flame h-3.5 w-3.5 text-ink/80" strokeWidth={2.5} aria-hidden />
            <span className="font-bold tracking-tight">Launch offer:</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span>
              lifetime Pro for <span className="num font-extrabold">{OFFER_PRICE}</span>
            </span>
            <span className="num text-[11px] font-bold tracking-tight text-ink/40 line-through sm:text-xs">
              {PLAN_DISPLAY.pro.price}
            </span>
          </span>
        </p>

        <span className="hidden h-3 w-px bg-ink/15 sm:block" aria-hidden />

        {/* Ghost timer + solid CTA: the timer is an outline badge that sits
            quietly on the gold bar (ink text, thin petal border, petal dot
            for the only urgency accent) so "Claim it" stays the single
            solid, high-contrast element instead of competing with a
            solid-pink block. */}
        <div className="inline-flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-petal/40 bg-sun/40 px-2.5 py-1.5 text-[11px] font-bold leading-none text-ink sm:px-3 sm:py-[7px]"
            aria-label={`Offer ends in ${offer.label}`}
          >
            <span className="relative mr-0.5 hidden h-1.5 w-1.5 shrink-0 sm:flex" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-petal opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-petal" />
            </span>
            <span className="num tabular-nums tracking-widest">{offer.label}</span>
          </span>
          <Link
            href="#plans"
            className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-xs font-bold tracking-wide text-white shadow-sm ring-1 ring-ink/10 transition hover:bg-black active:bg-black sm:px-3.5"
          >
            Claim it
            <ArrowRight className="h-3 w-3" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>

        {/* Alternative overlay variant (uncomment to use instead of fused strip):
            Timer floats as a tiny badge on the button's top edge — even more
            compact horizontally, timer doesn't add width at all.
        <div className="relative">
          <Link href="#plans" className="inline-flex items-center gap-1 rounded-full bg-ink px-5 py-1.5 text-xs font-bold text-white shadow-sm">
            Claim it <ArrowRight className="h-3 w-3" />
          </Link>
          <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-petal px-2 py-0.5 text-[10px] font-bold leading-none text-white shadow ring-1 ring-white/20 num tabular-nums">
            {offer.label}
          </span>
        </div>
        */}
      </div>
    </section>
  );
}

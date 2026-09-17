// Pricing page. The cards, the checkout call and the fine print all live in
// components/PlanCards.tsx, which the landing page renders too — so the two
// surfaces cannot advertise different things. What is left here is the page
// chrome around them, which is why this is a plain server component now.

import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { pageMetadata } from "@/lib/seo/metadata";
import { PlanCards } from "@/components/PlanCards";
import { PLAN_DISPLAY } from "@/lib/billing/plans";

export const metadata = pageMetadata({
  path: "/pricing",
  title: "Pricing",
  description: `GIFs and stickers are free forever and need no account. Pro is a one-time ${PLAN_DISPLAY.pro.price} payment for unlimited 3D generations, no badge, and commercial use.`,
});

export default function PricingPage() {
  return (
    <main className="flex min-h-screen flex-1 flex-col bg-background">
      {/* Nav — mirrors the landing / gallery chrome. */}
      <section className="border-b border-foreground/10 bg-panel">
        <SiteNav />

        <div className="mx-auto w-full max-w-6xl px-5 pb-12 pt-8 text-center sm:px-8 sm:pb-16 sm:pt-12">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-sky-deep">
            Pricing
          </p>
          <h1 className="mx-auto mt-3 max-w-2xl font-editorial text-4xl leading-tight text-foreground sm:text-5xl">
            GIFs and stickers, free forever. 3D is where Pro shines.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted sm:text-base">
            GIFs and stickers are unlimited and always free — they never leave
            your device, and need no account. Pro is a one-time payment for
            unlimited 3D generations and no Gifsy badge.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        <PlanCards next="/pricing" />
      </section>
      <SiteFooter />
    </main>
  );
}

import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script";
import { siteOrigin, siteUrl } from "@/lib/site-url";
import { JsonLd, organizationNodes, softwareApplicationNode } from "@/lib/seo/json-ld";
import { FREE_GENERATION_LIMIT, PLAN_DISPLAY } from "@/lib/billing/plans";

// Editorial display face, for page headlines only — a high-contrast serif
// standing in for PP Editorial New, which is commercial. Variable weight, so
// headlines can sit at 500/600 and keep some stem behind the thin strokes.
const editorial = Playfair_Display({
  variable: "--font-editorial",
  subsets: ["latin"],
});

// Everything else: body copy, nav, buttons, labels. A neutral grotesque
// carries small UI text far better than the serif would.
const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

// metadataBase makes every relative OG/Twitter image URL absolute. Crawlers
// silently drop relative ones, so without it the generated card never appears.
export const metadata: Metadata = {
  metadataBase: siteUrl(),
  // The default title is the homepage's and is used verbatim (the template
  // only applies to child pages), so it carries the brand itself. Page titles
  // must NOT include "Gifsy" — the template adds it.
  title: {
    default: "3D Photo Maker — Interactive Depth, Embed Anywhere · Gifsy",
    template: "%s · Gifsy",
  },
  description: `Make an interactive 3D photo from one image, in your browser. Drag it, then paste the iframe into Webflow, Framer or any site. ${FREE_GENERATION_LIMIT} free, then ${PLAN_DISPLAY.pro.price} once.`,
  alternates: { canonical: siteOrigin() },
  openGraph: {
    type: "website",
    siteName: "Gifsy",
    url: siteOrigin(),
    title: "Gifsy — the interactive 3D photo maker you can embed anywhere",
    description:
      "Upload one photo. Gifsy gives it real, interactive depth in your browser and hands you an embed for any site.",
  },
  twitter: {
    // Without this the card renders as a small thumbnail, not the large image.
    card: "summary_large_image",
    title: "Gifsy — the interactive 3D photo maker you can embed anywhere",
    description:
      "Upload one photo. Gifsy gives it real, interactive depth in your browser and hands you an embed for any site.",
  },
  // Site-ownership verification for the Orynth listing.
  other: {
    "ory-verify": "orynth-bfe949565da64784b4a7ceb8c2c448c0",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${editorial.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        {/* Scroll reveals hide their element in CSS and are un-hidden by an
            observer. With scripting off that observer never runs, so the
            content would stay hidden permanently — this puts it back. */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html:
                "[data-reveal]{opacity:1!important;transform:none!important}",
            }}
          />
        </noscript>
      </head>
      <body className="min-h-full flex flex-col">
      {/* Site-wide entity graph: who publishes this, who the founders are, and
          what the product is. Pages add their own nodes (FAQPage, HowTo,
          BreadcrumbList) that reference these by @id. */}
      <JsonLd graph={[...organizationNodes(), softwareApplicationNode()]} />
      {children}
      <Analytics />
      {/* DataFast analytics. afterInteractive = loads once the page is
          hydrated, on every route since this is the root layout. */}
      <Script
        src="https://datafa.st/js/script.js"
        data-website-id="dfid_VTK9dxkszf139VvLdMQxT"
        data-domain="gifsy.fun"
        strategy="afterInteractive"
      />
      </body>
    </html>
  );
}

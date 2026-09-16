import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { siteOrigin, siteUrl } from "@/lib/site-url";

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
  title: {
    default: "Gifsy — turn any photo into a live 3D photo",
    template: "%s · Gifsy",
  },
  description:
    "Upload one photo and Gifsy gives it real depth in your browser — then hands you an embed you can paste into any site. Also makes GIFs and cut-out stickers.",
  openGraph: {
    type: "website",
    siteName: "Gifsy",
    url: siteOrigin(),
    title: "Gifsy — turn any photo into a live 3D photo",
    description:
      "Upload one photo. Gifsy gives it real, interactive depth in your browser and hands you an embed for any site.",
  },
  twitter: {
    // Without this the card renders as a small thumbnail, not the large image.
    card: "summary_large_image",
    title: "Gifsy — turn any photo into a live 3D photo",
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
      {children}
      <Analytics />
      </body>
    </html>
  );
}

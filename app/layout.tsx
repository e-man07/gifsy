import type { Metadata } from "next";
import { Pixelify_Sans, Nunito } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { siteOrigin, siteUrl } from "@/lib/site-url";

// Display: a legible pixel face for the wordmark, headline, and labels.
const pixel = Pixelify_Sans({
  variable: "--font-pixel",
  subsets: ["latin"],
});

// Body/UI: rounded, friendly, and highly readable for controls and copy.
const nunito = Nunito({
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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${pixel.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
      {children}
      <Analytics />
      </body>
    </html>
  );
}

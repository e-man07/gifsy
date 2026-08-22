import type { Metadata } from "next";
import { Pixelify_Sans, Nunito } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

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

export const metadata: Metadata = {
  title: "Gifsy → GIF & Sticker",
  description:
    "Turn any photo into an animated GIF or a cut-out sticker, right in your browser. No uploads, no accounts.",
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

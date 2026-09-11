import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import { StickerWorkshop } from "@/components/StickerWorkshop";

export const metadata: Metadata = {
  title: "Make a Sticker",
  description:
    "Cut a subject out of any photo and turn it into a transparent sticker, right in your browser. Always free, no account needed.",
  robots: { index: true, follow: true },
};

export default function StickerToolPage() {
  return (
    <main className="flex flex-1 flex-col bg-background">
      <SiteNav links={[{ href: "/gallery", label: "Gallery" }]} />
      <StickerWorkshop />
    </main>
  );
}

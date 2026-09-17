import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { StickerWorkshop } from "@/components/StickerWorkshop";
import { StickerToolCopy } from "@/components/copy/StickerToolCopy";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  path: "/tools/sticker",
  title: "Telegram Sticker Maker — Photo to 512px Sticker, Free",
  description:
    "Cut the subject out of a photo with AI, add a white outline and shadow, and export a 512×512 WebP ready for a Telegram sticker pack. Runs in your browser — no upload, no account.",
});

export default function StickerToolPage() {
  return (
    <main className="flex flex-1 flex-col bg-background">
      <SiteNav links={[{ href: "/gallery", label: "Gallery" }]} />
      <StickerWorkshop />
      <StickerToolCopy />
      <SiteFooter />
    </main>
  );
}

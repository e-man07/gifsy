import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { GifWorkshop } from "@/components/GifWorkshop";
import { GifToolCopy } from "@/components/copy/GifToolCopy";
import { pageMetadata } from "@/lib/seo/metadata";

// `?mode=combine` pre-selects the multi-photo mode but is the same page, so it
// canonicalises here rather than existing as a duplicate URL for crawlers.
export const metadata = pageMetadata({
  path: "/tools/gif",
  title: "Animate a Photo Into a GIF — Free, No Upload",
  description:
    "Turn one photo into an animated GIF with zoom, bounce, shake, pulse, spin or glitch — or stitch several into a loop. Runs in your browser, no upload, no watermark, no account.",
});

export default async function GifToolPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  return (
    <main className="flex flex-1 flex-col bg-background">
      <SiteNav links={[{ href: "/gallery", label: "Gallery" }]} />
      <GifWorkshop initialGifMode={mode === "combine" ? "combine" : "animate"} />
      <GifToolCopy />
      <SiteFooter />
    </main>
  );
}

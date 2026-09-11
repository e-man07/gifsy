import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import { GifWorkshop } from "@/components/GifWorkshop";

export const metadata: Metadata = {
  title: "Make a GIF",
  description:
    "Turn one photo — or a handful — into an animated GIF, right in your browser. Always free, no account needed.",
  robots: { index: true, follow: true },
};

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
    </main>
  );
}

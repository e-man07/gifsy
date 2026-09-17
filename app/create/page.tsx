import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { CreateWorkshop } from "@/components/CreateWorkshop";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  path: "/create",
  title: "AI 3D Photo Animation — Free, Runs in Your Browser",
  description:
    "Give one photo real depth: an interactive 3D photo you can spin, share, and embed on any site. The AI runs in your browser; only the finished scene is uploaded when you publish.",
});

export default function CreatePage() {
  return (
    <main className="flex flex-1 flex-col bg-background">
      <SiteNav links={[{ href: "/gallery", label: "Gallery" }]} />
      <CreateWorkshop />
      <SiteFooter />
    </main>
  );
}

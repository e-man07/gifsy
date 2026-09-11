import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import { CreateWorkshop } from "@/components/CreateWorkshop";

export const metadata: Metadata = {
  title: "Make a 3D Photo",
  description:
    "Turn one photo into a live 3D scene, right in your browser. No modeling, and your photo itself is never uploaded.",
  robots: { index: true, follow: true },
};

export default function CreatePage() {
  return (
    <main className="flex flex-1 flex-col bg-background">
      <SiteNav links={[{ href: "/gallery", label: "Gallery" }]} />
      <CreateWorkshop />
    </main>
  );
}

import type { Metadata } from "next";
import { SceneClient } from "./scene-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Gifsy scene ${id}`,
    description:
      "An interactive 3D image made with Gifsy — move your mouse to look around. No uploads, no accounts.",
    openGraph: {
      title: `Gifsy scene ${id}`,
      description: "An interactive 3D image made with Gifsy.",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function ScenePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SceneClient key={id} id={id} />;
}

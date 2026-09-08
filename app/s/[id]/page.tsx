import type { Metadata } from "next";
import { SceneClient } from "./scene-client";
import { fetchSceneManifest } from "@/lib/publish/manifest";

const TITLE = "An interactive 3D photo, made with Gifsy";
const DESCRIPTION =
  "Drag to look around — this started as one still photo. Made with Gifsy, in the browser.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const manifest = await fetchSceneManifest(id);

  // No manifest → the scene doesn't exist (SceneClient renders its own "Scene
  // not found"). Don't invite crawlers to index /s/<garbage>, which previously
  // returned 200 + index:true for any id shaped like a scene id.
  if (!manifest) {
    return { title: "Scene not found", robots: { index: false, follow: false } };
  }

  // The published still is already a public Blob URL — using it as the card
  // image is what turns a shared link from a grey text row into a preview.
  const image = manifest.assets.image.url;

  return {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      type: "website",
      url: `/s/${id}`,
      images: [{ url: image, width: 1200, height: 630, alt: TITLE }],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESCRIPTION,
      images: [image],
    },
    alternates: { canonical: `/s/${id}` },
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

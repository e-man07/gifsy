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

  // No `images` here on purpose. opengraph-image.tsx in this segment composites
  // the still into a 1200x630 PNG and emits og:image AND twitter:image itself;
  // setting them here would override it with the raw WebP still, which is
  // undersized, wrongly-declared and cropped by X. See that file.
  return {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      type: "website",
      url: `/s/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESCRIPTION,
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

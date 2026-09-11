import type { Metadata } from "next";
import { fetchSceneManifest } from "@/lib/publish/manifest";
import { EmbedClient } from "./embed-client";

// This is the bare canvas meant to sit inside someone else's <iframe>, not a
// page a crawler should list — it has no chrome, no description, and is a
// near-duplicate of the properly-described /s/[id] share page. Point crawlers
// there instead of indexing this one.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    robots: { index: false, follow: false },
    alternates: { canonical: `/s/${id}` },
  };
}

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Resolve the poster here, not in the client: the manifest is ~1KB and we
  // are already server-rendering, so the placeholder lands in the initial HTML
  // and paints immediately. Doing it client-side would put a round trip in
  // front of the very gap this exists to fill.
  //
  // fetchSceneManifest never throws — a missing or unreachable manifest just
  // means no poster, and the viewer still resolves the scene on its own.
  const manifest = await fetchSceneManifest(id);
  const subjectOnly = Boolean(manifest?.config?.subjectOnly);

  // A subject-only scene must use the MATTE, not the thumbnail: the thumbnail
  // is the full photo including the background this mode exists to remove, so
  // using it would flash an opaque rectangle on the host's page and then pop
  // to a cut-out — worse than the blank frame it replaces.
  //
  // Routed through our own `/api/asset` proxy rather than the manifest's raw
  // Blob URL — see that route's comment (a page embedding many scenes at once
  // was bursting Blob's CDN and tripping its firewall).
  const posterField = subjectOnly
    ? (manifest?.assets.mask ? "mask" : null)
    : manifest?.assets.thumb
      ? "thumb"
      : manifest?.assets.image
        ? "image"
        : null;
  const poster = posterField ? `/api/asset/${id}/${posterField}` : null;

  return <EmbedClient key={id} id={id} poster={poster} />;
}

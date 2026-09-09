import { fetchSceneManifest } from "@/lib/publish/manifest";
import { EmbedClient } from "./embed-client";

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
  const poster = subjectOnly
    ? (manifest?.assets.mask?.url ?? null)
    : (manifest?.assets.thumb?.url ?? manifest?.assets.image.url ?? null);

  return <EmbedClient key={id} id={id} poster={poster} />;
}

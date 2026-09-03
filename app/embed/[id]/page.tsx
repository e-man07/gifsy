import { EmbedClient } from "./embed-client";

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EmbedClient key={id} id={id} />;
}

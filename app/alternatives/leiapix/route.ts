// /alternatives/leiapix → the Immersity page (same product, old name).
import { permanentRedirect } from "next/navigation";

export function GET() {
  permanentRedirect("/alternatives/immersity-ai");
}

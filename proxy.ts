import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next 16 renamed the "middleware" file convention to "proxy". Keeps the
// Supabase session fresh on navigations. Skips static assets and the embed +
// scene-API routes (embeds are public and must never depend on a viewer session),
// and the crawler files, which have no session to refresh.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|embed/|api/scenes/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp4|ico)$).*)",
  ],
};

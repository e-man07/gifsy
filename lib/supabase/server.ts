// Server-side Supabase client, bound to the request's cookies so it reads and
// refreshes the signed-in session in Server Components, Route Handlers, and
// Server Actions. Create a fresh one per request (never cache a module-level
// instance — cookies differ per request).
import { createServerClient } from "@supabase/ssr";
import { supabasePublishableKey } from "./keys";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // In a Server Component the cookie store is read-only; the middleware
          // refresh path handles writes, so swallow the error here.
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            /* called from a Server Component — safe to ignore */
          }
        },
      },
    },
  );
}

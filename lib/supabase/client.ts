// Browser-side Supabase client (anon key). Safe to use in client components —
// it only ever holds the public anon key and the signed-in user's own session.
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

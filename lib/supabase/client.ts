// Browser-side Supabase client (publishable key). Safe to use in client
// components — it only ever holds the public key and the signed-in user's own
// session.
import { createBrowserClient } from "@supabase/ssr";
import { supabasePublishableKey } from "./keys";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabasePublishableKey(),
  );
}

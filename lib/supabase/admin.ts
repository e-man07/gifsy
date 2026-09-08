// Server-only Supabase client using the SECRET (formerly service-role) key. This bypasses RLS,
// so it must NEVER be imported into a client component or any code that could
// be bundled for the browser. It is used by the Dodo webhook to write to
// public.profiles / public.subscriptions on behalf of a user we resolved from
// verified webhook metadata.
//
// The secret key is not a NEXT_PUBLIC_* var, so it is undefined in the
// browser; the guard below turns any accidental client-side use into a loud
// error instead of a silent, broken client.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseSecretKey } from "./keys";

let cached: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient() must never run in the browser.");
  }

  if (cached) return cached;

  const url = process.env.SUPABASE_URL;

  if (!url) throw new Error("SUPABASE_URL is not set.");

  cached = createClient(url, supabaseSecretKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return cached;
}

// Supabase renamed its API keys: the browser-safe `anon` key is now the
// "publishable" key (sb_publishable_…) and the server-only `service_role` key
// is now the "secret" key (sb_secret_…). This project's env uses the new names;
// the legacy names stay as a fallback so an older deploy's vars keep working.
//
// A missing key makes Supabase reject every request with "Invalid API key", so
// both helpers throw a named error instead of passing `undefined` through.

export function supabasePublishableKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set (no NEXT_PUBLIC_SUPABASE_ANON_KEY fallback either).",
    );
  }
  return key;
}

export function supabaseSecretKey(): string {
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error(
      "SUPABASE_SECRET_KEY is not set (no SUPABASE_SERVICE_ROLE_KEY fallback either).",
    );
  }
  return key;
}

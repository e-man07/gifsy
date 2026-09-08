// Refreshes the Supabase auth session on every request and rewrites the cookies
// onto the response so Server Components always see a fresh session. Does NOT
// gate any route — creation stays open and local; only publishing checks auth.
import { createServerClient } from "@supabase/ssr";
import { supabasePublishableKey } from "./keys";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        },
      },
    },
  );

  // Touch the user so an expired access token gets refreshed into new cookies.
  await supabase.auth.getUser();
  return response;
}

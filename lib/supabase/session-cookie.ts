// A cheap "might this visitor be signed in?" check that costs no JavaScript.
//
// The browser Supabase client is ~250 KB of script, and every page that
// shows the account menu was loading it just to learn that the visitor is
// anonymous — which, on the landing page, is nearly everyone. @supabase/ssr
// keeps the session in a `sb-<ref>-auth-token` cookie the browser can read,
// so if that cookie is absent there is no session to fetch and the client
// need not be loaded at all. When it is present, the real client is
// imported and does the actual check; the cookie alone is never trusted.
//
// Deliberately in its own module: importing anything from ./client pulls
// the SDK into the bundle, which is the thing being avoided.

import { useSyncExternalStore } from "react";

const SESSION_COOKIE = /(?:^|;\s*)sb-[^=;]*-auth-token/;

export function hasSessionCookie(): boolean {
  return typeof document !== "undefined" && SESSION_COOKIE.test(document.cookie);
}

const subscribeNever = () => () => {};

/** `hasSessionCookie()` as a hook: false on the server and during
 *  hydration, then the real answer. */
export function useMaySignedIn(): boolean {
  return useSyncExternalStore(subscribeNever, hasSessionCookie, () => false);
}

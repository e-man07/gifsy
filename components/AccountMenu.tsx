"use client";

// Header account control. Shows "Sign in" when logged out, or My scenes / Plans
// / Sign out when logged in. Styled for the dark hero header (text-cloud).

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const linkCls =
  "font-pixel text-sm text-cloud drop-shadow-[1px_1px_0_var(--ink)] hover:text-sun";

export function AccountMenu() {
  const [email, setEmail] = useState<string | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setEmail(session?.user?.email ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  if (email === undefined) return null; // avoid a sign-in→signed-in flash

  if (!email) {
    return (
      <Link href="/login" className={linkCls}>
        Sign in
      </Link>
    );
  }

  return (
    <>
      <Link href="/scenes" className={`hidden sm:block ${linkCls}`}>
        My scenes
      </Link>
      <Link href="/pricing" className={linkCls}>
        Plans
      </Link>
      <form action="/auth/signout" method="post" className="flex">
        <button type="submit" title={email} className={`${linkCls} opacity-80`}>
          Sign out
        </button>
      </form>
    </>
  );
}

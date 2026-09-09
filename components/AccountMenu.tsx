"use client";

// Header account control.
//
// Signed out: Pricing + "Sign in" as plain links — a visitor has no other
// route to the plans page, so Pricing stays visible in this state. On phones
// Pricing hides: it was the fourth item in a bar with room for three, and the
// landing page carries the plan cards inline plus a footer link.
//
// Signed in: a single avatar button (the user's picture, or the first letter
// of their name/email) that opens a dropdown holding everything account-
// shaped — My scenes, Plans, Account, Sign out. Those four used to sit in the
// nav as text, which crowded the bar and put "Account" next to "My scenes"
// and "Plans" as if they were peers rather than the page containing them.
//
// Used by the landing hero nav and by SiteNav, so the control is identical on
// every page.
//
// POSITION: this renders AFTER the nav's primary CTA in the DOM, but the two
// states want different slots — the signed-in avatar belongs at the far right
// (past the CTA), while the signed-out links read as nav items and belong
// before it. Flex `order` puts each where it goes without needing two
// components and two auth subscriptions: the CTA carries `order-1`, so
// `order-0` lands before it and `order-2` after.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// The nav sits over the hero video, so `hero-text` carries the ink outline +
// halo that keeps these readable on bright frames. Harmless on the flat ink
// band the other pages use.
const linkCls = "hero-text font-pixel text-sm text-cloud hover:text-sun";

/** One row in the dropdown. */
const itemCls =
  "block w-full px-3 py-2 text-left font-pixel text-sm text-foreground hover:bg-sky hover:text-cloud";

interface Account {
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

export function AccountMenu() {
  // undefined = still loading; null = signed out.
  const [account, setAccount] = useState<Account | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    const read = (user: { email?: string | null; user_metadata?: Record<string, unknown> } | null) =>
      user
        ? {
            email: user.email ?? null,
            name:
              (user.user_metadata?.full_name as string | undefined) ??
              (user.user_metadata?.name as string | undefined) ??
              null,
            avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
          }
        : null;

    supabase.auth.getUser().then(({ data }) => setAccount(read(data.user)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setAccount(read(session?.user ?? null)),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  // Close on an outside click or Escape — a dropdown that only closes by
  // re-clicking the avatar feels stuck.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (account === undefined) return null; // avoid a signed-out → signed-in flash

  if (!account) {
    return (
      <div className="order-0 flex items-center gap-2 sm:gap-3">
        <Link href="/pricing" className={`hidden sm:block ${linkCls}`}>
          Pricing
        </Link>
        <Link href="/login" className={linkCls}>
          Sign in
        </Link>
      </div>
    );
  }

  const label = account.name ?? account.email ?? "Account";
  const initial = label.trim().charAt(0).toUpperCase();

  return (
    <div ref={wrapRef} className="relative order-2 flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${label}`}
        className="btn-pixel flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-sky"
      >
        {account.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={account.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="font-pixel text-sm leading-none text-cloud">{initial}</span>
        )}
      </button>

      {open ? (
        <div
          role="menu"
          className="hud absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-xl bg-panel py-1"
        >
          {/* Who you are — the reason the avatar needs no text label beside it. */}
          <div className="border-b border-foreground/10 px-3 pb-2 pt-1.5">
            {account.name ? (
              <p className="truncate font-pixel text-sm text-foreground">{account.name}</p>
            ) : null}
            <p className="truncate text-xs text-muted">{account.email}</p>
          </div>

          <Link href="/account" role="menuitem" className={itemCls} onClick={() => setOpen(false)}>
            Account
          </Link>
          <Link href="/scenes" role="menuitem" className={itemCls} onClick={() => setOpen(false)}>
            My scenes
          </Link>
          <Link href="/pricing" role="menuitem" className={itemCls} onClick={() => setOpen(false)}>
            Plans
          </Link>

          <form action="/auth/signout" method="post" className="border-t border-foreground/10">
            <button type="submit" role="menuitem" className={itemCls}>
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

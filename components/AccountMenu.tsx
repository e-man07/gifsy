"use client";

// Header account control, plus the phone menu.
//
// DESKTOP (>= sm)
//   Signed out: Pricing + "Sign in" as plain links — a visitor has no other
//   route to the plans page, so Pricing stays visible in this state.
//   Signed in: a single avatar button (the user's picture, or the first letter
//   of their name/email) opening a dropdown holding everything account-shaped
//   — My scenes, Plans, Account, Sign out. Those four used to sit in the nav
//   as text, which crowded the bar and put "Account" next to "My scenes" and
//   "Plans" as if they were peers rather than the page containing them.
//
// PHONES (< sm)
//   One hamburger holding the whole nav: the page's own links (passed in as
//   `links`) and then the account rows. The bar itself keeps only the
//   wordmark, the CTA and this button — five items were previously drawing on
//   top of each other, and "Gallery" rendered inside "GIFSY".
//
//   The links live here rather than in a separate mobile-menu component so
//   there is one auth subscription and one outside-click handler for the whole
//   header, and so a phone menu can show signed-in rows at all.
//
// Used by the landing hero nav and by SiteNav, so the control is identical on
// every page.
//
// POSITION: this renders AFTER the nav's primary CTA in the DOM, but the slots
// differ — the signed-in avatar and the hamburger belong at the far right
// (past the CTA), while the signed-out desktop links read as nav items and
// belong before it. Flex `order` places each without needing two components
// and two auth subscriptions: the CTA carries `order-1`, so `order-0` lands
// before it and `order-2` after.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/** A plain nav link belonging to the page, shown inline on desktop by the nav
 *  itself and inside the hamburger on phones. */
export interface NavLink {
  href: string;
  label: string;
}

// The nav sits over the hero video, so `hero-text` carries the ink outline +
// halo that keeps these readable on bright frames. Harmless on the flat ink
// band the other pages use.
const linkCls = "hero-text font-pixel text-sm text-cloud hover:text-sun";

/** One row in either dropdown. */
const itemCls =
  "block w-full px-3 py-2.5 text-left font-pixel text-sm text-foreground hover:bg-sky hover:text-cloud";

const panelCls =
  "hud absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-xl bg-panel py-1";

interface Account {
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

export function AccountMenu({ links = [] }: { links?: NavLink[] }) {
  // undefined = still loading; null = signed out.
  const [account, setAccount] = useState<Account | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);

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
  // re-clicking its trigger feels stuck. Both triggers share one `open`, so
  // this has to treat either container as "inside".
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!avatarRef.current?.contains(t) && !burgerRef.current?.contains(t)) {
        setOpen(false);
      }
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

  const close = () => setOpen(false);

  /** In-page anchors stay plain anchors so they scroll instead of routing. */
  const renderLink = (l: NavLink) =>
    l.href.startsWith("#") ? (
      <a key={l.href} href={l.href} role="menuitem" className={itemCls} onClick={close}>
        {l.label}
      </a>
    ) : (
      <Link key={l.href} href={l.href} role="menuitem" className={itemCls} onClick={close}>
        {l.label}
      </Link>
    );

  const label = account ? account.name ?? account.email ?? "Account" : null;

  return (
    <>
      {/* ── Desktop, signed out ── */}
      {account === null && (
        <div className="order-0 hidden items-center gap-2 sm:flex sm:gap-3">
          <Link href="/pricing" className={linkCls}>
            Pricing
          </Link>
          <Link href="/login" className={linkCls}>
            Sign in
          </Link>
        </div>
      )}

      {/* ── Desktop, signed in ── */}
      {account && (
        <div ref={avatarRef} className="relative order-2 hidden items-center sm:flex">
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
              <span className="font-pixel text-sm leading-none text-cloud">
                {label?.trim().charAt(0).toUpperCase()}
              </span>
            )}
          </button>

          {open && (
            <div role="menu" className={panelCls}>
              {/* Who you are — the reason the avatar needs no text label. */}
              <div className="border-b border-foreground/10 px-3 pb-2 pt-1.5">
                {account.name && (
                  <p className="truncate font-pixel text-sm text-foreground">{account.name}</p>
                )}
                <p className="truncate text-xs text-muted">{account.email}</p>
              </div>
              <Link href="/account" role="menuitem" className={itemCls} onClick={close}>
                Account
              </Link>
              <Link href="/scenes" role="menuitem" className={itemCls} onClick={close}>
                My scenes
              </Link>
              <Link href="/pricing" role="menuitem" className={itemCls} onClick={close}>
                Plans
              </Link>
              <form action="/auth/signout" method="post" className="border-t border-foreground/10">
                <button type="submit" role="menuitem" className={itemCls}>
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ── Phones: one button for the whole nav ──
          Rendered even while auth is still loading, unlike the two blocks
          above: the button looks the same in both states, so there is no
          signed-out → signed-in flash to avoid, and hiding it would leave the
          bar with no menu at all on a slow session lookup. */}
      <div ref={burgerRef} className="relative order-2 flex items-center sm:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="btn-pixel flex h-9 w-9 items-center justify-center rounded-full bg-panel"
        >
          {open ? (
            <X className="h-4 w-4 text-foreground" strokeWidth={3} aria-hidden />
          ) : (
            <Menu className="h-4 w-4 text-foreground" strokeWidth={3} aria-hidden />
          )}
        </button>

        {open && (
          <div role="menu" className={panelCls}>
            {account && (
              <div className="border-b border-foreground/10 px-3 pb-2 pt-1.5">
                {account.name && (
                  <p className="truncate font-pixel text-sm text-foreground">{account.name}</p>
                )}
                <p className="truncate text-xs text-muted">{account.email}</p>
              </div>
            )}

            {links.map(renderLink)}

            {/* Pricing sits with the page links, not the account rows: on a
                phone it is a nav destination like any other. */}
            <Link
              href="/pricing"
              role="menuitem"
              className={`${itemCls} ${links.length ? "border-t border-foreground/10" : ""}`}
              onClick={close}
            >
              {account ? "Plans" : "Pricing"}
            </Link>

            {account === null && (
              <Link
                href="/login"
                role="menuitem"
                className={`${itemCls} border-t border-foreground/10`}
                onClick={close}
              >
                Sign in
              </Link>
            )}

            {account && (
              <>
                <Link
                  href="/account"
                  role="menuitem"
                  className={`${itemCls} border-t border-foreground/10`}
                  onClick={close}
                >
                  Account
                </Link>
                <Link href="/scenes" role="menuitem" className={itemCls} onClick={close}>
                  My scenes
                </Link>
                <form action="/auth/signout" method="post" className="border-t border-foreground/10">
                  <button type="submit" role="menuitem" className={itemCls}>
                    Sign out
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

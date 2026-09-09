# Gifsy auth emails

Branded replacements for Supabase's default auth emails. These are pasted into
the Supabase dashboard, not read by the app at runtime — they live here so the
copy and markup are versioned alongside the site they link to.

| File | Dashboard template | Subject line |
| --- | --- | --- |
| `confirm-signup.html` | Confirm signup | Confirm your Gifsy account |
| `reset-password.html` | Reset password | Reset your Gifsy password |

Only Confirm signup is reachable today — `app/login/page.tsx` has no
forgot-password flow. `reset-password.html` is ready for when it does, and its
shell is the one to copy for Magic Link / Change email / Invite if those are
ever turned on.

## Branding an auth email takes two changes, not one

**1. Templates** (Dashboard -> Authentication -> Emails -> pick a template ->
"Custom" -> paste the file's contents -> set the subject). This is what the
files here are for.

**2. Custom SMTP** (Dashboard -> Project Settings -> Authentication -> SMTP
Settings). Without it the templates still render, but:

- the sender stays `Supabase Auth <noreply@mail.app.supabase.io>`, which is the
  part of the screenshot that looks least like Gifsy and cannot be changed any
  other way;
- Supabase appends its own footer ("You're receiving this email because you
  signed up for an application powered by Supabase" + an opt-out link);
- the built-in service is **rate limited for testing only** — a handful of
  emails per hour, project-wide. That is a production signup blocker, not a
  cosmetic one.

Supabase's own docs are explicit that the built-in email service is not for
production. So SMTP is the change that actually matters; the templates are the
polish on top.

An SMTP provider has to be picked and its domain verified (SPF + DKIM DNS
records on gifsy.fun) before the sender can read `Gifsy <hello@gifsy.fun>`.
Vercel's marketplace lists **Resend** for this (`vercel integration discover
email`), which keeps it on the same bill as the rest of the project.

## Why the markup looks like 2005

Email clients, not preference:

- Tables and inline styles. Gmail strips `<style>`, flexbox and grid.
- No `@font-face`, so **Pixelify Sans cannot load**. The wordmark is the hosted
  PNG (`https://www.gifsy.fun/gifsy-logo.png`) and headings lean on weight 800
  + uppercase + letter-spacing to keep the HUD feel.
- `box-shadow` is stripped by Gmail, and nested spacer tables collapse to zero
  height (tried, verified). The hard ink offset shadow is instead an ink-filled
  outer cell with asymmetric padding (`padding:0 6px 6px 0`), which every
  client supports.
- **Pure ASCII**, with `&mdash;` / `&middot;` as entities. Supabase does not
  always send a `charset`, and raw UTF-8 punctuation arrived as `â€"` in
  testing.
- `color-scheme:light` and an explicit colour on every element, or Gmail and
  Apple Mail dark mode invert the palette.

Palette tracks `app/globals.css`: ink `#0e2438`, sky `#2e9bf0`, background
`#eaf4ff`, muted `#5b6b7d`.

## Known issue these templates deliberately do not touch

Both files use `{{ .ConfirmationURL }}`, exactly like the Supabase defaults, so
pasting them changes appearance only.

Worth a separate look: `app/auth/confirm/route.ts` reads `token_hash` and
`type` from the query string, which is the shape of the *token-hash* template
style (`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`).
`{{ .ConfirmationURL }}` does not produce that — it points at Supabase's own
`/auth/v1/verify`, which verifies and then redirects to `emailRedirectTo`. The
flow works, but the route's own verification branch is not what is running.
Switching the template to `{{ .TokenHash }}` would make the two agree, and
needs the `next` parameter rethought (`emailRedirectTo` is currently built in
`app/login/page.tsx` and would have to become the bare destination).

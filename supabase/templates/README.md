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

## Custom SMTP comes first, and it is not optional

On the Free plan the template editor is locked: the Emails screen shows "Set up
custom SMTP to edit templates" and the Subject/Body fields are read-only. So
this is one change, not two — SMTP is a hard prerequisite for everything here,
not a separate improvement. (The dropdown beside that banner also offers
"Upgrade to Pro", which unlocks template editing while keeping Supabase's own
mail service. That costs more and fixes less: the sender and footer below stay
as they are. Custom SMTP is available on Free.)

Enabling it (Dashboard -> Project Settings -> Authentication -> SMTP Settings)
is also what removes the parts of the default email no template can touch:

- the sender, otherwise `Supabase Auth <noreply@mail.app.supabase.io>`;
- Supabase's appended footer ("You're receiving this email because you signed
  up for an application powered by Supabase" + an opt-out link);
- the rate limit on the built-in service -- a handful of emails per hour,
  project-wide. A production signup blocker, not a cosmetic one.

### What is configured here

Resend, on its own free tier (3,000/month, 100/day, SMTP relay included).

**Sign up at resend.com directly, not through the Vercel marketplace.** The
marketplace lists a free plan for Resend but rejects it on install
("Billing plan is disabled: free"), leaving Pro at $20/month as the cheapest
option -- $240/year for auth email on a product that charges $29 once.

Supabase SMTP settings:

| Field | Value |
| --- | --- |
| Host | `smtp.resend.com` |
| Port | `587` (STARTTLS) |
| Username | `resend` -- **lowercase**, and it is compared byte-for-byte |
| Password | a Resend API key, Sending access only |
| Sender | `Gifsy <hello@gifsy.fun>` |

The lowercase username matters: `RESEND` authenticates as a bad login, and
both that and an unverified domain surface identically in the app as
"Error sending confirmation email". Supabase -> Logs -> Auth Logs is what
separates them (535 = credentials, 403 = domain).

### DNS on gifsy.fun

Verification needs three records, and current Resend accounts use CNAMEs
rather than the SPF TXT + MX pair older guides describe:

    resend._domainkey   TXT     p=MIGfMA0GCSqGSI...   (DKIM)
    send                CNAME   send.forge.rmta.net
    rsend               CNAME   rsend-apne1.forge.rmta.net

DNS is at Hostinger (nameservers `nebula`/`aurora.dns-parking.com`), not
Vercel, so `vercel dns` cannot manage it. Hostinger appends the domain to the
Name field, so enter `send`, not `send.gifsy.fun` -- the latter silently
creates `send.gifsy.fun.gifsy.fun`.

Check propagation against the authority, since a resolver that was queried
before the records existed will hold a negative cache:

    dig +short @nebula.dns-parking.com send.gifsy.fun CNAME

Still missing: a `_dmarc` TXT record. Not required by Resend, but `p=none` is
the normal next step for inbox placement.

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

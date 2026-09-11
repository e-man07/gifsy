// Launch promo: Pro's normal one-time price is cut to $5 for a fixed 24-hour
// window. The actual charge is whatever the Pro product is priced at on the
// Dodo dashboard — that price change (and reverting it once the window ends)
// is a manual step taken there, not something this file or any server code
// enforces. This just drives the countdown and strikethrough copy so the
// site can show/hide the offer without a backend flag.
//
// OFFER_ENDS_AT is a fixed, hardcoded deadline (not "now + 24h" computed at
// request time, which would silently extend the offer forever on every
// reload) — everyone sees the same countdown, and it ends for good the
// moment this timestamp passes.
export const OFFER_PRICE = "$5";
export const OFFER_ENDS_AT = "2026-09-12T13:50:00.000Z";

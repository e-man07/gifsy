// Single place for the details the policy pages depend on. Every value here is
// rendered verbatim on a public policy page, so treat changes as legal edits
// rather than copy tweaks — and bump POLICY_LAST_UPDATED when the text moves.

/** Support/privacy contact. Must be an address you actually monitor. */
export const CONTACT_EMAIL = "aman@metamemory.tech";

/** Country/state whose law governs the Terms. Gifsy operates from India.
 *  If you later want a specific bench named (the usual Indian drafting is
 *  "the courts at <city>"), add the city here and adjust the Terms sentence. */
export const GOVERNING_LAW = "India";

/** Trading name shown in the policies. There is no registered company: the
 *  service is operated by the individuals in lib/founders.ts, trading as this. */
export const COMPANY_NAME = "Gifsy";

/** Shown at the top of each policy. Bump when you change the text. */
export const POLICY_LAST_UPDATED = "17 September 2026";

/** Days after the Pro payment during which a refund is granted on request.
 *  Pro is a single payment, so there is exactly one payment this can apply to. */
export const REFUND_WINDOW_DAYS = 14;

/** What "lifetime" means in the policies, stated the same way everywhere:
 *  a one-time payment with no renewal, for as long as the service runs. */
export const LIFETIME_MEANING =
  "for as long as Gifsy operates as a service";

// The people behind Gifsy, stated once so the legal pages, the About page,
// bylines and the Organization/Person structured data can never disagree.
//
// There is no company yet: the service is operated by these two individuals,
// trading as "Gifsy". Dodo Payments is the merchant of record for purchases,
// so it — not the operators — is the seller on a Pro receipt.

export interface Founder {
  name: string;
  role: string;
  /** Public profile used as a `sameAs` identity link. */
  x: string;
}

export const FOUNDERS: readonly Founder[] = [
  { name: "Aman Jha", role: "Founder", x: "https://x.com/WhyParabola" },
  { name: "Priyanshu Tiwari", role: "Co-founder", x: "https://x.com/priyanshudotsol" },
];

/** Who signs the guides and comparisons. One byline: the articles are
 *  written by Aman; the footer and About still credit both founders. */
export const AUTHOR: Founder = FOUNDERS[0];

/** "Aman Jha and Priyanshu Tiwari" — for prose. */
export const OPERATOR_NAMES = FOUNDERS.map((f) => f.name).join(" and ");

/** Other public homes of the project, for the Organization `sameAs` list. */
export const GITHUB_URL = "https://github.com/e-man07/gifsy";
export const PRODUCT_HUNT_URL = "https://www.producthunt.com/products/gifsy";

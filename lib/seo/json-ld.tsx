// Structured data (schema.org JSON-LD), server-rendered.
//
// One helper per node type so pages compose a `@graph` from the same building
// blocks and the ids (`#organization`, `#website`, `#app`) stay stable across
// routes — Google merges nodes by `@id`, so a FAQ on /tools/gif can point at
// the same SoftwareApplication node the layout declares.
//
// Everything rendered here must also be visible on the page (FAQ answers,
// prices, names): schema that says more than the page does is a policy
// violation, not a ranking boost.

import { FOUNDERS, GITHUB_URL, PRODUCT_HUNT_URL } from "@/lib/founders";
import { FREE_GENERATION_LIMIT, PLAN_DISPLAY } from "@/lib/billing/plans";
import { siteOrigin } from "@/lib/site-url";

type Node = Record<string, unknown>;

export const ORG_ID = () => `${siteOrigin()}/#organization`;
export const SITE_ID = () => `${siteOrigin()}/#website`;
export const APP_ID = () => `${siteOrigin()}/#app`;
const personId = (name: string) =>
  `${siteOrigin()}/about#${name.toLowerCase().replace(/\s+/g, "-")}`;

/** Gifsy as a publisher/operator, plus its founders as Person nodes. */
export function organizationNodes(): Node[] {
  const origin = siteOrigin();
  const people: Node[] = FOUNDERS.map((f) => ({
    "@type": "Person",
    "@id": personId(f.name),
    name: f.name,
    jobTitle: f.role,
    url: `${origin}/about`,
    sameAs: [f.x],
    worksFor: { "@id": ORG_ID() },
  }));
  return [
    {
      "@type": "Organization",
      "@id": ORG_ID(),
      name: "Gifsy",
      url: origin,
      logo: `${origin}/opengraph-image`,
      sameAs: [GITHUB_URL, PRODUCT_HUNT_URL, ...FOUNDERS.map((f) => f.x)],
      founder: people.map((p) => ({ "@id": p["@id"] })),
    },
    ...people,
    {
      "@type": "WebSite",
      "@id": SITE_ID(),
      name: "Gifsy",
      url: origin,
      publisher: { "@id": ORG_ID() },
    },
  ];
}

/** The product itself. Free tier is $0; Pro is a one-time purchase. */
export function softwareApplicationNode(): Node {
  const origin = siteOrigin();
  const price = (p: string) => p.replace(/[^0-9.]/g, "") || "0";
  return {
    "@type": "SoftwareApplication",
    "@id": APP_ID(),
    name: "Gifsy",
    url: origin,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web browser",
    browserRequirements: "Requires a modern browser with WebGL and WebAssembly",
    description:
      "Turn one photo into an interactive 3D photo you can embed on any site, or into a GIF or a Telegram sticker — the AI runs in your browser.",
    featureList: [
      "Interactive 3D photo from one image (depth parallax)",
      "iframe embed for Webflow, Framer, Squarespace, WordPress",
      "Photo to GIF with motion presets and boomerang",
      "Telegram sticker maker with AI background removal",
    ],
    publisher: { "@id": ORG_ID() },
    offers: [
      {
        "@type": "Offer",
        name: PLAN_DISPLAY.free.name,
        price: price(PLAN_DISPLAY.free.price),
        priceCurrency: "USD",
        description: `${FREE_GENERATION_LIMIT} free 3D generations, unlimited GIFs and stickers`,
        url: `${origin}/pricing`,
      },
      {
        "@type": "Offer",
        name: PLAN_DISPLAY.pro.name,
        price: price(PLAN_DISPLAY.pro.price),
        priceCurrency: "USD",
        description: "One-time payment. Unlimited 3D generations, no badge, commercial use.",
        url: `${origin}/pricing`,
      },
    ],
  };
}

export interface Faq {
  q: string;
  a: string;
}

export function faqPageNode(faqs: Faq[]): Node {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbNode(items: { name: string; path: string }[]): Node {
  const origin = siteOrigin();
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${origin}${it.path}`,
    })),
  };
}

export function howToNode(opts: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
  totalTime?: string;
}): Node {
  return {
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    ...(opts.totalTime ? { totalTime: opts.totalTime } : {}),
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

/** Render a `@graph` as a JSON-LD script. Server component. */
export function JsonLd({ graph }: { graph: Node[] }) {
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph })
    // Prevent `</script>` injection if any string ever carries user content.
    .replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

// Registry for long-form pages: guides, alternatives, (later) blog. One entry
// per article; the page components read their own metadata from here so the
// index list, the article header, the sitemap and the JSON-LD never disagree.
//
// `date` is the first-publish date; `updated` moves when facts are re-checked
// (the alternatives pages promise a quarterly price re-check).

export type ArticleSection = "guides" | "alternatives" | "compare";

export interface Article {
  slug: string;
  section: ArticleSection;
  title: string;
  /** Tab title, when the H1 is too long for 60 chars. */
  shortTitle?: string;
  description: string;
  date: string; // ISO yyyy-mm-dd
  updated?: string;
  tags: string[];
  /** Approximate body word count, for the "N min read" label. */
  words: number;
}

export const SECTION_LABEL: Record<ArticleSection, { eyebrow: string; title: string; intro: string }> = {
  guides: {
    eyebrow: "Guides",
    title: "Guides",
    intro: "How interactive 3D photos work, and how to put one on a real website.",
  },
  alternatives: {
    eyebrow: "Alternatives",
    title: "Alternatives",
    intro: "Honest comparisons of 3D photo tools, with Gifsy as one entry among the rest.",
  },
  compare: {
    eyebrow: "Compare",
    title: "Compare",
    intro: "Side-by-side decisions: which 3D photo tool, and which output, for the job in front of you.",
  },
};

export const ARTICLES: Article[] = [
  {
    slug: "best-photos-for-3d-effect",
    section: "guides",
    title: "Best photos for a 3D effect — and the ones that fail",
    shortTitle: "Best Photos for a 3D Effect (and the Ones That Fail)",
    description:
      "What makes a photo turn into a convincing 3D scene: a clear subject, a receding background, an edge the matte can find. Eleven rules with the reason behind each, the six kinds of photo that fail and why, and a five-second test before you upload.",
    date: "2026-09-19",
    tags: ["photos", "how-to", "limits"],
    words: 1700,
  },
  {
    slug: "3d-hero-image",
    section: "guides",
    title: "A 3D hero image for your website: patterns that work, and a performance budget",
    shortTitle: "3D Hero Image for a Website: Patterns and a Performance Budget",
    description:
      "One interactive photo above the fold instead of a video or a static JPG. Six hero patterns, how to lay copy over a scene without blocking the drag, the load budget for an above-the-fold iframe, and the exact steps in Webflow, Framer, Squarespace and WordPress.",
    date: "2026-09-19",
    tags: ["hero", "use-case", "webflow", "framer"],
    words: 1800,
  },
  {
    slug: "3d-photo-portfolio",
    section: "guides",
    title: "Interactive 3D photos in a portfolio site: photographers, illustrators, 3D artists",
    shortTitle: "Interactive 3D Photos in a Portfolio Site",
    description:
      "Where a draggable photo earns its place in a portfolio and where it doesn't. Portrait and editorial photography, layered illustration, still renders from 3D and motion artists — with the badge question, gallery-versus-hero placement, and which portfolio builders take an iframe.",
    date: "2026-09-19",
    tags: ["portfolio", "use-case", "photography"],
    words: 1700,
  },
  {
    slug: "3d-photo-makers",
    section: "compare",
    title: "Best 3D photo makers in 2026: 10 tools compared by output, price and where your photo goes",
    shortTitle: "Best 3D Photo Makers (2026): 10 Tools Compared",
    description:
      "Every \"3D photo maker\" makes one of three things: an interactive scene, a video file, or a stylised still. The table sorts ten tools by which, then by free tier, watermark, price model and whether your photo is uploaded — with a straight answer on when a video tool is the right pick.",
    date: "2026-09-19",
    tags: ["comparison", "3d-photo", "pricing"],
    words: 2300,
  },
  {
    slug: "interactive-3d-photos-for-websites",
    section: "guides",
    title: "Interactive 3D photos for websites: the complete guide (2026)",
    shortTitle: "Interactive 3D Photos for Websites: The Complete Guide",
    description:
      "Turn one photo into a 3D scene visitors can drag, then embed it in Webflow, Framer, Squarespace or WordPress. What it is, why interactive beats a video, how it works, what to shoot, what it costs — with a live scene to try.",
    date: "2026-09-18",
    tags: ["hub", "3d-photo", "embed", "websites"],
    words: 3100,
  },
  {
    slug: "3d-photo-squarespace",
    section: "guides",
    title: "How to add an interactive 3D photo to Squarespace (Code block, not Embed block)",
    shortTitle: "Add an Interactive 3D Photo to Squarespace",
    description:
      "Squarespace's Embed block wants an oEmbed URL; a Gifsy scene is an iframe, so it goes in a Code block. Where the block is, why 'Display source' must be off, the plan requirement, and how to size it on phones.",
    date: "2026-09-18",
    tags: ["squarespace", "embed", "how-to"],
    words: 1400,
  },
  {
    slug: "3d-photo-wordpress",
    section: "guides",
    title: "How to add a 3D photo to WordPress without a plugin",
    shortTitle: "Add a 3D Photo to WordPress Without a Plugin",
    description:
      "One Custom HTML block — no slider plugin, no Photoshop layers. The block editor, Elementor and the classic editor, the wp_kses gotcha that silently strips iframes for non-admins, and how to make it responsive in a theme you don't control.",
    date: "2026-09-18",
    tags: ["wordpress", "embed", "how-to"],
    words: 1600,
  },
  {
    slug: "telegram-sticker-pack-from-browser",
    section: "guides",
    title: "How to make Telegram stickers from a photo without an app",
    shortTitle: "Make Telegram Stickers From a Photo Without an App",
    description:
      "The whole flow from a browser: cut the subject out, get a 512×512 WebP, and build the pack with the @Stickers bot — including the /newpack vs /newemojipack trap and why you must send the file as a file.",
    date: "2026-09-18",
    tags: ["telegram", "stickers", "how-to"],
    words: 1500,
  },
  {
    slug: "telegram-sticker-size",
    section: "guides",
    title: "Telegram sticker size: 512×512, WebP vs PNG, and the 512 KB limit",
    shortTitle: "Telegram Sticker Size and Format",
    description:
      "The exact rules for a static Telegram sticker — one side exactly 512 px, PNG or WebP with transparency, under 512 KB — with a WebP-vs-PNG table, the 100×100 emoji confusion, and what the @Stickers bot actually rejects.",
    date: "2026-09-18",
    tags: ["telegram", "stickers", "reference"],
    words: 900,
  },
  {
    slug: "3d-photo-webflow",
    section: "guides",
    title: "How to add an interactive 3D photo to Webflow (one photo, no layers)",
    shortTitle: "Add an Interactive 3D Photo to Webflow",
    updated: "2026-09-18",
    description:
      "Every \"interactive image Webflow\" tutorial wants Photoshop-cut layers and an Interactions rig. This one starts from a single photo and uses Webflow's Code Embed — about ten minutes, no code beyond one iframe. Tested on a free account: what's locked, what it costs, and the free-plan video route.",
    date: "2026-09-17",
    tags: ["webflow", "embed", "how-to", "tested"],
    words: 2150,
  },
  {
    slug: "embed-3d-photo-on-website",
    section: "guides",
    title: "How to embed a 3D photo on any website (iframe guide)",
    shortTitle: "Embed a 3D Photo on Any Website",
    description:
      "The universal iframe snippet, every attribute explained, what the frame actually loads, and the exact menu path for Webflow, Framer, Squarespace, WordPress, Wix, Carrd, Notion and Shopify — plus the troubleshooting table.",
    date: "2026-09-17",
    tags: ["embed", "iframe", "reference"],
    words: 1750,
  },
  {
    slug: "how-3d-photos-work",
    section: "guides",
    title: "How do 3D photos work? Depth maps, mattes and two planes, explained",
    shortTitle: "How 3D Photos Work",
    description:
      "One photo becomes a scene with depth in five steps: a depth map, a subject matte, an inpainted backdrop, two displaced planes, and a camera orbit that stops at 23° for a reason. The models, the numbers, and what a 3D photo can't do.",
    date: "2026-09-17",
    tags: ["explainer", "depth-map", "3d-photo"],
    words: 2400,
  },
  {
    slug: "3d-photo-framer",
    section: "guides",
    title: "How to add a 3D photo to Framer with the Embed component",
    shortTitle: "Add a 3D Photo to Framer",
    description:
      "Framer's Embed component takes raw HTML, so an interactive 3D photo is one iframe away — and it publishes on the free plan. Where the component lives, sizing per breakpoint, the transparent-WebM route via the Video component, and what the free plan gates.",
    date: "2026-09-17",
    updated: "2026-09-18",
    tags: ["framer", "embed", "how-to", "tested"],
    words: 1250,
  },
  {
    slug: "immersity-ai",
    section: "alternatives",
    title: "Immersity AI (LeiaPix) alternatives in 2026: 8 tools compared",
    shortTitle: "Immersity AI Alternatives (2026): 8 Tools Compared",
    description:
      "Immersity for Web now watermarks free exports and sells monthly credits — and no plan gives you a web embed. Eight alternatives, split by what you actually get: interactive embed, video file, or 3D mesh.",
    date: "2026-09-17",
    updated: "2026-09-17",
    tags: ["immersity", "leiapix", "comparison", "3d-photo"],
    words: 2580,
  },
];

export const articlePath = (a: Article) => `/${a.section}/${a.slug}`;
export const readTime = (words: number) => `${Math.max(1, Math.round(words / 220))} min read`;
export const articlesIn = (section: ArticleSection) =>
  ARTICLES.filter((a) => a.section === section).sort((a, b) => (a.date < b.date ? 1 : -1));
export const findArticle = (section: ArticleSection, slug: string) =>
  ARTICLES.find((a) => a.section === section && a.slug === slug);

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

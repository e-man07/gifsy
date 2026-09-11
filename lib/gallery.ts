// Curated showcase for the outward-facing 3D gallery.
//
// Each item maps to a pre-rendered clip + poster already sitting in /public:
//   /gallery/<id>.webm   (the depth-parallax orbit, lazy-loaded)
//   /gallery/<id>.jpg    (first frame, ~30KB, painted immediately — no CLS)
//
// These are RECORDINGS of Gifsy's 3D mode, not the live interactive scene
// (that lives at /s/[id]). Sources are Unsplash/Pexels-license image *types*
// only — no recognizable IP — so the set is safe for a public page.
//
// All clips share one aspect ratio, so the grid can reserve each card's box
// up front (see GALLERY_W/H) and never shift as videos load in.

export const GALLERY_W = 578;
export const GALLERY_H = 420;

/** Palette token used for a category's label shadow + badge (see app/globals.css). */
export type Accent = "sky" | "sky-deep" | "grass" | "sun" | "petal";

export type GalleryItem = {
  /** Basename of the .webm/.jpg pair under /public/gallery. */
  id: string;
  /** Visible caption. */
  title: string;
};

export type GalleryCategory = {
  key: string;
  label: string;
  blurb: string;
  accent: Accent;
  items: GalleryItem[];
};

export const GALLERY: GalleryCategory[] = [
  {
    key: "characters",
    label: "Characters",
    blurb: "3D avatars that lean off the screen.",
    accent: "sky",
    items: [
      { id: "character-5", title: "Blue-Hair Avatar" },
      { id: "character-1", title: "Orange Explorer" },
      { id: "character-6", title: "Grinning Avatar" },
      { id: "character-2", title: "Green Bean" },
      { id: "character-4", title: "Tiny Serenade" },
    ],
  },
  {
    key: "animals",
    label: "Animals",
    blurb: "Portraits with real depth of field.",
    accent: "grass",
    items: [
      { id: "animals-1", title: "Golden Retriever" },
      { id: "animals-3", title: "Red Fox" },
      { id: "animals-4", title: "Retriever, Standing" },
      { id: "animals-5", title: "Fox in Snow" },
    ],
  },
  {
    key: "flowers",
    label: "Flowers",
    blurb: "Macro blooms, layer by layer.",
    accent: "petal",
    items: [
      { id: "flowers-4", title: "Blue Bloom" },
      { id: "flowers-7", title: "Pink Dahlia" },
      { id: "flowers-5", title: "Dahlia, White & Pink" },
      { id: "flowers-1", title: "Wildflower" },
    ],
  },
  {
    key: "food",
    label: "Food & Drink",
    blurb: "Warm tables you could reach into.",
    accent: "sun",
    items: [
      { id: "food-7", title: "The Burger" },
      { id: "food-2", title: "Latte Art" },
      { id: "food-1", title: "Coffee for Two" },
    ],
  },
  {
    key: "landscapes",
    label: "Landscapes",
    blurb: "Scenery that breathes.",
    accent: "sky-deep",
    items: [
      { id: "nature-4", title: "Island Tree" },
      { id: "nature-1", title: "Dawn Ridge" },
      { id: "nature-2", title: "Field & Mountains" },
    ],
  },
  {
    key: "stilllife",
    label: "Still Life",
    blurb: "Painterly, patient, dimensional.",
    accent: "sun",
    items: [
      { id: "stilllife-4", title: "Pear & Grapes" },
      { id: "stilllife-2", title: "Book & Apple" },
      { id: "stilllife-1", title: "Quiet Table" },
    ],
  },
];

/** Total curated scenes — handy for hero copy / headers. */
export const GALLERY_COUNT = GALLERY.reduce((n, c) => n + c.items.length, 0);

export type FeaturedItem = GalleryItem & { accent: Accent };

/**
 * Clips whose recording doesn't sell the effect, kept off the landing strip
 * (they still appear in the full gallery). "The Burger" (food-7): its
 * parallax swing carries the burger almost out of frame behind a dark
 * foreground shape, which reads as a mistake rather than a demo.
 */
const SHOWCASE_EXCLUDE = new Set(["food-7"]);

/**
 * Every curated clip for the landing-page strip, dealt round-robin across
 * categories so a run of cards is a pet, a character, a landscape, a bloom —
 * never four variations of one thing. Each carries its category accent.
 */
export const SHOWCASE: FeaturedItem[] = (() => {
  const out: FeaturedItem[] = [];
  const longest = Math.max(...GALLERY.map((c) => c.items.length));
  for (let i = 0; i < longest; i++) {
    for (const cat of GALLERY) {
      const it = cat.items[i];
      if (it && !SHOWCASE_EXCLUDE.has(it.id)) out.push({ ...it, accent: cat.accent });
    }
  }
  return out;
})();

// Live, interactive 3D scenes shown directly on the landing page.
//
// These are OUR scenes, baked ahead of time: a source photo plus a depth map
// generated offline with the very same model the app runs in the browser
// (Depth Anything V2 small, fp16, 770px working pass, 0.5/99.5 percentile
// normalisation — identical to lib/depth.ts).
//
// Why this can sit above the fold: a *published* scene ships NO AI model to the
// viewer — SceneViewer only ever consumes a finished image + depth pair. So a
// first-time visitor drags a genuinely interactive 3D scene seconds after
// landing, instead of being asked for a photo and a ~150MB model download on
// faith. That was the single biggest hole in the funnel.
//
// Each scene ships a subject cut-out too (`-mask.png`), generated with the same
// ISNet model @imgly/background-removal runs in the browser. Without it the
// renderer has only one displaced plane, so the image reads as a flat sheet
// tilting rather than a subject standing in front of a background — depth
// without separation isn't legibly 3D.
//
// Each scene also ships a baked LaMa backdrop (`-bg.webp`) — the subject
// painted out — generated with the same model the publish flow runs
// server-side. Without it the renderer falls back to a client-side push-pull
// fill, which leaves a flat smeared rectangle in the gap parallax opens up
// beside the subject. That artifact is very visible on the landscape scene.
//
// To add one: put <id>.jpg in public/gallery, generate public/demo/<id>-depth.png
// and public/demo/<id>-mask.webp and -bg.webp with the same models, then add
// an entry below.

export interface DemoScene {
  id: string;
  title: string;
  /** One-liner naming what kind of depth this photo shows off. */
  blurb: string;
  /** Render the subject alone on transparency, composited onto the page.
   *  Shown alongside the normal scenes so the two can be compared directly. */
  subjectOnly?: boolean;
}

// Chosen by measurement, not taste. Each candidate was run through ISNet and
// scored on two numbers: what share of the frame the subject occupies, and how
// much clear background surrounds its bounding box. The first picks here were
// tight crops — the fox filled 52% of its frame and ran off every edge — so
// there was nowhere for the subject to travel, and parallax just smeared
// against the frame instead of reading as depth.
//
// These three all sit well inside the frame and none is clipped by it, so the
// subject has somewhere to travel and the separation stays legible.
//
// The "clipped" test is not cosmetic — it predicts failure. A subject running
// off the frame edge has no matte there, so the foreground layer stretches into
// a torn smear the moment the camera swings. A hiker shot that looked superb as
// a still tore apart on the first drag, exactly as its clipped flag warned.
export const DEMO_SCENES: DemoScene[] = [
  // All of these render background-free. A rectangular scene shows its plane
  // edge as a skewed corner at the extremes of an orbit; a cut-out has no plane
  // to show, so it stays clean at every angle *and* demonstrates the
  // compositing mode that makes the embed worth paying for.
  //
  // Deliberately different *kinds* of subject — product, photographed animal,
  // rendered character, portrait — so the section reads as "this works on your
  // stuff", not "this works on cartoons".
  { id: "product-cans", title: "Two Cans", blurb: "Product shot", subjectOnly: true },
  { id: "dog-field", title: "Blue Merle", blurb: "Photo subject", subjectOnly: true },
  { id: "character-2", title: "Green Bean", blurb: "3D render", subjectOnly: true },
  // Assets baked with scripts/make-demo-assets.py. A 540x360 source, so its
  // depth is softer than the others — kept because the close crop puts the
  // subject right up against the camera, which is the most striking read of
  // the effect in the set.
  { id: "dog-golden", title: "Happy Retriever", blurb: "Close portrait", subjectOnly: true },
];

export const demoImageSrc = (id: string) => `/gallery/${id}.jpg`;
export const demoDepthSrc = (id: string) => `/demo/${id}-depth.png`;
/** Subject cut-out with alpha — the foreground layer. WebP rather than the
 *  PNG the publish pipeline stores: same matte at a fifth of the bytes, and
 *  these three sit on the landing page. Encoded with alphaQuality 100 so the
 *  cut-out edge — the thing that sells the separation — stays crisp. */
export const demoMaskSrc = (id: string) => `/demo/${id}-mask.webp`;
/** Subject-removed backdrop, so disocclusion reveals real scenery. Only
 *  fetched for scenes that actually render one — a cut-out never does. */
export const demoBgSrc = (id: string) => `/demo/${id}-bg.webp`;

/** Shared aspect ratio of the demo assets — reserves each card's box so the
 *  grid never reflows as scenes initialise.
 *
 *  ⚠️ Mirrored as a literal in components/LiveScenes.tsx
 *  (`sm:aspect-[578/420]`), because a Tailwind arbitrary value cannot be
 *  interpolated from a runtime constant. Change both together. */
export const DEMO_ASPECT = "578 / 420";

// Shared 2.5D scene construction — used by the creator preview (ThreeDPreview)
// and the lightweight published-scene viewer (SceneViewer). Keeps both
// renderers from drifting: same shaders, same layer split, same live controls.
// The viewer never runs AI — it consumes already-generated assets.

import * as THREE from "three";
import type { Framing, SceneConfig } from "./types";
import { blurAlpha, getCtx, imageToCanvas, makeCanvas } from "@/lib/image";
import { cleanCutout, inpaintBackground } from "./refine";
import {
  backgroundFragmentShader,
  backgroundVertexShader,
  foregroundFragmentShader,
  foregroundVertexShader,
  planeFragmentShader,
  planeVertexShader,
  shadowFragmentShader,
  shadowVertexShader,
} from "./shaders";

// Background displacement factor — subject (foreground) displaces up to ~2× more.
export const FG_DEPTH_BASE = 0.55;

// ── Phase 2 parallax tuning ──────────────────────────────────────────────────
// The eased pointer drives a depth-weighted XY vertex offset (true differential
// parallax). The foreground (subject) responds much more strongly than the
// background, so the subject clearly leads and pops off the backdrop. DEPTH_BIAS
// is the depth value that stays put (the pivot plane); pixels nearer than it
// slide one way, farther the other. The bg base is now a subject-removed fill
// (see buildParallaxScene), so the subject can slide hard without ever revealing
// a baked-in twin — which is what lets these values be bold. BG_OVERSCAN + the
// backdrop's edge-hold keep a lateral slide from ever revealing a gutter.
const GEO_SEGMENTS = 300; // was 150: hard depth steps inside a subject (open jacket, an ear) tore into a sawtooth at the orbit extreme; 4× the triangles is still trivial for a GPU
const BG_OVERSCAN = 1.08; // a touch more headroom behind the subject at motion extremes
const DEPTH_BIAS = 0.4;
const PARALLAX_BG = 0.1;
const PARALLAX_FG = 0.34; // subject leads strongly (was 0.15) — the primary pop
const PARALLAX_SHADOW = 0.16; // between bg and fg → shadow lags the subject, gap opens
const PARALLAX_PLANE = 0.2;
// Subject XY slide is near-rigid so its feathered silhouette translates instead of
// stretching at the depth step (which reads as a horizontal smear at strong parallax).
const FG_RELIEF_XY = 0.15; // 0 = perfectly rigid slide; a little internal parallax for life
const FG_SUBJECT_DEPTH = 0.8; // representative subject depth for the rigid slide

// ── Shared camera framing (preview ⇄ embed must not drift) ───────────────────
// The plane is sized around `base`; the camera is then placed at the distance
// that makes it *cover* the viewport (fill it, cropping overflow) rather than a
// hardcoded distance that under-fills and letterboxes with a black border.
const PLANE_BASE = 1.6;
export const CAM_SWAY = 0.09; // camera XY drift coefficient — real orbit, not a shimmer
export const COVER_REST = 0.92; // plane overfill at rest — ~8% bleed hides the camera sway
export const COVER_HOVER = 0.84; // hover eases the camera in for a zoom
export const COVER_CAPTURE = 0.92; // export framing — same bleed as live so clips match

// ── Orbit mode (grab-to-spin the depth relief) ───────────────────────────────
// A genuine camera arc around the depth-displaced geometry — real perspective
// parallax and self-occlusion, not a shader slide. Single-image depth is a
// one-sided height-field, so this is honest only within a shallow cone; past it
// the relief's stretched silhouette edges smear (worst on a frame-filling
// subject). Verified against real frames (qa-3d/verify): at ±32°/±19° a
// frame-filling cartoon smeared its outer third; this tighter cone keeps the
// held-drag extreme inside the honest zone while the arc still reads as real 3D.
export const ORBIT_MAX_THETA = 0.4; // ~23° azimuth — past this the bas-relief edges smear
export const ORBIT_MAX_PHI = 0.22; // ~13° elevation
// Radius = coverDistance × this. Must be small enough that a *tilted* plane
// still fills the frame: orbiting to (ORBIT_MAX_THETA, ORBIT_MAX_PHI)
// foreshortens the plane by cos(0.4)·cos(0.22) ≈ 0.896, so anything above that
// lets the viewport see past the plane edge — which is what the old 0.9 did,
// missing it by half a percent and showing a bare corner at the extremes of
// every orbit. 0.85 clears it with margin for the depth displacement and the
// perspective spread, which push geometry further than the flat cosine implies.
export const ORBIT_COVER = 0.85;
export const ORBIT_RELIEF_BIAS = 0.0; // subject relief displaces fully forward → stays in front of the backdrop (no poke-through)
export const ORBIT_RELIEF_BOOST = 1.2; // a little extra bulge so the arc reads as real depth (was 1.35 — less bulge = less edge-stretch when tilted)

/** Position a camera on the orbit sphere (azimuth θ, elevation φ, given radius), looking at the origin. */
export function placeOrbit(
  camera: THREE.PerspectiveCamera,
  theta: number,
  phi: number,
  radius: number,
): void {
  const cp = Math.cos(phi);
  camera.position.set(
    radius * Math.sin(theta) * cp,
    radius * Math.sin(phi),
    radius * Math.cos(theta) * cp,
  );
  camera.lookAt(0, 0, 0);
}

/** Plane dimensions for an image aspect — the one source of truth for both viewers. */
export function planeDims(aspect: number): { pw: number; ph: number } {
  return aspect >= 1
    ? { pw: PLANE_BASE, ph: PLANE_BASE / aspect }
    : { pw: PLANE_BASE * aspect, ph: PLANE_BASE };
}

/**
 * Camera Z at which a pw×ph plane is fully *contained* in the viewport — the
 * opposite of coverDistance, which fills and crops the overflow.
 *
 * Subject-only scenes must use this. Cover-fitting crops the plane's edges,
 * which is free when a backdrop fills them but slices the subject itself once
 * the backdrop is gone — cans cut off at the bottom, a dog with no feet. There
 * is no cost to containing here: the uncovered area is transparent anyway.
 */
export function containDistance(
  fovDeg: number,
  pw: number,
  ph: number,
  aspect: number,
): number {
  const tanHalf = Math.tan((fovDeg * Math.PI) / 180 / 2);
  return Math.max(ph / 2, pw / 2 / aspect) / tanHalf;
}

/** Extra pull-back for a contained subject so it never kisses the frame edge
 *  as the camera swings to the orbit extremes. */
export const SUBJECT_MARGIN = 1.12;

/** Extra pull-back for a pop-out scene. The subject is displaced toward the
 *  camera, so perspective magnifies it by roughly 10-15% relative to the
 *  backdrop — this headroom lets it cross the backdrop's edge (the whole point)
 *  while still staying inside the canvas. */
export const POPOUT_MARGIN = 1.18;
/** Pop-out hover zoom. Much gentler than COVER_HOVER: there is no bleed to hide
 *  here, and pulling in hard would push the lifted subject out of the canvas. */
export const POPOUT_HOVER = 0.96;

/** Camera Z at which a pw×ph plane exactly covers a viewport of the given aspect. */
export function coverDistance(
  fovDeg: number,
  pw: number,
  ph: number,
  aspect: number,
): number {
  const tanHalf = Math.tan((fovDeg * Math.PI) / 180 / 2);
  return Math.min(ph / 2, pw / 2 / aspect) / tanHalf;
}

/**
 * Every camera distance a viewer needs, for one scene.
 *
 * This exists because the preview, the share page, the embed and the GIF/WebM
 * exporter each used to compute their own `coverDistance(...) * SOME_CONSTANT`.
 * That is four places to keep in agreement, and they had already drifted once:
 * subject-only scenes were contained in the embed but still cover-fit in the
 * workshop preview, so a cut-out subject looked cropped while you were editing
 * it and correct after publishing. Ask this function instead.
 */
export interface FramingPlan {
  /** Camera Z at rest, for the non-orbit motion modes. */
  rest: number;
  /** Camera Z while the pointer is over the scene (a gentle push-in). */
  hover: number;
  /** Radius of the orbit sphere. */
  orbit: number;
  /** Camera Z for exported frames, so clips match what was on screen. */
  capture: number;
}

/**
 * Where a cut-out subject actually sits on the plane, and how much of it it
 * spans.
 *
 * Framing a subject-only scene to the whole plane wastes whatever empty photo
 * surrounded the subject: the landing-page demos are cut-outs from 578x420
 * photos where the subject covers well under half the frame, so they rendered
 * small and lost in space while the same pipeline on a tight crop filled its
 * card. Measuring the matte lets the camera frame the subject instead of the
 * photo it came from.
 *
 * This measures the true bounding box AND its centre, because a symmetric
 * measurement (twice the furthest reach from the plane centre) silently fails
 * on an off-centre subject: the Blue Merle demo's matte touches the top edge
 * but stops well short of the bottom, which read as spanning 98.6% of the
 * frame when its box is really 82.6% — so it barely zoomed and rendered
 * visibly smaller than the others. Callers re-centre the scene with
 * `subjectRecentre` so the box can be framed for what it is.
 */
export interface SubjectExtent {
  /** Bounding-box width as a share of plane width, 0..1. */
  fx: number;
  /** Bounding-box height as a share of plane height, 0..1. */
  fy: number;
  /** Box centre in normalised image coordinates (0..1, y down). */
  cx: number;
  cy: number;
  /** Box size in matte pixels — the amount of real edge detail available. */
  bw: number;
  bh: number;
}

/**
 * Scene translation that puts the subject's centre at the origin, so the
 * existing camera maths — which always looks at (0,0,0) — frames the subject
 * without any re-targeting. Only meaningful for a subject-only scene: there is
 * no backdrop to drag off-centre with it.
 */
export function subjectRecentre(
  extent: SubjectExtent,
  pw: number,
  ph: number,
): { x: number; y: number } {
  // Image y runs down, world y runs up.
  return { x: -(extent.cx - 0.5) * pw, y: (extent.cy - 0.5) * ph };
}

/** Alpha threshold above which a pixel counts as subject. */
const EXTENT_ALPHA = 16;
/**
 * Ceiling on how large a cut-out may be drawn, in CSS pixels per pixel of its
 * own matte.
 *
 * A matte's silhouette is the roughest thing in the scene — ISNet leaves a
 * stair-stepped, slightly torn edge that disappears when the matte is
 * downscaled and reads as scattered pixels when it isn't. What matters is
 * therefore not how far the camera moved but how much real edge detail the
 * asset has for the size it's drawn at, and on a 280x203 landing card the demos
 * differ four-fold on exactly that (worst axis, which is usually width):
 *
 *   Green Bean   matte subject 233x295px  → 1.07 CSS px per matte px  ← ragged
 *   Happy Retriever          334x324      → 0.56
 *   product cans             755x648      → 0.28                     ← clean
 *   Blue Merle               557x720      → 0.25                     ← clean
 *
 * 0.85 pulls the one ragged outlier in by about a fifth and leaves the other
 * three untouched. Both axes are checked, because the limiting one for framing
 * is often not the coarse one. Expressed in CSS pixels on purpose, so a scene
 * is not framed differently on a retina display.
 *
 * This replaced a cap on camera zoom relative to plane-fit, which could not
 * work: plane-fit depends on the card's aspect, so one number was simultaneously
 * too loose on a landscape card and far too tight on a portrait one.
 */
const MAX_MATTE_SCALE = 0.85;

export function subjectExtent(cutout: HTMLImageElement): SubjectExtent {
  // 128px is plenty: this only decides a camera distance.
  const canvas = imageToCanvas(cutout, 128);
  const w = canvas.width;
  const h = canvas.height;
  const d = getCtx(canvas).getImageData(0, 0, w, h).data;

  let minX = w;
  let maxX = -1;
  let minY = h;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] <= EXTENT_ALPHA) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  // No subject found — frame the whole plane, centred.
  if (maxX < 0) {
    return {
      fx: 1,
      fy: 1,
      cx: 0.5,
      cy: 0.5,
      bw: cutout.naturalWidth || w,
      bh: cutout.naturalHeight || h,
    };
  }

  const span = (lo: number, hi: number, size: number) =>
    Math.min(1, (hi - lo + 1) / size);

  // bw/bh must be in the SOURCE matte's pixels, not this 128px probe's — they
  // stand for how much real edge detail the asset has, and measuring them on
  // the downscaled copy understated them by the probe's own scale factor
  // (~5.7x for a 720px matte), which made MAX_MATTE_SCALE wildly over-strict.
  const sx = (cutout.naturalWidth || w) / w;
  const sy = (cutout.naturalHeight || h) / h;

  return {
    fx: span(minX, maxX, w),
    fy: span(minY, maxY, h),
    cx: (minX + maxX + 1) / 2 / w,
    cy: (minY + maxY + 1) / 2 / h,
    bw: (maxX - minX + 1) * sx,
    bh: (maxY - minY + 1) * sy,
  };
}

/** The subject shader's Z relief scale (its `fgDepth` uniform). */
export function subjectReliefDepth(config: Pick<SceneConfig, "depthStrength" | "foregroundStrength">): number {
  return config.depthStrength * (FG_DEPTH_BASE + (1 - FG_DEPTH_BASE) * config.foregroundStrength);
}

/**
 * How far (world units) the subject's nearest pixel is pushed toward the
 * camera by the Z relief: `(d - bias) * fgDepth * 0.6 * boost` at d = 1 — the
 * vertex shader's formula. Orbit pushes all-forward (bias 0, boost 1.2); the
 * other modes are ± around 0.5. A contained subject has to be framed at this
 * pushed distance, or perspective magnifies it out of the frame: at the
 * default depth 0.5 that was ~30% overflow on a photo-sized matte.
 */
export function subjectReliefPush(config: Pick<SceneConfig, "depthStrength" | "foregroundStrength">): { rest: number; orbit: number } {
  const fg = subjectReliefDepth(config) * 0.6;
  return {
    rest: (1 - 0.5) * fg * 1.0,
    orbit: (1 - ORBIT_RELIEF_BIAS) * fg * ORBIT_RELIEF_BOOST,
  };
}

export function framingPlan(
  fovDeg: number,
  pw: number,
  ph: number,
  aspect: number,
  {
    framing = "window",
    subjectOnly = false,
    extent,
    viewportPx,
    reliefPush,
  }: {
    framing?: Framing;
    subjectOnly?: boolean;
    extent?: SubjectExtent;
    /** From subjectReliefPush(config); only a subject-only scene uses it. */
    reliefPush?: { rest: number; orbit: number };
    /** Canvas size in CSS pixels. Only needed for a subject-only scene, where
     *  it bounds how large the matte may be drawn (MAX_MATTE_SCALE). */
    viewportPx?: { w: number; h: number };
  } = {},
): FramingPlan {
  // Both of these need the plane fully inside the frame: a subject-only scene
  // because cropping would slice the subject itself, and a pop-out scene
  // because the backdrop's edge is the thing the subject pops over — crop it
  // and there is no edge to cross.
  if (subjectOnly || framing === "popout") {
    // A subject-only scene frames the SUBJECT's bounding box (measured from its
    // matte, with the scene re-centred on it) rather than the photo plane it was
    // cut from, so a cut-out fills its card no matter how much empty background
    // surrounded it or how off-centre it sat. Pop-out still frames the whole
    // plane — the backdrop's edge is the thing being popped over.
    const fitW = subjectOnly && extent ? pw * extent.fx : pw;
    const fitH = subjectOnly && extent ? ph * extent.fy : ph;
    let fit = containDistance(fovDeg, fitW, fitH, aspect);

    // Drawn size in CSS px = worldSize * canvasPx / (2 * d * tan(fov/2)), so
    // holding that under matteBoxPx * MAX_MATTE_SCALE is a floor on d. Closer
    // would just magnify the matte's ragged edge.
    if (subjectOnly && extent && viewportPx) {
      const tanHalf = Math.tan((fovDeg * Math.PI) / 180 / 2);
      const limit = (world: number, canvasPx: number, mattePx: number) =>
        mattePx > 0 && canvasPx > 0
          ? (world * canvasPx) / (2 * tanHalf * mattePx * MAX_MATTE_SCALE)
          : 0;
      fit = Math.max(
        fit,
        limit(fitH, viewportPx.h, extent.bh),
        limit(fitW, viewportPx.w, extent.bw),
      );
    }

    const base = fit * (subjectOnly ? SUBJECT_MARGIN : POPOUT_MARGIN);
    // The relief moves the subject toward the camera; add that distance back
    // so the framed size is the size of the *displaced* subject.
    const push = subjectOnly && reliefPush ? reliefPush : { rest: 0, orbit: 0 };
    return {
      rest: base + push.rest,
      hover: base * (subjectOnly ? 1 : POPOUT_HOVER) + push.rest,
      orbit: base + push.orbit,
      capture: base + push.rest,
    };
  }

  const base = coverDistance(fovDeg, pw, ph, aspect);
  return {
    rest: base * COVER_REST,
    hover: base * COVER_HOVER,
    orbit: base * ORBIT_COVER,
    capture: base * COVER_CAPTURE,
  };
}

/** Extract a cleaned cutout's alpha into an opaque grayscale mask, feathered to taste. */
export function buildMask(
  cutout: HTMLCanvasElement,
  feather: number,
  blurPx?: number,
): HTMLCanvasElement {
  const w = cutout.width;
  const h = cutout.height;
  const c = makeCanvas(w, h);
  const ctx = getCtx(c);
  ctx.drawImage(cutout, 0, 0);
  const id = ctx.getImageData(0, 0, w, h);
  const d = id.data;
  for (let i = 0; i < w * h; i++) {
    const a = d[i * 4 + 3];
    d[i * 4] = a;
    d[i * 4 + 1] = a;
    d[i * 4 + 2] = a;
    d[i * 4 + 3] = 255;
  }
  // Explicit radius (shadow) overrides the feather-derived one (subject edge).
  blurAlpha(d, w, h, blurPx ?? Math.round(feather * 6));
  ctx.putImageData(id, 0, 0);
  return c;
}

/** Upload a canvas/image as a texture (color vs data decides the color space). */
export function makeTexture(
  source: HTMLCanvasElement | HTMLImageElement,
  sRGB: boolean,
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(source);
  tex.colorSpace = sRGB ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

export interface ParallaxSceneInput {
  scene: THREE.Scene;
  image: HTMLImageElement;
  depthTex: THREE.CanvasTexture;
  cutout?: HTMLImageElement | null;
  /** Pre-baked LaMa subject-removed backdrop (published scenes). When present it
   *  replaces the client-side push-pull fill — real background structure, no
   *  smear. Absent → fall back to push-pull (creator preview, legacy scenes). */
  background?: HTMLImageElement | null;
  config: SceneConfig;
}

/** Live control handles for a built scene; strength/blur/feather/pointer update without rebuilding. */
export interface ParallaxScene {
  bgMat: THREE.ShaderMaterial | null;
  fgMat: THREE.ShaderMaterial | null;
  planeMat: THREE.ShaderMaterial | null;
  setDepthStrength(depthStrength: number, foregroundStrength: number): void;
  setBackgroundBlur(blur: number): void;
  setEdgeFeather(feather: number): void;
  setShadowStrength(strength: number): void;
  /** Orbit tuning: bias=depth mapped to zero Z (0=all-forward), boost=Z-relief multiplier. */
  setRelief(bias: number, boost: number): void;
  setPointer(x: number, y: number): void;
  dispose(): void;
}

/** Build the layered parallax meshes (background + optional feathered subject). */
export function buildParallaxScene(input: ParallaxSceneInput): ParallaxScene {
  const { scene, image, depthTex, cutout, background, config } = input;
  // Subject-only comes from the config so it rides along in the published
  // manifest. The point is compositing, not more depth: the embed stops being a
  // rectangle with its own background and becomes a cut-out that sits on the
  // host page's colour, gradient or dark mode. Needs a cutout to isolate.
  //
  // Trade-off worth knowing: without a backdrop you also lose the strongest
  // depth cue (subject moving against background), so the contact shadow and
  // the subject's own relief carry it. Kept the shadow for exactly that reason.
  const subjectOnly = Boolean(config.subjectOnly && cutout);
  const disposed: Array<{ dispose(): void }> = [depthTex];

  const aspect = image.naturalWidth / image.naturalHeight;
  const { pw, ph } = planeDims(aspect);
  // Exact-size plane for the subject; a slightly larger plane for the backdrop so
  // a lateral parallax slide never uncovers the frame edge behind the subject.
  const fgGeometry = new THREE.PlaneGeometry(
    pw,
    ph,
    GEO_SEGMENTS,
    GEO_SEGMENTS,
  );
  const bgGeometry = new THREE.PlaneGeometry(
    pw * BG_OVERSCAN,
    ph * BG_OVERSCAN,
    GEO_SEGMENTS,
    GEO_SEGMENTS,
  );
  disposed.push(fgGeometry, bgGeometry);

  let bgMat: THREE.ShaderMaterial | null = null;
  let fgMat: THREE.ShaderMaterial | null = null;
  let shadowMat: THREE.ShaderMaterial | null = null;
  let planeMat: THREE.ShaderMaterial | null = null;
  let maskTex: THREE.CanvasTexture | null = null;
  let cleaned: HTMLCanvasElement | null = null;

  if (cutout) {
    // Subject-only skips the whole backdrop: no plane, and no push-pull fill
    // computed for it either — which also makes this the cheapest path to build.
    if (!subjectOnly) {
      // The background's base map is a *sharp* subject-removed fill (not the full
      // original image), so sliding the subject never uncovers its baked-in twin;
      // the blurred fill feeds the stylistic background-blur control. A published
      // scene supplies a LaMa-inpainted backdrop (real structure); otherwise we
      // fall back to the client-side push-pull fill.
      const sharpFill: HTMLCanvasElement | HTMLImageElement =
        background ?? inpaintBackground(image, cutout, { blurPx: 0 });
      const fillTex = makeTexture(sharpFill, true);
      disposed.push(fillTex);
      const blurCanvas = makeCanvas(sharpFill.width, sharpFill.height);
      const blurCtx = getCtx(blurCanvas);
      blurCtx.filter = "blur(8px)";
      blurCtx.drawImage(sharpFill, 0, 0);
      const blurTex = makeTexture(blurCanvas, true);
      disposed.push(blurTex);
      bgMat = new THREE.ShaderMaterial({
        uniforms: {
          map: { value: fillTex },
          mapBlur: { value: blurTex },
          depthMap: { value: depthTex },
          depthStrength: { value: config.depthStrength * FG_DEPTH_BASE },
          blur: { value: config.backgroundBlur },
          uPointer: { value: new THREE.Vector2(0, 0) },
          uParallax: { value: PARALLAX_BG },
          uDepthBias: { value: DEPTH_BIAS },
        },
        vertexShader: backgroundVertexShader,
        fragmentShader: backgroundFragmentShader,
        transparent: false,
      });
      disposed.push(bgMat);
      scene.add(new THREE.Mesh(bgGeometry, bgMat));
    }

    cleaned = cleanCutout(cutout);
    const fgTex = makeTexture(cleaned, true);
    disposed.push(fgTex);
    maskTex = makeTexture(buildMask(cleaned, config.edgeFeather), false);
    disposed.push(maskTex);

    // Contact shadow: a soft black copy of the silhouette, cast on the backdrop
    // between it and the subject, offset toward a fixed light. It parallaxes less
    // than the subject so the gap opens as the camera moves → the subject reads as
    // floating off the background rather than painted on it.
    const shadowBlur = Math.max(
      4,
      Math.round(Math.min(cleaned.width, cleaned.height) * 0.03),
    );
    const shadowTex = makeTexture(buildMask(cleaned, 0, shadowBlur), false);
    disposed.push(shadowTex);
    shadowMat = new THREE.ShaderMaterial({
      uniforms: {
        maskMap: { value: shadowTex },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uParallax: { value: PARALLAX_SHADOW },
        uOffset: { value: new THREE.Vector2(pw * 0.015, -ph * 0.02) },
        uStrength: { value: (config.shadowStrength ?? 0.35) * 0.45 },
      },
      vertexShader: shadowVertexShader,
      fragmentShader: shadowFragmentShader,
      transparent: true,
      depthWrite: false,
    });
    disposed.push(shadowMat);
    const shadowMesh = new THREE.Mesh(fgGeometry, shadowMat);
    shadowMesh.position.z = 0.03; // just in front of the backdrop, behind the subject
    scene.add(shadowMesh);

    const fgDepth = subjectReliefDepth(config);
    fgMat = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: fgTex },
        maskMap: { value: maskTex },
        depthMap: { value: depthTex },
        fgDepth: { value: fgDepth },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uParallax: { value: PARALLAX_FG },
        uDepthBias: { value: DEPTH_BIAS },
        uReliefXY: { value: FG_RELIEF_XY },
        uSubjectDepth: { value: FG_SUBJECT_DEPTH },
        uReliefBias: { value: 0.5 }, // ± relief by default; orbit sets 0 (all-forward)
        uZBoost: { value: 1.0 }, // orbit exaggerates Z relief for the camera arc
      },
      vertexShader: foregroundVertexShader,
      fragmentShader: foregroundFragmentShader,
      transparent: true,
      depthWrite: false,
    });
    disposed.push(fgMat);
    const fgMesh = new THREE.Mesh(fgGeometry, fgMat);
    fgMesh.position.z = 0.08; // keep the subject clearly in front of the backdrop
    scene.add(fgMesh);
  } else {
    // Depth-only plane (Phase 2 path) — graceful fallback without segmentation.
    const mapTex = makeTexture(imageToCanvas(image), true);
    disposed.push(mapTex);
    planeMat = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: mapTex },
        depthMap: { value: depthTex },
        depthStrength: { value: config.depthStrength },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uParallax: { value: PARALLAX_PLANE },
        uDepthBias: { value: DEPTH_BIAS },
      },
      vertexShader: planeVertexShader,
      fragmentShader: planeFragmentShader,
      transparent: false,
    });
    disposed.push(planeMat);
    scene.add(new THREE.Mesh(bgGeometry, planeMat));
  }

  return {
    bgMat,
    fgMat,
    planeMat,
    setDepthStrength(depthStrength: number, foregroundStrength: number) {
      const fg =
        depthStrength *
        (FG_DEPTH_BASE + (1 - FG_DEPTH_BASE) * foregroundStrength);
      if (fgMat) fgMat.uniforms.fgDepth.value = fg;
      if (bgMat)
        bgMat.uniforms.depthStrength.value = depthStrength * FG_DEPTH_BASE;
      if (planeMat) planeMat.uniforms.depthStrength.value = depthStrength;
    },
    setBackgroundBlur(blur: number) {
      if (bgMat) bgMat.uniforms.blur.value = blur;
    },
    setEdgeFeather(feather: number) {
      if (!cleaned || !fgMat) return;
      const next = makeTexture(buildMask(cleaned, feather), false);
      fgMat.uniforms.maskMap.value = next;
      disposed.push(next);
      if (maskTex) {
        maskTex.dispose();
        maskTex = next;
      }
    },
    setShadowStrength(strength: number) {
      if (shadowMat) shadowMat.uniforms.uStrength.value = strength * 0.45;
    },
    setRelief(bias: number, boost: number) {
      if (!fgMat) return;
      fgMat.uniforms.uReliefBias.value = bias;
      fgMat.uniforms.uZBoost.value = boost;
    },
    setPointer(x: number, y: number) {
      if (bgMat) bgMat.uniforms.uPointer.value.set(x, y);
      if (fgMat) fgMat.uniforms.uPointer.value.set(x, y);
      if (shadowMat) shadowMat.uniforms.uPointer.value.set(x, y);
      if (planeMat) planeMat.uniforms.uPointer.value.set(x, y);
    },
    dispose() {
      for (const o of disposed) o.dispose();
    },
  };
}

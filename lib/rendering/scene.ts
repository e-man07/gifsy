// Shared 2.5D scene construction — used by the creator preview (ThreeDPreview)
// and the lightweight published-scene viewer (SceneViewer). Keeps both
// renderers from drifting: same shaders, same layer split, same live controls.
// The viewer never runs AI — it consumes already-generated assets.

import * as THREE from "three";
import type { SceneConfig } from "./types";
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
const GEO_SEGMENTS = 150; // was 72 — finer mesh renders the XY warp smoothly
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
export const ORBIT_COVER = 0.9; // radius = coverDistance × this (a touch closer so a tilted plane still fills)
export const ORBIT_RELIEF_BIAS = 0.0; // subject relief displaces fully forward → stays in front of the backdrop (no poke-through)
export const ORBIT_RELIEF_BOOST = 1.2; // a little extra bulge so the arc reads as real depth (was 1.35 — less bulge = less edge-stretch when tilted)

/** Position a camera on the orbit sphere (azimuth θ, elevation φ, given radius), looking at the origin. */
export function placeOrbit(camera: THREE.PerspectiveCamera, theta: number, phi: number, radius: number): void {
  const cp = Math.cos(phi);
  camera.position.set(radius * Math.sin(theta) * cp, radius * Math.sin(phi), radius * Math.cos(theta) * cp);
  camera.lookAt(0, 0, 0);
}

/** Plane dimensions for an image aspect — the one source of truth for both viewers. */
export function planeDims(aspect: number): { pw: number; ph: number } {
  return aspect >= 1
    ? { pw: PLANE_BASE, ph: PLANE_BASE / aspect }
    : { pw: PLANE_BASE * aspect, ph: PLANE_BASE };
}

/** Camera Z at which a pw×ph plane exactly covers a viewport of the given aspect. */
export function coverDistance(fovDeg: number, pw: number, ph: number, aspect: number): number {
  const tanHalf = Math.tan(((fovDeg * Math.PI) / 180) / 2);
  return Math.min(ph / 2, pw / 2 / aspect) / tanHalf;
}

/** Extract a cleaned cutout's alpha into an opaque grayscale mask, feathered to taste. */
export function buildMask(cutout: HTMLCanvasElement, feather: number, blurPx?: number): HTMLCanvasElement {
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
export function makeTexture(source: HTMLCanvasElement | HTMLImageElement, sRGB: boolean): THREE.CanvasTexture {
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
  const disposed: Array<{ dispose(): void }> = [depthTex];

  const aspect = image.naturalWidth / image.naturalHeight;
  const { pw, ph } = planeDims(aspect);
  // Exact-size plane for the subject; a slightly larger plane for the backdrop so
  // a lateral parallax slide never uncovers the frame edge behind the subject.
  const fgGeometry = new THREE.PlaneGeometry(pw, ph, GEO_SEGMENTS, GEO_SEGMENTS);
  const bgGeometry = new THREE.PlaneGeometry(pw * BG_OVERSCAN, ph * BG_OVERSCAN, GEO_SEGMENTS, GEO_SEGMENTS);
  disposed.push(fgGeometry, bgGeometry);

  let bgMat: THREE.ShaderMaterial | null = null;
  let fgMat: THREE.ShaderMaterial | null = null;
  let shadowMat: THREE.ShaderMaterial | null = null;
  let planeMat: THREE.ShaderMaterial | null = null;
  let maskTex: THREE.CanvasTexture | null = null;
  let cleaned: HTMLCanvasElement | null = null;

  if (cutout) {
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

    cleaned = cleanCutout(cutout);
    const fgTex = makeTexture(cleaned, true);
    disposed.push(fgTex);
    maskTex = makeTexture(buildMask(cleaned, config.edgeFeather), false);
    disposed.push(maskTex);

    // Contact shadow: a soft black copy of the silhouette, cast on the backdrop
    // between it and the subject, offset toward a fixed light. It parallaxes less
    // than the subject so the gap opens as the camera moves → the subject reads as
    // floating off the background rather than painted on it.
    const shadowBlur = Math.max(4, Math.round(Math.min(cleaned.width, cleaned.height) * 0.03));
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

    const fgDepth =
      config.depthStrength * (FG_DEPTH_BASE + (1 - FG_DEPTH_BASE) * config.foregroundStrength);
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
      const fg = depthStrength * (FG_DEPTH_BASE + (1 - FG_DEPTH_BASE) * foregroundStrength);
      if (fgMat) fgMat.uniforms.fgDepth.value = fg;
      if (bgMat) bgMat.uniforms.depthStrength.value = depthStrength * FG_DEPTH_BASE;
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

// Pre-flight check: will this photo actually make a good 3D scene?
//
// Single-image depth is a one-sided height field, so the renderer can only
// tilt within a shallow cone (ORBIT_MAX_THETA ≈ 23°). Inside that cone the
// result is honest; the failure mode is always the same — geometry with no
// image data behind it stretches into a smear.
//
// The reliable predictor, established by measuring ~25 photos against the real
// renderer, is whether the subject is CLIPPED by the frame. A subject running
// off the edge has no matte out there, so the foreground layer tears the moment
// the camera swings. It is invisible in a still, which is what makes it worth
// warning about: one photo used here looked superb frozen and fell apart on the
// first drag.
//
// These are heuristics, not guarantees, so callers should surface them as a
// non-blocking note — never as a refusal to render.

import { getCtx, imageToCanvas } from "@/lib/image";

export interface SubjectFit {
  /** Did segmentation find a subject worth speaking of? */
  found: boolean;
  /** Share of the frame the subject covers, 0..1. */
  coverage: number;
  /** Smallest gap between the subject's bounding box and any frame edge, 0..1
   *  of the corresponding dimension. */
  margin: number;
  /** Subject's bounding box touches a frame edge — the smear predictor. */
  clipped: boolean;
}

/** Fraction of a dimension within which the bounding box counts as touching. */
const EDGE_TOLERANCE = 0.01;
/** Below this share of frame there is effectively no subject to separate. */
const MIN_COVERAGE = 0.015;
/** Above this the subject leaves itself nowhere to travel. */
const FRAME_FILLING = 0.45;

/**
 * Measure how a cut-out subject sits inside its frame. Runs on a downscaled
 * copy — this is a heuristic, and full resolution buys nothing.
 */
export function analyzeSubject(
  cutout: HTMLImageElement,
  maxDim = 512,
): SubjectFit {
  const canvas = imageToCanvas(cutout, maxDim);
  const w = canvas.width;
  const h = canvas.height;
  const d = getCtx(canvas).getImageData(0, 0, w, h).data;

  let n = 0;
  let minX = w;
  let maxX = -1;
  let minY = h;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] <= 127) continue;
      n++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  const coverage = n / (w * h);
  if (n === 0 || coverage < MIN_COVERAGE) {
    return { found: false, coverage, margin: 0, clipped: false };
  }

  const margin = Math.min(
    minX / w,
    (w - 1 - maxX) / w,
    minY / h,
    (h - 1 - maxY) / h,
  );
  return { found: true, coverage, margin, clipped: margin <= EDGE_TOLERANCE };
}

/**
 * Turn a measurement into one sentence of plain advice, or null when the photo
 * is fine. Deliberately says what to do differently, not just what is wrong.
 */
export function subjectAdvice(fit: SubjectFit): string | null {
  if (!fit.found) return null; // depth-only fallback already explains itself

  if (fit.clipped) {
    return fit.coverage > FRAME_FILLING
      ? "Your subject fills the frame and runs off the edges, so those edges stretch as the scene tilts. A shot from further back reads much cleaner."
      : "Your subject touches the frame edge — there's nothing behind it there, so that edge stretches as the scene tilts. A little space around the subject fixes it.";
  }
  if (fit.coverage > FRAME_FILLING) {
    return "Your subject fills most of the frame, so it has little room to move against the background. A wider shot reads as more three-dimensional.";
  }
  return null;
}

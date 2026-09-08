// Normalized scene configuration — UI maps friendly controls to these values.
// Renderer consumes SceneConfig rather than hardcoded UI values (handoff §22).

export type MotionMode = "mouse" | "scroll" | "auto" | "static" | "orbit";

/**
 * How the scene sits in its frame.
 *
 * "window" — the plane over-fills the viewport, so you look *through* a
 *   rectangle at the relief and its edges are never visible. Safe on any photo.
 * "popout" — the whole backdrop is visible with room around it, so the subject
 *   (pushed forward by the depth relief, and therefore magnified by
 *   perspective) visibly crosses the backdrop's edge and reads as lifting out
 *   of the frame. Needs a subject; a backdrop-only scene has nothing to pop.
 */
export type Framing = "window" | "popout";

export interface SceneConfig {
  perspective: number; // 0..1 → camera fov (36..44°) + XY parallax gain (Phase 2)
  depthStrength: number; // 0..1 displacement scale
  cameraX: number; // -1..1 normalized mouse/scroll offset
  cameraY: number; // -1..1
  motionMode: MotionMode;
  motionSpeed: number; // 0..1 → pointer-follow easing + auto-drift rate (Phase 2)
  foregroundStrength: number; // 0..1 subject layer separation
  backgroundBlur: number; // 0..1 backdrop de-emphasis
  edgeFeather: number; // 0..1 subject edge softening
  shadowStrength?: number; // 0..1 contact-shadow opacity (optional; older scenes default in scene.ts)
  /**
   * Drop the backdrop and render the subject alone on transparency.
   *
   * Lives on the config (not a viewer prop) so it travels with the scene: it is
   * persisted into the published manifest and honoured automatically by the
   * share page and the embed, with no extra plumbing. Requires a subject mask;
   * ignored when segmentation was skipped. Optional so scenes published before
   * this existed keep their backdrop.
   */
  subjectOnly?: boolean;
  /**
   * Framing. Optional and absent-means-"window" on purpose: every scene
   * published before this existed must keep rendering exactly as it did, and
   * the manifest is the only record of how a published scene should look.
   */
  framing?: Framing;
}

export const DEFAULT_SCENE_CONFIG: SceneConfig = {
  perspective: 0.6,
  depthStrength: 0.5,
  cameraX: 0,
  cameraY: 0,
  motionMode: "mouse",
  motionSpeed: 0.2,
  foregroundStrength: 0.7,
  backgroundBlur: 0.15,
  edgeFeather: 0.35,
  shadowStrength: 0.35,
};

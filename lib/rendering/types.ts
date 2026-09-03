// Normalized scene configuration — UI maps friendly controls to these values.
// Renderer consumes SceneConfig rather than hardcoded UI values (handoff §22).

export type MotionMode = "mouse" | "scroll" | "auto" | "static" | "orbit";

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

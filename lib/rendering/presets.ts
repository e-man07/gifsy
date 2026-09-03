import type { MotionMode, SceneConfig } from "./types";

// Each preset produces a SceneConfig — renderer is agnostic to which was picked.
// Minimal Phase 2 set: 5–6 excellent presets > 30 mediocre ones (handoff §18).
// Values are spread across perspective (fov + parallax gain) and motionSpeed
// (follow easing + auto-drift rate) so presets feel genuinely distinct.

export type PresetId =
  | "orbit"
  | "gentle"
  | "mouse-tilt"
  | "float"
  | "cinematic"
  | "push-in"
  | "scroll";

export interface Preset {
  id: PresetId;
  label: string;
  hint: string;
  config: Partial<SceneConfig>;
}

export const PRESETS: Preset[] = [
  {
    id: "orbit",
    label: "Orbit 3D",
    hint: "Grab & spin the depth",
    config: { depthStrength: 0.6, motionMode: "orbit" as MotionMode, motionSpeed: 0.35, perspective: 0.7, foregroundStrength: 0.85, backgroundBlur: 0.35, edgeFeather: 0.5, shadowStrength: 0.45 },
  },
  {
    id: "gentle",
    label: "Gentle 3D",
    hint: "Subtle depth, barely there",
    config: { depthStrength: 0.28, motionMode: "mouse" as MotionMode, motionSpeed: 0.12, perspective: 0.35, foregroundStrength: 0.45, backgroundBlur: 0.1, edgeFeather: 0.35, shadowStrength: 0.2 },
  },
  {
    id: "mouse-tilt",
    label: "Mouse Tilt",
    hint: "Follows your pointer",
    config: { depthStrength: 0.5, motionMode: "mouse" as MotionMode, motionSpeed: 0.5, perspective: 0.72, foregroundStrength: 0.8, backgroundBlur: 0.15, edgeFeather: 0.5, shadowStrength: 0.4 },
  },
  {
    id: "float",
    label: "Float",
    hint: "Slow automatic drift",
    config: { depthStrength: 0.38, motionMode: "auto" as MotionMode, motionSpeed: 0.22, perspective: 0.5, foregroundStrength: 0.55, backgroundBlur: 0.15, edgeFeather: 0.4, shadowStrength: 0.3 },
  },
  {
    id: "cinematic",
    label: "Cinematic",
    hint: "Slow X/Y drift + subtle depth",
    config: { depthStrength: 0.32, motionMode: "auto" as MotionMode, motionSpeed: 0.1, perspective: 0.4, foregroundStrength: 0.45, backgroundBlur: 0.28, edgeFeather: 0.45, shadowStrength: 0.45 },
  },
  {
    id: "push-in",
    label: "Push In",
    hint: "Deeper lens, strong parallax",
    config: { depthStrength: 0.44, motionMode: "auto" as MotionMode, motionSpeed: 0.16, perspective: 0.9, foregroundStrength: 0.68, backgroundBlur: 0.18, edgeFeather: 0.4, shadowStrength: 0.4 },
  },
  {
    id: "scroll",
    label: "Scroll Depth",
    hint: "Moves with page scroll",
    config: { depthStrength: 0.4, motionMode: "scroll" as MotionMode, motionSpeed: 0.3, perspective: 0.6, foregroundStrength: 0.6, backgroundBlur: 0.2, edgeFeather: 0.45, shadowStrength: 0.35 },
  },
];

export function presetConfig(id: PresetId): Partial<SceneConfig> {
  return PRESETS.find((p) => p.id === id)?.config ?? {};
}

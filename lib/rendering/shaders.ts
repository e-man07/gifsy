// Custom displacement shaders — AI for understanding, graphics code for the effect.
// Phase 2: an eased pointer drives a depth-weighted XY vertex offset (true
// differential parallax — near pixels slide one way, far the other). Depth also
// still displaces vertex Z, but at a reduced weight, as a secondary volume cue.
// The foreground plane responds more strongly than the background (see scene.ts),
// so the AI-cut subject visibly leads a plausible, near-static backdrop.

// Shared parallax uniforms declared by every vertex shader below:
//   uPointer   — eased driver in [-1,1]², already scaled by intensity
//   uParallax  — per-plane XY response (foreground > background)
//   uDepthBias — the depth that stays put (the pivot plane)

// Pins vertex displacement to zero at the plane's outer edge so the border ring
// stays a flat rectangle — kills the curling lip and stops any gutter peeking in
// at motion extremes. The cover-fit framing crops this faded band off-screen, so
// the visible frame keeps near-full parallax while the edge stays clean.
const EDGE_HOLD_GLSL = `
float edgeHold(vec2 uv) {
  vec2 lo = smoothstep(vec2(0.0), vec2(0.10), uv);
  vec2 hi = smoothstep(vec2(0.0), vec2(0.10), vec2(1.0) - uv);
  vec2 w = lo * hi;
  return w.x * w.y;
}
`;

// ── Depth-only plane (Phase 2 fallback when no cutout is available) ──────────

export const planeVertexShader = `
uniform sampler2D depthMap;
uniform float depthStrength;
uniform vec2 uPointer;
uniform float uParallax;
uniform float uDepthBias;
varying vec2 vUv;
${EDGE_HOLD_GLSL}
void main() {
  vUv = uv;
  float d = texture2D(depthMap, uv).r;
  float hold = edgeHold(uv);
  vec3 pos = position;
  // Reduced Z is a secondary volume cue; the XY offset is the primary depth read.
  pos.z += (d - 0.5) * depthStrength * 0.6 * hold;
  pos.xy += uPointer * uParallax * (d - uDepthBias) * hold;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const planeFragmentShader = `
uniform sampler2D map;
varying vec2 vUv;

void main() {
  vec4 c = texture2D(map, vUv);
  gl_FragColor = c;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

// ── Background plane (full image, optionally blurred, less displacement) ─────

export const backgroundVertexShader = `
uniform sampler2D depthMap;
uniform float depthStrength;
uniform vec2 uPointer;
uniform float uParallax;
uniform float uDepthBias;
varying vec2 vUv;
${EDGE_HOLD_GLSL}
void main() {
  vUv = uv;
  float d = texture2D(depthMap, uv).r;
  float hold = edgeHold(uv);
  vec3 pos = position;
  // Background moves least (small uParallax) so the subject reads as leading.
  pos.z += (d - 0.5) * depthStrength * 0.6 * hold;
  pos.xy += uPointer * uParallax * (d - uDepthBias) * hold;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const backgroundFragmentShader = `
uniform sampler2D map;
uniform sampler2D mapBlur;
uniform float blur; // 0 = sharp, 1 = fully blurred backdrop
varying vec2 vUv;

void main() {
  vec4 sharp = texture2D(map, vUv);
  vec4 b = texture2D(mapBlur, vUv);
  gl_FragColor = mix(sharp, b, blur);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

// ── Foreground plane (AI-cut subject, feathered edge, stronger displacement) ─

export const foregroundVertexShader = `
uniform sampler2D depthMap;
uniform float fgDepth; // combined subject displacement strength
uniform vec2 uPointer;
uniform float uParallax;
uniform float uDepthBias;
uniform float uReliefXY;     // 0 = subject slides as a rigid layer, 1 = full per-pixel depth
uniform float uSubjectDepth; // representative subject depth for the rigid slide
uniform float uReliefBias;   // depth that maps to zero Z (0.5 = ± relief; 0 = all-forward, for orbit)
uniform float uZBoost;       // Z-relief multiplier (>1 exaggerates depth for camera orbit)
varying vec2 vUv;
void main() {
  vUv = uv;
  float d = texture2D(depthMap, uv).r;
  vec3 pos = position;
  // The subject is a clean alpha cutout, so (unlike the backdrop) it needs no
  // edge-pin. Crucially, depth-weighting its XY slide would STRETCH the feathered
  // silhouette across the depth step at its outline — a horizontal smear at strong
  // parallax. So the subject TRANSLATES as a near-rigid layer (uSubjectDepth) with
  // only a little internal relief (uReliefXY); Z relief still gives it volume.
  // In orbit mode uReliefBias→0 pushes the whole relief forward so it stays in
  // front of the backdrop (no poke-through) while a real camera arc reveals depth.
  pos.z += (d - uReliefBias) * fgDepth * 0.6 * uZBoost;
  float dXY = mix(uSubjectDepth, d, uReliefXY);
  pos.xy += uPointer * uParallax * (dXY - uDepthBias);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const foregroundFragmentShader = `
uniform sampler2D map;
uniform sampler2D maskMap; // feathered alpha, regenerated live on edgeFeather
varying vec2 vUv;

void main() {
  vec4 c = texture2D(map, vUv);
  float a = texture2D(maskMap, vUv).r;
  gl_FragColor = vec4(c.rgb, c.a * a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

// ── Contact shadow plane (subject silhouette, cast on the backdrop) ──────────
// A soft black copy of the subject mask, sitting just in front of the backdrop
// and behind the subject. It slides *less* than the subject (smaller uParallax)
// and carries a fixed light-direction offset, so the gap between subject and
// shadow opens as the camera moves — the cue that sells the subject as floating
// off the background rather than painted on it. Flat (no depth displacement).

export const shadowVertexShader = `
uniform vec2 uPointer;
uniform float uParallax;
uniform vec2 uOffset;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 pos = position;
  pos.xy += uOffset + uPointer * uParallax;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const shadowFragmentShader = `
uniform sampler2D maskMap;
uniform float uStrength;
varying vec2 vUv;
void main() {
  float a = texture2D(maskMap, vUv).r;
  gl_FragColor = vec4(0.0, 0.0, 0.0, a * uStrength);
}
`;

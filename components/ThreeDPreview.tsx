"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import * as THREE from "three";
import type { DepthGrid } from "@/lib/depth";
import { depthGridToCanvas } from "@/lib/depth";
import {
  buildParallaxScene,
  makeTexture,
  planeDims,
  framingPlan,
  subjectExtent,
  subjectRecentre,
  type SubjectExtent,
  placeOrbit,
  CAM_SWAY,
  ORBIT_MAX_THETA,
  ORBIT_MAX_PHI,
  ORBIT_RELIEF_BIAS,
  ORBIT_RELIEF_BOOST,
  type ParallaxScene,
} from "@/lib/rendering/scene";
import type { SceneConfig } from "@/lib/rendering/types";
import { getCtx, makeCanvas } from "@/lib/image";

interface Props {
  image: HTMLImageElement;
  depthGrid: DepthGrid;
  config: SceneConfig; // renderer consumes SceneConfig, not UI values (handoff §22)
  cutout?: HTMLImageElement | null; // Phase 3: AI-cut subject, optional
  className?: string;
}

export interface CaptureOptions {
  frames?: number;
  fps?: number;
  size?: number;
  onProgress?: (fraction: number) => void;
}

/** Imperative export API used by the 3D panel's Download buttons (Phase 5). */
export interface ThreeDPreviewHandle {
  captureGif(opts?: CaptureOptions): Promise<Blob>;
  captureStill(opts?: { size?: number }): Promise<Blob>;
  captureWebm(opts?: { duration?: number }): Promise<Blob | null>;
  canRecordWebm(): boolean;
}

/** Export canvas dims preserving the image aspect ratio. */
function exportDims(aspect: number, size: number) {
  return aspect >= 1
    ? { w: size, h: Math.max(1, Math.round(size / aspect)) }
    : { w: Math.max(1, Math.round(size * aspect)), h: size };
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export const ThreeDPreview = forwardRef<ThreeDPreviewHandle, Props>(function ThreeDPreview(
  { image, depthGrid, config, cutout, className },
  ref,
) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const parallaxRef = useRef<ParallaxScene | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rafRef = useRef<number>(0);
  const imageRef = useRef(image);
  const capturingRef = useRef(false);
  const targetMouse = useRef({ x: 0, y: 0 });
  const curMouse = useRef({ x: 0, y: 0 });
  const interacted = useRef(false); // false → auto self-demo; true after first pointer move/drag
  // Orbit mode (grab-to-spin): drag deltas steer camera azimuth/elevation.
  const dragging = useRef(false);
  const lastDrag = useRef({ x: 0, y: 0 });
  const orbit = useRef({ theta: 0, phi: 0 }); // eased current camera angles
  const orbitTarget = useRef({ theta: 0, phi: 0 }); // driven by drag / auto-turntable
  const planeDimsRef = useRef({ pw: 1.6, ph: 1.6 });
  const [fps, setFps] = useState<number | null>(null);
  // Subject reach, measured from the cutout when the scene is built.
  const extentRef = useRef<SubjectExtent | undefined>(undefined);

  /**
   * Every camera distance in this component comes from here, so the live
   * preview and the GIF/WebM/PNG exporters cannot disagree about how a scene
   * sits in its frame — and neither can drift from the embed, which asks the
   * same function (lib/rendering/scene.ts).
   */
  const planFor = useCallback((aspect: number) => {
    const cam = cameraRef.current;
    const mount = mountRef.current;
    return framingPlan(
      cam ? cam.fov : 40,
      planeDimsRef.current.pw,
      planeDimsRef.current.ph,
      aspect,
      {
        framing: configRef.current.framing,
        subjectOnly: configRef.current.subjectOnly,
        extent: extentRef.current,
        // CSS px, so the matte-scale cap does not depend on the display.
        viewportPx: mount
          ? { w: mount.clientWidth, h: mount.clientHeight }
          : undefined,
      },
    );
  }, []);
  const [webglFailed, setWebglFailed] = useState(false);

  imageRef.current = image;

  // Keep latest config so capture/loop closures read fresh values.
  const configRef = useRef(config);
  configRef.current = config;

  // Live controls — graphics only, no re-inference (handoff §14).
  useEffect(() => {
    parallaxRef.current?.setDepthStrength(config.depthStrength, config.foregroundStrength);
  }, [config.depthStrength, config.foregroundStrength]);

  useEffect(() => {
    parallaxRef.current?.setBackgroundBlur(config.backgroundBlur);
  }, [config.backgroundBlur]);

  useEffect(() => {
    parallaxRef.current?.setEdgeFeather(config.edgeFeather);
  }, [config.edgeFeather]);

  useEffect(() => {
    parallaxRef.current?.setShadowStrength(config.shadowStrength ?? 0.35);
  }, [config.shadowStrength]);

  // Perspective maps to camera FOV (parallax gain is applied per-frame in the loop).
  useEffect(() => {
    const cam = cameraRef.current;
    if (!cam) return;
    cam.fov = 36 + config.perspective * 8;
    cam.updateProjectionMatrix();
  }, [config.perspective]);

  // Grab-cursor affordance so orbit mode reads as draggable.
  useEffect(() => {
    const mount = mountRef.current;
    if (mount) mount.style.cursor = config.motionMode === "orbit" ? "grab" : "";
  }, [config.motionMode]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // New scene → replay the auto self-demo from the top.
    interacted.current = false;
    curMouse.current.x = 0;
    curMouse.current.y = 0;
    dragging.current = false;
    orbit.current.theta = 0;
    orbit.current.phi = 0;
    orbitTarget.current.theta = 0;
    orbitTarget.current.phi = 0;

    // Feature-detect WebGL before allocating Three objects.
    const probe = document.createElement("canvas").getContext("webgl2") || document.createElement("canvas").getContext("webgl");
    if (!probe) {
      setWebglFailed(true);
      return;
    }

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const w = mount.clientWidth || 480;
    const h = mount.clientHeight || 480;
    const camera = new THREE.PerspectiveCamera(36 + configRef.current.perspective * 8, w / h, 0.1, 100);
    const dims = planeDims(image.naturalWidth / image.naturalHeight);
    planeDimsRef.current = dims;
    // Measured once per cutout; lets a subject-only scene frame the subject
    // rather than the photo plane it came from.
    extentRef.current = config.subjectOnly && cutout ? subjectExtent(cutout) : undefined;
    // Centre the subject at the origin so the camera frames it, not the photo
    // it was cut from (the camera always looks at 0,0,0).
    if (extentRef.current) {
      const off = subjectRecentre(extentRef.current, dims.pw, dims.ph);
      scene.position.set(off.x, off.y, 0);
    }
    const initZ = framingPlan(camera.fov, dims.pw, dims.ph, w / h, {
      framing: config.framing,
      subjectOnly: config.subjectOnly,
      extent: extentRef.current,
      viewportPx: { w, h },
    }).rest;
    camera.position.set(0, 0, initZ);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      setWebglFailed(true);
      return;
    }
    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    // Avoid injecting a second canvas on HMR.
    mount.innerHTML = "";
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    const depthTex = makeTexture(depthGridToCanvas(depthGrid), false);
    const parallax = buildParallaxScene({
      scene,
      image,
      depthTex,
      cutout,
      config: configRef.current,
    });
    parallaxRef.current = parallax;

    let hovering = false;
    const DRAG_SENS = 2.4; // screen-fraction → radians; a half-width drag covers the full arc

    const onMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      if (configRef.current.motionMode === "orbit") {
        if (!dragging.current) return; // orbit responds only to an active grab-drag
        interacted.current = true;
        orbitTarget.current.theta = clamp(orbitTarget.current.theta + ((e.clientX - lastDrag.current.x) / rect.width) * DRAG_SENS, -ORBIT_MAX_THETA, ORBIT_MAX_THETA);
        orbitTarget.current.phi = clamp(orbitTarget.current.phi - ((e.clientY - lastDrag.current.y) / rect.height) * DRAG_SENS, -ORBIT_MAX_PHI, ORBIT_MAX_PHI);
        lastDrag.current.x = e.clientX;
        lastDrag.current.y = e.clientY;
        return;
      }
      interacted.current = true;
      targetMouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouse.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    const onMouseDown = (e: MouseEvent) => {
      if (configRef.current.motionMode !== "orbit") return;
      dragging.current = true;
      interacted.current = true;
      lastDrag.current.x = e.clientX;
      lastDrag.current.y = e.clientY;
      mount.style.cursor = "grabbing";
    };
    const onMouseUp = () => {
      dragging.current = false;
      mount.style.cursor = configRef.current.motionMode === "orbit" ? "grab" : "";
    };
    const onTouchStart = (e: TouchEvent) => {
      if (configRef.current.motionMode !== "orbit" || !e.touches[0]) return;
      dragging.current = true;
      interacted.current = true;
      lastDrag.current.x = e.touches[0].clientX;
      lastDrag.current.y = e.touches[0].clientY;
    };
    const onTouchEnd = () => {
      dragging.current = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      const t = e.touches[0];
      const rect = mount.getBoundingClientRect();
      if (configRef.current.motionMode === "orbit") {
        if (!dragging.current) return;
        interacted.current = true;
        orbitTarget.current.theta = clamp(orbitTarget.current.theta + ((t.clientX - lastDrag.current.x) / rect.width) * DRAG_SENS, -ORBIT_MAX_THETA, ORBIT_MAX_THETA);
        orbitTarget.current.phi = clamp(orbitTarget.current.phi - ((t.clientY - lastDrag.current.y) / rect.height) * DRAG_SENS, -ORBIT_MAX_PHI, ORBIT_MAX_PHI);
        lastDrag.current.x = t.clientX;
        lastDrag.current.y = t.clientY;
        return;
      }
      interacted.current = true;
      targetMouse.current.x = ((t.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouse.current.y = -(((t.clientY - rect.top) / rect.height) * 2 - 1);
    };
    const onMouseLeave = () => {
      hovering = false;
      targetMouse.current.x = 0;
      targetMouse.current.y = 0;
    };
    const onMouseEnter = () => {
      hovering = true;
    };

    if (configRef.current.motionMode === "orbit") mount.style.cursor = "grab";
    mount.addEventListener("mousemove", onMouseMove);
    mount.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    mount.addEventListener("touchstart", onTouchStart, { passive: true });
    mount.addEventListener("touchmove", onTouchMove, { passive: true });
    mount.addEventListener("touchend", onTouchEnd);
    mount.addEventListener("mouseleave", onMouseLeave);
    mount.addEventListener("mouseenter", onMouseEnter);

    let tick = 0;
    let lastFpsSample = performance.now();
    let frames = 0;

    let curZ = initZ;
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      tick += 0.016;

      const cfg = configRef.current;
      const persp = cfg.perspective;
      const speed = cfg.motionSpeed;
      const gain = 0.75 + persp * 0.6; // parallax intensity (perspective)
      const ease = 0.05 + speed * 0.12; // follow snappiness (motionSpeed)

      const mm = cfg.motionMode;

      if (mm === "orbit") {
        // Real camera arc around the depth relief — perspective parallax + self-
        // occlusion, not a shader slide. Auto-turntable until the viewer grabs it,
        // then it holds wherever they leave it. Relief is pushed all-forward so the
        // subject never sinks behind the backdrop as the camera swings around.
        if (!interacted.current) {
          const rate = 0.25 + speed * 0.4;
          orbitTarget.current.theta = Math.sin(tick * rate) * ORBIT_MAX_THETA * 0.85;
          orbitTarget.current.phi = Math.sin(tick * rate * 0.5) * ORBIT_MAX_PHI * 0.55;
        }
        const oe = 0.08 + speed * 0.1;
        orbit.current.theta += (orbitTarget.current.theta - orbit.current.theta) * oe;
        orbit.current.phi += (orbitTarget.current.phi - orbit.current.phi) * oe;
        parallax.setPointer(0, 0);
        parallax.setRelief(ORBIT_RELIEF_BIAS, ORBIT_RELIEF_BOOST);
        placeOrbit(camera, orbit.current.theta, orbit.current.phi, planFor(camera.aspect).orbit);
        curZ = camera.position.z; // keep the fit continuous if the mode switches
      } else {
        parallax.setRelief(0.5, 1.0); // default ± relief (identical to pre-orbit behavior)

        // Target driver in [-1,1]² for the current mode. In mouse mode we auto-
        // animate as a self-demo until the viewer first moves the pointer — a fresh
        // scene otherwise sits dead still and reads as a flat photo (the #1 "it's
        // not 3D" trap). After they engage, we follow the pointer.
        let tpx = 0;
        let tpy = 0;
        if (mm === "auto" || (mm === "mouse" && !interacted.current)) {
          const rate = 0.3 + speed * 0.5;
          tpx = Math.sin(tick * rate) * 0.7;
          tpy = Math.cos(tick * rate * 0.65) * 0.5;
        } else if (mm === "mouse") {
          tpx = targetMouse.current.x;
          tpy = targetMouse.current.y;
        } else if (mm === "scroll") {
          const s = Math.min(1, Math.max(-1, window.scrollY / 600));
          tpx = s;
          tpy = s * -0.6;
        }

        // One eased driver → smooth motion, no snap at the auto→pointer handoff.
        curMouse.current.x += (tpx - curMouse.current.x) * ease;
        curMouse.current.y += (tpy - curMouse.current.y) * ease;
        const px = curMouse.current.x;
        const py = curMouse.current.y;

        // Depth-weighted XY parallax does the heavy lifting; the camera adds only a
        // small sway so the whole frame feels alive without revealing edges.
        parallax.setPointer(px * gain, py * gain);
        camera.position.x = Math.max(-0.18, Math.min(0.18, px * gain * CAM_SWAY));
        camera.position.y = Math.max(-0.14, Math.min(0.14, py * gain * CAM_SWAY));

        // Framing comes from the plan: "window" cover-fits (fill, crop overflow →
        // no black border), "popout" contains the backdrop with margin so the
        // lifted subject can cross its edge. Hover eases the camera in a little;
        // auto adds a slow breathe.
        const plan = planFor(camera.aspect);
        const breathe = mm === "auto" ? Math.sin(tick * 0.5) * 0.02 * plan.rest : 0;
        const targetZ = (hovering ? plan.hover : plan.rest) + breathe;
        curZ += (targetZ - curZ) * 0.08;
        camera.position.z = curZ;
        camera.lookAt(0, 0, 0);
      }

      // During capture the exporter drives the pointer/camera/render itself.
      if (!capturingRef.current) renderer.render(scene, camera);

      frames++;
      const now = performance.now();
      if (now - lastFpsSample > 1000) {
        setFps(Math.round((frames * 1000) / (now - lastFpsSample)));
        frames = 0;
        lastFpsSample = now;
      }
    };
    animate();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        const nw = cr.width;
        const nh = cr.height;
        if (nw === 0 || nh === 0) continue;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh, false);
      }
    });
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(rafRef.current);
      mount.removeEventListener("mousemove", onMouseMove);
      mount.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      mount.removeEventListener("touchstart", onTouchStart);
      mount.removeEventListener("touchmove", onTouchMove);
      mount.removeEventListener("touchend", onTouchEnd);
      mount.removeEventListener("mouseleave", onMouseLeave);
      mount.removeEventListener("mouseenter", onMouseEnter);
      ro.disconnect();
      parallax.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      parallaxRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
    };
    // Rebuild only when identity of image/depth/cutout changes; config handled live.
    // subjectOnly adds/removes the backdrop mesh, so it needs a rebuild rather
    // than a uniform update like the other controls.
    //
    // config.framing is deliberately NOT a dependency: the animate loop reads it
    // through planFor every frame and eases the camera to the new distance, so
    // toggling pop-out glides instead of tearing the scene down — a rebuild here
    // would also throw away wherever the viewer had dragged the orbit to.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, depthGrid, cutout, config.subjectOnly]);

  // ── Export API (Phase 5) ──────────────────────────────────────────────────

  const canRecordWebm = () =>
    typeof window !== "undefined" &&
    typeof window.MediaRecorder !== "undefined" &&
    typeof HTMLCanvasElement !== "undefined" &&
    "captureStream" in HTMLCanvasElement.prototype;

  useImperativeHandle(ref, () => ({
    canRecordWebm,

    async captureGif(opts: CaptureOptions = {}) {
      const renderer = rendererRef.current;
      const camera = cameraRef.current;
      const scene = sceneRef.current;
      const imageEl = imageRef.current;
      if (!renderer || !camera || !scene) throw new Error("3D preview isn't ready yet.");

      const size = opts.size ?? 480;
      const frameCount = opts.frames ?? 30;
      const fps = opts.fps ?? 20;
      const delay = Math.round(1000 / fps);
      const { w: ew, h: eh } = exportDims(imageEl.naturalWidth / imageEl.naturalHeight, size);

      const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
      const out = makeCanvas(ew, eh);
      const octx = getCtx(out);

      // Temporarily render at export resolution (pixelRatio 1 → exact pixels).
      const prevRatio = renderer.getPixelRatio();
      const prevW = renderer.domElement.width;
      const prevH = renderer.domElement.height;
      const prevAspect = camera.aspect;
      capturingRef.current = true;
      renderer.setPixelRatio(1);
      renderer.setSize(ew, eh, false);
      camera.aspect = ew / eh;
      camera.updateProjectionMatrix();

      const frames: Array<{ data: Uint8ClampedArray; width: number; height: number; delay: number }> = [];
      const orbitMode = configRef.current.motionMode === "orbit";
      const gain = 0.75 + configRef.current.perspective * 0.6;
      const exportPlan = planFor(ew / eh);
      const capZ = exportPlan.capture;
      const orbitRadius = exportPlan.orbit;
      try {
        for (let i = 0; i < frameCount; i++) {
          const t = i / frameCount;
          const phase = t * Math.PI * 2;
          // Match the live view exactly so exports look like what the creator sees.
          if (orbitMode) {
            parallaxRef.current?.setPointer(0, 0);
            parallaxRef.current?.setRelief(ORBIT_RELIEF_BIAS, ORBIT_RELIEF_BOOST);
            placeOrbit(camera, Math.sin(phase) * ORBIT_MAX_THETA * 0.85, Math.cos(phase) * ORBIT_MAX_PHI * 0.5, orbitRadius);
          } else {
            const px = Math.sin(phase) * gain;
            const py = Math.cos(phase * 0.8) * gain * 0.6;
            parallaxRef.current?.setPointer(px, py);
            camera.position.x = px * CAM_SWAY;
            camera.position.y = py * CAM_SWAY;
            camera.position.z = capZ;
            camera.lookAt(0, 0, 0);
          }
          renderer.render(scene, camera);
          const dataUrl = renderer.domElement.toDataURL("image/png");
          const img = await loadImageElement(dataUrl);
          octx.clearRect(0, 0, ew, eh);
          octx.drawImage(img, 0, 0, ew, eh);
          const { data } = octx.getImageData(0, 0, ew, eh);
          frames.push({ data, width: ew, height: eh, delay });
          opts.onProgress?.((i + 1) / frameCount);
        }

        // Single shared palette across frames → no color flicker, smaller file.
        const palette = buildPalette(frames, quantize);
        const gif = GIFEncoder();
        let first = true;
        for (const f of frames) {
          const index = applyPalette(f.data, palette);
          gif.writeFrame(index, f.width, f.height, first ? { palette, delay: f.delay } : { delay: f.delay });
          first = false;
        }
        gif.finish();
        return new Blob([gif.bytes() as BlobPart], { type: "image/gif" });
      } finally {
        capturingRef.current = false;
        parallaxRef.current?.setPointer(0, 0);
        renderer.setPixelRatio(prevRatio);
        renderer.setSize(prevW, prevH, false);
        camera.aspect = prevAspect;
        camera.updateProjectionMatrix();
      }
    },

    async captureStill(opts: { size?: number } = {}) {
      const renderer = rendererRef.current;
      const camera = cameraRef.current;
      const scene = sceneRef.current;
      if (!renderer || !camera || !scene) throw new Error("3D preview isn't ready yet.");

      const imageEl = imageRef.current;
      const { w: ew, h: eh } = exportDims(imageEl.naturalWidth / imageEl.naturalHeight, opts.size ?? 1024);
      const prevRatio = renderer.getPixelRatio();
      const prevW = renderer.domElement.width;
      const prevH = renderer.domElement.height;
      const prevAspect = camera.aspect;
      capturingRef.current = true;
      try {
        renderer.setPixelRatio(1);
        renderer.setSize(ew, eh, false);
        camera.aspect = ew / eh;
        camera.updateProjectionMatrix();
        // A gentle off-center pose so the still reads as 3D, matching the live look.
        const gain = 0.75 + configRef.current.perspective * 0.6;
        if (configRef.current.motionMode === "orbit") {
          parallaxRef.current?.setPointer(0, 0);
          parallaxRef.current?.setRelief(ORBIT_RELIEF_BIAS, ORBIT_RELIEF_BOOST);
          const r = planFor(ew / eh).orbit;
          placeOrbit(camera, ORBIT_MAX_THETA * 0.6, ORBIT_MAX_PHI * 0.35, r);
        } else {
          const stillZ = planFor(ew / eh).capture;
          parallaxRef.current?.setPointer(0.35 * gain, 0.12 * gain);
          camera.position.set(0.35 * gain * CAM_SWAY, 0.12 * gain * CAM_SWAY, stillZ);
          camera.lookAt(0, 0, 0);
        }
        renderer.render(scene, camera);
        const dataUrl = renderer.domElement.toDataURL("image/png");
        const res = await fetch(dataUrl);
        return await res.blob();
      } finally {
        capturingRef.current = false;
        parallaxRef.current?.setPointer(0, 0);
        renderer.setPixelRatio(prevRatio);
        renderer.setSize(prevW, prevH, false);
        camera.aspect = prevAspect;
        camera.updateProjectionMatrix();
      }
    },

    async captureWebm(opts: { duration?: number } = {}) {
      const renderer = rendererRef.current;
      const camera = cameraRef.current;
      const scene = sceneRef.current;
      const canvas = renderer?.domElement;
      if (!renderer || !camera || !scene || !canvas) return null;
      if (!canRecordWebm()) return null;
      try {
        const stream = canvas.captureStream(30);
        const mime = window.MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : window.MediaRecorder.isTypeSupported("video/webm")
            ? "video/webm"
            : "";
        if (!mime) return null;
        const rec = new window.MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
        const chunks: Blob[] = [];
        rec.ondataavailable = (e) => {
          if (e.data.size) chunks.push(e.data);
        };
        const stopped = new Promise<void>((res) => {
          rec.onstop = () => res();
        });
        const duration = opts.duration ?? 3;
        const start = performance.now();
        const orbitMode = configRef.current.motionMode === "orbit";
        const gain = 0.75 + configRef.current.perspective * 0.6;
        const livePlan = planFor(camera.aspect);
        const capZ = livePlan.capture;
        const orbitRadius = livePlan.orbit;
        capturingRef.current = true;
        rec.start();
        await new Promise<void>((resolve) => {
          const step = () => {
            const t = (performance.now() - start) / 1000;
            const phase = Math.min(1, t / duration) * Math.PI * 2;
            // Same motion as the live view (exports must match).
            if (orbitMode) {
              parallaxRef.current?.setPointer(0, 0);
              parallaxRef.current?.setRelief(ORBIT_RELIEF_BIAS, ORBIT_RELIEF_BOOST);
              placeOrbit(camera, Math.sin(phase) * ORBIT_MAX_THETA * 0.85, Math.cos(phase) * ORBIT_MAX_PHI * 0.5, orbitRadius);
            } else {
              const px = Math.sin(phase) * gain;
              const py = Math.cos(phase * 0.8) * gain * 0.6;
              parallaxRef.current?.setPointer(px, py);
              camera.position.x = px * CAM_SWAY;
              camera.position.y = py * CAM_SWAY;
              camera.position.z = capZ;
              camera.lookAt(0, 0, 0);
            }
            renderer.render(scene, camera);
            if (t >= duration) resolve();
            else requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
        rec.stop();
        await stopped;
        capturingRef.current = false;
        parallaxRef.current?.setPointer(0, 0);
        return new Blob(chunks, { type: mime });
      } catch {
        capturingRef.current = false;
        return null;
      }
    },
  }));

  if (webglFailed) {
    return (
      <div className={`flex items-center justify-center rounded-xl bg-background p-6 text-sm font-semibold text-muted ${className ?? ""}`}>
        Your browser can&apos;t run the interactive preview. Try a modern Chrome/Firefox/Safari, or download the GIF instead.
      </div>
    );
  }

  return (
    // Pop-out and subject-only scenes are meant to sit on whatever is behind
    // them; a panel colour here would put the lifted subject back in a box.
    // `overflow-hidden` stays: the canvas is the scene's outer bound either way.
    <div
      className={`relative overflow-hidden rounded-xl ${
        config.framing === "popout" || config.subjectOnly ? "" : "bg-background"
      } ${className ?? ""}`}
    >
      <div ref={mountRef} className="h-[360px] w-full sm:h-[420px]" />
      {fps !== null && (
        <span className="pointer-events-none absolute bottom-2 right-2 rounded bg-ink/70 px-1.5 py-0.5 font-pixel text-[10px] text-cloud">{fps} fps</span>
      )}
    </div>
  );
});

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read a captured frame."));
    img.src = src;
  });
}

/** Sample pixels across frames and quantize once → one shared palette. */
function buildPalette(
  frames: Array<{ data: Uint8ClampedArray; width: number; height: number; delay: number }>,
  quantize: (rgba: Uint8ClampedArray, colors: number) => number[][],
): number[][] {
  const stride = 4;
  let cap = 0;
  for (const f of frames) cap += Math.ceil(f.data.length / 4 / stride) + 1;
  const sample = new Uint8ClampedArray(cap * 4);
  let o = 0;
  for (const f of frames) {
    const d = f.data;
    for (let i = 0; i < d.length; i += 4 * stride) {
      sample[o] = d[i];
      sample[o + 1] = d[i + 1];
      sample[o + 2] = d[i + 2];
      sample[o + 3] = d[i + 3];
      o += 4;
    }
  }
  return quantize(sample.subarray(0, o) as Uint8ClampedArray, 256);
}

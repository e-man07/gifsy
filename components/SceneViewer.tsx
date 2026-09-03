"use client";

// Lightweight published-scene viewer. Downloads only the stored assets
// (image/depth/mask) and renders them — it never loads an AI model (handoff
// §26). Used by both the share page (/s/[id]) and the embed (/embed/[id]).

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import * as THREE from "three";
import {
  buildParallaxScene,
  makeTexture,
  planeDims,
  coverDistance,
  placeOrbit,
  CAM_SWAY,
  COVER_REST,
  COVER_HOVER,
  ORBIT_MAX_THETA,
  ORBIT_MAX_PHI,
  ORBIT_COVER,
  ORBIT_RELIEF_BIAS,
  ORBIT_RELIEF_BOOST,
  type ParallaxScene,
} from "@/lib/rendering/scene";
import type { SceneConfig } from "@/lib/rendering/types";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

interface Props {
  image: HTMLImageElement; // decoded from the stored color WebP
  depth: HTMLImageElement; // decoded from the stored grayscale depth WebP
  mask?: HTMLImageElement | null; // decoded from the stored subject PNG
  background?: HTMLImageElement | null; // pre-baked LaMa backdrop (published scenes)
  config: SceneConfig;
  showBrand?: boolean; // "Made with Gifsy" corner mark (handoff §42)
  surface?: "share" | "embed"; // which route hosts the viewer — drives funnel analytics
  className?: string;
}

export function SceneViewer({ image, depth, mask, background, config, showBrand = true, surface, className }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const configRef = useRef(config);
  const targetMouse = useRef({ x: 0, y: 0 });
  const curMouse = useRef({ x: 0, y: 0 });
  const interacted = useRef(false); // false → auto-orbit self-demo; true after first pointer move
  // Orbit mode (grab-to-spin): drag deltas steer camera azimuth/elevation.
  const dragging = useRef(false);
  const lastDrag = useRef({ x: 0, y: 0 });
  const orbit = useRef({ theta: 0, phi: 0 }); // eased current camera angles
  const orbitTarget = useRef({ theta: 0, phi: 0 }); // driven by drag / auto-turntable
  const rafRef = useRef(0);
  const interactionTracked = useRef(false); // fire `<surface>_interacted` at most once per scene
  const [webglFailed, setWebglFailed] = useState(() => {
    if (typeof window === "undefined") return false;
    const c = document.createElement("canvas");
    return !(c.getContext("webgl2") || c.getContext("webgl"));
  });

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || webglFailed) return;

    // New scene → replay the auto-orbit self-demo from the top.
    interacted.current = false;
    interactionTracked.current = false;
    curMouse.current.x = 0;
    curMouse.current.y = 0;
    dragging.current = false;
    orbit.current.theta = 0;
    orbit.current.phi = 0;
    orbitTarget.current.theta = 0;
    orbitTarget.current.phi = 0;

    const scene = new THREE.Scene();
    const w = mount.clientWidth || 480;
    const h = mount.clientHeight || 480;
    const camera = new THREE.PerspectiveCamera(36 + config.perspective * 8, w / h, 0.1, 100);
    const dims = planeDims(image.naturalWidth / image.naturalHeight);
    const initZ = coverDistance(camera.fov, dims.pw, dims.ph, w / h) * COVER_REST;
    camera.position.set(0, 0, initZ);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWebglFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    mount.innerHTML = "";
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    // Depth stays a texture — no CPU readback (handoff §15).
    const depthTex = makeTexture(depth, false);
    let parallax: ParallaxScene;
    try {
      parallax = buildParallaxScene({ scene, image, depthTex, cutout: mask, background, config });
    } catch (e) {
      depthTex.dispose();
      renderer.dispose();
      setWebglFailed(true);
      throw e;
    }

    // Funnel instrumentation: the scene rendered on this surface (embed on a
    // third-party site, or the Gifsy share page). Interaction fires at most once.
    if (surface) track(`${surface}_loaded`);
    const markInteracted = () => {
      interacted.current = true;
      if (surface && !interactionTracked.current) {
        interactionTracked.current = true;
        track(`${surface}_interacted`);
      }
    };

    let hovering = false;
    const DRAG_SENS = 2.4; // screen-fraction → radians; a half-width drag covers the full arc

    const onMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      if (configRef.current.motionMode === "orbit") {
        if (!dragging.current) return; // orbit responds only to an active grab-drag
        markInteracted();
        orbitTarget.current.theta = clamp(orbitTarget.current.theta + ((e.clientX - lastDrag.current.x) / rect.width) * DRAG_SENS, -ORBIT_MAX_THETA, ORBIT_MAX_THETA);
        orbitTarget.current.phi = clamp(orbitTarget.current.phi - ((e.clientY - lastDrag.current.y) / rect.height) * DRAG_SENS, -ORBIT_MAX_PHI, ORBIT_MAX_PHI);
        lastDrag.current.x = e.clientX;
        lastDrag.current.y = e.clientY;
        return;
      }
      markInteracted();
      targetMouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouse.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    const onMouseDown = (e: MouseEvent) => {
      if (configRef.current.motionMode !== "orbit") return;
      dragging.current = true;
      markInteracted();
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
      markInteracted();
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
        markInteracted();
        orbitTarget.current.theta = clamp(orbitTarget.current.theta + ((t.clientX - lastDrag.current.x) / rect.width) * DRAG_SENS, -ORBIT_MAX_THETA, ORBIT_MAX_THETA);
        orbitTarget.current.phi = clamp(orbitTarget.current.phi - ((t.clientY - lastDrag.current.y) / rect.height) * DRAG_SENS, -ORBIT_MAX_PHI, ORBIT_MAX_PHI);
        lastDrag.current.x = t.clientX;
        lastDrag.current.y = t.clientY;
        return;
      }
      markInteracted();
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
    let curZ = initZ;
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      tick += 0.016;

      const cfg = configRef.current;
      const persp = cfg.perspective;
      const speed = cfg.motionSpeed;
      const gain = 0.75 + persp * 0.6;
      const ease = 0.05 + speed * 0.12;

      const mm = cfg.motionMode;

      if (mm === "orbit") {
        // Real camera arc around the depth relief — perspective parallax + self-
        // occlusion, not a shader slide. Auto-turntable until the viewer grabs it,
        // then it holds wherever they leave it. Relief is pushed all-forward so the
        // subject never sinks behind the backdrop as the camera swings around.
        // Mirror of ThreeDPreview so the embed matches the creator preview exactly.
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
        const fitZ = coverDistance(camera.fov, dims.pw, dims.ph, camera.aspect);
        placeOrbit(camera, orbit.current.theta, orbit.current.phi, fitZ * ORBIT_COVER);
        curZ = camera.position.z; // keep cover-fit continuous if the mode switches
      } else {
        parallax.setRelief(0.5, 1.0); // default ± relief (identical to pre-orbit behavior)

        // Target driver for the current mode. In mouse mode we auto-orbit as a
        // self-demo until the viewer first moves the pointer, so an embed reads as
        // 3D on load instead of a still photo; then we follow the pointer.
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

        // One eased driver for every mode → smooth, no snap at the auto→pointer handoff.
        curMouse.current.x += (tpx - curMouse.current.x) * ease;
        curMouse.current.y += (tpy - curMouse.current.y) * ease;
        const px = curMouse.current.x;
        const py = curMouse.current.y;

        parallax.setPointer(px * gain, py * gain);
        camera.position.x = Math.max(-0.18, Math.min(0.18, px * gain * CAM_SWAY));
        camera.position.y = Math.max(-0.14, Math.min(0.14, py * gain * CAM_SWAY));

        // Cover-fit the plane to the viewport (fill, crop overflow → no black border).
        const fitZ = coverDistance(camera.fov, dims.pw, dims.ph, camera.aspect);
        const breathe = mm === "auto" ? Math.sin(tick * 0.5) * 0.02 * fitZ : 0;
        const targetZ = (hovering ? fitZ * COVER_HOVER : fitZ * COVER_REST) + breathe;
        curZ += (targetZ - curZ) * 0.08;
        camera.position.z = curZ;
        camera.lookAt(0, 0, 0);
      }
      renderer.render(scene, camera);
    };
    animate();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        if (cr.width === 0 || cr.height === 0) continue;
        camera.aspect = cr.width / cr.height;
        camera.updateProjectionMatrix();
        renderer.setSize(cr.width, cr.height, false);
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, depth, mask, background]);

  if (webglFailed) {
    return (
      <div className={`flex items-center justify-center bg-background p-6 text-center text-sm font-semibold text-muted ${className ?? ""}`}>
        Your browser can&apos;t run this interactive image. Try a modern Chrome, Firefox, or Safari.
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-background ${className ?? ""}`}>
      <div ref={mountRef} className="h-full w-full" />
      {showBrand && (
        <a
          href={`/?ref=${surface ?? "scene"}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("brand_clicked", { surface: surface ?? "scene" })}
          className="absolute bottom-2 right-2 rounded bg-ink/60 px-2 py-0.5 font-pixel text-[10px] text-cloud/90 hover:text-sun"
        >
          Made with Gifsy
        </a>
      )}
    </div>
  );
}

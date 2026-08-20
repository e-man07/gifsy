// Sticker creation: AI background removal, edge cleanup, outline/border,
// optional drop shadow, and optional caption.
import {
  canvasToBlob,
  getCtx,
  loadImage,
  makeCanvas,
  refineCutout,
} from "./image";

export type BgModel = "isnet" | "isnet_fp16" | "isnet_quint8";

export interface CutoutProgress {
  stage: "download" | "process";
  fraction: number; // 0..1
}

/** Remove the background from an image, returning a transparent PNG blob. */
export async function cutout(
  source: Blob,
  onProgress?: (p: CutoutProgress) => void,
  model: BgModel = "isnet_fp16",
): Promise<Blob> {
  const { removeBackground } = await import("@imgly/background-removal");
  return removeBackground(source, {
    model,
    output: { format: "image/png" },
    progress: (key, current, total) => {
      const fraction = total > 0 ? current / total : 0;
      onProgress?.({
        stage: key.startsWith("fetch") ? "download" : "process",
        fraction,
      });
    },
  });
}

export interface StickerOptions {
  outline: number; // outline thickness in px (relative to a 512 canvas); 0 = none
  outlineColor: string;
  shadow?: boolean;
  text?: string;
  textColor?: string;
  textStrokeColor?: string;
}

/** Build a solid-colored silhouette of a source, drawn at the given rect. */
function silhouette(
  src: CanvasImageSource,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  size: number,
  color: string,
): HTMLCanvasElement {
  const sil = makeCanvas(size);
  const sctx = getCtx(sil);
  sctx.drawImage(src, dx, dy, dw, dh);
  sctx.globalCompositeOperation = "source-in";
  sctx.fillStyle = color;
  sctx.fillRect(0, 0, size, size);
  return sil;
}

/**
 * Compose a finished sticker on a square transparent canvas: cleans and
 * auto-crops the cutout, centers it, then draws (optionally) a soft shadow, a
 * smooth outline, the subject, and an optional caption.
 */
export async function composeSticker(
  cutoutBlob: Blob,
  opts: StickerOptions,
  size = 512,
): Promise<Blob> {
  const img = await loadImage(cutoutBlob);
  // De-halo, feather the edges, and crop tight to the subject.
  const subject = refineCutout(img, { threshold: 20, feather: 1 });

  const canvas = makeCanvas(size);
  const ctx = getCtx(canvas);

  const shadowRoom = opts.shadow ? Math.round(size * 0.03) : 0;
  const margin = Math.round(size * 0.08) + opts.outline + shadowRoom;
  const avail = size - margin * 2;
  const scale = Math.min(avail / subject.width, avail / subject.height);
  const dw = subject.width * scale;
  const dh = subject.height * scale;
  const dx = (size - dw) / 2;
  const dy = (size - dh) / 2;

  // Soft contact shadow underneath everything.
  if (opts.shadow) {
    const sh = silhouette(subject, dx, dy, dw, dh, size, "rgba(0,0,0,0.5)");
    ctx.save();
    ctx.filter = `blur(${Math.round(size * 0.018)}px)`;
    ctx.globalAlpha = 0.55;
    ctx.drawImage(sh, 0, Math.round(size * 0.02));
    ctx.restore();
  }

  // Outline: stamp a tinted silhouette around several rings for a smooth,
  // even border that follows the (feathered) subject edge.
  if (opts.outline > 0) {
    const sil = silhouette(subject, dx, dy, dw, dh, size, opts.outlineColor);
    const t = opts.outline;
    const steps = Math.max(48, Math.ceil(t * 3));
    for (const radius of [t, t * 0.66, t * 0.33]) {
      for (let a = 0; a < steps; a++) {
        const ang = (a / steps) * Math.PI * 2;
        ctx.drawImage(sil, Math.cos(ang) * radius, Math.sin(ang) * radius);
      }
    }
  }

  ctx.drawImage(subject, dx, dy, dw, dh);

  const text = opts.text?.trim();
  if (text) {
    drawCaption(
      ctx,
      text,
      size,
      opts.textColor ?? "#ffffff",
      opts.textStrokeColor ?? "#111111",
    );
  }

  return canvasToBlob(canvas, "image/png");
}

function drawCaption(
  ctx: CanvasRenderingContext2D,
  text: string,
  size: number,
  fill: string,
  stroke: string,
) {
  const fontSize = Math.round(size * 0.12);
  ctx.font = `900 ${fontSize}px "Geist", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.lineJoin = "round";
  ctx.lineWidth = fontSize * 0.22;
  const y = size - Math.round(size * 0.07);
  const upper = text.toUpperCase();
  ctx.strokeStyle = stroke;
  ctx.strokeText(upper, size / 2, y, size * 0.9);
  ctx.fillStyle = fill;
  ctx.fillText(upper, size / 2, y, size * 0.9);
}

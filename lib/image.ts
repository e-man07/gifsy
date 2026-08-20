// Shared canvas / image helpers. All browser-only; call from client code.

export type Ctx2D = CanvasRenderingContext2D;

/** Load a File/Blob/URL into a fully-decoded HTMLImageElement. */
export async function loadImage(src: string | Blob): Promise<HTMLImageElement> {
  const url = typeof src === "string" ? src : URL.createObjectURL(src);
  const img = new Image();
  img.decoding = "async";
  img.crossOrigin = "anonymous";
  img.src = url;
  try {
    await img.decode();
  } catch {
    // Safari sometimes rejects decode() for object URLs; fall back to onload.
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not load image"));
    });
  }
  if (typeof src !== "string") {
    // The bitmap is decoded; safe to release the object URL shortly after.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
  return img;
}

export function makeCanvas(width: number, height = width): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  return c;
}

export function getCtx(canvas: HTMLCanvasElement): Ctx2D {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D canvas context unavailable");
  return ctx;
}

/** Draw an image to fill a square of `size` (cover), centered, optionally scaled/offset/rotated. */
export function drawCover(
  ctx: Ctx2D,
  img: HTMLImageElement,
  size: number,
  scale = 1,
  offsetX = 0,
  offsetY = 0,
  rotation = 0,
) {
  const base = Math.max(size / img.naturalWidth, size / img.naturalHeight);
  const s = base * scale;
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  ctx.save();
  ctx.translate(size / 2 + offsetX, size / 2 + offsetY);
  if (rotation) ctx.rotate(rotation);
  ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
}

/** Draw an image fully inside a box (contain), centered, with padding. Returns the drawn rect. */
export function drawContain(
  ctx: Ctx2D,
  img: HTMLImageElement,
  size: number,
  padding = 0,
) {
  const avail = size - padding * 2;
  const scale = Math.min(avail / img.naturalWidth, avail / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = (size - dw) / 2;
  const dy = (size - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
  return { dx, dy, dw, dh };
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/png",
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      type,
      quality,
    );
  });
}

export function blobToURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/** Separable box blur applied to the alpha channel only (feathers cutout edges). */
export function blurAlpha(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  radius: number,
) {
  if (radius < 1) return;
  const a = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) a[i] = data[i * 4 + 3];
  const tmp = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0, c = 0;
      for (let k = -radius; k <= radius; k++) {
        const xx = x + k;
        if (xx >= 0 && xx < w) { s += a[y * w + xx]; c++; }
      }
      tmp[y * w + x] = s / c;
    }
  }
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let s = 0, c = 0;
      for (let k = -radius; k <= radius; k++) {
        const yy = y + k;
        if (yy >= 0 && yy < h) { s += tmp[yy * w + x]; c++; }
      }
      a[y * w + x] = s / c;
    }
  }
  for (let i = 0; i < w * h; i++) data[i * 4 + 3] = a[i];
}

export interface RefineOptions {
  threshold?: number; // alpha below this is cleared (de-halo)
  feather?: number; // alpha blur radius (edge anti-aliasing)
}

/**
 * Clean a raw cutout (drop the faint background halo, soften edges) and crop
 * tightly to the subject. Returns a canvas sized to the subject's bounding box.
 * Falls back to the full image if the cutout is empty.
 */
export function refineCutout(
  img: HTMLImageElement,
  opts: RefineOptions = {},
): HTMLCanvasElement {
  const threshold = opts.threshold ?? 20;
  const feather = opts.feather ?? 1;
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const src = makeCanvas(w, h);
  const sctx = getCtx(src);
  sctx.drawImage(img, 0, 0);
  const id = sctx.getImageData(0, 0, w, h);
  const d = id.data;

  // De-halo: clear near-transparent fringe pixels.
  for (let i = 0; i < w * h; i++) {
    if (d[i * 4 + 3] < threshold) d[i * 4 + 3] = 0;
  }
  // Feather remaining edges for smooth anti-aliasing.
  blurAlpha(d, w, h, feather);

  // Bounding box of the visible subject.
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  sctx.putImageData(id, 0, 0);

  if (maxX < minX || maxY < minY) return src; // nothing found — return as-is

  const pad = feather + 2;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;

  const out = makeCanvas(cw, ch);
  getCtx(out).drawImage(src, minX, minY, cw, ch, 0, 0, cw, ch);
  return out;
}

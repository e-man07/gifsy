// Export helpers: trigger downloads and produce messaging-app-ready sticker files.
import { canvasToBlob, getCtx, loadImage, makeCanvas } from "./image";

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Produce a 512×512 WebP suited to Telegram sticker packs (Telegram requires a
 * 512×512 image with transparency and caps static stickers at 512 KB). Quality
 * is nudged down until the result fits that limit.
 */
export async function toStickerWebp(pngBlob: Blob, size = 512): Promise<Blob> {
  const img = await loadImage(pngBlob);
  const canvas = makeCanvas(size);
  const ctx = getCtx(canvas);
  const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, (size - dw) / 2, (size - dh) / 2, dw, dh);

  const LIMIT = 512 * 1024;
  let quality = 0.92;
  let blob = await canvasToBlob(canvas, "image/webp", quality);
  while (blob.size > LIMIT && quality > 0.4) {
    quality -= 0.12;
    blob = await canvasToBlob(canvas, "image/webp", quality);
  }
  return blob;
}

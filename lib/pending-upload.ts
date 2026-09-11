// One-shot handoff for the file(s) picked on the homepage, so the dedicated
// /create, /tools/gif and /tools/sticker pages can open already showing them
// instead of asking the user to upload again.
//
// A plain module-level variable works here because Next.js client-side
// navigation (router.push) keeps the same JS module instance alive — no full
// page reload — so this survives the trip. It does NOT survive a hard
// refresh or a direct visit to one of those pages, which is fine: each one
// falls back to its own upload dropzone when nothing was handed off.

let pending: File[] | null = null;

export function setPendingUpload(files: File[]): void {
  pending = files;
}

export function takePendingUpload(): File[] | null {
  const files = pending;
  pending = null;
  return files;
}

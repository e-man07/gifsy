// Copy every legacy scene from the Vercel Blob store into R2.
//
// WHY
// ---
// Scenes published before the R2 move live in Blob under scenes/<id>/*. The
// read path (lib/publish/manifest.ts) still falls back to Blob for them, but
// every such read is a metered Blob operation — the thing that got the store
// blocked. Once this has run, nothing reads Blob and the store can be deleted.
//
// It rewrites each scene.json so asset refs become `r2:<key>` (what the asset
// proxy expects) instead of Blob URLs, and skips scenes already present in R2
// so it is safe to re-run.
//
// USAGE (needs .env.local with BLOB_READ_WRITE_TOKEN + the R2_* vars;
// Blob downloads must not be blocked — wait for the cycle reset or upgrade):
//   node scripts/migrate-blob-to-r2.mjs            # copy everything
//   node scripts/migrate-blob-to-r2.mjs --dry-run  # list only
//   node scripts/migrate-blob-to-r2.mjs <id> ...   # specific scenes

import fs from "node:fs";
import { list } from "@vercel/blob";
import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => /^[A-Z0-9_]+=/.test(l))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    }),
);
for (const k of ["BLOB_READ_WRITE_TOKEN", "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"]) {
  if (!env[k]) throw new Error(`${k} missing from .env.local`);
}
process.env.BLOB_READ_WRITE_TOKEN = env.BLOB_READ_WRITE_TOKEN;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const only = new Set(args.filter((a) => !a.startsWith("--")));

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
});
const Bucket = env.R2_BUCKET;

async function inR2(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket, Key: key }));
    return true;
  } catch (e) {
    if (e?.$metadata?.httpStatusCode === 404 || e?.name === "NotFound") return false;
    throw e;
  }
}

// 1. Inventory Blob, grouped by scene id.
const scenes = new Map();
let cursor;
do {
  const page = await list({ prefix: "scenes/", cursor, limit: 1000 });
  for (const b of page.blobs) {
    const [, id, file] = b.pathname.split("/");
    if (!id || !file) continue;
    if (only.size && !only.has(id)) continue;
    if (!scenes.has(id)) scenes.set(id, new Map());
    scenes.get(id).set(file, b);
  }
  cursor = page.hasMore ? page.cursor : undefined;
} while (cursor);
console.log(`${scenes.size} scene(s) in Blob${only.size ? " (filtered)" : ""}`);

// 2. Copy each one; manifest last so a half-copied scene never resolves.
let copied = 0, skipped = 0, failed = 0;
for (const [id, files] of scenes) {
  const manifestBlob = files.get("scene.json");
  if (!manifestBlob) { console.warn(`  ${id}: no scene.json, skipping`); skipped++; continue; }
  if (await inR2(`scenes/${id}/scene.json`)) { console.log(`  ${id}: already in R2`); skipped++; continue; }
  if (dryRun) { console.log(`  ${id}: would copy ${files.size} files`); continue; }
  try {
    const manifest = await (await fetchOrThrow(manifestBlob.url)).json();
    for (const [field, ref] of Object.entries(manifest.assets ?? {})) {
      if (!ref?.url) continue;
      const file = ref.url.split("/").pop();
      const src = files.get(file);
      if (!src) throw new Error(`asset ${field} (${file}) missing in Blob`);
      const key = `scenes/${id}/${file}`;
      const bytes = Buffer.from(await (await fetchOrThrow(src.url)).arrayBuffer());
      await s3.send(new PutObjectCommand({
        Bucket, Key: key, Body: bytes, ContentType: ref.mime,
        CacheControl: "public, max-age=31536000, immutable",
      }));
      ref.url = `r2:${key}`;
    }
    await s3.send(new PutObjectCommand({
      Bucket, Key: `scenes/${id}/scene.json`, Body: Buffer.from(JSON.stringify(manifest)),
      ContentType: "application/json", CacheControl: "public, max-age=31536000, immutable",
    }));
    console.log(`  ${id}: copied`);
    copied++;
  } catch (e) {
    console.error(`  ${id}: FAILED — ${e.message}`);
    failed++;
  }
}
console.log(`\ncopied ${copied}, skipped ${skipped}, failed ${failed}`);
if (failed) process.exit(1);

async function fetchOrThrow(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} fetching ${url}${r.status === 403 ? " (Blob store still blocked)" : ""}`);
  return r;
}

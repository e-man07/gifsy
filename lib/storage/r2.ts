// Server-only Cloudflare R2 client. Scene assets live here (see
// app/api/scenes/route.ts); this module is the only place that knows it's S3.
//
// Why R2 and not Vercel Blob: the Hobby Blob store is capped at ~10K "simple
// operations" a month — every GET/HEAD counts — and the embed traffic pattern
// (many scenes, many regions, each edge cache miss costing several reads)
// blew through that and got the whole store blocked. R2's free tier allows
// 10M reads and charges nothing for egress, which is the right shape for
// "small files read many times". Access is private: viewers never hit R2
// directly, they go through /api/asset/[id]/[field], so the bucket needs no
// public URL and nothing can enumerate it.
//
// Env: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET.

import {
  GetObjectCommand,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";

let client: S3Client | null = null;
let bucket = "";

function env(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`R2 not configured: ${name} is missing.`);
  return v;
}

/** Lazily-built client so a missing env var fails the request, not the build. */
function r2(): { client: S3Client; bucket: string } {
  if (!client) {
    const accountId = env("R2_ACCOUNT_ID");
    bucket = env("R2_BUCKET");
    client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env("R2_ACCESS_KEY_ID"),
        secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
      },
    });
  }
  return { client, bucket };
}

/** True when every R2 env var is present — lets callers pick a fallback
 *  instead of throwing when the bucket isn't wired up (local dev). */
export function r2Configured(): boolean {
  return ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"].every(
    (k) => !!process.env[k]?.trim(),
  );
}

export async function putObject(
  key: string,
  body: Blob | string | Uint8Array,
  contentType: string,
): Promise<void> {
  const { client, bucket } = r2();
  const bytes =
    typeof body === "string"
      ? Buffer.from(body)
      : body instanceof Blob
        ? Buffer.from(await body.arrayBuffer())
        : body;
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: bytes,
      ContentType: contentType,
      // Objects are immutable per key (re-publish overwrites the whole set).
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

export interface StoredObject {
  body: ReadableStream<Uint8Array>;
  contentType: string | undefined;
  size: number | undefined;
}

/** Fetch one object, or null when the key doesn't exist. Other failures throw. */
export async function getObject(key: string): Promise<StoredObject | null> {
  const { client, bucket } = r2();
  try {
    const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    if (!res.Body) return null;
    // In the Node runtime the SDK hands back a Readable wrapped with
    // transformToWebStream(); convert so the route can stream it as a
    // Response body without buffering.
    const raw = res.Body as unknown as {
      transformToWebStream?: () => ReadableStream<Uint8Array>;
    };
    const body = raw.transformToWebStream
      ? raw.transformToWebStream()
      : (res.Body as unknown as ReadableStream<Uint8Array>);
    return { body, contentType: res.ContentType, size: res.ContentLength };
  } catch (err) {
    if (err instanceof NoSuchKey) return null;
    if (err instanceof S3ServiceException && err.$metadata?.httpStatusCode === 404) return null;
    throw err;
  }
}

/** Read a small object fully as text (manifests). Null when missing. */
export async function getObjectText(key: string): Promise<string | null> {
  const obj = await getObject(key);
  if (!obj) return null;
  return await new Response(obj.body).text();
}

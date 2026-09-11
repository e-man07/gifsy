// Per-scene Open Graph / Twitter card.
//
// Replaces pointing og:image straight at the published still, which was wrong
// in three ways that only show up once a link is actually pasted somewhere:
//
//   * the still is 540x360, well under X's recommended 1200x628, so it was
//     upscaled and soft;
//   * its 1.5 aspect got cropped top-and-bottom into the card's 1.91, which on
//     a subject-only pop-out scene is exactly where the subject is;
//   * it is WebP, which X accepts but several other unfurlers do not.
//
// Compositing into a 1200x630 PNG fixes all three at once, and because the
// still sits framed at 588px rather than stretched full-bleed the upscale is
// ~1.09x instead of ~2.2x. It also puts the wordmark on every shared scene.
//
// This file convention populates BOTH og:image and twitter:image, along with
// their type/width/height/alt tags — verified against the site-wide card at
// app/opengraph-image.tsx. So generateMetadata must NOT also set images, or the
// hardcoded pair comes back.
//
// The still has to be transcoded on the way in: Satori's rasteriser cannot
// decode WebP, and hands back an empty frame rather than an error (first
// attempt at this rendered a beautifully composed card with a hole in it).

import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { fetchSceneManifest } from "@/lib/publish/manifest";

export const alt = "An interactive 3D photo, made with Gifsy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand palette, mirrored from app/globals.css. Satori has no CSS variables.
const INK = "#0e2438";
const PANEL = "#0b1a2b";
const CLOUD = "#f5faff";
const SKY = "#2e9bf0";
const DIM = "#a9c2d8";

/** Frame is 1.5 — the same aspect the renderer publishes stills at, so the
 *  common case fills it exactly. */
const FRAME_W = 588;
const FRAME_H = 392;

/**
 * Fetch a published still and return it as a PNG data URI sized to the frame.
 *
 * Two jobs beyond the format change. It resizes with sharp rather than letting
 * the rasteriser scale a 540px still up to 588px, which is a better kernel for
 * the same pixels. And `fit: "contain"` bakes the letterbox in PANEL, so a
 * portrait or square scene keeps its full extent instead of being cropped —
 * clipping the subject is the whole failure this card exists to avoid.
 *
 * Returns null on any failure: a card missing its photo still unfurls, while a
 * throw here means a 500 to the crawler and no card at all.
 */
async function framedPng(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const png = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(FRAME_W, FRAME_H, { fit: "contain", background: PANEL })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch (err) {
    console.warn(`[og] could not prepare still ${url}`, err);
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // fetchSceneManifest never throws (it collapses every failure to null), and
  // this must not either: a thrown image route means a 500 in the unfurler and
  // no card at all. A missing scene just loses the photo, not the card.
  const manifest = await fetchSceneManifest(id);
  const still = manifest?.assets.image.url ?? manifest?.assets.thumb?.url;
  const photo = still ? await framedPng(still) : null;

  const logo = await readFile(join(process.cwd(), "public/gifsy-logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          backgroundColor: INK,
          padding: "0 56px",
          gap: "40px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: "424px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "32px",
              fontWeight: 800,
              letterSpacing: "0.06em",
              color: CLOUD,
            }}
          >
            <img src={logoSrc} width={56} height={56} alt="" />
            GIFSY
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "24px",
              fontSize: "50px",
              fontWeight: 800,
              lineHeight: 1.08,
              color: CLOUD,
            }}
          >
            An interactive 3D photo.
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "22px",
              fontSize: "23px",
              lineHeight: 1.4,
              color: DIM,
            }}
          >
            Drag to look around — it started as one still photo.
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "30px",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                backgroundColor: SKY,
                color: CLOUD,
                fontSize: "21px",
                fontWeight: 700,
                padding: "9px 20px",
                borderRadius: "999px",
              }}
            >
              Live 3D
            </div>
            <div style={{ display: "flex", color: "#7d97ad", fontSize: "21px" }}>
              Made with Gifsy
            </div>
          </div>
        </div>

        {/* Same soft-shadow card treatment as the site-wide card. objectFit is
            `contain`, not `cover`: a portrait or square scene would otherwise
            lose its edges, and clipping the subject is the failure this card
            exists to avoid. */}
        <div
          style={{
            display: "flex",
            width: `${FRAME_W}px`,
            height: `${FRAME_H}px`,
            backgroundColor: PANEL,
            border: `1px solid rgba(14,36,56,0.12)`,
            borderRadius: "22px",
            boxShadow: `0 24px 60px rgba(14,36,56,0.35)`,
            overflow: "hidden",
          }}
        >
          {photo && (
            <img
              src={photo}
              width={FRAME_W}
              height={FRAME_H}
              style={{ objectFit: "contain" }}
              alt=""
            />
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}

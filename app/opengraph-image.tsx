// Site-wide Open Graph / Twitter card, generated at build time.
//
// This is the single highest-leverage asset for a link-shared launch: without
// it a pasted Gifsy link unfurls as a bare grey text card on X, Slack, Discord
// and iMessage. The hero photo is a real gallery still with obvious
// subject/background separation, because that separation *is* the product.

import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt =
  "Gifsy — turn any photo into a live 3D photo you can embed anywhere";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand palette, mirrored from app/globals.css. Satori has no CSS variables, so
// these are duplicated deliberately rather than imported.
const INK = "#0e2438";
const CLOUD = "#f5faff";
const SKY = "#2e9bf0";

export default async function Image() {
  const photo = await readFile(
    join(process.cwd(), "public/gallery/animals-1.jpg"),
  );
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;
  // Satori can't resolve next/image, so the mark is inlined as a data URI.
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
          padding: "0 64px",
          gap: "56px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "580px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              fontSize: "38px",
              fontWeight: 800,
              letterSpacing: "0.06em",
              color: CLOUD,
            }}
          >
            <img src={logoSrc} width={66} height={66} alt="" />
            GIFSY
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "26px",
              fontSize: "62px",
              fontWeight: 800,
              lineHeight: 1.08,
              color: CLOUD,
            }}
          >
            Turn any photo into a live 3D photo.
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "26px",
              fontSize: "27px",
              lineHeight: 1.4,
              color: "#a9c2d8",
            }}
          >
            Runs in your browser. Publish it and paste the embed into
            any site.
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "34px",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                backgroundColor: SKY,
                color: CLOUD,
                fontSize: "22px",
                fontWeight: 700,
                padding: "10px 22px",
                borderRadius: "999px",
              }}
            >
              Free to try
            </div>
            <div
              style={{
                display: "flex",
                color: "#7d97ad",
                fontSize: "22px",
              }}
            >
              No plugins, no modeling
            </div>
          </div>
        </div>

        {/* Hero still, with the soft-shadow card treatment used across the UI. */}
        <div
          style={{
            display: "flex",
            width: "460px",
            height: "440px",
            border: `1px solid rgba(14,36,56,0.12)`,
            borderRadius: "22px",
            boxShadow: `0 24px 60px rgba(14,36,56,0.35)`,
            overflow: "hidden",
          }}
        >
          <img
            src={photoSrc}
            width={460}
            height={440}
            style={{ objectFit: "cover" }}
            alt=""
          />
        </div>
      </div>
    ),
    { ...size },
  );
}

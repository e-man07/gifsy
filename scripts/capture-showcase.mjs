// Records the community-showcase clips under /public/showcase.
//
// The homepage used to <iframe> the live gifsy.fun embeds; see the comment at
// the top of components/CommunityShowcase.tsx for why it now plays local
// clips instead. This captures each scene's auto-orbit self-demo straight off
// the embed's WebGL canvas in headless Chrome, then hands the result to
// ffmpeg for a seamless forward-then-backward loop plus a first-frame poster.
//
// Usage (dev server running on :3000, ffmpeg on PATH):
//   npm i --no-save playwright-core
//   node scripts/capture-showcase.mjs ae14f65c7f 0f0fbe28ea ...
//   SIZE=600x800 node scripts/capture-showcase.mjs <id>              (other card shapes)
//
// Headless is deliberate: a real tab that is not the focused, unoccluded
// window stops running requestAnimationFrame, so the viewer never paints and
// the capture stalls.

import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ids = process.argv.slice(2);
if (ids.length === 0) {
  console.error("usage: node scripts/capture-showcase.mjs <scene-id> [...]");
  process.exit(1);
}
const OUT = path.join(process.cwd(), "public", "showcase");
fs.mkdirSync(OUT, { recursive: true });
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "showcase-"));
// Default is 2× the 300×380 marquee card, so it stays crisp on retina; SIZE
// overrides it for other card shapes. 8s of orbit, mirrored below into a
// 15s loop.
const [W, H] = (process.env.SIZE ?? "600x760").split("x").map(Number);
const SECS = 8;

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on("console", (m) => { if (m.type() === "error") console.log("  [console]", m.text().slice(0, 160)); });

for (const id of ids) {
  console.log("capturing", id);
  await page.goto(`http://localhost:3000/embed/${id}`, { waitUntil: "networkidle" });
  // Wait for the viewer's first painted frame: the poster <img> fades to 0.
  await page.waitForFunction(() => {
    const c = document.querySelector("canvas");
    const img = document.querySelector("img");
    return c && (!img || getComputedStyle(img).opacity === "0");
  }, null, { timeout: 60000 });
  await page.waitForTimeout(1000);
  const b64 = await page.evaluate(async (secs) => {
    const canvas = document.querySelector("canvas");
    const stream = canvas.captureStream(30);
    const rec = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9", videoBitsPerSecond: 10_000_000 });
    const chunks = [];
    rec.ondataavailable = (e) => chunks.push(e.data);
    const done = new Promise((r) => (rec.onstop = r));
    rec.start(250);
    await new Promise((r) => setTimeout(r, secs * 1000));
    rec.stop();
    await done;
    const buf = await new Blob(chunks, { type: "video/webm" }).arrayBuffer();
    let s = ""; const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  }, SECS);
  const raw = path.join(TMP, `${id}.webm`);
  fs.writeFileSync(raw, Buffer.from(b64, "base64"));

  // MediaRecorder writes a variable-rate stream: pin it to 30fps first. The
  // first half-second is the viewer easing in from rest, so it is trimmed;
  // then the clip is played forward and reversed so the loop has no seam.
  const mp4 = path.join(OUT, `${id}.mp4`);
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-i", raw,
    "-filter_complex",
    "[0:v]fps=30,format=yuv420p,trim=start=0.5,setpts=PTS-STARTPTS,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1",
    "-c:v", "libx264", "-preset", "slow", "-crf", "29", "-profile:v", "main",
    "-movflags", "+faststart", "-an", mp4,
  ]);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", mp4, "-frames:v", "1", "-q:v", "6", path.join(OUT, `${id}.jpg`)]);
  console.log("  wrote", mp4, fs.statSync(mp4).size, "bytes");
}
fs.rmSync(TMP, { recursive: true, force: true });
await browser.close();

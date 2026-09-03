// Phase 2 test surface for LaMa server-side inpainting. Node runtime (WASM
// onnxruntime, no native deps). GET runs a synthetic self-test so the WASM +
// model path can be verified on a real Vercel deploy by just visiting the URL;
// POST inpaints real RGBA pixel data (the shape the publish flow will send).

import { NextResponse } from "next/server";
import { inpaintBackground, type Rgba, type Gray } from "@/lib/inpaint/lama";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300; // first cold call downloads the ~200MB model

// GET /api/inpaint — synthetic proof the model loads and runs in this runtime.
export async function GET() {
  try {
    const N = 128;
    const image: Rgba = { data: new Uint8Array(N * N * 4), width: N, height: N };
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) {
        const i = (y * N + x) * 4;
        image.data[i] = (x * 4) % 255;
        image.data[i + 1] = (y * 4) % 255;
        image.data[i + 2] = 140;
        image.data[i + 3] = 255;
      }
    const mask: Gray = { data: new Uint8Array(N * N), width: N, height: N };
    const c = N / 2;
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++)
        mask.data[y * N + x] = (x - c) ** 2 + (y - c) ** 2 < (N * 0.25) ** 2 ? 255 : 0;

    const t0 = Date.now();
    const out = await inpaintBackground(image, mask);
    return NextResponse.json({
      ok: true,
      runtime: "nodejs/wasm",
      ms: Date.now() - t0,
      output: `${out.width}x${out.height}`,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

// POST /api/inpaint — real inpaint. Body: multipart form with
//   image: raw RGBA bytes,  mask: raw 1-byte-per-pixel,  width, height.
// Returns raw RGBA bytes of the subject-removed background.
export async function POST(req: Request) {
  try {
    // Inpaint is an expensive server op invoked during publish — require auth.
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

    const form = await req.formData();
    const width = Number(form.get("width"));
    const height = Number(form.get("height"));
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
      return NextResponse.json({ ok: false, error: "bad width/height" }, { status: 400 });
    }
    const imageFile = form.get("image");
    const maskFile = form.get("mask");
    if (!(imageFile instanceof Blob) || !(maskFile instanceof Blob)) {
      return NextResponse.json({ ok: false, error: "image and mask required" }, { status: 400 });
    }
    const image: Rgba = { data: new Uint8Array(await imageFile.arrayBuffer()), width, height };
    const mask: Gray = { data: new Uint8Array(await maskFile.arrayBuffer()), width, height };
    if (image.data.length !== width * height * 4) {
      return NextResponse.json({ ok: false, error: "image bytes != w*h*4" }, { status: 400 });
    }
    if (mask.data.length !== width * height) {
      return NextResponse.json({ ok: false, error: "mask bytes != w*h" }, { status: 400 });
    }
    const out = await inpaintBackground(image, mask);
    // Copy into a plain ArrayBuffer-backed view so the body type is unambiguous.
    const body = new Uint8Array(out.data.length);
    body.set(out.data);
    return new Response(body.buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "X-Output-Size": `${out.width}x${out.height}`,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

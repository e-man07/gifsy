// LaMa server-side inpainting. Node runtime (WASM onnxruntime, no native deps).
// POST inpaints real RGBA pixel data, sent by the publish flow.
//
// There is deliberately no GET: it used to run a synthetic self-test so the
// WASM + model path could be verified on a real deploy by visiting the URL, but
// unauthenticated it was a denial-of-wallet hole — every hit pulls the ~200MB
// model on a cold instance and burns CPU up to maxDuration. Verify deploys with
// an authenticated POST instead.

import { NextResponse } from "next/server";
import { inpaintBackground, type Rgba, type Gray } from "@/lib/inpaint/lama";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300; // first cold call downloads the ~200MB model

// Upper bound on accepted dimensions. The publish flow sends a 1024 canvas
// (lib/publish/creator.ts) which lama.ts letterboxes to 512 anyway, so this is
// pure headroom — it caps what a signed-in caller can make the server allocate.
const MAX_DIM = 2048;

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
    if (
      !Number.isInteger(width) ||
      !Number.isInteger(height) ||
      width < 1 ||
      height < 1 ||
      width > MAX_DIM ||
      height > MAX_DIM
    ) {
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

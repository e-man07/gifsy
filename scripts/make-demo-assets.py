#!/usr/bin/env python3
"""Bake the assets a landing-page demo scene needs, offline.

WHY
---
The demos in lib/showcase.ts render with SceneViewer, which consumes a finished
image + depth + matte and ships NO model to the visitor. That is what lets an
interactive 3D scene sit above the fold. The price is that those three files
have to be produced ahead of time with the SAME models the browser would use —
otherwise the demo is not honestly "the same thing you get from your own photo".

This script is that step, and it deliberately mirrors the app rather than
approximating it:
  depth  → Depth Anything V2 small fp16, long edge 770 rounded to the model's
           14px patch grid, ImageNet normalisation, 0.5/99.5 percentile
           stretch — the same numbers as lib/depth.ts.
  matte  → ISNet fp16, 1024x1024, (v-128)/256 — the same model and constants
           @imgly/background-removal uses in lib/sticker.ts.

USAGE
-----
  # models (once)
  curl -L -o depth.onnx "https://huggingface.co/onnx-community/depth-anything-v2-small/resolve/main/onnx/model_fp16.onnx"
  # isnet_fp16 ships chunked; concatenate the chunk list from
  # https://staticimgly.com/@imgly/background-removal-data/<ver>/dist/resources.json
  .venv/bin/python scripts/make-demo-assets.py <source.jpg> <id> <models-dir>

Writes public/gallery/<id>.jpg, public/demo/<id>-depth.png and
public/demo/<id>-mask.webp, then add the entry to DEMO_SCENES.
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

import numpy as np
import onnxruntime as ort
from PIL import Image

# ── depth: mirror lib/depth.ts ───────────────────────────────────────────────
PATCH = 14
DEPTH_LONG_EDGE = 770  # THREED_INPUT_SIZE — the 3D pass, not the 518 preview pass
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)
# Robust stretch so a few outliers don't flatten the relief (lib/depth.ts).
LO_PCT, HI_PCT = 0.5, 99.5

# ── matte: mirror @imgly/background-removal ──────────────────────────────────
ISNET_RES = 1024
ISNET_MEAN = 128.0
ISNET_STD = 256.0


def session(path: Path) -> ort.InferenceSession:
    opts = ort.SessionOptions()
    opts.log_severity_level = 3
    return ort.InferenceSession(str(path), opts, providers=["CPUExecutionProvider"])


def make_depth(img: Image.Image, model: Path) -> Image.Image:
    w, h = img.size
    scale = min(DEPTH_LONG_EDGE / w, DEPTH_LONG_EDGE / h)
    iw = max(PATCH, round(w * scale / PATCH) * PATCH)
    ih = max(PATCH, round(h * scale / PATCH) * PATCH)

    arr = np.asarray(img.convert("RGB").resize((iw, ih), Image.BILINEAR), dtype=np.float32) / 255.0
    arr = (arr - IMAGENET_MEAN) / IMAGENET_STD
    tensor = np.transpose(arr, (2, 0, 1))[None].astype(np.float32)  # NCHW

    sess = session(model)
    raw = sess.run(["predicted_depth"], {"pixel_values": tensor})[0].astype(np.float32)
    depth = raw.reshape(ih, iw)

    lo, hi = np.percentile(depth, [LO_PCT, HI_PCT])
    depth = (depth - lo) / max(hi - lo, 1e-6)
    depth = np.clip(depth, 0.0, 1.0)

    # RGB grey with opaque alpha, byte-for-byte what depthGridToCanvas writes.
    grey = (depth * 255.0 + 0.5).astype(np.uint8)
    print(f"  depth  {iw}x{ih}  range {depth.min():.3f}..{depth.max():.3f}")
    return Image.fromarray(np.dstack([grey, grey, grey]), mode="RGB")


def make_matte(img: Image.Image, model: Path) -> Image.Image:
    rgb = img.convert("RGB")
    small = np.asarray(rgb.resize((ISNET_RES, ISNET_RES), Image.BILINEAR), dtype=np.float32)
    tensor = np.transpose((small - ISNET_MEAN) / ISNET_STD, (2, 0, 1))[None].astype(np.float32)

    sess = session(model)
    name = sess.get_inputs()[0].name
    out = sess.run(None, {name: tensor})[0].astype(np.float32)
    alpha = np.squeeze(out)
    if alpha.ndim == 3:  # some exports stack side outputs
        alpha = alpha[0]

    # ISNet's head is unbounded on some exports; squash then min-max stretch,
    # which is what imgly does before using it as an alpha channel.
    if alpha.min() < 0.0 or alpha.max() > 1.0:
        alpha = 1.0 / (1.0 + np.exp(-alpha))
    span = max(float(alpha.max() - alpha.min()), 1e-6)
    alpha = (alpha - alpha.min()) / span

    a_img = Image.fromarray((alpha * 255.0 + 0.5).astype(np.uint8), mode="L").resize(
        rgb.size, Image.BILINEAR
    )
    cut = rgb.copy()
    cut.putalpha(a_img)
    covered = float((np.asarray(a_img, dtype=np.float32) / 255.0 > 0.5).mean())
    print(f"  matte  {rgb.size[0]}x{rgb.size[1]}  subject covers {covered * 100:.1f}% of frame")
    return cut


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("usage: make-demo-assets.py <source-image> <id> <models-dir>")
    src, scene_id, models = Path(sys.argv[1]), sys.argv[2], Path(sys.argv[3])
    root = Path(__file__).resolve().parent.parent
    gallery, demo = root / "public" / "gallery", root / "public" / "demo"
    demo.mkdir(parents=True, exist_ok=True)

    img = Image.open(src)
    print(f"{src.name} → {scene_id}  ({img.size[0]}x{img.size[1]})")

    make_depth(img, models / "depth.onnx").save(demo / f"{scene_id}-depth.png", optimize=True)
    # alpha_quality 100 keeps the cut-out edge crisp — it is the thing that
    # sells the separation — while the colour stays lossy and small.
    make_matte(img, models / "isnet_fp16.onnx").save(
        demo / f"{scene_id}-mask.webp", "WEBP", quality=90, alpha_quality=100, method=6
    )
    if src.resolve() != (gallery / f"{scene_id}.jpg").resolve():
        shutil.copyfile(src, gallery / f"{scene_id}.jpg")

    for p in (gallery / f"{scene_id}.jpg", demo / f"{scene_id}-depth.png", demo / f"{scene_id}-mask.webp"):
        print(f"  wrote {p.relative_to(root)}  {p.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()

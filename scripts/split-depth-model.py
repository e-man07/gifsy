#!/usr/bin/env python3
"""Split the depth model into a client encoder and a server head.

WHY THIS EXISTS
---------------
3D generation runs in the browser, so a "have you got quota left?" call to the
server is advisory — a user can patch it out and keep generating. Splitting the
model removes the choice: the free tier's browser gets the encoder only, which
emits intermediate activations rather than a depth map, so it *cannot* finish
without the server running the head. The metered event becomes work we perform,
not a request we politely receive.

Depth Anything V2 Small is 24.71M params. The DPT head is 2.66M of that (10.7%),
and exactly six tensors cross the encoder/head boundary: four hooked ViT feature
stages plus two int64 scalars carrying the patch grid. That makes the head a
natural, cheap thing to withhold — 5.4MB of weights and ~12-17% of the compute.

OUTPUTS
-------
  depth-encoder.onnx  44.3MB  public  -> uploaded to Blob, cached by every client
  depth-head.onnx      5.4MB  server  -> committed to models/, bundled into the
                                         function; also served to Pro accounts
                                         by /api/models/depth-head so Pro keeps
                                         the fully-local, offline pipeline

USAGE
-----
  uv venv .venv && uv pip install --python .venv/bin/python onnx onnxruntime numpy
  curl -L -o depth.onnx "$MODEL_URL"
  .venv/bin/python scripts/split-depth-model.py depth.onnx ./out

Re-run this whenever the upstream depth model is upgraded; the boundary tensor
names are graph-specific and are verified below rather than assumed.
"""
from __future__ import annotations

import os
import sys

import numpy as np
import onnx
from onnx.utils import extract_model

# The six tensors crossing encoder -> DPT head in onnx-community's
# depth-anything-v2-small fp16 export. Verified (not assumed) by _check_boundary.
CROSS = [
    "/Slice_1_output_0",
    "/Slice_2_output_0",
    "/Slice_3_output_0",
    "/Slice_4_output_0",
    "/Div_output_0",
    "/Div_1_output_0",
]
GRAPH_INPUT = "pixel_values"
GRAPH_OUTPUT = "predicted_depth"


def _check_boundary(src: str) -> None:
    """Fail loudly if CROSS is not exactly the encoder->head cut for this graph.

    A silent mismatch after a model upgrade would ship an encoder that leaks
    more (or less) of the network than intended, so this is a hard gate.
    """
    model = onnx.load(src, load_external_data=False)
    graph = model.graph
    inits = {i.name for i in graph.initializer}
    producer = {out: n for n in graph.node for out in n.output}

    def is_head(node) -> bool:
        return node.name.startswith("/depth_head") or any(
            i.startswith("depth_head") for i in node.input if i in inits
        )

    head_names = {n.name for n in graph.node if is_head(n)}
    crossing: list[str] = []
    for node in graph.node:
        if node.name not in head_names:
            continue
        for i in node.input:
            if not i or i in inits:
                continue
            p = producer.get(i)
            if (p is None or p.name not in head_names) and i not in crossing:
                crossing.append(i)

    if sorted(crossing) != sorted(CROSS):
        raise SystemExit(
            "Boundary mismatch — the graph changed.\n"
            f"  expected: {sorted(CROSS)}\n"
            f"  found   : {sorted(crossing)}\n"
            "Update CROSS (and the tensor names in app/api/depth/head/route.ts\n"
            "and lib/depth.ts) to match."
        )

    params = sum(int(np.prod(i.dims)) if i.dims else 1 for i in graph.initializer)
    head_params = sum(
        int(np.prod(i.dims)) if i.dims else 1
        for i in graph.initializer
        if i.name.startswith("depth_head")
    )
    print(f"  boundary verified: {len(crossing)} tensors")
    print(f"  params {params/1e6:.2f}M total, head {head_params/1e6:.2f}M "
          f"({100*head_params/params:.1f}% withheld from the client)")


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: split-depth-model.py <depth.onnx> <out-dir>")
    src, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)

    print(f"splitting {src}")
    _check_boundary(src)

    encoder = os.path.join(out_dir, "depth-encoder.onnx")
    head = os.path.join(out_dir, "depth-head.onnx")
    extract_model(src, encoder, [GRAPH_INPUT], CROSS)
    extract_model(src, head, CROSS, [GRAPH_OUTPUT])

    for path in (encoder, head):
        print(f"  wrote {path}  {os.path.getsize(path)/1e6:.2f} MB")

    _verify(src, encoder, head)


def _verify(src: str, encoder: str, head: str) -> None:
    """encoder + head must reproduce the original within fp16 rounding."""
    import onnxruntime as ort

    opts = ort.SessionOptions()
    opts.log_severity_level = 3
    full = ort.InferenceSession(src, opts, providers=["CPUExecutionProvider"])
    enc = ort.InferenceSession(encoder, opts, providers=["CPUExecutionProvider"])
    hd = ort.InferenceSession(head, opts, providers=["CPUExecutionProvider"])
    names = [o.name for o in enc.get_outputs()]

    rng = np.random.default_rng(0)
    # Non-square on purpose: the real preprocess pads to multiples of 14, not squares.
    x = rng.standard_normal((1, 3, 518, 770)).astype(np.float32)
    acts = enc.run(names, {GRAPH_INPUT: x})
    got = hd.run([GRAPH_OUTPUT], dict(zip(names, acts)))[0].astype(np.float32)
    ref = full.run([GRAPH_OUTPUT], {GRAPH_INPUT: x})[0].astype(np.float32)

    max_diff = float(np.max(np.abs(ref - got)))
    payload = sum(a.nbytes for a in acts)
    # The depth map is normalised then stored as an 8-bit PNG, so one LSB is
    # 1/255 ≈ 3.9e-3. Anything at or below that is invisible downstream.
    limit = 1.0 / 255
    print(f"  max |full - split| = {max_diff:.3e} (8-bit LSB = {limit:.3e})")
    print(f"  activation payload = {payload/1e6:.2f} MB per generation at 518x770")
    if max_diff > limit:
        raise SystemExit("split output drifts beyond 8-bit depth precision — aborting")
    print("  ✓ split verified")


if __name__ == "__main__":
    main()

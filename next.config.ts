import type { NextConfig } from "next";

// onnxruntime-web is loaded via createRequire at runtime, so Next's file tracer
// can't follow the dependency — every route that runs ONNX needs the package and
// its runtime deps forced into the function bundle.
const ORT_RUNTIME_FILES = [
  "./node_modules/onnxruntime-web/**",
  "./node_modules/onnxruntime-common/**",
  "./node_modules/flatbuffers/**",
  "./node_modules/guid-typescript/**",
  "./node_modules/long/**",
  "./node_modules/platform/**",
  "./node_modules/protobufjs/**",
  "./node_modules/@protobufjs/**",
];

const nextConfig: NextConfig = {
  // Next 16 refuses dev-resource requests (chunks, HMR, fonts) from any origin
  // other than localhost, so opening the dev server via the LAN IP renders the
  // server HTML but never hydrates. Allow private-network hosts so the site
  // can be checked from a phone or another machine on the same network.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.16.*.*"],
  // onnxruntime-web ships its own WASM assets and expects to load them at
  // runtime — keep it external so the server bundler doesn't try to inline it.
  serverExternalPackages: ["onnxruntime-web"],
  // The inpaint route loads onnxruntime-web via createRequire at runtime, so the
  // file tracer can't follow the dependency — force the whole package plus its
  // runtime deps into the function so require("onnxruntime-web") resolves there.
  outputFileTracingIncludes: {
    "/api/inpaint": ORT_RUNTIME_FILES,
    // The depth head runs the same way as inpaint (runtime require of
    // onnxruntime-web), plus it reads its 5.4MB weights off disk — the tracer
    // can't see either, so both are forced in.
    "/api/depth/head": [...ORT_RUNTIME_FILES, "./models/depth-head.onnx"],
    // Serves those same weights to Pro accounts for local execution.
    "/api/models/depth-head": ["./models/depth-head.onnx"],
  },
};

export default nextConfig;

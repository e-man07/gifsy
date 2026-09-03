import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // onnxruntime-web ships its own WASM assets and expects to load them at
  // runtime — keep it external so the server bundler doesn't try to inline it.
  serverExternalPackages: ["onnxruntime-web"],
  // The inpaint route loads onnxruntime-web via createRequire at runtime, so the
  // file tracer can't follow the dependency — force the whole package plus its
  // runtime deps into the function so require("onnxruntime-web") resolves there.
  outputFileTracingIncludes: {
    "/api/inpaint": [
      "./node_modules/onnxruntime-web/**",
      "./node_modules/onnxruntime-common/**",
      "./node_modules/flatbuffers/**",
      "./node_modules/guid-typescript/**",
      "./node_modules/long/**",
      "./node_modules/platform/**",
      "./node_modules/protobufjs/**",
      "./node_modules/@protobufjs/**",
    ],
  },
};

export default nextConfig;

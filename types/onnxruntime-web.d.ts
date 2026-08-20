// onnxruntime-web ships its types in an ambient types.d.ts that isn't
// reachable through the package "exports" map, so redeclare the module here.
declare module "onnxruntime-web" {
  export * from "onnxruntime-common";
}
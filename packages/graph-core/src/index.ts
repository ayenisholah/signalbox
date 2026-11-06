export { checkSchemaChange } from "./check.ts";
export type {
  AttributedChange,
  SchemaChangeFailure,
  SchemaChangeInput,
  SchemaChangeReport,
} from "./check.ts";
export { composeGraph, findFieldOwners } from "./compose.ts";
export { buildGraphMap } from "./graph-map.ts";
export type { GraphMapSuccess } from "./graph-map.ts";
export { analyzeImpact, diffSchemas } from "./impact.ts";
export { splitOperations } from "./operations.ts";
export type * from "./types.ts";

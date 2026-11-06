export { checkSchemaChange } from "./check.ts";
export type {
  AttributedChange,
  SchemaChangeFailure,
  SchemaChangeInput,
  SchemaChangeReport,
} from "./check.ts";
export { composeGraph, findFieldOwners } from "./compose.ts";
export { analyzeImpact, diffSchemas } from "./impact.ts";
export type * from "./types.ts";

import {
  checkSchemaChange,
  collectOperations,
  type OperationInput,
  type SchemaChangeReport,
  type SubgraphInput,
} from "@traverse/graph-core";
import { CONFIG_FILE, parseConfig, type TraverseConfig } from "./config.ts";
import { extractOperations } from "./extract.ts";
import type { ReadFile } from "./source.ts";

export type CheckOutcome =
  | { kind: "report"; report: SchemaChangeReport; skipped: string[] }
  | { kind: "composition"; errors: string[] }
  | { kind: "no-base" }
  | { kind: "invalid"; errors: string[] };

export interface CheckDependencies {
  current: ReadFile;
  proposed: ReadFile;
  listFiles: (patterns: string[]) => string[];
}

type Invalid = Extract<CheckOutcome, { kind: "invalid" }>;

const invalid = (...errors: string[]): Invalid => ({ kind: "invalid", errors });

const loadSubgraphs = (
  { subgraphs }: TraverseConfig,
  read: ReadFile,
  side: string,
): SubgraphInput[] | Invalid => {
  const inputs: SubgraphInput[] = [];
  const errors: string[] = [];
  for (const { name, schema, owner } of subgraphs) {
    const sdl = read(schema);
    if (sdl === undefined) errors.push(`Can't read ${schema} in ${side}.`);
    else inputs.push({ name, sdl, ...(owner !== undefined && { owner }) });
  }
  return errors.length > 0 ? invalid(...errors) : inputs;
};

interface LoadedOperations {
  operations: OperationInput[];
  skipped: string[];
}

const loadOperations = (
  base: TraverseConfig,
  head: TraverseConfig,
  { proposed, listFiles }: CheckDependencies,
): LoadedOperations | Invalid => {
  // The base's patterns count too, or a pull request could narrow the check that judges it.
  const patterns = [...new Set([...base.operations, ...head.operations])];
  const extraction = extractOperations(listFiles(patterns), proposed);
  if (!extraction.success) return invalid(...extraction.errors);

  const { operations, conflicts } = collectOperations(extraction.files);
  if (conflicts.length > 0) {
    return invalid(...conflicts.map((name) => `Fragment ${name} has different definitions.`));
  }
  if (operations.length === 0) return invalid(`No operations matched ${patterns.join(", ")}.`);

  const names = new Set(operations.map(({ name }) => name));
  const unknown = head.screens.flatMap(({ name, operations: used }) =>
    used
      .filter((operation) => !names.has(operation))
      .map((operation) => `Screen ${name} names an unknown operation: ${operation}.`),
  );
  if (unknown.length > 0) return invalid(...unknown);
  return { operations, skipped: extraction.skipped };
};

const isInvalid = (value: object): value is Invalid => "kind" in value;

const compare = (
  baseConfig: TraverseConfig,
  headConfig: TraverseConfig,
  dependencies: CheckDependencies,
): CheckOutcome => {
  const current = loadSubgraphs(baseConfig, dependencies.current, "the base");
  if (isInvalid(current)) return current;
  const proposed = loadSubgraphs(headConfig, dependencies.proposed, "the working tree");
  if (isInvalid(proposed)) return proposed;
  const loaded = loadOperations(baseConfig, headConfig, dependencies);
  if (isInvalid(loaded)) return loaded;

  const result = checkSchemaChange({
    current,
    proposed,
    operations: loaded.operations,
    screens: headConfig.screens,
  });
  if (result.success) return { kind: "report", report: result, skipped: loaded.skipped };
  if (result.failed === "proposed") return { kind: "composition", errors: result.errors };
  return invalid("The current schema doesn't compose.", ...result.errors);
};

export const runCheck = (dependencies: CheckDependencies): CheckOutcome => {
  const headText = dependencies.proposed(CONFIG_FILE);
  if (headText === undefined) return invalid(`No ${CONFIG_FILE} found.`);
  const head = parseConfig(headText);
  if (!head.success) return invalid(...head.errors);

  const baseText = dependencies.current(CONFIG_FILE);
  if (baseText === undefined) return { kind: "no-base" };
  const base = parseConfig(baseText);
  if (!base.success) return invalid(...base.errors);

  return compare(base.config, head.config, dependencies);
};

export const countBroken = ({ operations }: SchemaChangeReport): number =>
  operations.filter(({ errors }) => errors.length > 0).length;

export const exitCode = (outcome: CheckOutcome, strict = false): number => {
  if (outcome.kind === "invalid") return 2;
  if (outcome.kind === "composition") return 1;
  if (outcome.kind === "no-base") return 0;
  if (countBroken(outcome.report) > 0) return 1;
  return strict && outcome.skipped.length > 0 ? 2 : 0;
};

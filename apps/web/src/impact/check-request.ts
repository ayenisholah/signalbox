import {
  checkSchemaChange,
  splitOperations,
  type SchemaChangeFailure,
  type SchemaChangeReport,
  type Screen,
  type SubgraphInput,
} from "@traverse/graph-core";

/** Text stays unparsed here, so parsing runs in the worker and the page never loads graph-core. */
export interface CheckInput {
  current: SubgraphInput[];
  proposed: SubgraphInput[];
  operations: string;
  screens: string;
}

export interface CheckRequest {
  id: number;
  input: CheckInput;
}

export type CheckResponse =
  { id: number; report: SchemaChangeReport | SchemaChangeFailure } | { id: number; crash: string };

export const parseScreens = (source: string): Screen[] =>
  source
    .split("\n")
    .filter((line) => line.includes(":"))
    .map((line) => {
      const [name = "", operations = ""] = line.split(":");
      return {
        name: name.trim(),
        operations: operations.split(",").map((operation) => operation.trim()),
      };
    });

export const runCheck = ({ id, input }: CheckRequest): CheckResponse => {
  try {
    const report = checkSchemaChange({
      current: input.current,
      proposed: input.proposed,
      operations: splitOperations(input.operations),
      screens: parseScreens(input.screens),
    });
    return { id, report };
  } catch (error) {
    return { id, crash: (error as Error).message };
  }
};

import { composeGraph, findFieldOwners } from "./compose.ts";
import { analyzeImpact } from "./impact.ts";
import type {
  ComposedGraph,
  CompositionFailure,
  Impact,
  OperationInput,
  SchemaChange,
  Screen,
  SubgraphInput,
  SubgraphRef,
} from "./types.ts";

export interface SchemaChangeInput {
  current: SubgraphInput[];
  proposed: SubgraphInput[];
  operations: OperationInput[];
  screens?: Screen[];
}

export interface AttributedChange extends SchemaChange {
  subgraphs: SubgraphRef[];
}

export interface SchemaChangeReport extends Omit<Impact, "changes"> {
  success: true;
  changes: AttributedChange[];
}

export interface SchemaChangeFailure extends CompositionFailure {
  failed: "current" | "proposed";
}

const attribute = (
  change: SchemaChange,
  current: ComposedGraph,
  proposed: ComposedGraph,
): AttributedChange => {
  const owners = findFieldOwners(current, change.coordinate);
  const subgraphs = owners.length > 0 ? owners : findFieldOwners(proposed, change.coordinate);
  return { ...change, subgraphs };
};

export const checkSchemaChange = ({
  current,
  proposed,
  operations,
  screens,
}: SchemaChangeInput): SchemaChangeReport | SchemaChangeFailure => {
  const currentGraph = composeGraph(current);
  if (!currentGraph.success) return { ...currentGraph, failed: "current" };
  const proposedGraph = composeGraph(proposed);
  if (!proposedGraph.success) return { ...proposedGraph, failed: "proposed" };

  const impact = analyzeImpact({
    before: currentGraph.sdl,
    after: proposedGraph.sdl,
    operations,
    ...(screens && { screens }),
  });
  return {
    ...impact,
    success: true,
    changes: impact.changes.map((change) => attribute(change, currentGraph, proposedGraph)),
  };
};

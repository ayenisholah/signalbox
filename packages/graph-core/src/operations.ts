import {
  Kind,
  parse,
  print,
  visit,
  type DefinitionNode,
  type DocumentNode,
  type FragmentDefinitionNode,
  type OperationDefinitionNode,
} from "graphql";
import type { OperationInput } from "./types.ts";

const parseSource = (source: string): DocumentNode | undefined => {
  try {
    return parse(source);
  } catch {
    return undefined;
  }
};

const spreadsIn = (node: DefinitionNode): string[] => {
  const names: string[] = [];
  visit(node, { FragmentSpread: (spread) => void names.push(spread.name.value) });
  return names;
};

const reachableFragments = (
  operation: OperationDefinitionNode,
  fragments: Map<string, FragmentDefinitionNode>,
): FragmentDefinitionNode[] => {
  const found = new Map<string, FragmentDefinitionNode>();
  const pending = spreadsIn(operation);
  for (const name of pending) {
    const fragment = fragments.get(name);
    if (fragment && !found.has(name)) {
      found.set(name, fragment);
      pending.push(...spreadsIn(fragment));
    }
  }
  return [...found.values()];
};

/**
 * Splits a document into one entry per operation, each with only the fragments it uses. Text that
 * can't be parsed stays whole, so the impact check can report the syntax error.
 */
export const splitOperations = (source: string): OperationInput[] => {
  if (source.trim() === "") return [];
  const parsed = parseSource(source);
  if (parsed === undefined) return [{ name: "Operations", document: source }];

  const definitions = parsed.definitions;
  const fragments = new Map(
    definitions
      .filter((node) => node.kind === Kind.FRAGMENT_DEFINITION)
      .map((node) => [node.name.value, node]),
  );
  return definitions
    .filter((node) => node.kind === Kind.OPERATION_DEFINITION)
    .map((operation, index) => ({
      name: operation.name?.value ?? `Operation ${index + 1}`,
      document: print({
        kind: Kind.DOCUMENT,
        definitions: [operation, ...reachableFragments(operation, fragments)],
      }),
    }));
};

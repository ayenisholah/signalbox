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
import type { CollectedOperations, OperationFile, OperationInput } from "./types.ts";

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

const printOperation = (
  operation: OperationDefinitionNode,
  fragments: Map<string, FragmentDefinitionNode>,
): string =>
  print({
    kind: Kind.DOCUMENT,
    definitions: [operation, ...reachableFragments(operation, fragments)],
  });

const fragmentsIn = (document: DocumentNode): FragmentDefinitionNode[] =>
  document.definitions.filter((node) => node.kind === Kind.FRAGMENT_DEFINITION);

const operationsIn = (document: DocumentNode): OperationDefinitionNode[] =>
  document.definitions.filter((node) => node.kind === Kind.OPERATION_DEFINITION);

/**
 * Splits a document into one entry per operation, each with only the fragments it uses. Text that
 * can't be parsed stays whole, so the impact check can report the syntax error.
 */
export const splitOperations = (source: string): OperationInput[] => {
  if (source.trim() === "") return [];
  const parsed = parseSource(source);
  if (parsed === undefined) return [{ name: "Operations", document: source }];

  const fragments = new Map(fragmentsIn(parsed).map((node) => [node.name.value, node]));
  return operationsIn(parsed).map((operation, index) => ({
    name: operation.name?.value ?? `Operation ${index + 1}`,
    document: printOperation(operation, fragments),
  }));
};

const anonymousNamer = (): ((path: string) => string) => {
  const counts = new Map<string, number>();
  return (path) => {
    const count = (counts.get(path) ?? 0) + 1;
    counts.set(path, count);
    return count === 1 ? path : `${path}#${count}`;
  };
};

const findConflicts = (fragments: FragmentDefinitionNode[]): string[] => {
  const printed = new Map<string, string>();
  const conflicts = new Set<string>();
  for (const fragment of fragments) {
    const name = fragment.name.value;
    const text = print(fragment);
    if ((printed.get(name) ?? text) !== text) conflicts.add(name);
    printed.set(name, text);
  }
  return [...conflicts];
};

/**
 * Splits many files at once. Repositories keep fragments apart from the operations that spread
 * them, so fragments resolve across every file. That needs fragment names to be unique: if two
 * differ, the wrong one could replace the real selection and hide a break, so they're reported.
 * Names of anonymous operations come from their file, because a number would change whenever
 * another file is added.
 */
export const collectOperations = (files: OperationFile[]): CollectedOperations => {
  const parsed = files
    .filter(({ source }) => source.trim() !== "")
    .map((file) => ({ ...file, document: parseSource(file.source) }));
  const allFragments = parsed.flatMap(({ document }) => (document ? fragmentsIn(document) : []));
  const fragments = new Map(allFragments.map((node) => [node.name.value, node]));
  const nameAnonymous = anonymousNamer();

  return {
    conflicts: findConflicts(allFragments),
    operations: parsed.flatMap(({ path, source, document }) =>
      document
        ? operationsIn(document).map((operation) => ({
            name: operation.name?.value ?? nameAnonymous(path),
            document: printOperation(operation, fragments),
          }))
        : [{ name: path, document: source }],
    ),
  };
};

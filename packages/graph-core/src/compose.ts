import {
  federateSubgraphs,
  ROUTER_COMPATIBILITY_VERSION_ONE,
  type FederationSuccess,
  type ParentDefinitionData,
} from "@wundergraph/composition";
import {
  type GraphQLError,
  Kind,
  parse,
  print,
  type DocumentNode,
  type GraphQLSchema,
} from "graphql";
import type { ComposedGraph, CompositionResult, SubgraphInput, SubgraphRef } from "./types.ts";

interface ChildData {
  name: string;
  subgraphNames: Set<string>;
  externalFieldDataBySubgraphName?: Map<string, { isDefinedExternal: boolean }>;
}

const parseSdl = ({ name, sdl }: SubgraphInput): DocumentNode | string => {
  try {
    return parse(sdl);
  } catch (error) {
    return `${name}: ${(error as GraphQLError).message}`;
  }
};

/**
 * Bundlers can load one copy of graphql here and another inside composition, and graphql rejects
 * schema objects from a different copy. AST nodes are plain objects, so printing from them is safe.
 */
const printClientSchema = (schema: GraphQLSchema): string => {
  const nodes = [
    ...schema.getDirectives().map(({ astNode }) => astNode),
    ...Object.values(schema.getTypeMap()).map(({ astNode }) => astNode),
  ];
  const definitions = nodes.filter((node): node is NonNullable<typeof node> => Boolean(node));
  return print({ kind: Kind.DOCUMENT, definitions: definitions });
};

const childrenOf = (parent: ParentDefinitionData): ChildData[] => {
  if ("fieldDataByName" in parent) return [...parent.fieldDataByName.values()];
  if ("inputValueDataByName" in parent) return [...parent.inputValueDataByName.values()];
  return [];
};

const resolvingSubgraphs = (child: ChildData): string[] =>
  [...child.subgraphNames]
    .filter((name) => !child.externalFieldDataBySubgraphName?.get(name)?.isDefinedExternal)
    .sort();

const indexFields = (
  { parentDefinitionDataByTypeName }: FederationSuccess,
  refs: Map<string, SubgraphRef>,
): ComposedGraph["fields"] => {
  const fields: ComposedGraph["fields"] = new Map();
  for (const [typeName, parent] of parentDefinitionDataByTypeName) {
    for (const child of childrenOf(parent)) {
      const subgraphs = resolvingSubgraphs(child).map((name) => refs.get(name) as SubgraphRef);
      fields.set(`${typeName}.${child.name}`, subgraphs);
    }
  }
  return fields;
};

const indexTypes = (
  { parentDefinitionDataByTypeName }: FederationSuccess,
  refs: Map<string, SubgraphRef>,
): ComposedGraph["types"] => {
  const types: ComposedGraph["types"] = new Map();
  for (const [typeName, parent] of parentDefinitionDataByTypeName) {
    types.set(typeName, {
      isEntity: "isEntity" in parent && parent.isEntity,
      subgraphs: [...parent.subgraphNames].sort().map((name) => refs.get(name) as SubgraphRef),
    });
  }
  return types;
};

const toRef = ({ name, owner }: SubgraphInput): [string, SubgraphRef] => [
  name,
  owner === undefined ? { name } : { name, owner },
];

export const composeGraph = (inputs: SubgraphInput[]): CompositionResult => {
  const parsed = inputs.map(parseSdl);
  const syntaxErrors = parsed.filter((result) => typeof result === "string");
  if (syntaxErrors.length > 0) return { success: false, errors: syntaxErrors };

  const subgraphs = inputs.map(({ name }, index) => ({
    name,
    url: "",
    definitions: parsed[index] as DocumentNode,
  }));
  const result = federateSubgraphs({ subgraphs, version: ROUTER_COMPATIBILITY_VERSION_ONE });
  if (!result.success) {
    return { success: false, errors: result.errors.map(({ message }) => message) };
  }

  const refs = new Map(inputs.map(toRef));
  return {
    success: true,
    sdl: printClientSchema(result.federatedGraphClientSchema),
    fields: indexFields(result, refs),
    types: indexTypes(result, refs),
    warnings: result.warnings.map(({ message }) => message),
  };
};

export const findFieldOwners = (graph: ComposedGraph, coordinate: string): SubgraphRef[] =>
  graph.fields.get(coordinate) ?? [];

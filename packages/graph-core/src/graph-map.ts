import {
  buildSchema,
  getNamedType,
  isEnumType,
  isInputObjectType,
  isInterfaceType,
  isObjectType,
  isSpecifiedScalarType,
  isUnionType,
  type GraphQLField,
  type GraphQLInputField,
  type GraphQLNamedType,
} from "graphql";
import { composeGraph } from "./compose.ts";
import type {
  ComposedGraph,
  CompositionFailure,
  GraphMap,
  MapField,
  MapSubgraph,
  MapType,
  SubgraphInput,
  SubgraphRef,
  TypeData,
  TypeKind,
} from "./types.ts";

export interface GraphMapSuccess {
  success: true;
  map: GraphMap;
}

const kindOf = (type: GraphQLNamedType): TypeKind => {
  if (isObjectType(type)) return "object";
  if (isInterfaceType(type)) return "interface";
  if (isInputObjectType(type)) return "input";
  if (isEnumType(type)) return "enum";
  return isUnionType(type) ? "union" : "scalar";
};

const membersOf = (type: GraphQLNamedType): string[] => {
  if (isEnumType(type)) return type.getValues().map(({ name }) => name);
  return isUnionType(type) ? type.getTypes().map(({ name }) => name) : [];
};

const fieldsOf = (type: GraphQLNamedType, graph: ComposedGraph): MapField[] => {
  if (!isObjectType(type) && !isInterfaceType(type) && !isInputObjectType(type)) return [];
  return Object.values<GraphQLField<unknown, unknown> | GraphQLInputField>(type.getFields()).map(
    (field) => ({
      name: field.name,
      type: String(field.type),
      namedType: getNamedType(field.type).name,
      subgraphs: graph.fields.get(`${type.name}.${field.name}`) as SubgraphRef[],
    }),
  );
};

const toMapType = (type: GraphQLNamedType, graph: ComposedGraph): MapType => ({
  ...(graph.types.get(type.name) as TypeData),
  name: type.name,
  kind: kindOf(type),
  fields: fieldsOf(type, graph),
  members: membersOf(type).sort(),
});

const isShown = (type: GraphQLNamedType): boolean =>
  !type.name.startsWith("__") && !isSpecifiedScalarType(type);

const toMapSubgraph = (input: SubgraphInput, types: MapType[]): MapSubgraph => {
  const includes = ({ subgraphs }: { subgraphs: { name: string }[] }) =>
    subgraphs.some(({ name }) => name === input.name);
  return {
    name: input.name,
    ...(input.owner !== undefined && { owner: input.owner }),
    entities: types.filter((type) => type.isEntity && includes(type)).map(({ name }) => name),
    fieldCount: types.flatMap(({ fields }) => fields).filter(includes).length,
  };
};

const byName = (a: { name: string }, b: { name: string }): number => a.name.localeCompare(b.name);

export const buildGraphMap = (inputs: SubgraphInput[]): GraphMapSuccess | CompositionFailure => {
  const graph = composeGraph(inputs);
  if (!graph.success) return graph;

  const types = Object.values(buildSchema(graph.sdl).getTypeMap())
    .filter(isShown)
    .map((type) => toMapType(type, graph))
    .sort(byName);
  const subgraphs = inputs.map((input) => toMapSubgraph(input, types)).sort(byName);
  return { success: true, map: { subgraphs, types } };
};

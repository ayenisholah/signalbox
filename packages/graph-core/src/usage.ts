import {
  getNamedType,
  isAbstractType,
  isInputObjectType,
  TypeInfo,
  visit,
  visitWithTypeInfo,
  type DocumentNode,
  type GraphQLCompositeType,
  type GraphQLInputType,
  type GraphQLSchema,
} from "graphql";

const addField = (
  schema: GraphQLSchema,
  parent: GraphQLCompositeType,
  field: string,
  used: Set<string>,
): void => {
  if (field.startsWith("__")) return;
  const types = isAbstractType(parent) ? [parent, ...schema.getPossibleTypes(parent)] : [parent];
  for (const { name } of types) used.add(`${name}.${field}`);
};

const addInput = (type: GraphQLInputType, used: Set<string>): void => {
  const named = getNamedType(type);
  if (!isInputObjectType(named)) return;
  for (const field of Object.values(named.getFields())) {
    const coordinate = `${named.name}.${field.name}`;
    if (used.has(coordinate)) continue;
    used.add(coordinate);
    addInput(field.type, used);
  }
};

/**
 * Lists the field coordinates a document uses. A variable's value can't be seen, so every field of
 * its input type counts as in use. An inline value counts only the fields it sets.
 */
export const collectUsage = (schema: GraphQLSchema, document: DocumentNode): Set<string> => {
  const used = new Set<string>();
  const typeInfo = new TypeInfo(schema);
  visit(
    document,
    visitWithTypeInfo(typeInfo, {
      Field(node) {
        const parent = typeInfo.getParentType();
        if (parent) addField(schema, parent, node.name.value, used);
      },
      ObjectField(node) {
        const parent = getNamedType(typeInfo.getParentInputType());
        if (isInputObjectType(parent)) used.add(`${parent.name}.${node.name.value}`);
      },
      VariableDefinition() {
        const type = typeInfo.getInputType();
        if (type) addInput(type, used);
      },
    }),
  );
  return used;
};

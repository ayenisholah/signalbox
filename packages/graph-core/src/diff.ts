import {
  isInputObjectType,
  isInterfaceType,
  isObjectType,
  isRequiredInputField,
  type GraphQLField,
  type GraphQLInputField,
  type GraphQLSchema,
} from "graphql";
import type { ChangeKind, SchemaChange } from "./types.ts";

type Field = GraphQLField<unknown, unknown> | GraphQLInputField;

const hasArgs = (field: Field): field is GraphQLField<unknown, unknown> => "args" in field;

const collectFields = (schema: GraphQLSchema): Map<string, Field> => {
  const fields = new Map<string, Field>();
  for (const type of Object.values(schema.getTypeMap())) {
    if (type.name.startsWith("__")) continue;
    if (isObjectType(type) || isInterfaceType(type) || isInputObjectType(type)) {
      const typeFields = Object.values<Field>(type.getFields());
      for (const field of typeFields) fields.set(`${type.name}.${field.name}`, field);
    }
  }
  return fields;
};

const signatureOfArgs = (field: Field): string =>
  hasArgs(field)
    ? field.args
        .map(({ name, type, defaultValue }) => `${name}:${String(type)}=${String(defaultValue)}`)
        .sort()
        .join()
    : "";

const compareField = (before: Field, after: Field | undefined): ChangeKind | undefined => {
  if (after === undefined) return "removed";
  if (String(before.type) !== String(after.type)) return "type-changed";
  if (signatureOfArgs(before) !== signatureOfArgs(after)) return "arguments-changed";
  return undefined;
};

const isNewRequiredInput = (field: Field): boolean =>
  !hasArgs(field) && isRequiredInputField(field);

export const diffFields = (before: GraphQLSchema, after: GraphQLSchema): SchemaChange[] => {
  const old = collectFields(before);
  const current = collectFields(after);
  const changes: SchemaChange[] = [];

  for (const [coordinate, field] of old) {
    const kind = compareField(field, current.get(coordinate));
    if (kind !== undefined) changes.push({ coordinate, kind });
  }
  for (const [coordinate, field] of current) {
    if (!old.has(coordinate) && isNewRequiredInput(field)) {
      changes.push({ coordinate, kind: "required-input-added" });
    }
  }
  return changes.sort((a, b) => a.coordinate.localeCompare(b.coordinate));
};

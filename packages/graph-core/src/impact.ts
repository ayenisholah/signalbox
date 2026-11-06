import {
  buildSchema,
  type GraphQLError,
  parse,
  validate,
  type DocumentNode,
  type GraphQLSchema,
} from "graphql";
import { diffFields } from "./diff.ts";
import type {
  AffectedOperation,
  Impact,
  ImpactInput,
  OperationInput,
  SchemaChange,
  Screen,
} from "./types.ts";
import { collectUsage } from "./usage.ts";

export const diffSchemas = (before: string, after: string): SchemaChange[] =>
  diffFields(buildSchema(before), buildSchema(after));

const parseOperation = (document: string): DocumentNode | string => {
  try {
    return parse(document);
  } catch (error) {
    return (error as GraphQLError).message;
  }
};

const messages = (schema: GraphQLSchema, document: DocumentNode): string[] => [
  ...new Set(validate(schema, document).map(({ message }) => message)),
];

const analyzeOperation = (
  { name, document }: OperationInput,
  before: GraphQLSchema,
  after: GraphQLSchema,
  changes: SchemaChange[],
): AffectedOperation => {
  const parsed = parseOperation(document);
  if (typeof parsed === "string") return { name, fields: [], errors: [parsed] };

  // A new required input field exists only in the new schema, so usage has to cover both.
  const used = new Set([...collectUsage(before, parsed), ...collectUsage(after, parsed)]);
  const known = new Set(messages(before, parsed));
  return {
    name,
    fields: changes.map(({ coordinate }) => coordinate).filter((field) => used.has(field)),
    errors: messages(after, parsed).filter((message) => !known.has(message)),
  };
};

const narrowScreen = ({ name, operations }: Screen, affected: Set<string>): Screen => ({
  name,
  operations: operations.filter((operation) => affected.has(operation)),
});

export const analyzeImpact = ({ before, after, operations, screens = [] }: ImpactInput): Impact => {
  const oldSchema = buildSchema(before);
  const newSchema = buildSchema(after);
  const changes = diffFields(oldSchema, newSchema);

  const affected = operations
    .map((operation) => analyzeOperation(operation, oldSchema, newSchema, changes))
    .filter(({ fields, errors }) => fields.length > 0 || errors.length > 0);
  const names = new Set(affected.map(({ name }) => name));

  return {
    changes,
    operations: affected,
    screens: screens
      .map((screen) => narrowScreen(screen, names))
      .filter((screen) => screen.operations.length > 0),
  };
};

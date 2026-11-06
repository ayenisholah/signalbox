import { describe, expect, it } from "vitest";
import { analyzeImpact, diffSchemas } from "../src/index.ts";

const before = /* GraphQL */ `
  interface Node {
    id: ID!
  }
  type Package implements Node {
    id: ID!
    name: String!
    license: String
    advisories(version: String): [String!]!
  }
  type Other implements Node {
    id: ID!
    label: String
  }
  input Filter {
    prefix: String
    limit: Int
  }
  type Query {
    package(name: String!): Package
    node: Node
    search(filter: Filter): [Package!]!
  }
`;

const replace = (from: string, to: string): string => {
  expect(before).toContain(from);
  return before.replace(from, to);
};

const license = { name: "License", document: 'query { package(name: "a") { license } }' };
const name = { name: "Name", document: 'query { package(name: "a") { name } }' };

describe("diffSchemas", () => {
  it("[FR-WB-3] reports a removed field", () => {
    expect(diffSchemas(before, replace("license: String\n", "\n"))).toEqual([
      { coordinate: "Package.license", kind: "removed" },
    ]);
  });

  it("[FR-WB-3] reports a changed field type", () => {
    expect(diffSchemas(before, replace("license: String", "license: Int"))).toEqual([
      { coordinate: "Package.license", kind: "type-changed" },
    ]);
  });

  it("[FR-WB-3] reports changed arguments", () => {
    const after = replace("advisories(version: String)", "advisories(version: Int)");

    expect(diffSchemas(before, after)).toEqual([
      { coordinate: "Package.advisories", kind: "arguments-changed" },
    ]);
  });

  it("[FR-WB-3] reports every field of a removed type", () => {
    const after = replace("type Other implements Node {\n    id: ID!\n    label: String\n  }", "");

    expect(diffSchemas(before, after)).toEqual([
      { coordinate: "Other.id", kind: "removed" },
      { coordinate: "Other.label", kind: "removed" },
    ]);
  });

  it("[FR-WB-3] reports a changed input field", () => {
    expect(diffSchemas(before, replace("limit: Int", "limit: String"))).toEqual([
      { coordinate: "Filter.limit", kind: "type-changed" },
    ]);
  });

  it("[FR-WB-3] reports a new required input field", () => {
    expect(diffSchemas(before, replace("limit: Int", "limit: Int\n    tag: String!"))).toEqual([
      { coordinate: "Filter.tag", kind: "required-input-added" },
    ]);
  });

  it("[FR-WB-3] ignores additions that can't break a client", () => {
    const after = replace("limit: Int", "limit: Int\n    tag: String").replace(
      "license: String",
      "license: String\n    stars: Int",
    );

    expect(diffSchemas(before, after)).toEqual([]);
  });

  it("[FR-WB-3] ignores descriptions", () => {
    expect(diffSchemas(before, replace("license: String", '"SPDX" license: String'))).toEqual([]);
  });
});

describe("analyzeImpact", () => {
  it("[FR-WB-3] lists the operations using a changed field, and no others", () => {
    const after = replace("license: String", "license: Int");

    const { operations } = analyzeImpact({ before, after, operations: [license, name] });

    expect(operations).toEqual([{ name: "License", fields: ["Package.license"], errors: [] }]);
  });

  it("[FR-WB-3] lists the screens using an affected operation, and no others", () => {
    const after = replace("license: String\n", "\n");

    const { screens } = analyzeImpact({
      before,
      after,
      operations: [license, name],
      screens: [
        { name: "Licences", operations: ["License", "Name"] },
        { name: "Search", operations: ["Name"] },
      ],
    });

    expect(screens).toEqual([{ name: "Licences", operations: ["License"] }]);
  });

  it("[FR-WB-3] reports why an operation breaks", () => {
    const after = replace("license: String\n", "\n");

    const { operations } = analyzeImpact({ before, after, operations: [license] });

    expect(operations[0]?.errors).toEqual([
      expect.stringContaining('Cannot query field "license"'),
    ]);
  });

  it("[FR-WB-3] finds fields used through a fragment", () => {
    const document = /* GraphQL */ `
      query {
        package(name: "a") {
          ...Licence
        }
      }
      fragment Licence on Package {
        license
      }
    `;
    const after = replace("license: String", "license: Int");

    const { operations } = analyzeImpact({
      before,
      after,
      operations: [{ name: "Fragment", document }],
    });

    expect(operations).toMatchObject([{ fields: ["Package.license"] }]);
  });

  it("[FR-WB-3] treats a field on an interface as used on each implementing type", () => {
    const after = replace(
      "type Other implements Node {\n    id: ID!",
      "type Other implements Node {\n    id: ID",
    );
    const document = "query { node { id } }";

    const { changes, operations } = analyzeImpact({
      before,
      after: after.replace("interface Node {\n    id: ID!", "interface Node {\n    id: ID"),
      operations: [{ name: "Node", document }],
    });

    expect(changes.map(({ coordinate }) => coordinate)).toContain("Other.id");
    expect(operations[0]?.fields).toContain("Other.id");
  });

  it("[FR-WB-3] finds input fields passed through a variable", () => {
    const document = "query ($filter: Filter) { search(filter: $filter) { name } }";
    const after = replace("limit: Int", "limit: Int\n    tag: String!");

    const { operations } = analyzeImpact({
      before,
      after,
      operations: [{ name: "Search", document }],
    });

    expect(operations).toEqual([{ name: "Search", fields: ["Filter.tag"], errors: [] }]);
  });

  it("[FR-WB-3] counts only the input fields an inline value sets", () => {
    const inline = (name: string, field: string) => ({
      name,
      document: `query { search(filter: { ${field} }) { name } }`,
    });
    const after = replace("limit: Int", "limit: String");

    const { operations } = analyzeImpact({
      before,
      after,
      operations: [inline("Prefix", 'prefix: "a"'), inline("Limit", 'limit: "1"')],
    });

    expect(operations.map(({ name }) => name)).toEqual(["Limit"]);
  });

  it("[FR-WB-3] reports an inline value missing a new required input field", () => {
    const document = 'query { search(filter: { prefix: "a" }) { name } }';
    const after = replace("limit: Int", "limit: Int\n    tag: String!");

    const { operations } = analyzeImpact({
      before,
      after,
      operations: [{ name: "Inline", document }],
    });

    expect(operations).toEqual([
      { name: "Inline", fields: [], errors: [expect.stringContaining("Filter.tag")] },
    ]);
  });

  it("[FR-WB-3] doesn't count __typename as a field in use", () => {
    const document = 'query { package(name: "a") { __typename } }';
    const after = replace("license: String", "license: Int");

    const { operations } = analyzeImpact({
      before,
      after,
      operations: [{ name: "Typename", document }],
    });

    expect(operations).toEqual([]);
  });

  it("[FR-WB-3] reports only new errors, not ones the operation already had", () => {
    const document = "query { missing }";
    const after = replace("license: String", "license: Int");

    const { operations } = analyzeImpact({
      before,
      after,
      operations: [{ name: "AlreadyBroken", document }],
    });

    expect(operations).toEqual([]);
  });

  it("[FR-WB-3] survives a fragment on an unknown type", () => {
    const document = "fragment F on Missing { id } query { node { ...F } }";

    const { operations } = analyzeImpact({
      before,
      after: before,
      operations: [{ name: "Unknown", document }],
    });

    expect(operations).toEqual([]);
  });

  it("[FR-WB-3] survives an argument the schema doesn't have", () => {
    const document = 'query { package(name: "a", missing: 1) { name } }';

    const { operations } = analyzeImpact({
      before,
      after: before,
      operations: [{ name: "Unknown", document }],
    });

    expect(operations).toEqual([]);
  });

  it("[FR-WB-3] follows an input type that refers to itself", () => {
    const schema = (leaf: string) => /* GraphQL */ `
      input Tree {
        leaf: ${leaf}
        children: [Tree!]
      }
      type Query {
        find(tree: Tree): Int
      }
    `;
    const document = "query ($tree: Tree) { find(tree: $tree) }";

    const { operations } = analyzeImpact({
      before: schema("Int"),
      after: schema("String"),
      operations: [{ name: "Find", document }],
    });

    expect(operations).toEqual([{ name: "Find", fields: ["Tree.leaf"], errors: [] }]);
  });

  it("[FR-WB-3] survives a variable of an unknown type", () => {
    const document = "query ($x: Missing) { node { id } }";

    const { operations } = analyzeImpact({
      before,
      after: before,
      operations: [{ name: "Unknown", document }],
    });

    expect(operations).toEqual([]);
  });

  it("[FR-WB-3] survives an object passed to a scalar argument", () => {
    const document = "query { package(name: { a: 1 }) { name } }";

    const { operations } = analyzeImpact({
      before,
      after: before,
      operations: [{ name: "Unknown", document }],
    });

    expect(operations).toEqual([]);
  });

  it("[FR-WB-3] reports an operation that can't be parsed", () => {
    const { operations } = analyzeImpact({
      before,
      after: before,
      operations: [{ name: "Syntax", document: "query {" }],
    });

    expect(operations).toEqual([
      { name: "Syntax", fields: [], errors: [expect.stringContaining("Syntax Error")] },
    ]);
  });

  it("[FR-WB-3] reports nothing when the schema doesn't change", () => {
    expect(analyzeImpact({ before, after: before, operations: [license] })).toEqual({
      changes: [],
      operations: [],
      screens: [],
    });
  });
});

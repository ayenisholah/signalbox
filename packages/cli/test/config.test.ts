import { describe, expect, it } from "vitest";
import { parseConfig } from "../src/config.ts";

const valid = {
  subgraphs: [{ name: "employees", schema: "graph/employees.graphqls", owner: "people-team" }],
  operations: ["src/**/*.graphql"],
  screens: [{ name: "Checkout", operations: ["GetCart"] }],
};

describe("parseConfig", () => {
  it("[FR-WB-5] reads subgraphs, owners, operations and screens", () => {
    expect(parseConfig(JSON.stringify(valid))).toEqual({ success: true, config: valid });
  });

  it("[FR-WB-5] treats screens and owners as optional", () => {
    const { subgraphs, operations } = valid;
    const text = JSON.stringify({
      operations,
      subgraphs: subgraphs.map(({ name, schema }) => ({ name, schema })),
    });

    expect(parseConfig(text)).toMatchObject({ success: true, config: { screens: [] } });
  });

  it("[FR-WB-5] reports text that isn't JSON", () => {
    expect(parseConfig("{")).toMatchObject({
      success: false,
      errors: [expect.stringContaining("isn't valid JSON")],
    });
  });

  it("[FR-WB-5] names the field that's wrong", () => {
    expect(parseConfig(JSON.stringify({ ...valid, operations: [] }))).toMatchObject({
      success: false,
      errors: [expect.stringContaining("operations")],
    });
  });

  it("[FR-WB-5] rejects unknown keys, so a typo can't silently do nothing", () => {
    expect(parseConfig(JSON.stringify({ ...valid, screen: [] })).success).toBe(false);
  });

  it.each([
    "/etc/passwd.graphql",
    "../secret.graphql",
    "src/../../secret.graphql",
    ".git/config.graphql",
  ])("[FR-WB-5] refuses the path %s, which leaves the repository", (path) => {
    expect(parseConfig(JSON.stringify({ ...valid, operations: [path] })).success).toBe(false);
    const subgraphs = [{ name: "a", schema: path }];
    expect(parseConfig(JSON.stringify({ ...valid, subgraphs })).success).toBe(false);
  });

  it.each(["{..,src}/*", "{/etc,src}/host*", "src/{a,/etc}/*", "@(..|src)/*"])(
    "[FR-WB-5] refuses the pattern %s, which expands out of the repository",
    (pattern) => {
      expect(parseConfig(JSON.stringify({ ...valid, operations: [pattern] })).success).toBe(false);
    },
  );

  it.each(["creds.txt", ".env", "schema.graphql.bak"])(
    "[FR-WB-5] refuses %s as a schema, because a parse error would quote it in public",
    (schema) => {
      const subgraphs = [{ name: "a", schema }];
      expect(parseConfig(JSON.stringify({ ...valid, subgraphs })).success).toBe(false);
    },
  );

  it.each(["a.graphql", "a.graphqls", "a.gql"])("[FR-WB-5] accepts %s as a schema", (schema) => {
    const subgraphs = [{ name: "a", schema }];
    expect(parseConfig(JSON.stringify({ ...valid, subgraphs })).success).toBe(true);
  });
});

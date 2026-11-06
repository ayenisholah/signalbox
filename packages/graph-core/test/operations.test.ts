import { describe, expect, it } from "vitest";
import { collectOperations, splitOperations } from "../src/index.ts";

describe("splitOperations", () => {
  it("[FR-WB-5] splits a document into named operations", () => {
    const operations = splitOperations("query A { a } mutation B { b }");

    expect(operations.map(({ name }) => name)).toEqual(["A", "B"]);
    expect(operations[0]?.document).toContain("query A");
    expect(operations[0]?.document).not.toContain("mutation B");
  });

  it("[FR-WB-5] numbers operations that have no name", () => {
    expect(splitOperations("{ a } { b }").map(({ name }) => name)).toEqual([
      "Operation 1",
      "Operation 2",
    ]);
  });

  it("[FR-WB-5] gives each operation only the fragments it reaches", () => {
    const [first, second] = splitOperations(/* GraphQL */ `
      query A {
        ...Outer
      }
      query B {
        b
      }
      fragment Outer on Query {
        ...Inner
      }
      fragment Inner on Query {
        a
      }
      fragment Unused on Query {
        c
      }
    `);

    expect(first?.document).toContain("fragment Outer");
    expect(first?.document).toContain("fragment Inner");
    expect(first?.document).not.toContain("fragment Unused");
    expect(second?.document).not.toContain("fragment");
  });

  it("[FR-WB-5] follows a fragment cycle without hanging", () => {
    const [operation] = splitOperations(/* GraphQL */ `
      query A {
        ...One
      }
      fragment One on Query {
        ...Two
      }
      fragment Two on Query {
        ...One
      }
    `);

    expect(operation?.document).toContain("fragment Two");
  });

  it("[FR-WB-5] ignores a spread of a fragment that doesn't exist", () => {
    const [operation] = splitOperations("query A { ...Missing }");

    expect(operation?.document).toContain("...Missing");
  });

  it("[FR-WB-5] keeps text that can't be parsed, so the check can report it", () => {
    expect(splitOperations("query {")).toEqual([{ name: "Operations", document: "query {" }]);
  });

  it("[FR-WB-5] returns nothing for blank text", () => {
    expect(splitOperations("  \n")).toEqual([]);
  });
});

describe("collectOperations", () => {
  it("[FR-WB-5] resolves a fragment defined in another file", () => {
    const { operations, conflicts } = collectOperations([
      { path: "a.graphql", source: "query A { ...F }" },
      { path: "b.graphql", source: "fragment F on Query { a }" },
    ]);

    expect(conflicts).toEqual([]);
    expect(operations).toHaveLength(1);
    expect(operations[0]?.name).toBe("A");
    expect(operations[0]?.document).toContain("fragment F on Query");
  });

  it("[FR-WB-5] names anonymous operations by file, numbering any after the first", () => {
    const { operations } = collectOperations([
      { path: "a.graphql", source: "{ a } { b }" },
      { path: "a.graphql", source: "{ c }" },
      { path: "b.graphql", source: "{ d }" },
    ]);

    expect(operations.map(({ name }) => name)).toEqual([
      "a.graphql",
      "a.graphql#2",
      "a.graphql#3",
      "b.graphql",
    ]);
  });

  it("[FR-WB-5] keeps a file it can't parse whole, without hiding the others", () => {
    const { operations } = collectOperations([
      { path: "bad.graphql", source: "query {" },
      { path: "good.graphql", source: "query A { a }" },
    ]);

    expect(operations.map(({ name }) => name)).toEqual(["bad.graphql", "A"]);
    expect(operations[0]?.document).toBe("query {");
  });

  it("[FR-WB-5] ignores empty files", () => {
    expect(collectOperations([{ path: "empty.graphql", source: "  " }]).operations).toEqual([]);
  });

  it("[FR-WB-5] reports fragments that share a name but differ, which could hide a break", () => {
    const { conflicts } = collectOperations([
      { path: "a.graphql", source: "fragment F on Query { b }" },
      { path: "z.graphql", source: "fragment F on Query { a }" },
    ]);

    expect(conflicts).toEqual(["F"]);
  });

  it("[FR-WB-5] accepts the same fragment defined twice", () => {
    const source = "fragment F on Query { a }";
    const { conflicts } = collectOperations([
      { path: "a.graphql", source },
      { path: "b.graphql", source },
    ]);

    expect(conflicts).toEqual([]);
  });
});

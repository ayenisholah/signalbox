import { describe, expect, it } from "vitest";
import { splitOperations } from "../src/index.ts";

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

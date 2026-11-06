import type { GraphMap, MapType } from "@traverse/graph-core";
import { describe, expect, it } from "vitest";
import demoGraph from "../src/generated/demo-graph.json";
import { searchTypes } from "../src/graph-map/search.ts";

const { types } = demoGraph as GraphMap;
const namesFor = (query: string, subgraph: string | null = null) =>
  searchTypes(types, query, subgraph).map(({ name }) => name);

const type = (name: string, fields: string[] = []): MapType => ({
  name,
  kind: "object",
  isEntity: false,
  subgraphs: [],
  members: [],
  fields: fields.map((field) => ({ name: field, type: "", namedType: "", subgraphs: [] })),
});

describe("searchTypes", () => {
  it("[FR-WB-1] returns every type for an empty query", () => {
    expect(namesFor("")).toHaveLength(types.length);
  });

  it("[FR-WB-1] ignores case and surrounding space", () => {
    expect(namesFor("  EMPLOYEE ")[0]).toBe("Employee");
  });

  it("[FR-WB-1] ranks an exact name, then a prefix, a part of a name and a field", () => {
    const candidates = [
      type("HasCat", []),
      type("Other", ["cat"]),
      type("CatFood"),
      type("Cat"),
      type("Dog"),
    ];

    expect(searchTypes(candidates, "cat", null).map(({ name }) => name)).toEqual([
      "Cat",
      "CatFood",
      "HasCat",
      "Other",
    ]);
  });

  it("[FR-WB-1] limits results to one subgraph", () => {
    const names = namesFor("", "mood");

    expect(names).toContain("Mood");
    expect(names).not.toContain("Hobby");
  });

  it("[FR-WB-1] returns nothing when nothing matches", () => {
    expect(namesFor("zzzz")).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { checkSchemaChange, composeGraph, findFieldOwners } from "../src/index.ts";
import { loadCosmoDemo } from "./fixtures/cosmo-demo.ts";

const demo = loadCosmoDemo();

const edit = (name: string, from: string, to: string) =>
  demo.map((subgraph) =>
    subgraph.name === name ? { ...subgraph, sdl: subgraph.sdl.replace(from, to) } : subgraph,
  );

const composed = () => {
  const graph = composeGraph(demo);
  if (!graph.success) throw new Error(graph.errors.join("\n"));
  return graph;
};

describe("Cosmo demo graph", () => {
  it("[FR-WB-6] composes all ten subgraphs", () => {
    expect(demo).toHaveLength(10);
    expect(composed().success).toBe(true);
  });

  it("[FR-WB-6] maps fields to the subgraphs that resolve them", () => {
    const graph = composed();
    const names = (coordinate: string) =>
      findFieldOwners(graph, coordinate).map(({ name }) => name);

    expect(names("Employee.currentMood")).toEqual(["mood"]);
    expect(names("Employee.isAvailable")).toEqual(["availability"]);
    expect(names("Employee.details")).toEqual(["employees", "family"]);
  });

  it("[FR-WB-6] keeps @inaccessible values out of the client schema", () => {
    expect(composed().sdl).not.toContain("APATHETIC");
  });

  it("[FR-WB-3] finds the operation a real schema change breaks, and no others", () => {
    const result = checkSchemaChange({
      current: demo,
      proposed: edit("hobbies", "hobbies: [Hobby!]", ""),
      operations: [
        { name: "Hobbies", document: "query { employee(id: 1) { hobbies { __typename } } }" },
        { name: "Tag", document: "query { employee(id: 1) { tag } }" },
      ],
      screens: [
        { name: "Profile", operations: ["Hobbies", "Tag"] },
        { name: "Directory", operations: ["Tag"] },
      ],
    });

    expect(result).toMatchObject({
      success: true,
      operations: [{ name: "Hobbies", fields: ["Employee.hobbies"] }],
      screens: [{ name: "Profile", operations: ["Hobbies"] }],
    });
    const changes = result.success ? result.changes : [];
    expect(changes.find(({ coordinate }) => coordinate === "Employee.hobbies")).toEqual({
      coordinate: "Employee.hobbies",
      kind: "removed",
      subgraphs: [{ name: "hobbies" }],
    });
  });

  it("[FR-WB-2] refuses to remove a field another subgraph still requires", () => {
    const result = checkSchemaChange({
      current: demo,
      proposed: edit("mood", "currentMood: Mood!", ""),
      operations: [],
    });

    expect(result).toMatchObject({
      success: false,
      failed: "proposed",
      errors: [expect.stringContaining("currentMood")],
    });
  });
});

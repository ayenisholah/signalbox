import { describe, expect, it } from "vitest";
import { composeGraph, findFieldOwners } from "../src/index.ts";
import { specGraph } from "./fixtures/spec-graph.ts";

const composed = () => {
  const graph = composeGraph(specGraph);
  if (!graph.success) throw new Error(graph.errors.join("\n"));
  return graph;
};

describe("composeGraph", () => {
  it("[FR-WB-2] returns the client schema as SDL", () => {
    const { sdl } = composed();

    expect(sdl).toContain("type Package");
    expect(sdl).toContain("repository: Repository");
    expect(sdl).not.toContain("@key");
  });

  it("[FR-WB-2] returns composition errors for subgraphs that conflict", () => {
    const result = composeGraph([
      { name: "a", sdl: "type Query { a: Shared } type Shared { x: Int }" },
      { name: "b", sdl: "type Query { b: Shared } type Shared { x: String }" },
    ]);

    expect(result.success).toBe(false);
    expect(result).toMatchObject({ success: false });
    expect(JSON.stringify(result)).toContain("Shared.x");
  });

  it("[FR-WB-2] names the subgraph when its SDL can't be parsed", () => {
    const result = composeGraph([...specGraph, { name: "draft", sdl: "type {" }]);

    expect(result).toMatchObject({
      success: false,
      errors: [expect.stringMatching(/^draft: Syntax Error/)],
    });
  });

  it("[FR-WB-2] returns only plain data, so a Web Worker can post it", () => {
    const graph = composed();

    expect(structuredClone(graph)).toEqual(graph);
  });

  it("[FR-WB-2] passes on composition warnings", () => {
    const result = composeGraph([
      { name: "a", sdl: 'type Query { a: A } type A @key(fields: "id") { id: ID! }' },
      { name: "b", sdl: 'type A @key(fields: "id") { id: ID! c: String @external d: Int }' },
      { name: "c", sdl: 'type A @key(fields: "id") { id: ID! c: String }' },
    ]);

    expect(result).toMatchObject({ success: true, warnings: [expect.any(String)] });
  });
});

describe("findFieldOwners", () => {
  it("[FR-WB-4] resolves a field to its subgraph and owner", () => {
    expect(findFieldOwners(composed(), "Package.latestVersion")).toEqual([
      { name: "packages", owner: "registry-team" },
    ]);
  });

  it("[FR-WB-4] lists every subgraph that resolves a shared key", () => {
    const names = findFieldOwners(composed(), "Package.name").map(({ name }) => name);

    expect(names).toEqual(["packages", "repositories"]);
  });

  it("[FR-WB-4] leaves out a subgraph that only declares the field as external", () => {
    const names = findFieldOwners(composed(), "Package.repositoryUrl").map(({ name }) => name);

    expect(names).toEqual(["packages"]);
  });

  it("[FR-WB-4] resolves input fields", () => {
    const names = findFieldOwners(composed(), "PackageFilter.prefix").map(({ name }) => name);

    expect(names).toEqual(["packages"]);
  });

  it("[FR-WB-4] leaves the owner out when none was given", () => {
    expect(findFieldOwners(composed(), "Repository.stars")).toEqual([{ name: "repositories" }]);
  });

  it("[FR-WB-4] returns nothing for an unknown field", () => {
    expect(findFieldOwners(composed(), "Package.missing")).toEqual([]);
  });
});

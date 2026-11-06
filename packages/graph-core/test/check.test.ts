import { describe, expect, it } from "vitest";
import { checkSchemaChange } from "../src/index.ts";
import { specGraph } from "./fixtures/spec-graph.ts";

const edit = (subgraph: string, from: string, to: string) =>
  specGraph.map((input) =>
    input.name === subgraph ? { ...input, sdl: input.sdl.replace(from, to) } : input,
  );

const stars = { name: "Stars", document: 'query { package(name: "a") { repository { stars } } }' };

describe("checkSchemaChange", () => {
  it("[FR-WB-3] attributes a changed field to the subgraphs that held it", () => {
    const result = checkSchemaChange({
      current: specGraph,
      proposed: edit("repositories", "stars: Int!", ""),
      operations: [stars],
    });

    expect(result).toMatchObject({
      success: true,
      changes: [
        {
          coordinate: "Repository.stars",
          kind: "removed",
          subgraphs: [{ name: "repositories" }],
        },
      ],
      operations: [{ name: "Stars" }],
    });
  });

  it("[FR-WB-3] attributes a new field to the subgraph that added it", () => {
    const result = checkSchemaChange({
      current: specGraph,
      proposed: edit("packages", "prefix: String", "prefix: String\n tag: String!"),
      operations: [],
    });

    expect(result).toMatchObject({
      changes: [
        {
          coordinate: "PackageFilter.tag",
          subgraphs: [{ name: "packages", owner: "registry-team" }],
        },
      ],
    });
  });

  it("[FR-WB-2] stops at composition errors in the proposed graph", () => {
    const result = checkSchemaChange({
      current: specGraph,
      proposed: edit("repositories", "type Package", "type {"),
      operations: [stars],
    });

    expect(result).toMatchObject({ success: false, failed: "proposed" });
  });

  it("[FR-WB-2] says when the current graph doesn't compose", () => {
    const result = checkSchemaChange({
      current: edit("repositories", "type Package", "type {"),
      proposed: specGraph,
      operations: [],
    });

    expect(result).toMatchObject({ success: false, failed: "current" });
  });
});

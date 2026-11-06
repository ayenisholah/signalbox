import { describe, expect, it } from "vitest";
import { buildGraphMap, type GraphMap } from "../src/index.ts";
import { loadCosmoDemo } from "./fixtures/cosmo-demo.ts";
import { specGraph } from "./fixtures/spec-graph.ts";

const mapOf = (inputs: Parameters<typeof buildGraphMap>[0]): GraphMap => {
  const result = buildGraphMap(inputs);
  if (!result.success) throw new Error(result.errors.join("\n"));
  return result.map;
};

const typeNamed = (map: GraphMap, name: string) => map.types.find((type) => type.name === name);

describe("buildGraphMap", () => {
  it("[FR-WB-1] lists each subgraph with its owner, entities and field count", () => {
    expect(mapOf(specGraph).subgraphs).toEqual([
      {
        name: "packages",
        owner: "registry-team",
        entities: ["Package"],
        fieldCount: 6,
      },
      { name: "repositories", entities: ["Package", "Repository"], fieldCount: 4 },
    ]);
  });

  it("[FR-WB-1] marks entities, and says which subgraphs contribute to a type", () => {
    const map = mapOf(specGraph);

    expect(typeNamed(map, "Package")).toMatchObject({
      kind: "object",
      isEntity: true,
      subgraphs: [{ name: "packages", owner: "registry-team" }, { name: "repositories" }],
    });
    expect(typeNamed(map, "PackageFilter")).toMatchObject({ kind: "input", isEntity: false });
  });

  it("[FR-WB-1] gives each field its type, the type to open and its subgraphs", () => {
    const fields = typeNamed(mapOf(specGraph), "Query")?.fields;

    expect(fields?.find(({ name }) => name === "search")).toEqual({
      name: "search",
      type: "[Package!]!",
      namedType: "Package",
      subgraphs: [{ name: "packages", owner: "registry-team" }],
    });
  });

  it("[FR-WB-1] lists enum values and union members", () => {
    const map = mapOf([
      {
        name: "a",
        sdl: /* GraphQL */ `
          enum Colour {
            RED
            BLUE
          }
          type Cat {
            name: String
          }
          type Dog {
            name: String
          }
          union Pet = Cat | Dog
          type Query {
            colour: Colour
            pet: Pet
          }
        `,
      },
    ]);

    expect(typeNamed(map, "Colour")).toMatchObject({ kind: "enum", members: ["BLUE", "RED"] });
    expect(typeNamed(map, "Pet")).toMatchObject({ kind: "union", members: ["Cat", "Dog"] });
  });

  it("[FR-WB-1] keeps interfaces and custom scalars, and leaves built-in types out", () => {
    const map = mapOf([
      {
        name: "a",
        sdl: /* GraphQL */ `
          scalar Date
          interface Node {
            id: ID!
          }
          type Item implements Node {
            id: ID!
            at: Date
          }
          type Query {
            node: Node
            item: Item
          }
        `,
      },
    ]);

    expect(map.types.map(({ name, kind }) => [name, kind])).toEqual([
      ["Date", "scalar"],
      ["Item", "object"],
      ["Node", "interface"],
      ["Query", "object"],
    ]);
  });

  it("[FR-WB-1] returns the failure when the graph doesn't compose", () => {
    expect(buildGraphMap([{ name: "a", sdl: "type {" }])).toMatchObject({ success: false });
  });

  it("[FR-WB-6] maps the Cosmo demo graph, as plain JSON", () => {
    const map = mapOf(loadCosmoDemo());

    expect(map.subgraphs).toHaveLength(10);
    expect(typeNamed(map, "Employee")).toMatchObject({ isEntity: true });
    expect(typeNamed(map, "Mood")?.members).not.toContain("APATHETIC");
    expect(JSON.parse(JSON.stringify(map))).toEqual(map);
  });
});

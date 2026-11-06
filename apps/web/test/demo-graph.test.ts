import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { buildGraphMap } from "@traverse/graph-core";
import { expect, it } from "vitest";
import demoGraph from "../src/generated/demo-graph.json";

const directory = join(import.meta.dirname, "../../../graph/cosmo-demo");

it("[FR-WB-1] keeps the generated demo graph in step with the schemas", () => {
  const subgraphs = readdirSync(directory)
    .filter((file) => file.endsWith(".graphqls"))
    .map((file) => ({
      name: basename(file, ".graphqls"),
      sdl: readFileSync(join(directory, file), "utf8"),
    }));

  expect(buildGraphMap(subgraphs)).toEqual({ success: true, map: demoGraph });
});

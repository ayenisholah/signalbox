import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { buildGraphMap } from "@traverse/graph-core";

const directory = "graph/cosmo-demo";

const subgraphs = readdirSync(directory)
  .filter((file) => file.endsWith(".graphqls"))
  .map((file) => ({
    name: basename(file, ".graphqls"),
    sdl: readFileSync(join(directory, file), "utf8"),
  }));

const result = buildGraphMap(subgraphs);
if (!result.success) throw new Error(result.errors.join("\n"));

const exampleQuery = readFileSync(join(directory, "example-query.graphql"), "utf8");

writeFileSync("apps/web/src/generated/demo-graph.json", `${JSON.stringify(result.map)}\n`);
writeFileSync(
  "apps/web/src/generated/demo-impact.json",
  `${JSON.stringify({ subgraphs, exampleQuery })}\n`,
);

import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import type { SubgraphInput } from "../../src/index.ts";

const directory = join(import.meta.dirname, "../../../../graph/cosmo-demo");

export const loadCosmoDemo = (): SubgraphInput[] =>
  readdirSync(directory)
    .filter((file) => file.endsWith(".graphqls"))
    .map((file) => ({
      name: basename(file, ".graphqls"),
      sdl: readFileSync(join(directory, file), "utf8"),
    }));

import { readFileSync } from "node:fs";
import {
  createSubgraph,
  isSafeEndpoint,
  type Subgraph,
  type SubgraphDependencies,
  type UpstreamFetch,
} from "@traverse/subgraph-kit";
import { z } from "zod";
import { createOsvClient } from "./osv.ts";

const typeDefs = readFileSync(new URL("../schema.graphqls", import.meta.url), "utf8");

const OSV_URL = "https://api.osv.dev";

// A wrong address that answers `{}` would make every package look safe.
const environmentSchema = z.object({
  OSV_URL: z
    .url({ abort: true })
    .refine((url) => isSafeEndpoint(url, OSV_URL), "must be OSV's address, or a local service")
    .default(OSV_URL),
});

interface AdvisoriesDependencies extends SubgraphDependencies {
  fetch?: UpstreamFetch;
}

export const createAdvisoriesSubgraph = ({
  fetch = globalThis.fetch,
  env = process.env,
  ...dependencies
}: AdvisoriesDependencies = {}): Subgraph => {
  const { OSV_URL: baseUrl } = environmentSchema.parse(env);
  const osv = createOsvClient({ fetch, baseUrl });

  return createSubgraph(
    {
      name: "advisories",
      typeDefs,
      resolvers: {
        Advisory: {
          __resolveReference: ({ id }: { id?: unknown }) => osv.advisory(id),
        },
        Package: {
          advisories: ({ name }: { name?: unknown }, { version }: { version?: unknown }) =>
            osv.advisories(name, version),
        },
      },
    },
    { ...dependencies, env },
  );
};

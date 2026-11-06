import { readFileSync } from "node:fs";
import {
  createSubgraph,
  isSafeEndpoint,
  type Subgraph,
  type SubgraphDependencies,
  type UpstreamFetch,
} from "@traverse/subgraph-kit";
import { z } from "zod";
import { createNpmClient, type PackageData } from "./npm.ts";

const typeDefs = readFileSync(new URL("../schema.graphqls", import.meta.url), "utf8");

const endpoint = (official: string) =>
  z
    .url({ abort: true })
    .refine((url) => isSafeEndpoint(url, official), "must be npm's address, or a local service")
    .default(official);

const environmentSchema = z.object({
  NPM_REGISTRY_URL: endpoint("https://registry.npmjs.org"),
  NPM_DOWNLOADS_URL: endpoint("https://api.npmjs.org"),
});

interface PackagesDependencies extends SubgraphDependencies {
  fetch?: UpstreamFetch;
}

export const createPackagesSubgraph = ({
  fetch = globalThis.fetch,
  env = process.env,
  ...dependencies
}: PackagesDependencies = {}): Subgraph => {
  const { NPM_REGISTRY_URL, NPM_DOWNLOADS_URL } = environmentSchema.parse(env);
  const npm = createNpmClient({
    fetch,
    registryUrl: NPM_REGISTRY_URL,
    downloadsUrl: NPM_DOWNLOADS_URL,
  });

  return createSubgraph(
    {
      name: "packages",
      typeDefs,
      resolvers: {
        Query: {
          package: (_: unknown, { name }: { name: string }) => npm.latest(name),
        },
        Package: {
          __resolveReference: ({ name }: Pick<PackageData, "name">) => npm.latest(name),
          versions: ({ name }: PackageData) => npm.versions(name),
          weeklyDownloads: ({ name }: PackageData) => npm.weeklyDownloads(name),
        },
      },
    },
    { ...dependencies, env },
  );
};

import { readFileSync } from "node:fs";
import {
  createSubgraph,
  isSafeEndpoint,
  type Subgraph,
  type SubgraphDependencies,
  type UpstreamFetch,
} from "@traverse/subgraph-kit";
import { z } from "zod";
import { createGithubClient } from "./github.ts";

const typeDefs = readFileSync(new URL("../schema.graphqls", import.meta.url), "utf8");

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

const environmentSchema = z.object({
  GITHUB_TOKEN: z.string().min(1),
  GITHUB_GRAPHQL_URL: z
    .url({ abort: true })
    // The token goes wherever this points.
    .refine(
      (url) => isSafeEndpoint(url, GITHUB_GRAPHQL_URL),
      "must be GitHub's GraphQL endpoint, or a local service",
    )
    .default(GITHUB_GRAPHQL_URL),
});

interface RepositoriesDependencies extends SubgraphDependencies {
  fetch?: UpstreamFetch;
}

export const createRepositoriesSubgraph = ({
  fetch = globalThis.fetch,
  env = process.env,
  ...dependencies
}: RepositoriesDependencies = {}): Subgraph => {
  const { GITHUB_TOKEN: token, GITHUB_GRAPHQL_URL: graphqlUrl } = environmentSchema.parse(env);
  const github = createGithubClient({ fetch, graphqlUrl, token });

  return createSubgraph(
    {
      name: "repositories",
      typeDefs,
      resolvers: {
        Repository: {
          __resolveReference: ({ url }: { url?: unknown }) => github.repository(url),
        },
        Package: {
          repository: ({ repositoryUrl }: { repositoryUrl?: unknown }) =>
            github.repository(repositoryUrl),
        },
      },
    },
    { ...dependencies, env },
  );
};

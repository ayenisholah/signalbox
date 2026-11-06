import type { SubgraphInput } from "../../src/index.ts";

// The packages and repositories subgraphs from SPEC.md, with one input type added.
export const specGraph: SubgraphInput[] = [
  {
    name: "packages",
    owner: "registry-team",
    sdl: /* GraphQL */ `
      type Package @key(fields: "name") {
        name: String!
        latestVersion: String!
        repositoryUrl: String
      }
      input PackageFilter {
        prefix: String
      }
      type Query {
        package(name: String!): Package
        search(filter: PackageFilter): [Package!]!
      }
    `,
  },
  {
    name: "repositories",
    sdl: /* GraphQL */ `
      type Repository @key(fields: "url") {
        url: ID!
        stars: Int!
      }
      type Package @key(fields: "name") {
        name: String!
        repositoryUrl: String @external
        repository: Repository @requires(fields: "repositoryUrl")
      }
    `,
  },
];

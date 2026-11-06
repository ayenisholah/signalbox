# 0016: Build subgraphs on GraphQL Yoga and @apollo/subgraph

**Status:** Accepted

## Context

Every subgraph needs the same server, health checks, token verification, logging and shutdown (FR-SG-7). The subgraphs are TypeScript, on `graphql` 16, and the Cosmo Router calls them over plain federation.

## Decision

`packages/subgraph-kit` wraps GraphQL Yoga for the server and `@apollo/subgraph` for `_service` and `_entities`. It uses `jose` for tokens, Pino for logs and Zod for the environment. A subgraph supplies a name, SDL and resolvers.

## Consequences

- Both are MIT licensed. `@apollo/subgraph` is a library with no ties to an Apollo service, and composition stays with Cosmo.
- They need different majors of `@graphql-tools/utils`. npm keeps them apart, and `npm audit` finds nothing.
- Vitest has to load the same `graphql` build as Node, or Yoga masks deliberate errors (W-5). An integration test runs a real process to prove it.

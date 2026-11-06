# M2: Real graph

**Outcome:** one federated query returns live npm, GitHub and OSV data through the pinned Cosmo Router, in Docker. No AWS access is needed.

## Work

1. `feat/subgraph-kit`: server, health, token verification, logging and shutdown.
2. `feat/packages-subgraph`, `feat/repositories-subgraph`, `feat/advisories-subgraph`: tests first, replaying recorded real responses.
3. `feat/upstream-resilience`: caching, retries, rate limit handling, and a scheduled check against the live sources.
4. `feat/local-router`: compose config, JWT, persisted operations, limits, and the production config test for GR-1.
5. `docs/spike-results`: answers to U-2, U-3, U-4, U-5, U-9, U-13, U-14, U-15 and U-16.

## Exit

- An end-to-end test passes against the pinned router image.
- One operation joins a real package, repository and advisories.
- A non-persisted operation is rejected on the public router config.
- With one upstream blocked, the others still return.

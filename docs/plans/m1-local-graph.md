# M1: Local graph

**Outcome:** one federated query runs across all three subgraphs behind the pinned router, in Docker. No AWS access is needed.

## Work

1. `feat/subgraph-kit`: server, health, token verification, logging and shutdown.
2. `feat/catalog-subgraph`, `feat/availability-subgraph`, `feat/bookings-subgraph`: tests first, with Postgres.
3. `feat/local-router`: compose config, JWT, persisted operations, limits, and the production config test for GR-1.
4. `docs/spike-results`: answers to U-2, U-3, U-4, U-5, U-8 and U-9.

## Exit

- An end-to-end test passes against the pinned router image.
- A token for one business can't reach another's data.
- A non-persisted operation is rejected.

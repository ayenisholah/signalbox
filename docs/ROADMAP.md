# Roadmap

**Updated:** 2026-11-05

Each branch is one pull request and lists the requirements it delivers. Plans for each milestone are in [`plans/`](plans/).

| Milestone | Outcome | Plan | Status |
|---|---|---|---|
| M0 | Foundation: tooling, specification, quality gates | [Plan](plans/m0-foundation.md) | In progress |
| M1 | Local graph behind the pinned router | [Plan](plans/m1-local-graph.md) | Planned |
| M2 | Booking web app, running locally | [Plan](plans/m2-web-app.md) | Planned |
| M3 | Network, data and edge in CDK | [Plan](plans/m3-network-data-edge.md) | Planned |
| M4 | Router, subgraphs and web app on staging | [Plan](plans/m4-services.md) | Planned |
| M5 | Observability | [Plan](plans/m5-observability.md) | Planned |
| M6 | Delivery pipeline | [Plan](plans/m6-delivery.md) | Planned |
| M7 | Load and resilience proof | [Plan](plans/m7-resilience.md) | Planned |
| M8 | Production launch | [Plan](plans/m8-production.md) | Planned |

[Account setup](plans/account-setup.md) must be complete before M3. The [Frox licence check](plans/m2-web-app.md#licence-gate) for styled UI in M2 is cleared.

## Branches

| Milestone | Branch | Requirements | Status |
|---|---|---|---|
| M0 | `chore/repo-tooling` | FR-DP-7 | Merged |
| M0 | `docs/readme` | FR-DP-8 | Merged |
| M0 | `docs/spec-and-requirements` | FR-DP-8, FR-DP-9 | Merged |
| M0 | `docs/agent-instructions` | FR-DP-9 | In progress |
| M0 | `ci/quality-gates` | FR-DP-7, FR-DP-8 | Planned |
| M0 | `chore/agent-skills` | FR-DP-9 | Planned |
| M1 | `feat/subgraph-kit` | FR-SG-7, FR-OB-6, GR-3 | Planned |
| M1 | `feat/catalog-subgraph` | FR-SG-1, FR-SG-2 | Planned |
| M1 | `feat/availability-subgraph` | FR-SG-1, FR-SG-3 | Planned |
| M1 | `feat/bookings-subgraph` | FR-SG-1, FR-SG-4, FR-SG-5, FR-SG-6 | Planned |
| M1 | `feat/local-router` | FR-GW-2, FR-GW-4, GR-1, GR-2 | Planned |
| M1 | `docs/spike-results` | FR-GW-3, FR-GW-7 | Planned |
| M2 | `feat/web-graph-client` | FR-WEB-6 | Planned |
| M2 | `feat/web-auth` | FR-WEB-5, GR-9 | Planned |
| M2 | `feat/design-system` | FR-WEB-7, NFR-9, NFR-10, GR-10 | Planned |
| M2 | `feat/web-booking-flow` | FR-WEB-1, FR-WEB-2, FR-WEB-3 | Planned |
| M2 | `feat/web-bookings-page` | FR-WEB-4 | Planned |
| M2 | `test/web-e2e` | FR-WEB-3, NFR-9 | Planned |
| M3 | `feat/network-stack` | NFR-7, GR-5 | Planned |
| M3 | `feat/data-stack` | NFR-5, NFR-7 | Planned |
| M3 | `feat/edge-stack` | FR-GW-6, NFR-6 | Planned |
| M4 | `feat/graph-service-construct` | FR-DP-5 | Planned |
| M4 | `feat/router-service` | FR-GW-1, FR-GW-3, FR-GW-5, FR-GW-7, FR-GW-8 | Planned |
| M4 | `feat/subgraph-services` | FR-GW-1 | Planned |
| M4 | `feat/migration-task` | FR-SG-8 | Planned |
| M4 | `feat/web-service` | FR-WEB-8 | Planned |
| M5 | `feat/telemetry-pipeline` | FR-OB-1, FR-OB-2, FR-OB-5, GR-4 | Planned |
| M5 | `feat/dashboards` | FR-OB-3 | Planned |
| M5 | `feat/alarms-and-slos` | FR-OB-4 | Planned |
| M6 | `ci/schema-checks` | FR-DP-1, GR-7 | Planned |
| M6 | `ci/deploy-pipeline` | FR-DP-2, FR-DP-3, FR-DP-6, GR-8 | Planned |
| M6 | `feat/github-oidc-roles` | FR-DP-4, GR-5, GR-6 | Planned |
| M7 | `test/load-suite` | NFR-1, NFR-2, NFR-3, NFR-11 | Planned |
| M7 | `test/resilience-suite` | FR-GW-3, NFR-4, NFR-5 | Planned |
| M7 | `docs/resilience-results` | NFR-1, NFR-4, NFR-5 | Planned |
| M8 | `feat/production-environment` | FR-GW-1, NFR-6 | Planned |
| M8 | `docs/runbooks` | NFR-8 | Planned |

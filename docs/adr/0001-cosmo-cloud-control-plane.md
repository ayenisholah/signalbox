# 0001: Use Cosmo Cloud with a self-managed router

**Status:** Accepted

## Context

A federated graph needs a schema registry, composition and analytics. Self-hosting them means operating Keycloak, ClickHouse, Postgres, Redis, S3-compatible storage and collectors.

## Decision

Run the router, subgraphs and data in AWS, and use Cosmo Cloud for the control plane.

## Consequences

- Far less to operate and pay for.
- Schemas and sampled telemetry leave AWS, so [data privacy](../DATA_PRIVACY.md) limits what is sent.
- Cosmo Cloud becomes a dependency, which the S3 fallback must cover (FR-GW-3).

# 0002: Run services on ECS Fargate

**Status:** Accepted

## Context

The router is a long-running service that needs graceful draining, and it supports subscriptions. The project has no need to operate a cluster.

## Decision

Run the router and subgraphs as ECS Fargate services, connected with Service Connect.

## Consequences

- No nodes or control plane to manage, and no internal load balancers.
- Fixed monthly cost is higher than scale-to-zero options.
- `stopTimeout` is capped at 120 seconds, which limits shutdown timing (A-2).

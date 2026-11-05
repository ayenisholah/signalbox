# 0006: Use CloudWatch for dashboards

**Status:** Accepted

## Context

Amazon Managed Grafana isn't available in the proposed Region, eu-north-1 (A-6). Cosmo Studio already covers graph-level analytics.

## Decision

Use CloudWatch dashboards and alarms for infrastructure and service health, and Studio for graph analytics.

## Consequences

- No extra service to run or pay for, and dashboards live in CDK.
- Two places to look, with a clear split between platform and graph.

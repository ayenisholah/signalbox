# Service level objectives

**Status:** Proposed. Targets are confirmed by load and resilience tests in M7.

| Objective | Target | Measured at |
|---|---|---|
| Availability | 99.9% of valid requests succeed each month | Load balancer |
| Latency | p95 under 300 ms | Router |
| Recovery point (RPO) | 5 minutes | Restore test |
| Recovery time (RTO) | 1 hour, for a single-zone or data failure | Restore test |

99.9% allows about 43 minutes of failure in a 30-day month.

## Error budget

When the month's budget is spent, reliability work takes priority over new features until it recovers.

Alarms follow the rate at which the budget burns, so they signal user impact, not noise (FR-OB-4).

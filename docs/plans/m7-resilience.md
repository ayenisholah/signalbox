# M7: Load and resilience

All tests run in staging, with results recorded in `docs/`.

## Work

1. `test/load-suite`: k6 to 2× expected peak, and a rolling deploy under load.
2. `test/resilience-suite`: task kill, zone disruption with AWS FIS, RDS and Redis failover, CDN blocked, restore from backup.
3. `docs/resilience-results`: measured results, and the decision on whether rate limiting fails open or closed.

## Exit

- The [SLOs](../SLOS.md) hold, or gaps are fixed or accepted in writing by the owner.

# Data privacy

Signalbox stores fictional data. These rules are written as if it were real, so the design holds for real use.

## What's stored

| Data | Location | Retention |
|---|---|---|
| Businesses, services and slots | RDS Postgres | Until deleted |
| Bookings | RDS Postgres | Until deleted |
| Rate-limit counters | ElastiCache | Short-lived |
| Backups | RDS automated backups | 14 days |
| Logs | CloudWatch Logs | 30 days |
| Traces and metrics | CloudWatch, X-Ray | Service defaults |

Retention values are design targets, set in CDK during M3 and M5.

## What leaves AWS

| Data | Destination | Purpose |
|---|---|---|
| Subgraph schemas | Cosmo Cloud | Composition and registry |
| Operation names, timing and client names | Cosmo Cloud | Studio analytics |
| Sampled traces | Cosmo Cloud | Studio tracing |

GraphQL variables and response data must never be exported (GR-4). Exactly which attributes the router sends is reviewed in M5 against a real capture.

## Rules

- Logs and telemetry carry no personal data, tokens or secrets.
- Fixtures and test data are fictional.
- All data is encrypted at rest and in transit (NFR-7).

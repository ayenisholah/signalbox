# M8: Observability

## Work

1. `feat/telemetry-pipeline`: ADOT sidecar to CloudWatch and X-Ray, plus an explicit Cosmo Cloud exporter (C-16), and a review of exported attributes.
2. `feat/dashboards`: CloudWatch dashboards. Managed Grafana isn't available in eu-north-1 (A-6).
3. `feat/alarms-and-slos`: burn-rate alarms sent through SNS.

## Exit

- One trace spans the load balancer to the database.
- A test alarm reaches the owner.
- A captured request shows no variables in logs or telemetry.

# M4: Services on staging

## Work

1. `feat/graph-service-construct`: a reusable Fargate service with least-privilege roles, Service Connect and autoscaling.
2. `feat/router-service`: digest-pinned image in ECR, shutdown timing from the [specification](../../SPEC.md), Redis rate limits and S3 fallback.
3. `feat/subgraph-services`: the three subgraphs, published to Cosmo Cloud.
4. `feat/migration-task`: one-off migration task.
5. `feat/web-service`: the web app on Fargate, using the same construct.

U-1 is answered here.

## Exit

- An authenticated query over HTTPS on staging succeeds and appears in Studio.

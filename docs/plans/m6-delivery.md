# M6: Delivery

## Work

1. `feat/github-oidc-roles`: roles limited to this repository and environment, plus scheduled drift detection.
2. `ci/schema-checks`: `wgc subgraph check` as a required status.
3. `ci/deploy-pipeline`: staging, smoke tests, approval, production, with circuit breakers and alarm rollback.

## Exit

- A bad image rolls back by itself in staging.
- A breaking schema change fails its pull request.

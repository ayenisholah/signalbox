# Verified facts

**Updated:** 2026-11-05

This file records what Traverse relies on from Cosmo and AWS, and how far each claim can be trusted. Add a fact here before depending on it.

| Status | Meaning |
|---|---|
| `tested` | Observed directly, by running or calling it |
| `documented` | Read in the official documentation for the pinned version or current service |
| `reported` | Stated by a source that hasn't been confirmed; don't rely on it |
| `unknown` | Not established; must not be relied on until tested |

## Pinned versions

The versions below are the only ones whose docs count. Upgrades change this table in the same pull request.

| Tool | Version | Source |
|---|---|---|
| Node.js | 24 | `.nvmrc` |
| Cosmo Router | `0.366.1` | [Release list](https://github.com/wundergraph/cosmo/releases) |
| Cosmo Router image | `ghcr.io/wundergraph/cosmo/router:0.366.1` @ `sha256:1a8bc23db2c33c2028720b85b56fce68b7bf35f1064bac0f8301eb5ca6cae81c` | GHCR manifest, read directly |
| `wgc` | `0.133.6` | npm registry |
| AWS CDK library | `2.275.0` | npm registry |

## Cosmo

| ID | Fact | Status | Source |
|---|---|---|---|
| C-1 | Cosmo is licensed under Apache-2.0. | `tested` | GitHub repository metadata |
| C-2 | A graph can run locally with `wgc router compose` and no Cosmo account. That command is for local development only. | `documented` | [Local development](https://cosmo-docs.wundergraph.com/tutorial/mastering-local-development-for-graphql-federation.md) |
| C-3 | Without a graph token, the router sends no analytics or tracing to Cosmo. | `documented` | [Local development](https://cosmo-docs.wundergraph.com/tutorial/mastering-local-development-for-graphql-federation.md) |
| C-4 | `DEV_MODE` must not be set in production. | `documented` | [Deployment](https://cosmo-docs.wundergraph.com/router/deployment.md) |
| C-5 | Cosmo recommends 3 instances of 2 CPUs and 1 GB for low to medium traffic. | `documented` | [Deployment](https://cosmo-docs.wundergraph.com/router/deployment.md) |
| C-6 | On SIGTERM the router drains, then shuts down, within `SHUTDOWN_DELAY`. An explicit `DRAIN_PERIOD` plus `GRACE_PERIOD` can't exceed it. | `documented` | [Configuration](https://cosmo-docs.wundergraph.com/router/configuration.md) |
| C-7 | While draining, the router sends `Connection: close` and returns 503 on readiness. | `documented` | [Deployment](https://cosmo-docs.wundergraph.com/router/deployment.md) |
| C-8 | Health paths default to `/health`, `/health/ready` and `/health/live`. | `documented` | [Configuration](https://cosmo-docs.wundergraph.com/router/configuration.md) |
| C-9 | Introspection, playground and query plans are on by default, and CORS defaults to all origins. | `documented` | [Configuration](https://cosmo-docs.wundergraph.com/router/configuration.md) |
| C-10 | `security.block_non_persisted_operations` and `security.complexity_limits` exist. Complexity limits support `measure` and `enforce` modes. | `documented` | [Configuration](https://cosmo-docs.wundergraph.com/router/configuration.md) |
| C-11 | `traffic_shaping.router.max_request_body_size` defaults to 5 MB. | `documented` | [Configuration](https://cosmo-docs.wundergraph.com/router/configuration.md) |
| C-12 | Rate limiting needs Redis 3.2 or newer. | `documented` | [Configuration](https://cosmo-docs.wundergraph.com/router/configuration.md) |
| C-13 | `execution_config.fallback_storage` is off by default, and its provider must differ from the primary provider. | `documented` | [Configuration](https://cosmo-docs.wundergraph.com/router/configuration.md) |
| C-14 | The router polls the CDN every 15 seconds by default. A config change runs old and new graph instances side by side. | `documented` | [Hot reload](https://cosmo-docs.wundergraph.com/router/deployment/config-hot-reload.md) |
| C-15 | A config swap closes WebSocket and SSE subscriptions, and invalidates the planner cache. | `documented` | [Hot reload](https://cosmo-docs.wundergraph.com/router/deployment/config-hot-reload.md) |
| C-16 | With no exporters configured, telemetry goes to Cosmo Cloud. Sending it elsewhere as well means listing Cosmo Cloud as an explicit exporter. | `documented` | [OpenTelemetry](https://cosmo-docs.wundergraph.com/router/open-telemetry.md) |
| C-17 | Prometheus metrics default to `127.0.0.1:8088/metrics`. | `documented` | [Metrics](https://cosmo-docs.wundergraph.com/router/metrics-and-monitoring.md) |
| C-18 | Cosmo Cloud is free up to 10M requests a month. | `reported` | [WunderGraph answers](https://wundergraph.com/answers) |

## AWS

| ID | Fact | Status | Source |
|---|---|---|---|
| A-1 | A 2 vCPU Fargate task takes 4 GB to 16 GB of memory. | `documented` | [Fargate task definitions](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-tasks-services.html) |
| A-2 | On Fargate, `stopTimeout` defaults to 30 seconds, with a maximum of 120. | `documented` | [ContainerDefinition](https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_ContainerDefinition.html) |
| A-3 | An Application Load Balancer's idle timeout defaults to 60 seconds. AWS recommends a longer idle timeout in the application, or 502 errors can occur. | `documented` | [ALB attributes](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/edit-load-balancer-attributes.html) |
| A-4 | Service Connect adds a proxy container to each task, which shares the task's resources. It has no extra charge. | `documented` | [Service Connect](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-connect.html) |
| A-5 | An ACM certificate for HTTPS between viewers and CloudFront must be in `us-east-1`. | `documented` | [CloudFront certificates](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html) |
| A-6 | Amazon Managed Grafana isn't offered in eu-north-1. | `documented` | [Managed Grafana regions](https://docs.aws.amazon.com/grafana/latest/userguide/what-is-Amazon-Managed-Service-Grafana.html) |
| A-7 | A Free plan project is assigned one Region, and other Regions need a plan upgrade and advanced features. | `tested` | Console message and API calls on the development account |
| A-8 | Activating advanced features can't be reversed, removes any spend limit and prevents new projects in that organisation. | `documented` | [Activate advanced features](https://docs.aws.amazon.com/accounts/latest/reference/activate-advanced-features.md) |
| A-9 | Upgrading an account plan can't be reversed. | `documented` | [Upgrade your account](https://docs.aws.amazon.com/accounts/latest/reference/upgrade-account.md) |

## Open questions

Each is answered by test before the feature that depends on it ships.

| ID | Question | Needed by | Answered in |
|---|---|---|---|
| U-1 | Does the router's S3 provider use Fargate task-role credentials? The docs only name EC2 and EKS. | FR-GW-3 | M4 |
| U-2 | Does the router image contain anything that can run a container health check? | FR-GW-7 | M1 |
| U-3 | What does the router do when the CDN is down at startup, and while running? | FR-GW-3 | M1, M7 |
| U-4 | Is the router's HTTP idle timeout longer than the load balancer's? If not, it must change to avoid 502 errors (A-3). | NFR-2 | M1 |
| U-5 | How is the `Authorization` header forwarded to subgraphs, and how is it configured? | GR-3 | M1 |
| U-6 | What retention, limits and support does the Cosmo free plan give? | FR-OB-2 | Before M3 |
| U-7 | Which account route gives multi-Region access and the needed quotas, and at what cost? | NFR-6 | Before M3 |
| U-9 | How are generated operations pushed to Cosmo as persisted operations, and which `wgc` command does it? | FR-WEB-6 | M1 |
| U-8 | Do `SPEC.md`'s `extend type` and `@external` definitions compose as written? | FR-SG-2 | M1 |

## Answered questions

| ID | Question | Needed by | Answer | Source |
|---|---|---|---|---|
| U-10 | Does the Frox licence allow derived tokens and components in a public MIT repository? | GR-10 | Yes, on the owner's confirmation that Frox can be used publicly. | Owner statement, 2026-11-05, recorded in [ADR 0008](adr/0008-frox-design-system.md) |

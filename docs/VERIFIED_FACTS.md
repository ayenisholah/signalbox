# Verified facts

**Updated:** 2026-11-06

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
| `@wundergraph/composition` | `0.66.2` | npm registry |
| `graphql` | `16.15.0` | `package-lock.json`. Composition needs 16, so don't move to 17 alone. |
| AWS CDK library | `2.275.0` | npm registry |
| Next.js | `16.4.5` | `package-lock.json` |
| React | `19.3.1` | `package-lock.json` |
| Tailwind CSS | `4.3.4` | `package-lock.json` |
| `radix-ui` | `1.8.1` | `package-lock.json` |

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
| C-18 | The Developer plan is free, with 10M requests a month, 1 federated graph, 10 subgraphs, 3 users and 7-day retention. | `documented` | [Pricing](https://wundergraph.com/pricing) |
| C-19 | `@wundergraph/composition` 0.66.2 is Apache-2.0. | `tested` | npm registry |
| C-20 | `federateSubgraphs` composes the schema in `SPEC.md`, its `parentDefinitionDataByTypeName` result gives each field's subgraphs, and a planted break fails with an error. Run in Node 24 and in a browser (C-27). | `tested` | Local run on 2026-11-06 |
| C-21 | Sending `X-WG-Include-Query-Plan` returns the plan in `extensions`. `X-WG-Skip-Loader` skips subgraph requests. | `documented` | [Query plans](https://cosmo-docs.wundergraph.com/router/query-plan) |
| C-22 | Self-hosting needs no subscription or licence key. | `reported` | [WunderGraph answers](https://wundergraph.com/answers) |
| C-23 | The pricing table excludes persisted operations, rate limiting and multiple OpenTelemetry exporters below Scale, and cache warming below Enterprise. | `documented` | [Pricing](https://wundergraph.com/pricing) |
| C-24 | The operations check uses router traffic, 7 days by default. | `documented` | [Schema checks](https://cosmo-docs.wundergraph.com/studio/schema-checks.md) |
| C-25 | Persisted operations and the execution config can load from S3, with artifacts pushed by your own CI. | `documented` | [Storage providers](https://cosmo-docs.wundergraph.com/router/storage-providers.md) |
| C-26 | `wgc` commands need `COSMO_API_KEY`, and the router uses `GRAPH_API_TOKEN`. | `documented` | [API keys](https://cosmo-docs.wundergraph.com/cli/api-keys.md) |
| C-27 | `packages/graph-core`, bundled by esbuild, composes the 10 Cosmo demo subgraphs in a Web Worker in headless Chrome in under 200 ms, 111 to 166 ms over three runs. The bundle is 958 KB, or 240 KB gzipped, and its results survive `structuredClone`. In the spike, the longest main-thread gap during composition was 6 ms. | `tested` | Local run on 2026-11-06 |
| C-28 | A field's `subgraphNames` includes subgraphs that only declare it `@external`. `externalFieldDataBySubgraphName` marks them with `isDefinedExternal`. | `tested` | `Employee.isAvailable` in the Cosmo demo, 2026-11-06 |
| C-30 | `new Worker(new URL("./compose.worker.ts", import.meta.url), { type: "module" })` works under Next.js 16.4.5 and Turbopack in a static export. Checking the Cosmo demo graph in it caused no main-thread long task, and the composer's 1 MB chunk loads only in the worker. | `tested` | Playwright run on 2026-11-06 |
| C-29 | Composition rejects removing a field while another subgraph still declares it `@external`. | `tested` | `Employee.currentMood` in the Cosmo demo, 2026-11-06 |

## Data sources

| ID | Fact | Status | Source |
|---|---|---|---|
| D-1 | The npm registry and downloads API answer with no key. | `tested` | Live request on 2026-11-05 |
| D-2 | OSV answers version queries with no key. It returned 4 advisories for `lodash` 4.17.20. | `tested` | Live request on 2026-11-05 |
| D-3 | GitHub GraphQL allows 5,000 points an hour for an authenticated user. | `tested` | `rate_limit` API on 2026-11-05 |
| D-4 | The deps.dev `:dependencies` endpoint returned 404, so npm metadata is used instead. | `tested` | Live request on 2026-11-05 |

## Web

| ID | Fact | Status | Source |
|---|---|---|---|
| W-1 | With `output: "export"`, `next build` writes static files to `out`. | `tested` | `next build` in `node:24` on 2026-11-06, and `node_modules/next/dist/docs/01-app/02-guides/static-exports.md` |
| W-2 | `next build` refuses a route using `dynamic = "force-dynamic"` under `output: "export"`. | `tested` | Planted route on 2026-11-06 |
| W-3 | `eslint-config-next` 16.4.5 depends on `eslint-plugin-react` and `eslint-plugin-jsx-a11y`, whose peer ranges stop at ESLint 9. | `tested` | npm registry on 2026-11-06 |
| W-5 | `graphql` 16 ships CJS and ESM builds. Under Vite, composition's schema objects fail in our `graphql` calls with "from another module or realm". AST nodes are plain objects and cross safely. | `tested` | Vitest run on 2026-11-06 |
| W-6 | `@wundergraph/composition` 0.66.2 asks for `@graphql-tools/utils` ^11, which has two high severity advisories (GHSA-7mx3-vvmw-hjmv, GHSA-c4qx-w738-7hr3). An npm override scoped to composition, to ^12.1.0, clears `npm audit`, and composition passes every test and the Chrome run on it. It has to be scoped, because `graphql-tag-pluck` needs ^13. Overrides don't reach packages installed by others. | `tested` | `npm audit` and `npm ls @graphql-tools/utils`, on 2026-11-06 |
| W-7 | The values in `packages/design-tokens` are the Frox scale. They haven't been compared with the file's variables from this repository, because the Figma MCP call limit on the Starter plan was reached. | `reported` | [Frox Figma file](https://www.figma.com/design/jWHhIpI52m6ABnQpcTzZkG/Frox_dashboard_v5?node-id=1169-12005) |
| W-8 | Setting `--color-*: initial` in `@theme` removes Tailwind's default palette: `bg-red-500` emits no CSS. | `tested` | Planted class on 2026-11-06 |
| W-9 | `document.fonts.check` returns true when the font hasn't loaded, so a test must read each face's `status`. | `tested` | Planted missing font on 2026-11-06 |
| W-4 | Under jsdom, axe reports colour contrast as `incomplete`, not as a violation, even for `#eee` on `#fff`. In Chromium through Playwright, the same text fails `color-contrast`. | `tested` | Local run and planted violation on 2026-11-06 |
| W-10 | Node 24 refuses to strip types under `node_modules` (`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`), so a TypeScript package can't run once installed from npm. | `tested` | `node:24` on 2026-11-06 |
| W-11 | `gqlPluckFromCodeStringSync` 9.0.9 returns `Source[]`, though its docs say a string. It drops every `${...}`, finds `gql` tags even with no import, `graphql()` calls and `/* GraphQL */` comments, and throws on source it can't parse. `.vue` needs `@vue/compiler-sfc`. | `tested` | `packages/cli/test/extract.test.ts`, 2026-11-06 |
| W-12 | `fs.globSync` in Node 24 expands braces, and `exclude` receives a `Dirent` with `withFileTypes`. | `tested` | `packages/cli/test/source.test.ts`, 2026-11-06 |
| W-13 | Issue comments: `GET` and `POST /repos/{owner}/{repo}/issues/{number}/comments`, with `per_page` up to 100, and `PATCH /repos/{owner}/{repo}/issues/comments/{id}`. The current API version is `2026-03-10`. Comments include `user.type`. | `documented` | [Issue comments](https://docs.github.com/en/rest/issues/comments) |
| W-14 | On `pull_request` from a fork, `GITHUB_TOKEN` is read-only and secrets aren't passed. | `documented` | [Events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows) |
| W-15 | With `pull-requests: write`, `GITHUB_TOKEN` can list, create and update issue comments on a pull request, and the author is `github-actions[bot]`. `git fetch` of a base SHA works in a public repository with `persist-credentials: false`. | `tested` | [Pull request #32](https://github.com/ayenisholah/traverse/pull/32#issuecomment-6683679869), 2026-11-06 |
| W-16 | npm trusted publishing needs `id-token: write`, npm 11.5.1 or later, Node 22.14 or later, a cloud-hosted runner, and a `repository.url` matching the repository. It needs no token, and adds provenance for a public package from a public repository. The trusted publisher is added in the package's settings, so the package must exist first. A new one expires after 2 days without a publish. `npm stage publish` is always allowed, and `npm publish` needs the "Allow npm publish" option. | `documented` | [Trusted publishers](https://docs.npmjs.com/trusted-publishers) |
| W-17 | `node:24` ships npm 11.19.1. | `tested` | `npm --version` on 2026-11-06 |
| W-18 | release-please-action v5 outputs `release_created` for a root component, and `extra-files` entries of type `json` update the field named by `jsonpath`. | `tested` | [Action README](https://github.com/googleapis/release-please-action/blob/v5.0.0/README.md), [customizing](https://github.com/googleapis/release-please/blob/main/docs/customizing.md), and the `0.7.1` release |
| W-19 | `Release-As: x.y.z` in a commit body makes release-please open a pull request for that version. | `documented` | [release-please README](https://github.com/googleapis/release-please/blob/main/README.md) |
| W-20 | `npx @ayenis/traverse@0.7.1` from the registry runs in a clean `node:24` container, exits 0 on the Cosmo demo schemas and 1 on a planted break. `release.yml` published it through the trusted publisher, with SLSA provenance and no runtime dependencies. | `tested` | [Release run](https://github.com/ayenisholah/traverse/actions/runs/42233755838), 2026-11-06 |
| W-21 | `npm publish` in CI warns `No bin file found at dist/bin.js`, because `dist` doesn't exist until `prepack` runs. The published manifest still has `bin`, and the command works. | `tested` | The same run, and the registry manifest of `0.7.1` |
| W-22 | A Pages deployment ID is the commit SHA. Once cancelled, it stays `deployment_cancelled`, and rerunning that run fails within seconds. | `tested` | [Run 42246560098](https://github.com/ayenisholah/traverse/actions/runs/42246560098), attempt 2 |

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
| U-1 | Does the router's S3 provider use Fargate task-role credentials? The docs only name EC2 and EKS. | FR-GW-3 | M7 |
| U-2 | Does the router image contain anything that can run a container health check? | FR-GW-7 | M2 |
| U-3 | What does the router do when the CDN is down at startup, and while running? | FR-GW-3 | M2, M10 |
| U-4 | Is the router's HTTP idle timeout longer than the load balancer's? If not, it must change to avoid 502 errors (A-3). | NFR-2 | M2 |
| U-5 | How is the `Authorization` header forwarded to subgraphs, and how is it configured? | GR-3 | M2 |
| U-6 | What retention, limits and support does the Cosmo free plan give? | FR-OB-2 | Before the first deploy |
| U-7 | Which account route gives multi-Region access and the needed quotas, and at what cost? | NFR-6 | Before M4 |
| U-9 | How are generated operations pushed to Cosmo as persisted operations, and which `wgc` command does it? | FR-WB-12 | M2 |
| U-13 | Do persisted operations from S3, Redis rate limiting and multiple OpenTelemetry exporters work on a self-hosted router on the free plan? | GR-2, FR-GW-5 | M2 |
| U-14 | Does `wgc router compose` need `COSMO_API_KEY`? C-2 and C-26 disagree. | FR-GW-2 | M2 |
| U-15 | Do npm, GitHub and OSV terms allow this use, and what are npm's and OSV's practical rate limits? | FR-SG-6 | M2 |
| U-16 | What shape is the query plan in `extensions`, and does it need dev mode or a token? The docs don't say. | FR-WB-7 | M2 |
| U-17 | Can a third-party app read the Platform API? The docs describe it as used by the CLI and Studio. | FR-WB-1 | M3 |
| U-19 | Which current Claude model does Bedrock offer from the chosen Region, and at what cost? | FR-AI-1 | Before M5 |
| U-21 | Do the values in `packages/design-tokens` match the Figma file's variables exactly? See W-7. | FR-WB-13 | When the Figma call limit resets |

## Answered questions

| ID | Question | Needed by | Answer | Source |
|---|---|---|---|---|
| U-8 | Do `SPEC.md`'s entity definitions compose as written? | FR-SG-5 | Yes. | C-20 |
| U-10 | Does the Frox licence allow derived tokens and components in a public MIT repository? | GR-10 | Partly: the owner confirmed public use. U-18 answers the MIT question. | Owner statement, 2026-11-05, recorded in [ADR 0008](adr/0008-frox-design-system.md) |
| U-11 | Does `@wundergraph/composition` run in a Web Worker, at an acceptable bundle size? | FR-WB-2 | Yes. 240 KB gzipped is acceptable, because it loads in the worker and not on the main thread. | C-27 |
| U-12 | Can field-to-subgraph data be read from composition output? | FR-WB-4 | Yes. | C-20 |
| U-20 | Does `packages/graph-core` run in a Web Worker built by Next.js and Turbopack? | FR-WB-2 | Yes. | C-30 |
| U-18 | Do the Frox terms allow derived tokens in an MIT repository? | GR-10 | Yes: "you can use frox in an MIT license project". The licence text isn't held in this repository. | Owner statement, 2026-11-06, recorded in [ADR 0010](adr/0010-tailwind-radix-frox-scale.md) |

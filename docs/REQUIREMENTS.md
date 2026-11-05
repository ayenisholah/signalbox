# Requirements

**Status:** Draft v1 · **Updated:** 2026-11-05
**Related:** [Specification](../SPEC.md) · [Roadmap](ROADMAP.md) · [Test strategy](TEST_STRATEGY.md)

Every requirement has an ID, a testable acceptance check, how it's verified, the milestone that delivers it and a status. A requirement moves to `done` only when its check has passed and the evidence is recorded. `partial` means some of its check is met so far.

**ID prefixes:** `FR-WEB` web app · `FR-GW` gateway · `FR-SG` subgraphs · `FR-DP` delivery · `FR-OB` observability · `NFR` non-functional · `GR` guardrail.

## Web app

| ID | Requirement | Acceptance check | Verified by | Milestone | Status |
|---|---|---|---|---|---|
| FR-WEB-1 | Browse a business's services. | A signed-in customer sees each service's name, duration and price, and loading, empty and error states all render. | e2e | M2 | planned |
| FR-WEB-2 | Choose an open slot. | Slots for a chosen date appear in the business timezone, including across a daylight-saving change. | e2e | M2 | planned |
| FR-WEB-3 | Book a slot. | A customer books in one flow; a double submit makes one booking; a slot taken meanwhile shows a clear message and fresh slots. | e2e | M2 | planned |
| FR-WEB-4 | View and cancel bookings. | A customer sees their bookings, and a cancelled booking's slot becomes available again. | e2e | M2 | planned |
| FR-WEB-5 | Sign in through Cognito. | Sign-in uses authorization code with PKCE, sessions expire and refresh, and signing out ends the session. | e2e | M2 | planned |
| FR-WEB-6 | Use generated, typed operations. | Every operation the app sends is a persisted operation generated from its documents, and a schema mismatch fails the build. | contract | M2 | planned |
| FR-WEB-7 | Build the UI from one design system. | Components use semantic tokens only, generated from one source, and each has state tests and an accessibility check. | unit | M2 | planned |
| FR-WEB-8 | Serve the web app from AWS. | The app runs on Fargate behind the load balancer and deploys without failed requests. | staging | M4 | planned |

## Gateway

| ID | Requirement | Acceptance check | Verified by | Milestone | Status |
|---|---|---|---|---|---|
| FR-GW-1 | Serve the federated graph over HTTPS. | An authenticated persisted operation returns data from all 3 subgraphs; plain HTTP redirects to HTTPS. | e2e | M4 | planned |
| FR-GW-2 | Reject invalid or missing JWTs. | Expired, wrong-audience, wrongly signed and missing tokens are refused and reach no subgraph. | e2e | M1 | planned |
| FR-GW-3 | Keep serving if the Cosmo CDN is unavailable. | With the CDN blocked, running tasks and newly started tasks serve the last good configuration. | resilience | M7 | planned |
| FR-GW-4 | Limit request cost. | Operations over the depth or field limits, and bodies over the size limit, are rejected. | e2e | M1 | planned |
| FR-GW-5 | Rate limit each client. | A client over its limit is rejected while other clients are unaffected. | e2e | M4 | planned |
| FR-GW-6 | Filter hostile traffic at the edge. | A request matching a managed WAF rule or the rate rule is blocked before it reaches the router. | staging | M3 | planned |
| FR-GW-7 | Report health accurately. | `/health/ready` fails while the router can't serve or is draining, and load balancer targets follow it. | staging | M4 | planned |
| FR-GW-8 | Drain before stopping. | On SIGTERM the task finishes in-flight requests before it exits, inside `stopTimeout`. | staging | M4 | planned |

## Subgraphs

| ID | Requirement | Acceptance check | Verified by | Milestone | Status |
|---|---|---|---|---|---|
| FR-SG-1 | Scope all data access by business. | A token for business A can't read or change business B's data through any operation. | integration | M1 | planned |
| FR-SG-2 | `catalog` serves businesses and services. | `services` returns only the caller's services, with prices in integer cents. | integration | M1 | planned |
| FR-SG-3 | `availability` serves open slots. | `Service.slots` returns slots inside opening hours and excludes booked slots, including across a daylight-saving change. | integration | M1 | planned |
| FR-SG-4 | `bookings` creates and cancels bookings. | `createBooking` confirms a free slot, and `cancelBooking` frees it. | integration | M1 | planned |
| FR-SG-5 | A slot can't be double-booked. | Concurrent `createBooking` calls for one slot produce exactly one booking. | integration | M1 | planned |
| FR-SG-6 | Retried mutations have no second effect. | A repeated `createBooking` with the same idempotency key returns the first booking. | integration | M1 | planned |
| FR-SG-7 | Every subgraph shares one kit. | A new subgraph gets health, auth context, logging and shutdown by supplying only a schema and resolvers. | unit | M1 | planned |
| FR-SG-8 | Migrations are safe during rollout. | The previous release's tests pass against the migrated schema. | integration | M4 | planned |

## Delivery

| ID | Requirement | Acceptance check | Verified by | Milestone | Status |
|---|---|---|---|---|---|
| FR-DP-1 | Block breaking schema changes. | A pull request removing a used field fails `wgc subgraph check`. | CI | M6 | planned |
| FR-DP-2 | Roll back failed deploys automatically. | A failing image returns to the previous task set with no manual step. | staging | M6 | planned |
| FR-DP-3 | Production needs staging proof and approval. | A production deploy can't start until staging smoke tests pass and an owner approves. | CI | M6 | planned |
| FR-DP-4 | Deploys use short-lived credentials. | The deploy role trusts only this repository and environment through OIDC. | infrastructure | M6 | planned |
| FR-DP-5 | Images are pinned and scanned. | Task definitions reference digests in ECR, and a failed scan stops the release. | infrastructure | M4 | planned |
| FR-DP-6 | Releases run in a safe order. | The pipeline migrates, deploys subgraphs, then publishes schemas, and stops at the first failure. | CI | M6 | planned |
| FR-DP-7 | Every pull request passes all quality gates. | A planted violation fails each gate, and CI is required on `main`. | CI | M0 | partial |
| FR-DP-8 | Every change traces to a requirement. | A check fails on an unknown ID, a `done` requirement with no evidence, or a roadmap branch with no requirement. | unit | M0 | planned |
| FR-DP-9 | Agents work from verified facts. | `AGENTS.md` and project skills define the sources of truth, and each Cosmo and AWS claim has a recorded source. | review | M0 | planned |

## Observability

| ID | Requirement | Acceptance check | Verified by | Milestone | Status |
|---|---|---|---|---|---|
| FR-OB-1 | Trace every sampled request end to end. | One trace spans load balancer, router, subgraph and database. | staging | M5 | planned |
| FR-OB-2 | Export router metrics. | Request rate, errors and latency appear in CloudWatch and Studio. | staging | M5 | planned |
| FR-OB-3 | Show service health at a glance. | Dashboards cover traffic, latency, errors, saturation and data stores for each environment. | staging | M5 | planned |
| FR-OB-4 | Alert on user impact. | A forced failure raises its alarm and reaches the owner, and every alarm links to a runbook. | staging | M5 | planned |
| FR-OB-5 | Identify API clients. | Studio separates usage by client name and version. | staging | M5 | planned |
| FR-OB-6 | Write structured logs. | Every service logs JSON with a trace ID. | unit | M1 | planned |

## Non-functional

| ID | Requirement | Acceptance check | Verified by | Milestone | Status |
|---|---|---|---|---|---|
| NFR-1 | Meet the availability and latency SLOs. | A load test at 2× expected peak stays within the targets in [SLOs](SLOS.md). | load | M7 | planned |
| NFR-2 | Deploy without failed requests. | A rolling deploy under load shows no 5xx responses. | load | M7 | planned |
| NFR-3 | Scale with demand. | Under rising load, tasks scale out before latency leaves its target, then scale back. | load | M7 | planned |
| NFR-4 | Survive the loss of an Availability Zone. | With one zone disrupted, the service stays within its availability target. | resilience | M7 | planned |
| NFR-5 | Recover data within targets. | A restore from backup meets the RPO and RTO in [SLOs](SLOS.md). | resilience | M7 | planned |
| NFR-6 | Keep costs visible. | Budget alerts exist before the first deployment, and the launch records a measured cost baseline. | infrastructure | M3 | planned |
| NFR-7 | Encrypt data at rest and in transit. | Stores use KMS encryption, and connections to data stores require TLS. | infrastructure | M3 | planned |
| NFR-8 | Operate from runbooks. | Each alarm's runbook has been followed once in staging. | staging | M8 | planned |
| NFR-9 | Meet WCAG 2.2 AA. | axe finds no violations on any route, every flow works by keyboard, and token contrast pairs pass in both themes. | e2e | M2 | planned |
| NFR-10 | Scale with the user's font size. | Styles use rem, em and % only, and a check rejects `px`. | CI | M2 | planned |
| NFR-11 | Load quickly. | Largest Contentful Paint stays under 2.5 seconds at the 75th percentile on staging. | load | M7 | planned |

## Guardrails

Guardrails are enforced by tests or policy, never by convention alone.

| ID | Requirement | Acceptance check | Verified by | Milestone | Status |
|---|---|---|---|---|---|
| GR-1 | Production never enables dev mode, playground, introspection, query plans or wildcard CORS. | A test parses the production router config and fails on each setting, proven with a planted violation of each. | unit | M1 | planned |
| GR-2 | Production runs persisted operations only. | A non-persisted operation is rejected. | e2e | M1 | planned |
| GR-3 | The business ID comes from the verified JWT, never client input. | No operation accepts a business ID, and a forged header has no effect. | integration | M1 | planned |
| GR-4 | GraphQL variables, personal data and secrets never reach logs or telemetry. | Variables sent in a test request appear in no log, span or metric. | e2e | M5 | planned |
| GR-5 | No long-lived AWS keys anywhere. | A CDK test rejects IAM users and access keys, and CI holds no AWS secrets. | infrastructure | M3 | planned |
| GR-6 | All infrastructure comes from CDK. | Scheduled drift detection reports no differences. | infrastructure | M6 | planned |
| GR-7 | Breaking schema changes can't merge. | The schema check is a required status on `main`. | CI | M6 | planned |
| GR-8 | Production changes only through the approved pipeline. | Only the pipeline role can change production services. | infrastructure | M6 | planned |
| GR-9 | Browser code can't read auth tokens or secrets. | Tokens live in `HttpOnly`, `Secure` cookies, and the client bundle contains no secrets. | e2e | M2 | planned |
| GR-10 | Licensed design assets enter the repository only after their licence is confirmed. | A written record of the licence check exists before any Frox-derived file is merged. | review | M2 | planned |

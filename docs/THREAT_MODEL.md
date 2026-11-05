# Threat model

**Status:** Draft v1. Controls are planned until their requirement is `done`.

## Assets

- Tenant data in Postgres.
- Signing trust: the JWT keys and the Cosmo router token.
- The deploy path: GitHub workflows, the OIDC role and images.
- Router configuration, which decides what the API exposes.

## Trust boundaries

1. The internet to the load balancer.
2. The router to subgraphs.
3. Subgraphs to data stores.
4. GitHub to AWS.
5. AWS to Cosmo Cloud, for config in and telemetry out.

## Threats and controls

| Threat | Control | Requirement |
|---|---|---|
| A tenant reads another tenant's data | Tenant from the verified token only; every query scoped; property tests | FR-SG-1, GR-3 |
| A forged tenant header reaches a subgraph | Subgraphs verify the token themselves, and security groups admit only the router | GR-3 |
| Arbitrary queries probe or overload the API | Persisted operations only; complexity, size and rate limits; WAF | GR-2, FR-GW-4, FR-GW-5, FR-GW-6 |
| Schema discovery by attackers | Introspection and playground off in production | GR-1 |
| Stolen or expired tokens | Short token lifetime; audience, expiry and signature checks | FR-GW-2 |
| A compromised router image | Digest pinning, ECR mirror, scanning | FR-DP-5 |
| Stolen deploy credentials | OIDC only, limited to this repository and environment | GR-5, FR-DP-4 |
| A malicious or faulty schema change | Required schema check and review | GR-7, FR-DP-1 |
| Sensitive data leaves through telemetry | Variables never exported; attributes reviewed | GR-4 |
| Cosmo Cloud is unavailable or compromised | S3 fallback config; only schema and telemetry cross the boundary | FR-GW-3 |
| Script injection steals a session | Tokens in `HttpOnly` cookies, Content Security Policy, React escaping | GR-9 |
| Cross-site request forgery | `SameSite` cookies and origin checks on mutations | GR-9 |
| Manual change weakens production | CDK only, drift detection, pipeline-only access | GR-6, GR-8 |
| A dependency is compromised | Lockfile, Dependabot, audit in CI, pinned actions | FR-DP-7 |
| Secrets committed to the public repository | Secret scanning in hooks and CI | FR-DP-7 |

## Accepted risks

- A Region-wide AWS outage stops the service, because multi-Region failover is out of scope.
- Cosmo Cloud holds the schema and sampled telemetry. Traverse treats its schema as public.

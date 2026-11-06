# Threat model

**Status:** Draft v1. Controls are planned until their requirement is `done`.

## Assets

- Users' saved workspaces in Postgres.
- The GitHub token used by the `repositories` subgraph.
- Signing trust: the JWT keys and the Cosmo router token.
- The deploy path: GitHub workflows, the OIDC role and images.
- Router configuration, which decides what the API exposes.

## Trust boundaries

1. The internet to the load balancer.
2. The router to subgraphs.
3. Subgraphs to data stores.
4. GitHub to AWS.
5. AWS to Cosmo Cloud, for config in and telemetry out.
6. The browser to the web server, over tRPC.
7. The web server to the sandbox router.
8. Subgraphs to npm, GitHub and OSV.
9. The web server to Amazon Bedrock.

## Threats and controls

| Threat | Control | Requirement |
|---|---|---|
| A user reads another user's workspace | User from the verified token only; every query scoped; property tests | FR-SG-1, GR-3 |
| A forged user header reaches a subgraph | Subgraphs verify the token themselves, and security groups admit only the router | GR-3 |
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
| The sandbox router is reached or abused | No public route, read-only, rate limited, called only by the web server | GR-11 |
| A pasted schema contains hostile content | Parsed as data in a Web Worker, rendered escaped, and kept in the browser unless saved | FR-WB-2 |
| Upstream text carries script or instructions | Rendered escaped, and treated as data in prompts | GR-13 |
| Prompt injection steers the assistant | Output validated before it's shown, and it can't reach the graph or a mutation | GR-12, GR-13 |
| The assistant runs up cost | Per-session limits and a spend alarm | GR-15 |
| A GitHub token leaks | Read-only, held in Secrets Manager, used only on the server | FR-SG-3, GR-9 |
| An upstream outage or rate limit takes the app down | Caching, retries and clear partial results | FR-SG-6 |

## Accepted risks

- A Region-wide AWS outage stops the service, because multi-Region failover is out of scope.
- Cosmo Cloud holds the schema and sampled telemetry. Traverse treats its schema as public.

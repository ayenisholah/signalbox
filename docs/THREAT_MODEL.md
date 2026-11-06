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
10. A pull request to the Traverse Action, which reads its files and writes a public comment.

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
| A pull request's `traverse.json` or symlinks read files outside the repository into a public comment | Config paths and patterns are validated, matches outside the root are dropped, symlinks are resolved, and only GraphQL files can be schemas, because a parse error quotes the file | FR-WB-5 |
| Operation names or errors forge a comment or log line, hide content or mention people | All pull request text is escaped, including HTML, formatting and `@`, and line breaks and format characters are removed from every report. The marker can't be forged, and only `github-actions[bot]` comments are updated | FR-WB-5, GR-13 |
| A pull request runs code through the check | Source is parsed and never run, git runs with no shell, refs are resolved first, and `safe.bareRepository=explicit` stops a committed directory acting as a repository. Install scripts are off, and the Action's docs forbid `pull_request_target` | FR-WB-5, GR-13 |
| A pull request hides a break from the check | The base's patterns still apply, clashing fragments stop the check, symlinks and build directories stay in, a git fault can't read as a missing file, and `--strict` fails on anything unchecked | FR-WB-5, GR-7 |
| The comment token leaks | Only the comment step receives it, a fork's token is read-only, and this repository's checkout keeps no credential | FR-WB-5, GR-4 |
| A request exhausts a subgraph or blocks its shutdown | A 1 MB body limit, a parser token limit, only `POST /graphql` routed, and a forced close after a bounded wait | FR-SG-7 |
| A client's text or a secret reaches subgraph logs | Paths, aliases, messages and stacks aren't logged, and the shared logger drops sensitive fields itself | GR-4, FR-OB-6 |
| A subgraph trusts a claim it shouldn't | Tokens are verified again, with algorithm, audience, issuer, `exp` and `sub` checks, and `sub` must be a non-empty string | GR-3 |
| A pasted schema contains hostile content | Parsed as data in a Web Worker, rendered escaped, and kept in the browser unless saved | FR-WB-2 |
| Upstream text carries script or instructions | Rendered escaped, and treated as data in prompts | GR-13 |
| Prompt injection steers the assistant | Output validated before it's shown, and it can't reach the graph or a mutation | GR-12, GR-13 |
| The assistant runs up cost | Per-session limits and a spend alarm | GR-15 |
| A GitHub token leaks | Read-only, held in Secrets Manager, used only on the server | FR-SG-3, GR-9 |
| An upstream outage or rate limit takes the app down | Caching, retries and clear partial results | FR-SG-6 |

## Accepted risks

- A Region-wide AWS outage stops the service, because multi-Region failover is out of scope.
- Cosmo Cloud holds the schema and sampled telemetry. Traverse treats its schema as public.
- The Traverse Action reports on what a pull request contains. It can't see an operation moved outside every pattern, or a tag from an unrecognised package. In this repository a pull request also runs its own copy of the Action, so the check gates nothing until GR-7's required check exists.
- Bare URLs in a name stay clickable in a pull request comment.
- Subgraphs keep introspection on, because `_service` exposes their SDL anyway and only the router can reach them.

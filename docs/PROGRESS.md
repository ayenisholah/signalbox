# Progress

**Updated:** 2026-11-06

Read this first. It says what's done, what's in progress and what's left, so any agent can resume after a session ends unexpectedly. Update it in the same commit as the work.

## Direction

The project is changing from a customer booking app to **Traverse**, a tool for frontend developers to explore a federated graph: which subgraphs a query touches, and what a schema change breaks. The repository is still named Signalbox, and `SPEC.md`, the requirements and the roadmap still describe the booking app until `docs/workbench-direction` lands. Where they disagree with this section, this section is newer.

- **Core use:** a CLI and GitHub Action read a repository's operations, compose the proposed schema with `@wundergraph/composition`, and report broken operations and screens. Web screens: graph map, operation route, impact.
- **Data:** real throughout. Subgraphs serve live npm, GitHub and OSV data, plus a `workspace` subgraph. The booking domain goes. Tests replay recorded real responses.
- **Stack:** Next.js, React, TypeScript, Tailwind, Radix with the Frox scale, tRPC, Zustand.
- **Kept:** the Cosmo Router, the AWS plan and all guardrails. A separate internal sandbox router serves query plans and free-form operations, so GR-1 and GR-2 stay intact on the public router.
- **AI:** an optional Amazon Bedrock assistant explains results. Model output is validated before it's shown, and the tool works fully without it.
- **Cosmo plan:** no paid plan. Self-hosted router, and the free Developer plan for the registry and Studio.

## Done

| Date | Work | PR |
|---|---|---|
| 2026-11-05 | Repository tooling and README | #1, #2 |
| 2026-11-05 | Specification, requirements and project documents | #3 |
| 2026-11-05 | `AGENTS.md` and `CLAUDE.md` | #4 |
| 2026-11-05 | Quality gates, CI, CodeQL, Dependabot and release-please | #5 |
| 2026-11-05 | Repository setting: GitHub Actions can create pull requests | none |

## In progress

| Branch | State |
|---|---|
| `docs/progress-log` | This log, `check:progress`, and the `AGENTS.md` rule. FR-DP-9. |

## Next

In order:

1. `chore/rename-to-traverse`: rename packages, config and docs. After merge, rename the GitHub repository (confirm first) and update `origin`. Move the local folder last, in its own session.
2. `ci/release-fixes`: add `CHANGELOG.md` to `.prettierignore`, group Vitest updates, ignore `@types/node` majors, and document running CI on release pull requests with `gh workflow run ci.yml --ref <branch>`, proving it on #6. Then merge #6, add `verify` to the `protect-main` ruleset (owner approved), and confirm it's active.
3. `docs/workbench-direction`: rewrite the specification, requirements, roadmap, plans, ADRs, threat model, data privacy, verified facts and README for the new direction. Mark FR-DP-7 done.
4. `chore/agent-skills`: only skills usable today, finishing M0.
5. M1, the public demo and CLI: `chore/web-tooling`, `feat/graph-core`, `feat/design-tokens`, `feat/graph-map`, `feat/impact-check`, `feat/impact-cli`, `ci/demo-deploy`.

## Blocked

| Item | Waiting on | Blocks |
|---|---|---|
| AWS account setup | Owner | Cognito, Bedrock and every AWS milestone. Not the public demo. |
| Frox licence for derived files in an MIT repository | Owner's confirmation of the exact terms | `feat/design-tokens` |
| Dependabot #8, #9 and #11 | Decision on Vitest 5 and TypeScript 7, which fail CI | Nothing yet |

## Notes for the next session

- Generate `package-lock.json` in a `node:24` container. Older npm drops optional `@emnapi` entries, and `npm ci` then fails in CI.
- Before pushing, run `npm ci` and `npm run check` on a clean clone in `node:24`, and stop if either fails.
- Force-pushes need the owner's approval or the owner's own terminal.

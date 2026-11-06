# Progress

**Updated:** 2026-11-06

Read this first. It says what's done, what's in progress and what's left, so any agent can resume after a session ends unexpectedly. Update it in the same commit as the work.

## Direction

Traverse is built on WunderGraph Cosmo and helps frontend developers explore a federated graph. `SPEC.md` describes the target, and the [roadmap](ROADMAP.md) lists every branch.

## Done

| Date | Work | PR |
|---|---|---|
| 2026-11-05 | Repository tooling and README | #1, #2 |
| 2026-11-05 | Specification, requirements and project documents | #3 |
| 2026-11-05 | `AGENTS.md` and `CLAUDE.md` | #4 |
| 2026-11-05 | Quality gates, CI, CodeQL, Dependabot and release-please | #5 |
| 2026-11-05 | Repository setting: GitHub Actions can create pull requests | none |
| 2026-11-06 | Progress log and `check:progress` | #12 |
| 2026-11-06 | dependency-cruiser 18 | #7 |
| 2026-11-06 | Closed #8 and #9 (Vitest 5 needs both together), #10 (stay on Node 24 types), #11 (typescript-eslint rejects TypeScript 7) | none |
| 2026-11-06 | Renamed the project and GitHub repository to Traverse | #14 |
| 2026-11-06 | Release fixes, and `verify` required on `main`, which finishes FR-DP-7 | #16 |
| 2026-11-06 | Traverse specification, requirements, roadmap and README | #18 |
| 2026-11-06 | Released `v0.2.0` | #15 |
| 2026-11-06 | Project skills, guardrail reviewer and `main` guard. M0 is done. | `chore/agent-skills` |
| 2026-11-06 | Closed #17: the Vitest group left out `@vitest/coverage-v8`. Update both by hand when needed. | none |
| 2026-11-06 | Closed release #13, replaced by #15 after the package rename | none |
| 2026-11-06 | Closed release #6: `verify` failed on generated `CHANGELOG.md` and `.release-please-manifest.json` formatting | none |
| 2026-11-06 | Moved the local folder to `/home/titan/projects/traverse` | none |
| 2026-11-06 | Owner confirmed Frox can be used in an MIT project, which answers U-18 | `chore/web-tooling` |

## In progress

`chore/web-tooling` (FR-WB-13): the `apps/web` workspace, with the gates extended to `apps/` and `.tsx`.

## Next

In order:

1. M1, the public demo and CLI, in this order: `feat/graph-core`, `feat/design-tokens`, `feat/graph-map`, `feat/impact-check`, `feat/impact-cli`, `ci/demo-deploy`. Test U-11 first, in `feat/graph-core`.

## Blocked

| Item | Waiting on | Blocks |
|---|---|---|
| AWS account setup | Owner | Cognito, Bedrock and every AWS milestone. Not the public demo. |

## Notes for the next session

- Generate `package-lock.json` in a `node:24` container. Older npm drops optional `@emnapi` entries, and `npm ci` then fails in CI.
- Before pushing, run `npm ci` and `npm run check` on a clean clone in `node:24`, and stop if either fails.
- Release pull requests get no CI until closed and reopened, and again after each update.
- The first risk to test in M1 is U-11: composition in a browser Web Worker. It's proven in Node.
- Merge pull requests with `gh pr merge --rebase --delete-branch` once checks pass on the current commit.
- Force-pushes need the owner's approval or the owner's own terminal.
- Shell commands run in zsh, where an unquoted `$VAR` doesn't split into words. After a bulk edit, confirm the result with a search, not an exit code.

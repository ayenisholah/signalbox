# Verification

**Updated:** 2026-11-05

This file records proof that isn't a named test. Each gate below was run on a clean tree, where it passed, and then on a planted violation, where it failed. Exit codes were checked one at a time.

## Quality gates (FR-DP-7)

| Gate | Command | Planted violation | Result |
|---|---|---|---|
| Format | `npm run format:check` | Misformatted file | Exit 1, file named |
| Lint | `npm run lint` | `console.log` in package source | Exit 1, `no-console` |
| Types | `npm run typecheck` | String assigned to a number | Exit 2, `TS2322` |
| Boundaries | `npm run check:deps` | Subgraph importing a subgraph | Exit 1, `subgraphs-do-not-import-subgraphs` |
| Boundaries | `npm run check:deps` | Package importing a subgraph | Exit 1, `packages-stay-inward` |
| Boundaries | `npm run check:deps` | Import of a package's internals | Exit 1, `no-deep-package-imports` |
| Boundaries | `npm run check:deps` | Circular import | Exit 1, `no-circular` |
| Boundaries | `npm run check:deps` | Node built-in in `packages/domain` | Exit 1, `domain-has-no-io` |
| Duplication | `npm run check:dupes` | Copied source file | Exit 1, one clone |
| Unused code | `npm run check:unused` | Orphan file | Exit 1, file named |
| Unused code | `npm run check:unused` | Unused export | Exit 1, export named |
| Hygiene | `npm run check:hygiene` | Focused test, unticketed TODO, unexplained disable, `any`, coverage exclusion, attribution line | Exit 1, each one reported |
| Traceability | `npm run check:traceability` | Unknown requirement ID | Exit 1, ID and line named |
| Traceability | `npm run check:traceability` | `done` requirement with no evidence | Exit 1, requirement named |
| Traceability | `npm run check:traceability` | Roadmap branch with no requirement | Exit 1, branch named |
| Progress log | `npm run check:progress` | Branch with work and no progress update | Exit 1, log named |
| Coverage | `npm run test:coverage` | Uncovered function | Exit 1, below the 100% per-file threshold |
| Tests | `npm test` | Changed behaviour | Exit 1, tests failed |
| Tests | `CI=1 npm test` | Test marked `.only` | Exit 1, `.only` refused |
| Commit messages | `npx commitlint` | Attribution line, filler subject, schedule label | Exit 1, each rule reported |
| Secrets | `gitleaks` 8.24.3 over full history | Committed AWS key and GitHub token | Exit 1, two leaks found |
| Dependencies | `npm audit --omit=dev --audit-level=high` | Project depending on `lodash` 4.17.20 | Exit 1 |

The traceability run first passed on the `done` plant, because a test fixture named a real ID and counted as evidence. Fixtures now use a prefix no real requirement has.

Still to prove: CI as a required check on `main`, which needs this workflow to have run first.

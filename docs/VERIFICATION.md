# Verification

**Updated:** 2026-11-06

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

## Web gates (FR-WB-13)

Run on 2026-11-06 in a clean clone in `node:24`, with each violation planted in `apps/web`.

| Gate | Command | Planted violation | Result |
|---|---|---|---|
| Lint | `npm run lint` | Conditional hook in `.tsx` | Exit 1, hook rule reported |
| Lint | `npm run lint` | `<img>` element | Exit 1, through `--max-warnings 0` |
| Hygiene | `npm run check:hygiene` | `any` in `apps/web/src` | Exit 1, file and line named |
| Boundaries | `npm run check:deps` | `.tsx` importing a package's internals | Exit 1, `no-deep-package-imports` |
| Unused code | `npm run check:unused` | Orphan `.tsx` file | Exit 1, file named |
| Duplication | `npm run check:dupes` | Copied `.tsx` files | Exit 1, two clones |
| Coverage | `npx vitest run --coverage` | Uncovered branch in `page.tsx` | Exit 1, 50% branches, file named |
| Accessibility | `npx vitest run --project web` | Image with no alt text | Exit 1, `image-alt` |
| Types | `npm run typecheck` | Type error in `apps/web/src` | Exit 2, TS2322 |
| Web build | `npm run build:web` | Import of a missing file | Exit 1, module not found |
| Web build | `npm run build:web` | Server-only route | Exit 1, refused under `output: "export"` |

The `<img>` plant first passed, because the Next rules only warn. `npm run lint` now fails on warnings.

## Browser and integration gates (NFR-9)

Run on 2026-11-06 in a clean clone in `node:24`, against a rebuilt static export. Chromium came from `npx playwright install --with-deps chromium`.

| Gate | Command | Planted violation | Result |
|---|---|---|---|
| Integration | `npm run test:integration` | Page with no heading | Exit 1, test named |
| End to end | `npm run test:e2e` | `#eee` text on `#fff` | Exit 1, `color-contrast` |
| End to end | `npm run test:e2e` | Empty stylesheet | Exit 1, one test failed |
| End to end | `npm run test:e2e` | `console.error` in the browser | Exit 1, one test failed |
| End to end | `npm run test:e2e` | `test.only` | Exit 1, refused by `forbidOnly` |
| Hygiene | `npm run check:hygiene` | `test.only` in `apps/web/test/e2e` | Exit 1, file and line named |

The contrast plant passed the jsdom axe test with exit 0, then failed in Playwright. That matches W-4.

## Agent rules (FR-DP-9)

`AGENTS.md` sets the order of truth and accuracy rules, the `verify-fact` skill defines how a claim is checked and recorded, and `docs/VERIFIED_FACTS.md` records each Cosmo, AWS and upstream claim with a source and status. Reviewed on 2026-11-06.

`.claude/hooks/block-main.sh` was run against 12 commands. It blocked commits and pushes from a `main` checkout, and pushes to `main` from a branch, including `git -C`. It allowed feature branch work, including a command that mentions `main` outside the push. The first version failed two of these cases: a false positive on any such mention, and a bypass through `git -C`.

## Required checks (FR-DP-7)

`verify` is a required status check in the `protect-main` ruleset. `gh api repos/ayenisholah/traverse/rules/branches/main` lists it, alongside the pull request, linear history, deletion and force-push rules. On 2026-11-06, release #15 showed as mergeable with the rule active, after a passing `verify`.

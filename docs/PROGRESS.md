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
| 2026-11-06 | Impact check at `/impact`: edit a draft, compose it in a Web Worker, and see the fields, operations and screens it breaks. Answers U-20. | `feat/impact-check` |
| 2026-11-06 | Searchable graph map at `/`, on the Cosmo demo schemas, by keyboard. Composition runs ahead of time into `apps/web/src/generated/demo-graph.json`. | `feat/graph-map` |
| 2026-11-06 | `packages/design-tokens`: the Frox scale as semantic tokens and a Tailwind theme, with Poppins, contrast checks in both themes, and gates against `px` and raw colours. | `feat/design-tokens` |
| 2026-11-06 | README badges and a quality gates table, at the owner's request. The coverage badge shows the enforced gate, because a live one needs a service account. | `docs/readme-status` |
| 2026-11-06 | `packages/graph-core`: composition, field ownership and impact analysis, proven on the Cosmo demo schemas and in a Chrome Web Worker. Answers U-11. | `feat/graph-core` |
| 2026-11-06 | Integration and Playwright layers, and the testing rule in `AGENTS.md`, at the owner's request. Pulled forward from M3. NFR-9 stays planned until every route is covered. | `test/web-e2e` |
| 2026-11-06 | `apps/web` on Next.js, Tailwind and Radix, with every gate extended to `apps/` and `.tsx`. FR-WB-13 stays planned until `feat/design-tokens`. | `chore/web-tooling` |

## In progress

`feat/impact-cli` (FR-WB-5): the CLI, the Action and `traverse.json` are built and tested locally. The guardrail review is done and its findings are fixed. Next: a clean-clone `npm run check`, the pull request, and the real pull request proof. That proof is a throwaway pull request into this branch, closed unmerged. FR-WB-5 stays planned until it passes.

## Next

In order:

1. `ci/npm-publish`, with a new requirement for it: a bundled, dependency-free `@ayenisholah/traverse`, published by trusted publishing. See the notes below.
2. Owner: confirm the npm account `ayenisholah`, run the first publish, and add the trusted publisher for `release.yml`.
3. Close and reopen release pull request #30 for CI, then merge it. Hold it until step 2 is done, or the publish job fails on it.
4. `ci/demo-deploy`. Confirm with the owner before enabling Pages.

## Blocked

| Item | Waiting on | Blocks |
|---|---|---|
| AWS account setup | Owner | Cognito, Bedrock and every AWS milestone. Not the public demo. |

## Notes for the next session

- Generate `package-lock.json` in a `node:24` container. Older npm drops optional `@emnapi` entries, and `npm ci` then fails in CI.
- Before pushing, run `npm ci` and `npm run check` on a clean clone in `node:24`, and stop if either fails.
- Release pull requests get no CI until closed and reopened, and again after each update.
- `apps/web` uses `eslint-plugin-react-hooks` and `@next/eslint-plugin-next` directly, not `eslint-config-next` (W-3).
- axe can't check contrast under jsdom, but the Playwright run can (W-4).
- The design source is the [Frox Figma file](https://www.figma.com/design/jWHhIpI52m6ABnQpcTzZkG/Frox_dashboard_v5?node-id=1169-12005). Compare `packages/design-tokens` with its variables when the MCP call limit resets (U-21).
- After changing `packages/design-tokens`, run `npm run generate:tokens`. A test fails if the CSS is stale.
- Add a contrast pair for each new token that carries text. The theme follows the OS setting, and there's no toggle yet.
- `vite preview` serves the export for Playwright. `serve` was rejected: its `compression` dependency has a high severity advisory.
- dependency-cruiser refuses local Node 25, so run the gates in `node:24`.
- `npm audit` reports 10 moderate `minimatch` findings through ESLint. They're dev-only, and CI audits production dependencies at high.
- Cosmo demo schemas are in `packages/graph-core/test/fixtures/cosmo-demo`, copied from tag `router@0.366.1`.
- `graph-core` must not pass composition's class instances to `graphql` (W-5). Print or read AST nodes instead.
- `graph-core` looks at field changes. Removed enum values and union members only show up if validation fails, which `feat/impact-check` should revisit.
- Remove the `@graphql-tools/utils` override in `package.json` once composition depends on a fixed version (W-6). After editing overrides, confirm the package is present before trusting `npm audit`: a missing package audits clean.
- `ci/npm-publish` must bundle: Node can't strip types under `node_modules` (W-10), and overrides don't reach consumers, so a package depending on composition would hand them the W-6 advisories. Inline every dependency and include their licence notices. Trusted publishing needs `id-token: write`, npm 11.5.1 or later, and an exact `repository.url`.
- The owner chose to read inline `gql` tags as well as `.graphql` files. Tags left unreadable by `${...}` are listed as "Couldn't be checked" and only fail with `--strict`, which this repository's workflow sets. A tag that still parses is checked as written, so interpolated selections aren't seen.
- The impact check can't block a merge yet: only `verify` is required on `main`, and a pull request here runs its own copy of the Action through `uses: ./`. `ci/schema-checks` (GR-7) is where that gets decided, and it needs the owner, because it's a repository setting.
- The Action uses `GITHUB_TOKEN` only, because comments are matched on the `github-actions[bot]` login.
- The Cosmo demo schemas define no owners, so the map shows "No owner set". The owner chose a config file, filled in by each team and kept in their repository, which `packages/cli` reads as `traverse.json`. A global store of owners was rejected: names aren't unique, ownership is private, and nobody could verify entries. Never invent owners.
- FR-WB-1 is marked done, but no real owner has appeared on screen yet, and the map doesn't read `traverse.json`. Check whether Cosmo labels or `CODEOWNERS` could replace the config file.
- The map is a keyboard-first list, not a React Flow canvas. `SPEC.md` still lists React Flow, so the owner should decide whether a visual canvas is wanted.
- After changing `graph/cosmo-demo` or `packages/graph-core`, run `npm run generate:demo`. A test fails if the data is stale.
- CI on `main` took 9 minutes once, on `b04b7d8`, against 1 to 2 minutes usually. Watch for a repeat.
- The impact check uses a plain `<textarea>`, not Monaco. `SPEC.md` still lists Monaco, and its React wrapper loads from a CDN by default, so the owner should decide.
- An unresolved CodeQL review thread blocks a merge even when every check passes, because `protect-main` requires threads to be resolved. Fix the finding, don't use `--admin`.
- Messages to a dedicated worker have an empty `origin`, and `compose.worker.ts` relies on that.
- The page must import only types from `graph-core`. A Playwright test fails if the composer reaches the map page.
- Merge pull requests with `gh pr merge --rebase --delete-branch` once checks pass on the current commit.
- Force-pushes need the owner's approval or the owner's own terminal.
- Shell commands run in zsh, where an unquoted `$VAR` doesn't split into words. After a bulk edit, confirm the result with a search, not an exit code.

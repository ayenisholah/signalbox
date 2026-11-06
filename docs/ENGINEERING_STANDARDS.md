# Engineering standards

These rules keep the code modular and reusable. Where a tool enforces a rule, it's named. Tools not yet in the repository arrive with `ci/quality-gates`.

## Modularity

- One responsibility per module. Functions stay under 60 lines, with complexity under 10 (ESLint).
- `packages/domain` is pure logic with no I/O. Time, IDs and data are passed in as arguments.
- Packages never import subgraphs or infrastructure, and subgraphs never import each other (dependency-cruiser).
- Import a workspace through its entry point, never its internals.
- Entrypoints only wire things together. Logic lives in the modules they call.

## Reuse

- Search `packages/` before writing a helper.
- Move code to a shared package on its second real use, not in anticipation of one.
- Duplicated blocks fail CI (jscpd), and so do unused files, exports and dependencies (knip).
- Infrastructure patterns live in tested constructs. Environment differences live in validated config, not in conditionals inside a construct.

## Dependency injection

Pass collaborators in as arguments, typed by the narrowest interface needed. Tests use small fakes, not module mocks.

## Validation and errors

- Validate at every boundary with Zod: environment, tokens, GraphQL inputs and config.
- Parse once, then use the typed result.
- Expected outcomes are returned values. Throw only for faults.
- Errors returned to clients never expose internals.

## Data

- Money is integer cents. Timestamps are UTC instants.
- Every query on workspace data is scoped by user, using the verified identity.
- Migrations follow the [release process](RELEASE_PROCESS.md).

## Logging

Structured JSON only, through the shared logger, with a trace ID. Never log GraphQL variables, personal data or secrets.

## Naming

- Files are lowercase kebab-case, types are `PascalCase`, and functions and variables are `camelCase`.
- Factory functions start with `create`. Validators start with `parse` or `assert`.

## Comments and history

- Comments explain why, never what.
- No leftover TODOs without an issue, commented-out code, placeholders or speculative abstractions.
- Each commit is one complete change that builds and passes alone, with tests alongside the code.
- Fix mistakes on a branch by rewriting it before review, not with follow-up commits.

## Definition of done

- The change traces to a requirement ID.
- `npm run check` passes, including the 100% coverage gate.
- Every function has unit tests, every component has UI tests, and every feature has integration and Playwright tests. See the [test strategy](TEST_STRATEGY.md#what-each-thing-needs).
- Docs and ADRs match the change.
- Every Cosmo or AWS claim is in [verified facts](VERIFIED_FACTS.md).
- Commits are atomic, and the pull request is green.

# M0: Foundation

**Outcome:** every later feature has a requirement ID and an automatic quality bar. No AWS access is needed.

## Work

1. `docs/spec-and-requirements`: the specification, requirements, standards, decisions and this roadmap.
2. `docs/agent-instructions`: `AGENTS.md` and `CLAUDE.md`, covering sources of truth, verified facts and git rules.
3. `ci/quality-gates`: `packages/repo-checks` for hygiene and traceability, dependency, duplicate and unused-code checks, `npm run check`, CI, CodeQL, Dependabot, release-please and templates. Then make `verify` a required check on `main`.
4. `chore/agent-skills`: skills usable today, the guardrail reviewer and the `main` guard hook. Other skills land with the first branch that needs them, such as `add-subgraph` with `feat/subgraph-kit`.

## Exit

- Every gate fails on a planted violation.
- CI is a required check on `main`.
- Every roadmap branch maps to a requirement, and every requirement to a branch.

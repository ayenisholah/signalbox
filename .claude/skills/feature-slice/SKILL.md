---
name: feature-slice
description: Builds one feature end to end from a requirement ID to a pull request. Use when starting any feature, requirement or roadmap branch in this repo.
---

# Feature slice

1. **Resume.** Read `docs/PROGRESS.md`, then find the requirement in `docs/REQUIREMENTS.md` and its branch in `docs/ROADMAP.md`. Restate the acceptance check. If the work has no requirement ID, ask first.
2. **Use case.** Name the job in `SPEC.md` this serves. If it serves none, stop and ask.
3. **Branch.** `git switch main && git pull --ff-only`, then create the branch named in the roadmap. Never work on `main`.
4. **Facts.** Use `verify-fact` for any Cosmo or AWS interface before relying on it.
5. **Look for reuse.** Search `packages/` for existing helpers, types and patterns.
6. **Failing test.** Write a test named `[ID] behaviour` that captures the acceptance check, and watch it fail for the right reason.
7. **Implement.** Make the smallest change that passes. Pure logic goes in a package. Inject dependencies.
8. **Cover.** Run `npm run test:coverage`. Close gaps with real behaviour tests. Don't add exclusions.
9. **Guardrails.** If the change touches the routers, auth, workspace data, upstream data or AI, run the `guardrail-reviewer` agent.
10. **Docs.** Update docs and the threat model if behaviour, trust boundaries or data stores changed. Use `write-adr` for significant decisions.
11. **Progress.** Update `docs/PROGRESS.md` in the same commit as the work.
12. **Ship.** Use `atomic-commit`, then `open-pr`.

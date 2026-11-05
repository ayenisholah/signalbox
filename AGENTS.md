# Signalbox agent instructions

A Next.js booking web app on a federated Cosmo graph, hosted on AWS. TypeScript, Node 24, npm workspaces. Read the linked docs before changing what they cover.

## Commands

```sh
npm run format:check     # Prettier
npm run lint             # ESLint
npm run typecheck        # tsc
npm run test:coverage    # tests with the 100% per-file gate
```

Planned: `npm run check` runs every gate. It arrives with `ci/quality-gates`.

## Repo map

| Path                | What it is                                     |
| ------------------- | ---------------------------------------------- |
| `docs/`             | Requirements, standards, ADRs, plans, facts    |
| `scripts/`          | Git hook helpers                               |
| `SPEC.md`           | Goals, architecture, interfaces and data model |
| `apps/web`          | Planned: Next.js booking web app               |
| `packages/`         | Planned: shared domain logic and subgraph kit  |
| `subgraphs/`        | Planned: catalog, availability and bookings    |
| `router/`, `graph/` | Planned: router config and local composition   |
| `infra/`            | Planned: CDK app and reusable constructs       |

## Order of truth

1. Code and tests
2. `SPEC.md` and [requirements](docs/REQUIREMENTS.md)
3. [ADRs](docs/adr/README.md)
4. [Verified facts](docs/VERIFIED_FACTS.md)

If these disagree, stop and report it. Don't pick one and carry on.

## Accuracy rules

- **No guessed interfaces.** Never write a Cosmo config key, `wgc` flag, CDK property or AWS limit from memory. Check the pinned version's docs, schema or `--help`, then record it in verified facts.
- **Fact status.** Each fact has a status. Behaviour marked `reported` or `unknown` can't be relied on until it's tested.
- **Pinned versions.** Only the versions in [verified facts](docs/VERIFIED_FACTS.md#pinned-versions) count. Docs for another version don't.
- **No invented resources.** ARNs, IDs, hostnames and quotas come from a real lookup or from code.
- **Evidence for claims.** "Tests pass" or "deployed" needs the command and its output. Report failures and skipped steps as they are.
- **Scope.** Work needs a requirement ID. Without one, ask first.

## AWS limits

- Read-only unless a task says otherwise.
- Use this project's account only.
- Never work around an organisation policy.
- Every first deployment and the production launch need the owner's confirmation, because they cost money and create real infrastructure.

## Guardrails: never weaken these

Enforced by tests or policy, never by convention alone. Full text: [requirements](docs/REQUIREMENTS.md).

- **GR-1** Production never enables dev mode, playground, introspection, query plans or wildcard CORS.
- **GR-2** Production runs persisted operations only.
- **GR-3** The business ID comes from the verified JWT, never client input.
- **GR-4** GraphQL variables, personal data and secrets never reach logs or telemetry.
- **GR-5** No long-lived AWS keys anywhere.
- **GR-6** All infrastructure comes from CDK.
- **GR-7** Breaking schema changes can't merge.
- **GR-8** Production changes only through the approved pipeline.
- **GR-9** Browser code can't read auth tokens or secrets.
- **GR-10** Licensed design assets enter the repository only after their licence is confirmed.

## How to work

- Search `packages/` before writing a helper, and inject dependencies. See [engineering standards](docs/ENGINEERING_STANDARDS.md).
- Write the failing test first. Follow the [test strategy](docs/TEST_STRATEGY.md), and don't add coverage exclusions to get past the gate.
- Prove any new gate fails on a planted violation before trusting it.
- Comments explain why, never what.
- Docs state what's true now. Mark anything unbuilt as planned.
- The repo is public: fixtures stay fictional, with no real business or customer names, account IDs or secrets.

## Git rules

- One branch per feature, one pull request per branch. **Never push to `main`.**
- Atomic Conventional Commits: `type(scope): summary`, with tests in the same commit as their code.
- Commits and pull requests carry no AI attribution.
- Never use schedule labels or filler subjects such as `wip`. Milestones (M1, M2) are fine in docs.
- Never bypass hooks with `--no-verify` or `LEFTHOOK=0`.
- Pull requests land by rebase merge.

## Definition of done

See [engineering standards](docs/ENGINEERING_STANDARDS.md#definition-of-done).

## Key docs

[Specification](SPEC.md) · [Requirements](docs/REQUIREMENTS.md) · [Roadmap](docs/ROADMAP.md) · [Verified facts](docs/VERIFIED_FACTS.md) · [ADRs](docs/adr/README.md) · [Threat model](docs/THREAT_MODEL.md) · [Data privacy](docs/DATA_PRIVACY.md) · [Release process](docs/RELEASE_PROCESS.md) · [SLOs](docs/SLOS.md) · [Contributing](CONTRIBUTING.md)

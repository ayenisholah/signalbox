# Test strategy

Tests come first, and a bug fix starts with a failing test.

## Layers

| Layer | What it proves | Tooling | Runs |
|---|---|---|---|
| Unit | Logic, through public functions and small fakes | Vitest | Every pull request |
| Property | Rules that must hold for any input, such as tenant scoping | fast-check | Every pull request |
| Mutation | Tests catch breakage in auth, tenant and policy code | Stryker | Scheduled, and on those modules |
| Integration | Real Postgres and Redis | Docker Compose | Every pull request |
| Contract | Subgraphs compose, and persisted operations stay valid | `wgc`, schema snapshots | Every pull request |
| End to end | The pinned router image, with real auth and safelist | Docker Compose | Every pull request |
| Infrastructure | Resources, IAM and guardrails | CDK assertions, `cdk-nag` | Every pull request |
| Post-deploy | A release works where it landed | Smoke tests | Every deploy |
| Load and resilience | SLOs, scaling and recovery | k6, AWS FIS | Before launch, then on demand |

Only Vitest is in the repository today. Each tool arrives with the first feature that needs it.

## Coverage policy

`npm run test:coverage` requires 100% lines, branches, functions and statements, per file. Database tests that are skipped therefore fail the gate.

Adding an exclusion needs a reason here and in `vitest.config.ts`. Try moving the logic out of the entrypoint first. There are no exclusions today.

## Writing good tests

- Coverage shows that code ran, not that it's correct. Each test should fail if the behaviour breaks.
- Name the requirement ID in the test name, for example `[FR-SG-5] allows one booking per slot`.
- Every guardrail has a test.
- Avoid real timers.
- Fixtures are fictional.

## Proving a gate works

A new gate must be shown to fail on a planted violation before it's trusted. Check each command's exit code on its own, so that one failure can't hide behind another.

# 0003: Define infrastructure in CDK TypeScript

**Status:** Accepted

## Context

Infrastructure must be reviewable, repeatable and tested like application code. Cosmo publishes a Terraform module for Fargate, but it covers only the router.

## Decision

Define all AWS resources with CDK in TypeScript, in an `infra/` workspace.

## Consequences

- One language and one set of quality gates across the repository.
- Cosmo's module can't be reused, so its behaviour is rebuilt and tested here.
- `cdk diff` output belongs in infrastructure pull requests.

# 0004: Deploy from GitHub Actions through OIDC

**Status:** Accepted

## Context

Deploys need AWS access without long-lived credentials (GR-5).

## Decision

GitHub Actions is the only CI/CD system. Workflows assume IAM roles through OIDC, limited to this repository and the target environment.

## Consequences

- No AWS keys are stored in GitHub.
- Required reviewers on the `production` environment rely on the repository being public, unless a paid GitHub plan is used.

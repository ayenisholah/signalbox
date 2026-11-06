# 0012: Use Amazon Bedrock for an optional assistant

**Status:** Accepted

## Context

Explaining composition errors and suggesting safe migrations is useful, but a model can be wrong and the project's value mustn't depend on one.

## Decision

Call Amazon Bedrock from the web server through its task role, so there are no keys to manage. Keep composition and impact analysis deterministic. Validate every suggestion with real composition or the schema before showing it.

## Consequences

- The product works fully with the assistant off (FR-AI-4).
- User schemas and upstream text are untrusted input to a model (GR-13).
- It needs an AWS account, so it comes after the public demo.

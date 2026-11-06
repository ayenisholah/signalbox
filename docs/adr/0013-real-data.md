# 0013: Serve real data

**Status:** Accepted

## Context

Fictional data would make the graph a toy, and it couldn't show real federated joins or real failure handling.

## Decision

Serve live public data from npm, GitHub and OSV, joined by `Package` and `Repository` entities. Tests replay recorded real responses, with a scheduled check against the live sources.

## Consequences

- Subgraphs need caching, retries and rate limit handling (FR-SG-6).
- Upstream text is untrusted, and maintainer emails are dropped on read (GR-16).
- Upstream terms must be checked before launch (U-15).

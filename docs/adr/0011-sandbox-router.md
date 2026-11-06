# 0011: Run a separate sandbox router

**Status:** Accepted

## Context

The workbench needs query plans and free-form operations. GR-1 and GR-2 ban both on the public router, and they shouldn't be weakened for a feature.

## Decision

Run a second Cosmo Router with no public route, reachable only from the web server, limited to read operations and rate limited. The public router stays hardened, and its guardrails are unchanged.

## Consequences

- One more service to run and pay for.
- GR-11 must hold: no internet route, and no mutations.
- The route view works only through the web server, so it needs M3.

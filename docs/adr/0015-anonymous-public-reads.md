# 0015: Allow anonymous reads on the public router

**Status:** Accepted

## Context

FR-GW-2 refused missing tokens, while `SPEC.md` said public package data needs no sign-in, and M3's Package explorer is for visitors who haven't signed in. Requiring a token everywhere would mean the web server holding a service token, which needs Cognito before M3 can ship.

The pinned router treats these separately. `authorization.require_authentication` controls whether a token is needed, and `authentication.jwt.on_error` controls what happens to a bad one (C-36).

## Decision

The public router serves public data with no token. It refuses any token that is present but invalid, expired or wrongly signed, and such a request reaches no subgraph. Workspace fields require a valid token, from M4.

## Consequences

- Sign-in stays optional, as the product promises.
- Anonymous traffic is limited by persisted operations (GR-2), request limits (FR-GW-4) and rate limits (FR-GW-5), not by identity.
- `on_error` stays `reject`, so a broken token never quietly becomes anonymous.
- `workspace` must enforce authentication itself, and GR-3 still applies.

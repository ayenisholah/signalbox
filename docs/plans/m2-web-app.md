# M2: Booking web app

**Outcome:** a customer can sign in, find a slot, book it and cancel it in a browser, against the local graph. No AWS access is needed, apart from a Cognito stand-in for local sign-in.

## Licence gate

Cleared on 2026-11-05: the owner confirmed Frox can be used publicly (U-10, GR-10), as recorded in [ADR 0008](../adr/0008-frox-design-system.md). Styled UI can proceed. Kit icons and images still aren't copied.

## Work

1. `feat/web-graph-client`: `apps/web`, `.graphql` documents, generated types and persisted operations.
2. `feat/web-auth`: Cognito code flow with PKCE, server-side session, `HttpOnly` cookies, and a local issuer for development and tests.
3. `feat/design-system`: token pipeline, contrast and unit checks, and the base components.
4. `feat/web-booking-flow`: services, slot selection and booking.
5. `feat/web-bookings-page`: viewing and cancelling.
6. `test/web-e2e`: Playwright flows and axe on every route, against the pinned router.

## Exit

- The full booking flow passes end to end in Docker.
- axe reports no violations, and each flow works by keyboard.
- A second browser losing the race for a slot sees fresh slots.

# 0007: Build the web app with Next.js

**Status:** Accepted

## Context

Traverse's product is a booking web app. Keeping tokens away from browser code (GR-9) needs a server-side layer between the browser and the router.

## Decision

Build `apps/web` with Next.js and server rendering. The server holds the session and calls the router.

## Consequences

- The web app runs as a long-lived Fargate service with the same deploy path as the subgraphs.
- The web app's browser code never calls the router directly, so router CORS stays closed to it. API clients use `/graphql` with their own tokens.
- The router sees the web app as its main client.

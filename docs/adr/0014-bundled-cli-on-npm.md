# 0014: Publish the CLI as a dependency-free bundle

**Status:** Accepted

## Context

Frontend developers need to run Traverse on their own repositories without cloning it. Every package here ships raw TypeScript, and Node refuses to strip types under `node_modules` (W-10), so the source can't run once installed. `@wundergraph/composition` also asks for a `@graphql-tools/utils` with two high severity advisories, and this repository's npm override can't reach a consumer's install (W-6).

## Decision

Publish `packages/cli` to npm as `@ayenis/traverse`, bundled by rolldown with every dependency inlined, so it installs nothing else. The licences of inlined packages ship in `THIRD-PARTY-NOTICES.txt`.

`release.yml` publishes through npm trusted publishing, so no npm token is stored. The version follows the repository's through release-please.

The GitHub Action keeps running from source at its pinned tag, so it doesn't depend on the registry.

## Consequences

- Consumers get the fixed `@graphql-tools/utils` and no advisory from it, and their `npm audit` can't see what's inlined. A security fix in a dependency needs a Traverse release.
- The package is about 700 kB packed, mostly composition and Babel.
- The first publish is manual, because a trusted publisher is added to a package that exists (W-16).
- The name uses the owner's personal scope, because `traverse` and `traverse-cli` are taken.

# 0009: Build a graph workbench for frontend developers

**Status:** Accepted

## Context

The first product was a customer booking app. It proved little about a federated graph from the point of view of the people who consume one, and a graph's users are developers. Cosmo's own checks rely on router traffic, so they can't see operations that haven't shipped.

## Decision

Build Traverse, a tool for frontend developers on [WunderGraph Cosmo](https://cosmo-docs.wundergraph.com/overview). A CLI and GitHub Action report what a schema change breaks in a repository's code, and a web app shows the graph, query routes and impact. Rename the project from Signalbox. Keep the Cosmo Router, AWS plan and guardrails. A web-only tool was rejected, because people can't build it into their workflow.

## Consequences

- The CLI is the core, so the product is useful with no account or website.
- The booking domain, its requirements and its subgraphs are removed.
- It overlaps with GraphQL Inspector, and the README says so plainly.

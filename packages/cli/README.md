# Traverse

Finds the GraphQL operations and screens a federated schema change breaks, using [WunderGraph Cosmo](https://cosmo-docs.wundergraph.com/overview) composition. It reads your repository, so it sees operations that haven't shipped.

Traverse is an independent project, not a WunderGraph product.

Needs Node 24 or later, and git.

## Use

Add `traverse.json` to your repository:

```json
{
  "subgraphs": [
    { "name": "employees", "schema": "graph/employees.graphqls", "owner": "people-team" }
  ],
  "operations": ["src/**/*.graphql", "src/**/*.{ts,tsx}"],
  "screens": [{ "name": "Checkout", "operations": ["GetCart"] }]
}
```

Then compare your working tree with a branch:

```sh
npx @ayenis/traverse check --base origin/main
```

It exits 0 if nothing breaks, 1 if an operation breaks or the proposed schema doesn't compose, and 2 if it can't run.

The [repository](https://github.com/ayenisholah/traverse#check-a-pull-request) has the GitHub Action and the full [specification](https://github.com/ayenisholah/traverse/blob/main/SPEC.md#cli-and-github-action).

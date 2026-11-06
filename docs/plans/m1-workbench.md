# M1: Public demo and CLI

**Outcome:** anyone can open a public URL and see a real graph's map and impact check, and run a check on their own repository. No AWS or Cosmo account is needed.

## Work

1. `chore/web-tooling`: `apps/*` workspace with Next.js, Tailwind and Radix, and the gates extended to `apps/` and `.tsx`.
2. `feat/graph-core`: `packages/graph-core`, pure logic over `@wundergraph/composition`: composition, the field-to-subgraph index and impact analysis. Answer U-11 here first.
3. `feat/design-tokens`: the Frox scale as a Tailwind theme, with contrast and rem checks. Needs U-18 answered.
4. `feat/graph-map`: the searchable map.
5. `feat/impact-check`: schema draft editor, Web Worker and results view.
6. `feat/impact-cli`: the CLI and GitHub Action.
7. `ci/demo-deploy`: static export to GitHub Pages. Confirm with the owner before enabling Pages.

## Exit

- The CLI flags a planted breaking change against the Cosmo demo schemas, and on a real pull request.
- Playwright and axe pass on the exported app, and it loads with no sign-in.
- At least three frontend developers have tried it on their own repositories, with findings in `docs/USER_FEEDBACK.md`.

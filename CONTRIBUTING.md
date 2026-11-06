# Contributing

Read the [specification](SPEC.md), [requirements](docs/REQUIREMENTS.md) and [engineering standards](docs/ENGINEERING_STANDARDS.md) first.

## Workflow

1. Find the requirement your change delivers. If there isn't one, open an issue first.
2. Create one branch for the feature from the latest `main`.
3. Write a failing test, then the code.
4. Open a pull request linked to its requirement IDs.
5. Pull requests land by rebase merge once checks are green.

`main` is protected, so nothing is pushed to it directly. Don't bypass Git hooks.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): summary`.

- Keep each commit to one complete change, with its tests.
- Each commit must build and pass on its own.
- Describe the change. Hooks reject schedule labels and filler subjects such as `wip`.
- Rewrite your branch to fix mistakes before review.

## Checks

```sh
npm run check
```

## Definition of done

See [engineering standards](docs/ENGINEERING_STANDARDS.md#definition-of-done).

## Fixtures

The repository is public. Fixtures are recorded public responses with personal fields removed, and hold no account IDs, tokens or secrets.

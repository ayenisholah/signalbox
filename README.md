# Signalbox

Signalbox is a booking web app built on a production-grade federated GraphQL API. Customers browse services, choose a slot and manage bookings in a Next.js app. Behind it, a self-managed [Cosmo Router](https://cosmo-docs.wundergraph.com/router/intro) fronts independently deployed subgraphs on AWS, with Cosmo Cloud for the schema registry, analytics and Studio.

A signal box controls which route each train takes, and keeps trains on separate routes from colliding. Signalbox does the same job for API traffic: one controlled entry point that decides what may pass and where it goes.

All booking data is fictional, and the patterns apply to any app on a federated graph.

> [!NOTE]
> **Status: early development.** Today the repository contains the tooling and quality rules. The web app, router, subgraphs and AWS infrastructure described below are planned and not built yet.

## Why it exists

Running a graph router in production involves more than starting a container. Signalbox aims to be a complete, tested answer to the harder questions:

- How do you deploy without dropping requests?
- What happens when the control plane is unreachable?
- How do you stop a schema change from breaking clients?
- How do you keep one tenant's data away from another?
- How do you trace a request from the load balancer to the database?

## Planned architecture

```mermaid
flowchart TD
    client[Browser] -->|HTTPS| waf[AWS WAF]
    waf --> alb[Application Load Balancer]
    alb -->|pages| web[Next.js web app on ECS Fargate]
    alb -->|/graphql| router
    web --> router[Cosmo Router on ECS Fargate]

    subgraph services[Subgraphs on ECS Fargate]
        catalog[Catalog]
        availability[Availability]
        bookings[Bookings]
    end

    router --> services
    services --> rds[(RDS Postgres)]
    router --> redis[(ElastiCache)]
    router --> s3[(S3 fallback config)]
    router -->|config and telemetry| cosmo[Cosmo Cloud]
    router -->|traces and metrics| cloudwatch[CloudWatch and X-Ray]
```

The web app, router, subgraphs and data all run in your AWS account. Cosmo Cloud provides Studio, the schema registry and analytics.

## Design goals

- **Accessible.** The app meets WCAG 2.2 AA and works by keyboard.
- **Safe by default.** Production accepts approved operations only, and development features stay off.
- **Zero-downtime deploys.** Tasks drain before they stop, and failed releases roll back automatically.
- **Tenant isolation.** The tenant comes from a verified token, never from client input.
- **Observable.** Every request can be traced, and every alarm has a runbook.
- **Everything in code.** All infrastructure is defined in CDK, and deploys use short-lived credentials.

## Planned stack

| Area           | Technology                                   |
| -------------- | -------------------------------------------- |
| Web app        | Next.js, React, TypeScript                   |
| Graph          | Cosmo Router, Cosmo Cloud                    |
| Services       | TypeScript on Node 24, Postgres, Redis       |
| Infrastructure | AWS CDK, ECS Fargate, RDS, ElastiCache       |
| Edge           | Route 53, AWS WAF, Application Load Balancer |
| Observability  | OpenTelemetry, CloudWatch, X-Ray             |
| Delivery       | GitHub Actions with OIDC                     |

## Getting started

You need Node 24 and npm. These commands work today:

```sh
git clone https://github.com/ayenisholah/signalbox.git
cd signalbox
nvm use
npm ci
```

`npm ci` also installs the Git hooks.

| Command                 | What it does                             |
| ----------------------- | ---------------------------------------- |
| `npm run format:check`  | Checks formatting with Prettier          |
| `npm run lint`          | Runs ESLint                              |
| `npm run typecheck`     | Type-checks the project                  |
| `npm test`              | Runs the tests                           |
| `npm run test:coverage` | Runs the tests with a 100% per-file gate |

There's no application code or tests yet, so the test commands pass with nothing to run.

## Roadmap

| Phase            | Outcome                                                 | Status      |
| ---------------- | ------------------------------------------------------- | ----------- |
| Foundation       | Tooling, specification, quality gates                   | In progress |
| Local graph      | Three subgraphs running behind the router locally       | Planned     |
| Web app          | Sign in, find a slot, book and cancel, locally          | Planned     |
| Network and data | VPC, databases and edge in CDK                          | Planned     |
| Services         | Web app, router and subgraphs on staging                | Planned     |
| Observability    | End-to-end traces, dashboards and alarms                | Planned     |
| Delivery         | Schema checks and automated, reversible deploys         | Planned     |
| Resilience       | Load, failover and recovery tests with recorded results | Planned     |
| Production       | Launch with runbooks and a cost baseline                | Planned     |

## Documentation

- [Specification](SPEC.md)
- [Requirements](docs/REQUIREMENTS.md)
- [Roadmap](docs/ROADMAP.md)
- [Architecture decisions](docs/adr/README.md)
- [Verified facts](docs/VERIFIED_FACTS.md)
- [Service level objectives](docs/SLOS.md)
- [Threat model](docs/THREAT_MODEL.md)

## Contributing

- Use one branch and one pull request per feature.
- `main` is protected, so all changes arrive through a pull request and land by rebase merge.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/) and each one is a single, complete change. A hook checks the format.
- New behaviour comes with tests in the same commit.

See [contributing](CONTRIBUTING.md) for details, and [security](SECURITY.md) to report a vulnerability.

## Licence

[MIT](LICENSE)

Signalbox is an independent project and isn't affiliated with WunderGraph or AWS.

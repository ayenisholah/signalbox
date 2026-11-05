# Account setup

The owner completes this before M3. Nothing here is needed for M0, M1 or M2.

## AWS

1. Choose the account route. A Free plan project is locked to one Region and its credits won't cover this workload. Upgrading and activating advanced features can't be reversed, and activation removes spend limits (A-8, A-9), so first answer U-7 in [verified facts](../VERIFIED_FACTS.md).
2. Set a budget with alerts before anything is deployed (NFR-6).
3. Confirm the Region. eu-north-1 is proposed.
4. Confirm that the GitHub OIDC provider and roles can be created.
5. Request a Fargate quota of at least 32 vCPU. A rolling deploy of 3 routers alone can use 12.
6. Delegate the subdomain to a Route 53 hosted zone.
7. Bootstrap CDK.

## Cosmo Cloud

1. Create the organisation and federated graph.
2. Create a router token and an API key for CI.
3. Review the plan's limits, retention and support against the [SLOs](../SLOS.md) (U-6).

**Done when:** a deploy role works, the subdomain resolves and the quota is approved.

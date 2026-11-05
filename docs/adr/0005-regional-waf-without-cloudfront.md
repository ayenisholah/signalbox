# 0005: Use a regional WAF without CloudFront

**Status:** Accepted

## Context

GraphQL POST requests gain little from a CDN. CloudFront also needs its viewer certificate in `us-east-1` (A-5), which a single-Region account can't use (A-7).

## Decision

Attach a regional AWS WAF web ACL directly to the Application Load Balancer.

## Consequences

- One less service and no cross-Region certificate.
- No edge caching or edge DDoS absorption beyond what the load balancer and WAF give.

# 0010: Use Tailwind and Radix with the Frox scale

**Status:** Accepted

## Context

ADR 0008 chose a Frox token pipeline. Tailwind and Radix are a better fit for a dense, accessible developer tool, and Radix provides accessible primitives.

## Decision

Use Radix primitives and Tailwind, with the Frox colour, type, radius and spacing scale as the Tailwind theme. Project rules win where they conflict: AA contrast, rem sizing and touch target sizes. Kit icons and images aren't copied.

## Consequences

- `feat/design-tokens` waits for U-18, because the owner's confirmation of public use may not cover MIT relicensing.
- If it doesn't, our own scale replaces the Frox values, with no change to components.

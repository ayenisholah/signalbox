# 0010: Use Tailwind and Radix with the Frox scale

**Status:** Accepted

## Context

ADR 0008 chose a Frox token pipeline. Tailwind and Radix are a better fit for a dense, accessible developer tool, and Radix provides accessible primitives.

## Decision

Use Radix primitives and Tailwind, with the Frox colour, type, radius and spacing scale as the Tailwind theme. Project rules win where they conflict: AA contrast, rem sizing and touch target sizes. Kit icons and images aren't copied.

## Consequences

- On 2026-11-06 the owner confirmed the MIT question (U-18): "you can use frox in an MIT license project". This is the written record GR-10 requires, so `feat/design-tokens` can proceed. The licence text isn't held in this repository.
- If the terms turn out not to allow this use, our own scale replaces the Frox values, with no change to components.

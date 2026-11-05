# 0008: Adopt Frox after a licence check

**Status:** Accepted on 2026-11-05, after the owner confirmed the licence check: "i can use frox for public use". This is the written record GR-10 requires. The licence text isn't held in this repository.

## Context

The web app needs a complete, accessible design system. Frox covers one, but its licence is separate from this repository's MIT licence, and the repository is public.

## Decision

Use the Frox scale for colour, type, radius and control sizes, through a generated token pipeline. Project rules win where they conflict: AA contrast, rem sizing and touch target sizes. Kit icons and images aren't copied.

## Consequences

- Styled UI work in M2 can proceed (GR-10).
- If the licence terms turn out not to allow this use, a new decision replaces this one.

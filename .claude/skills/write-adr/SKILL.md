---
name: write-adr
description: Records an architecture decision in docs/adr. Use when choosing or changing a technology, boundary, data approach or process with lasting impact.
---

# Write an ADR

1. Take the next number from `docs/adr/README.md`.
2. Create `docs/adr/NNNN-short-title.md`:

   ```markdown
   # NNNN: Decision title

   **Status:** Accepted

   ## Context

   The problem and the constraints that force a decision.

   ## Decision

   What we'll do, and the main alternatives rejected and why.

   ## Consequences

   What gets easier, what gets harder, and follow-up work.
   ```

3. Add a row to `docs/adr/README.md`.
4. To change an earlier decision, add a new ADR and mark the old one `Superseded by NNNN`. Don't rewrite old records.
5. Keep it short. If the reasoning needs more than a page, the decision is probably several decisions.

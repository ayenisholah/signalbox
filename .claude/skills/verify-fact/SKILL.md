---
name: verify-fact
description: Checks a Cosmo, AWS or upstream API claim and records it in docs/VERIFIED_FACTS.md. Use before relying on any config key, CLI flag, limit, price or behaviour.
---

# Verify a fact

1. **Look it up.** Check `docs/VERIFIED_FACTS.md`, including its pinned versions and open questions.
2. **Find the source.** Use the pinned version's docs, schema or `--help`. Docs for another version don't count. Never write an interface from memory.
3. **Test it if you can.** Running it beats reading about it.
4. **Record it** with the next ID and one status: `tested` (observed directly), `documented` (official docs), `reported` (unconfirmed) or `unknown`.
5. **Don't rely on `reported` or `unknown`.** Add it to the open questions with the requirement that needs it and when it must be answered.
6. **If sources disagree,** record the conflict as an open question and report it. Don't pick one.

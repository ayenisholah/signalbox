---
name: open-pr
description: Verifies a branch on a clean clone, pushes it, opens a pull request and merges it once green. Use when a branch is ready.
---

# Open a pull request

1. **Tidy.** History has no `wip` or fixup commits. Fix mistakes by rewriting before review. A force-push needs the owner's approval.
2. **Progress.** Confirm `docs/PROGRESS.md` is current.
3. **Lockfile.** If dependencies changed, generate `package-lock.json` in a `node:24` container. Older npm leaves out optional entries, and `npm ci` then fails in CI.
4. **Verify before pushing.** On a clean clone in `node:24`, run `npm ci` and `npm run check`. Check each exit code. If either fails, don't push.
5. **Confirm the change.** After a bulk edit, confirm the result with a search, not an exit code.
6. **Open.** Use the pull request template and list the requirement IDs. Write the body only from results you've seen. Add no attribution.
7. **Wait.** Watch the checks on the current commit. Never trust checks from an older commit.
8. **Merge.** Once all checks pass, run `gh pr merge --rebase --delete-branch`. Never merge a failing or stale pull request.
9. **Confirm.** Check that CI passes on `main`.

Release pull requests get no CI until they're closed and reopened. See `docs/RELEASE_PROCESS.md`.

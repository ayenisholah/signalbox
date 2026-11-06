#!/bin/sh
# PreToolUse guard: main changes only through pull requests (CONTRIBUTING.md).
# Exit 2 blocks the tool call and shows stderr to Claude.
command=$(jq -r '.tool_input.command // ""')
branch=$(git branch --show-current 2>/dev/null)

# Git options before the verb, including -C and -c, which take an argument.
git_verb="(^|[[:space:]])git([[:space:]]+(-[Cc][[:space:]]+[^[:space:]]+|-[^[:space:]]+))*[[:space:]]+"

# One line per shell segment, so a mention of main elsewhere in the command doesn't count.
segments=$(printf '%s\n' "$command" | tr ';&|' '\n\n\n')
uses() { printf '%s\n' "$segments" | grep -E "$git_verb$1([[:space:]]|$)"; }

if [ "$branch" = "main" ] && { uses commit >/dev/null || uses push >/dev/null; }; then
  echo "Blocked: don't commit or push on main. Create a feature branch and open a pull request." >&2
  exit 2
fi
if uses push | grep -qE '([[:space:]:])(refs/heads/)?main([[:space:]]|$)'; then
  echo "Blocked: don't push to main. Push a feature branch and open a pull request." >&2
  exit 2
fi
exit 0

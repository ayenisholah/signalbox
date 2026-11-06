@AGENTS.md

## Claude Code

- Project skills are in `.claude/skills/`. Use `feature-slice` for feature work, `verify-fact` before relying on any Cosmo or AWS claim, `atomic-commit` before committing, and `open-pr` to ship.
- Run the `guardrail-reviewer` agent on changes to the routers, auth, workspace data, upstream data, the web server or the AI assistant.
- For AWS work use the installed `aws-*` skills.

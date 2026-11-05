// Conventional Commits, plus rules that keep history describing the change itself.
const SCHEDULE_LABEL = /\b(?:days?|sessions?|sprints?)[ -]?#?\d+\b/i;
const ATTRIBUTION = /^(co-authored-by:.*|.*generated (with|by) .*)$/im;
const FILLER_SUBJECT =
  /^(wip|fix(es)? tests?|address(ed)? (review|comments?)|cleanup|misc|updates?)\b/i;

const reject = (pattern, text, message) => [!pattern.test(text ?? ""), message];

export default {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        "no-schedule-label": ({ raw }) =>
          reject(SCHEDULE_LABEL, raw, "commit messages describe the change, not when it happened"),
        "no-attribution": ({ raw }) =>
          reject(ATTRIBUTION, raw, "commit messages carry no tool attribution"),
        "no-filler-subject": ({ subject }) =>
          reject(FILLER_SUBJECT, subject, "state what changed; squash fixups before review"),
      },
    },
  ],
  rules: {
    "no-schedule-label": [2, "always"],
    "no-attribution": [2, "always"],
    "no-filler-subject": [2, "always"],
    "body-max-line-length": [0], // dependency bots paste long release notes
    "footer-max-line-length": [0],
  },
};

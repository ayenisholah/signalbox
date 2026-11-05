import { execFileSync } from "node:child_process";
import { checkProgress } from "@signalbox/repo-checks";

const base = process.argv[2] ?? "origin/main";

const changed = execFileSync("git", ["diff", "--name-only", `${base}...HEAD`], {
  encoding: "utf8",
})
  .split("\n")
  .filter(Boolean);

const violations = checkProgress(changed);
violations.forEach(({ path, message }) => console.log(`${path} ${message}`));
console.log(`progress: ${changed.length} changed files, ${violations.length} violations`);
process.exitCode = violations.length === 0 ? 0 : 1;

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { runCheck } from "@traverse/repo-checks";

const TEXT_FILE = /\.(?:ts|tsx|css|js|cjs|mjs|md|ya?ml)$/;

const paths = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
  encoding: "utf8",
})
  .split("\n")
  .filter((path) => TEXT_FILE.test(path) && existsSync(path));

const files = paths.map((path) => ({ path, content: readFileSync(path, "utf8") }));

process.exitCode = runCheck(process.argv[2] ?? "", files, console.log);

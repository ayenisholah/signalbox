import { checkHygiene } from "./hygiene.ts";
import { checkTraceability } from "./traceability.ts";
import type { Check, RepoFile, Violation } from "./types.ts";

const checks = new Map<string, Check>([
  ["hygiene", checkHygiene],
  ["traceability", checkTraceability],
]);

const describeViolation = ({ path, line, message }: Violation): string =>
  `${line === undefined ? path : `${path}:${line}`} ${message}`;

export const runCheck = (name: string, files: RepoFile[], log: (text: string) => void): number => {
  const check = checks.get(name);
  if (check === undefined) {
    log(`unknown check: ${name}`);
    return 1;
  }

  const violations = check(files);
  violations.map(describeViolation).forEach((text) => log(text));
  log(
    violations.length === 0
      ? `${name}: ${files.length} files clean`
      : `${name}: ${violations.length} violations`,
  );
  return violations.length === 0 ? 0 : 1;
};

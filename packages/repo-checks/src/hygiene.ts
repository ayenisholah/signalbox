import { isCode, isOwnPackage, isTestFile } from "./paths.ts";
import type { RepoFile, Violation } from "./types.ts";

interface Rule {
  message: string;
  appliesTo: (path: string) => boolean;
  matches: (line: string) => boolean;
}

const isComment = (line: string): boolean => /^\s*(?:\/\/|\/\*|\*)/.test(line);

const rules: Rule[] = [
  {
    message: "focused or skipped test",
    appliesTo: isTestFile,
    matches: (line) => /\b(?:describe|it|test)\.(?:only|skip)\b/.test(line),
  },
  {
    message: "the any type",
    appliesTo: isCode,
    matches: (line) => !isComment(line) && /:\s*any\b|\bas any\b|<any>/.test(line),
  },
  {
    message: "lint disable without a reason",
    appliesTo: isCode,
    matches: (line) => line.includes("eslint-disable") && !/ -- \S/.test(line),
  },
  {
    message: "TODO without an issue",
    appliesTo: isCode,
    matches: (line) => /\b(?:TODO|FIXME)\b(?!\(#\d+\))/.test(line),
  },
  {
    message: "coverage exclusion in source",
    appliesTo: isCode,
    matches: (line) => /\b(?:v8|c8|istanbul) ignore\b/.test(line),
  },
  {
    message: "attribution line",
    appliesTo: () => true,
    matches: (line) => /^\W*co-authored-by:|\bgenerated (?:with|by) \[?claude/i.test(line),
  },
];

const checkFile = ({ path, content }: RepoFile): Violation[] => {
  const applicable = rules.filter((rule) => rule.appliesTo(path));
  return content
    .split("\n")
    .flatMap((text, index) =>
      applicable
        .filter((rule) => rule.matches(text))
        .map(({ message }) => ({ path, line: index + 1, message })),
    );
};

export const checkHygiene = (files: RepoFile[]): Violation[] =>
  files.filter(({ path }) => !isOwnPackage(path)).flatMap(checkFile);

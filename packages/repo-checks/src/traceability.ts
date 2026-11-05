import { isOwnPackage, isTestFile } from "./paths.ts";
import type { RepoFile, Violation } from "./types.ts";

const REQUIREMENTS = "docs/REQUIREMENTS.md";
const ROADMAP = "docs/ROADMAP.md";
const VERIFICATION = "docs/VERIFICATION.md";

// Deliberately wider than the real prefixes, so a mistyped prefix counts as unknown.
const ID = /\b(?:FR-[A-Z]+-\d+|NFR-\d+|GR-\d+)\b/g;

interface Requirement {
  id: string;
  status: string;
}

interface Branch {
  name: string;
  ids: string[];
}

const idsIn = (text: string): string[] => text.match(ID) ?? [];

const cellsOf = (row: string): string[] =>
  row
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());

const parseRequirements = (content: string): Requirement[] =>
  content
    .split("\n")
    .map(cellsOf)
    .filter(([first = ""]) => idsIn(first)[0] === first && first !== "")
    .map((cells) => ({ id: cells[0] as string, status: cells.at(-1) as string }));

const parseBranches = (content: string): Branch[] =>
  [...content.matchAll(/^\| M\d+ \| `([^`]+)` \| ([^|]*) \|/gm)].map(([, name, ids]) => ({
    name: name as string,
    ids: idsIn(ids as string),
  }));

const duplicates = (requirements: Requirement[]): string[] => {
  const ids = requirements.map(({ id }) => id);
  return [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
};

const unknownIds = (files: RepoFile[], known: Set<string>): Violation[] =>
  files
    .filter(({ path }) => !isOwnPackage(path))
    .flatMap(({ path, content }) =>
      content.split("\n").flatMap((text, index) =>
        idsIn(text)
          .filter((id) => !known.has(id))
          .map((id) => ({ path, line: index + 1, message: `unknown requirement ${id}` })),
      ),
    );

const hasEvidence = (id: string, files: RepoFile[]): boolean =>
  files.some(
    ({ path, content }) =>
      (isTestFile(path) && content.includes(`[${id}]`)) ||
      (path === VERIFICATION && content.includes(id)),
  );

const missingEvidence = (requirements: Requirement[], files: RepoFile[]): Violation[] =>
  requirements
    .filter(({ id, status }) => status === "done" && !hasEvidence(id, files))
    .map(({ id }) => ({
      path: REQUIREMENTS,
      message: `${id} is done but has no named test or recorded proof`,
    }));

const roadmapGaps = (requirements: Requirement[], branches: Branch[]): Violation[] => {
  const planned = new Set(branches.flatMap(({ ids }) => ids));
  return [
    ...branches
      .filter(({ ids }) => ids.length === 0)
      .map(({ name }) => ({
        path: ROADMAP,
        message: `roadmap branch ${name} has no requirement`,
      })),
    ...requirements
      .filter(({ id }) => !planned.has(id))
      .map(({ id }) => ({ path: ROADMAP, message: `${id} has no roadmap branch` })),
  ];
};

export const checkTraceability = (files: RepoFile[]): Violation[] => {
  const contentOf = (path: string) => files.find((file) => file.path === path)?.content;
  const requirementsDoc = contentOf(REQUIREMENTS);
  const roadmapDoc = contentOf(ROADMAP);
  if (requirementsDoc === undefined || roadmapDoc === undefined) {
    return [REQUIREMENTS, ROADMAP]
      .filter((path) => contentOf(path) === undefined)
      .map((path) => ({ path, message: `${path} is missing` }));
  }

  const requirements = parseRequirements(requirementsDoc);
  const known = new Set(requirements.map(({ id }) => id));
  return [
    ...duplicates(requirements).map((id) => ({
      path: REQUIREMENTS,
      message: `${id} is defined more than once`,
    })),
    ...unknownIds(files, known),
    ...missingEvidence(requirements, files),
    ...roadmapGaps(requirements, parseBranches(roadmapDoc)),
  ];
};

import { describe, expect, it } from "vitest";
import { checkTraceability, type RepoFile } from "../src/index.ts";

// Fixture IDs use a prefix no real requirement has: this file counts as evidence for any ID it names.

const requirement = (id: string, status = "planned") =>
  `| ${id} | Text. | Check. | unit | M0 | ${status} |`;

const requirements = (...rows: string[]): RepoFile => ({
  path: "docs/REQUIREMENTS.md",
  content: ["| ID | Requirement | Status |", "|---|---|---|", ...rows].join("\n"),
});

const roadmap = (...rows: string[]): RepoFile => ({
  path: "docs/ROADMAP.md",
  content: [
    "| M1 | Local graph | [Plan](plans/m1.md) | Planned |",
    "| Milestone | Branch | Requirements | Status |",
    "|---|---|---|---|",
    ...rows,
  ].join("\n"),
});

const branch = (name: string, ids: string) => `| M0 | \`${name}\` | ${ids} | Planned |`;

const messages = (files: RepoFile[]) => checkTraceability(files).map(({ message }) => message);

describe("checkTraceability", () => {
  it("[FR-DP-8] accepts a repository where everything traces", () => {
    const files = [
      requirements(requirement("FR-ZZ-1"), requirement("GR-1"), requirement("NFR-1")),
      roadmap(branch("feat/a", "FR-ZZ-1, GR-1"), branch("feat/b", "NFR-1")),
    ];
    expect(checkTraceability(files)).toEqual([]);
  });

  it("[FR-DP-8] needs the requirements and roadmap documents", () => {
    expect(messages([])).toEqual(["docs/REQUIREMENTS.md is missing", "docs/ROADMAP.md is missing"]);
  });

  it("[FR-DP-8] rejects a requirement defined twice", () => {
    const files = [
      requirements(requirement("FR-ZZ-1"), requirement("FR-ZZ-1")),
      roadmap(branch("feat/a", "FR-ZZ-1")),
    ];
    expect(messages(files)).toEqual(["FR-ZZ-1 is defined more than once"]);
  });

  it("[FR-DP-8] rejects an unknown ID anywhere, with its location", () => {
    const files = [
      requirements(requirement("FR-ZZ-1")),
      roadmap(branch("feat/a", "FR-ZZ-1")),
      { path: "docs/plans/m1.md", content: "Fine.\nDelivers FR-ZZ-99 and FR-XX-1, NFR-9, GR-9." },
    ];
    expect(checkTraceability(files)).toEqual(
      ["FR-ZZ-99", "FR-XX-1", "NFR-9", "GR-9"].map((id) => ({
        path: "docs/plans/m1.md",
        line: 2,
        message: `unknown requirement ${id}`,
      })),
    );
  });

  it("[FR-DP-8] skips this package's fixtures when looking for unknown IDs", () => {
    const files = [
      requirements(requirement("FR-ZZ-1")),
      roadmap(branch("feat/a", "FR-ZZ-1")),
      { path: "packages/repo-checks/test/a.test.ts", content: "FR-ZZ-99" },
    ];
    expect(checkTraceability(files)).toEqual([]);
  });

  it("[FR-DP-8] rejects a done requirement with no evidence", () => {
    const files = [
      requirements(requirement("FR-ZZ-1", "done")),
      roadmap(branch("feat/a", "FR-ZZ-1")),
    ];
    expect(messages(files)).toEqual(["FR-ZZ-1 is done but has no named test or recorded proof"]);
  });

  it("[FR-DP-8] accepts a named test as evidence", () => {
    const files = [
      requirements(requirement("FR-ZZ-1", "done")),
      roadmap(branch("feat/a", "FR-ZZ-1")),
      { path: "packages/a/test/a.test.ts", content: 'it("[FR-ZZ-1] works", run);' },
    ];
    expect(checkTraceability(files)).toEqual([]);
  });

  it("[FR-DP-8] accepts a recorded verification as evidence", () => {
    const files = [
      requirements(requirement("FR-ZZ-1", "done")),
      roadmap(branch("feat/a", "FR-ZZ-1")),
      { path: "docs/VERIFICATION.md", content: "| FR-ZZ-1 | Proof. |" },
    ];
    expect(checkTraceability(files)).toEqual([]);
  });

  it("[FR-DP-8] does not count a bare mention in a test as evidence", () => {
    const files = [
      requirements(requirement("FR-ZZ-1", "done")),
      roadmap(branch("feat/a", "FR-ZZ-1")),
      { path: "packages/a/test/a.test.ts", content: "// see FR-ZZ-1" },
    ];
    expect(messages(files)).toHaveLength(1);
  });

  it("[FR-DP-8] rejects a roadmap branch with no requirement", () => {
    const files = [
      requirements(requirement("FR-ZZ-1")),
      roadmap(branch("feat/a", "FR-ZZ-1"), branch("feat/b", "none")),
    ];
    expect(messages(files)).toEqual(["roadmap branch feat/b has no requirement"]);
  });

  it("[FR-DP-8] rejects a requirement with no roadmap branch", () => {
    const files = [
      requirements(requirement("FR-ZZ-1"), requirement("FR-ZZ-2")),
      roadmap(branch("feat/a", "FR-ZZ-1")),
    ];
    expect(messages(files)).toEqual(["FR-ZZ-2 has no roadmap branch"]);
  });
});

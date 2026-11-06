import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createGitReader, createWorkingTreeReader, listFiles } from "../src/source.ts";

let parent: string;
let root: string;

const git = (...args: string[]): string =>
  execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();

beforeEach(() => {
  parent = mkdtempSync(join(tmpdir(), "traverse-source-"));
  root = join(parent, "repo");
  mkdirSync(join(root, "src/deep"), { recursive: true });
  mkdirSync(join(root, "src/node_modules/x"), { recursive: true });
  writeFileSync(join(root, "src/a.graphql"), "query A { a }");
  writeFileSync(join(root, "src/deep/b.tsx"), "export {};");
  writeFileSync(join(root, "src/node_modules/x/c.graphql"), "query C { c }");
  writeFileSync(join(parent, "secret.txt"), "secret");
});

afterEach(() => {
  rmSync(parent, { recursive: true, force: true });
});

describe("createWorkingTreeReader", () => {
  it("[FR-WB-5] reads a file in the repository", () => {
    expect(createWorkingTreeReader(root)("src/a.graphql")).toBe("query A { a }");
  });

  it("[FR-WB-5] returns nothing for a missing file", () => {
    expect(createWorkingTreeReader(root)("missing")).toBeUndefined();
  });

  it("[FR-WB-5] won't follow a symlink out of the repository", () => {
    symlinkSync(join(parent, "secret.txt"), join(root, "link.graphql"));

    expect(createWorkingTreeReader(root)("link.graphql")).toBeUndefined();
  });
});

describe("listFiles", () => {
  it("[FR-WB-5] expands patterns to files, skipping dependencies and directories", () => {
    expect(listFiles(root, ["src/**", "src/**/*.{graphql,tsx}"])).toEqual([
      "src/a.graphql",
      "src/deep/b.tsx",
    ]);
  });

  it("[FR-WB-5] keeps build-looking directories, so moving a file there can't hide it", () => {
    mkdirSync(join(root, "src/dist"));
    writeFileSync(join(root, "src/dist/d.graphql"), "query D { d }");

    expect(listFiles(root, ["src/dist/*.graphql"])).toEqual(["src/dist/d.graphql"]);
  });

  it("[FR-WB-5] keeps symlinks, so the reader can decide and report them", () => {
    symlinkSync(join(parent, "secret.txt"), join(root, "src/link.graphql"));

    expect(listFiles(root, ["src/*.graphql"])).toContain("src/link.graphql");
  });

  it("[FR-WB-5] drops anything a pattern finds outside the repository", () => {
    expect(listFiles(root, ["{..,src}/*.txt", "/etc/host*"])).toEqual([]);
  });
});

describe("createGitReader", () => {
  beforeEach(() => {
    git("init", "--quiet");
    git("add", "src/a.graphql");
    git("-c", "user.name=t", "-c", "user.email=t@example.com", "commit", "--quiet", "-m", "a");
    writeFileSync(join(root, "src/a.graphql"), "query Changed { a }");
  });

  it("[FR-WB-5] reads a file as it was at the ref", () => {
    expect(createGitReader(root, "HEAD")?.("src/a.graphql")).toBe("query A { a }");
  });

  it("[FR-WB-5] reads relative to the working directory, not the top of the repository", () => {
    expect(createGitReader(join(root, "src"), "HEAD")?.("a.graphql")).toBe("query A { a }");
  });

  it("[FR-WB-5] returns nothing for a file the ref doesn't have", () => {
    expect(createGitReader(root, "HEAD")?.("src/deep/b.tsx")).toBeUndefined();
  });

  it("[FR-WB-5] fails rather than call a file missing when git can't read it", () => {
    const blob = git("rev-parse", "HEAD:src/a.graphql");
    rmSync(join(root, ".git/objects", blob.slice(0, 2), blob.slice(2)), { force: true });

    expect(() => createGitReader(root, "HEAD")?.("src/a.graphql")).toThrow("src/a.graphql");
  });

  it("[FR-WB-5] won't treat a committed directory as a repository of its own", () => {
    git("clone", "--quiet", "--bare", ".", "embedded");

    expect(createGitReader(join(root, "embedded"), "HEAD")).toBeUndefined();
  });

  it("[FR-WB-5] refuses a ref that doesn't exist", () => {
    expect(createGitReader(root, "no-such-ref")).toBeUndefined();
  });

  it("[FR-WB-5] refuses a ref that git would read as an option", () => {
    expect(createGitReader(root, "--output=/tmp/x")).toBeUndefined();
  });
});

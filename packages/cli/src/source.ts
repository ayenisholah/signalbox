import { execFileSync } from "node:child_process";
import { globSync, readFileSync, realpathSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

export type ReadFile = (path: string) => string | undefined;

// Only these. Skipping a name like `dist` would let a pull request hide a file by moving it there.
const SKIPPED_DIRECTORIES = new Set(["node_modules", ".git"]);

// A pull request controls these paths, and its symlinks, so anything outside the repository stays
// unread rather than ending up in a public comment.
const readInside = (root: string, path: string): string | undefined => {
  const real = realpathSync(resolve(root, path));
  const outside = relative(realpathSync(root), real).split(sep).includes("..");
  return outside ? undefined : readFileSync(real, "utf8");
};

export const createWorkingTreeReader =
  (root: string): ReadFile =>
  (path) => {
    try {
      return readInside(root, path);
    } catch {
      return undefined;
    }
  };

export const listFiles = (root: string, patterns: string[]): string[] => {
  const entries = globSync(patterns, {
    cwd: root,
    withFileTypes: true,
    exclude: (entry) => SKIPPED_DIRECTORIES.has(entry.name),
  });
  const files = entries
    .filter((entry) => entry.isFile() || entry.isSymbolicLink())
    .map((entry) => relative(root, join(entry.parentPath, entry.name)))
    .filter((path) => !path.split(sep).includes(".."));
  return [...new Set(files)].sort();
};

// A pull request can commit a directory laid out like a bare repository, with a config that runs
// commands. This stops git treating one as the repository.
const SAFE_GIT = ["-c", "safe.bareRepository=explicit"];

const git = (root: string, args: string[]): string | undefined => {
  try {
    return execFileSync("git", [...SAFE_GIT, ...args], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return undefined;
  }
};

/**
 * Returns nothing if the ref can't be resolved. A file the ref doesn't have reads as undefined.
 * Any other failure throws, because reading it as missing would turn a fault into a pass.
 */
export const createGitReader = (root: string, ref: string): ReadFile | undefined => {
  if (ref.startsWith("-")) return undefined;
  const commit = git(root, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`])?.trim();
  if (commit === undefined) return undefined;
  return (path) => {
    const text = git(root, ["show", `${commit}:./${path}`]);
    if (text !== undefined) return text;
    if (git(root, ["ls-tree", "--name-only", commit, "--", `./${path}`]) === "") return undefined;
    throw new Error(`Git couldn't read ${path} at ${ref}.`);
  };
};

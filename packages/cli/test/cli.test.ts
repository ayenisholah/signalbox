import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runCli, USAGE, type CliDependencies } from "../src/cli.ts";
import { MARKER } from "../src/report.ts";

let root: string;
let output: { stdout: string; stderr: string };

const git = (...args: string[]): void => {
  execFileSync("git", args, { cwd: root });
};

const dependencies = (overrides: Partial<CliDependencies> = {}): CliDependencies => ({
  root,
  env: {},
  fetch: () => Promise.resolve(Response.json([])),
  stdout: (text) => (output.stdout += text),
  stderr: (text) => (output.stderr += text),
  writeFile: (path, text) => writeFileSync(path, text),
  ...overrides,
});

const run = (args: string[], overrides?: Partial<CliDependencies>): Promise<number> =>
  runCli(args, dependencies(overrides));

const env = { GITHUB_TOKEN: "secret", GITHUB_REPOSITORY: "o/r" };

beforeEach(() => {
  output = { stdout: "", stderr: "" };
  root = mkdtempSync(join(tmpdir(), "traverse-cli-"));
  mkdirSync(join(root, "ops"));
  writeFileSync(
    join(root, "traverse.json"),
    JSON.stringify({
      subgraphs: [{ name: "s", schema: "s.graphqls" }],
      operations: ["ops/*.graphql"],
    }),
  );
  writeFileSync(join(root, "s.graphqls"), "type Query { a: String b: String }");
  writeFileSync(join(root, "ops/a.graphql"), "query A { b }");
  git("init", "--quiet");
  git("add", ".");
  git("-c", "user.name=t", "-c", "user.email=t@example.com", "commit", "--quiet", "-m", "base");
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("traverse check", () => {
  it("[FR-WB-5] exits 0 when nothing breaks", async () => {
    expect(await run(["check", "--base", "HEAD"])).toBe(0);
    expect(output.stdout).toContain("0 broken operations");
  });

  it("[FR-WB-5] exits 1 on a broken operation and writes the Markdown", async () => {
    writeFileSync(join(root, "s.graphqls"), "type Query { a: String }");
    const file = join(root, "report.md");

    expect(await run(["check", "--base", "HEAD", "--markdown", file])).toBe(1);
    expect(output.stdout).toContain("1 broken operation");
    expect(readFileSync(file, "utf8")).toContain(MARKER);
  });

  it("[FR-WB-5] exits 2 and writes to stderr when it can't run", async () => {
    rmSync(join(root, "ops/a.graphql"));

    expect(await run(["check", "--base", "HEAD"])).toBe(2);
    expect(output.stderr).toContain("No operations");
  });

  it("[FR-WB-5] exits 2 in strict mode when a file couldn't be checked", async () => {
    writeFileSync(
      join(root, "traverse.json"),
      JSON.stringify({
        subgraphs: [{ name: "s", schema: "s.graphqls" }],
        operations: ["ops/*"],
      }),
    );
    writeFileSync(join(root, "ops/b.ts"), "export const = ;");

    expect(await run(["check", "--base", "HEAD"])).toBe(0);
    expect(await run(["check", "--base", "HEAD", "--strict"])).toBe(2);
  });

  it("[FR-WB-5] exits 2, not 0, when git can't read the base config", async () => {
    const blob = execFileSync("git", ["rev-parse", "HEAD:traverse.json"], { cwd: root })
      .toString()
      .trim();
    rmSync(join(root, ".git/objects", blob.slice(0, 2), blob.slice(2)), { force: true });

    expect(await run(["check", "--base", "HEAD"])).toBe(2);
    expect(output.stderr).toContain("traverse.json");
  });

  it("[FR-WB-5] exits 2 without --base", async () => {
    expect(await run(["check"])).toBe(2);
    expect(output.stderr).toContain("--base is required");
  });

  it("[FR-WB-5] exits 2 on a ref that doesn't exist", async () => {
    expect(await run(["check", "--base", "nope"])).toBe(2);
    expect(output.stderr).toContain("nope");
  });
});

describe("traverse comment", () => {
  beforeEach(() => {
    writeFileSync(join(root, "report.md"), `${MARKER}\nbroken`);
  });

  const comment = ["comment", "--pr", "7", "--file", "report.md"];

  it("[FR-WB-5] posts the file to the pull request", async () => {
    const fetch = vi.fn<CliDependencies["fetch"]>(() => Promise.resolve(Response.json([])));

    expect(await run(comment, { env, fetch })).toBe(0);
    expect(output.stdout).toContain("created");
    expect(fetch.mock.calls[1]?.[0]).toBe("https://api.github.com/repos/o/r/issues/7/comments");
  });

  it("[FR-WB-5] uses the runner's API address", async () => {
    const fetch = vi.fn<CliDependencies["fetch"]>(() => Promise.resolve(Response.json([])));
    const apiUrl = "https://github.example.com/api/v3";

    await run(comment, { env: { ...env, GITHUB_API_URL: apiUrl }, fetch });

    expect(fetch.mock.calls[0]?.[0]).toContain(apiUrl);
  });

  it("[FR-WB-5] exits 2 when GitHub refuses, without printing the token", async () => {
    const fetch = () => Promise.resolve(new Response("{}", { status: 500 }));

    expect(await run(comment, { env, fetch })).toBe(2);
    expect(output.stderr).toContain("500");
    expect(output.stderr + output.stdout).not.toContain("secret");
  });

  it.each([
    [["comment", "--file", "report.md"]],
    [["comment", "--pr", "x", "--file", "report.md"]],
  ])("[FR-WB-5] exits 2 on %j, which has no pull request number", async (args) => {
    expect(await run(args, { env })).toBe(2);
    expect(output.stderr).toContain("--pr");
  });

  it.each([[{ GITHUB_TOKEN: "secret" }], [{ GITHUB_REPOSITORY: "o/r" }]])(
    "[FR-WB-5] exits 2 with only %j set",
    async (partial) => {
      expect(await run(comment, { env: partial })).toBe(2);
      expect(output.stderr).toContain("required");
    },
  );

  it.each([[["comment", "--pr", "7"]], [["comment", "--pr", "7", "--file", "missing.md"]]])(
    "[FR-WB-5] exits 2 on %j, which names no readable file",
    async (args) => {
      expect(await run(args, { env })).toBe(2);
      expect(output.stderr).toContain("Can't read");
    },
  );
});

describe("runCli", () => {
  it("[FR-WB-5] prints usage for --help", async () => {
    expect(await run(["--help"])).toBe(0);
    expect(output.stdout).toBe(USAGE);
  });

  it("[FR-WB-5] exits 2 on an unknown command", async () => {
    expect(await run(["nope"])).toBe(2);
    expect(output.stderr).toContain("Usage");
  });

  it("[FR-WB-5] exits 2 on an unknown flag", async () => {
    expect(await run(["check", "--nope"])).toBe(2);
    expect(output.stderr).toContain("--nope");
  });
});

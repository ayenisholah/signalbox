import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const cli = resolve("packages/cli");
const demo = resolve("graph/cosmo-demo");
const config = JSON.parse(readFileSync(resolve("traverse.json"), "utf8")) as {
  subgraphs: object[];
};

let work: string;
let project: string;
let tarball: string;

const run = (command: string, args: string[], cwd: string) =>
  spawnSync(command, args, { cwd, encoding: "utf8" });

const installed = (...path: string[]): string =>
  join(project, "node_modules/@ayenis/traverse", ...path);

beforeAll(() => {
  work = mkdtempSync(join(tmpdir(), "traverse-package-"));
  project = join(work, "project");
  const packed = run("npm", ["pack", "--pack-destination", work, "--silent"], cli);
  expect(packed.status).toBe(0);
  tarball = join(work, packed.stdout.trim().split("\n").at(-1) ?? "");

  cpSync(demo, join(project, "graph/cosmo-demo"), { recursive: true });
  writeFileSync(join(project, "package.json"), '{ "private": true }');
  writeFileSync(join(project, "tag.tsx"), "gql`query Tag { employee(id: 1) { tag } }`;");
  writeFileSync(
    join(project, "traverse.json"),
    JSON.stringify({
      subgraphs: config.subgraphs,
      operations: ["*.tsx"],
    }),
  );
  run("git", ["init", "--quiet"], project);
  run("git", ["add", "graph", "traverse.json", "tag.tsx"], project);
  const identity = ["-c", "user.name=t", "-c", "user.email=t@example.com"];
  run("git", [...identity, "commit", "--quiet", "-m", "base"], project);
  const install = run("npm", ["install", "--no-audit", "--no-fund", tarball], project);
  expect(install.status).toBe(0);
}, 180_000);

afterAll(() => {
  rmSync(work, { recursive: true, force: true });
});

// Node can't strip types under node_modules, so only a real install proves the bundle.
describe("the published package", { timeout: 60_000 }, () => {
  it("[FR-WB-16] installs with no dependencies, so consumers get no advisories", () => {
    expect(existsSync(join(project, "node_modules/@graphql-tools"))).toBe(false);
    expect(existsSync(join(project, "node_modules/@wundergraph"))).toBe(false);
    expect(existsSync(join(project, "node_modules/graphql"))).toBe(false);
  });

  it("[FR-WB-16] ships the bundle, licences and README, and no source", () => {
    expect(existsSync(installed("dist/bin.js"))).toBe(true);
    expect(existsSync(installed("dist/LICENSE"))).toBe(true);
    expect(existsSync(installed("README.md"))).toBe(true);
    expect(existsSync(installed("src"))).toBe(false);
  });

  it("[FR-WB-16] carries the licence of what it inlines", () => {
    const notices = readFileSync(installed("dist/THIRD-PARTY-NOTICES.txt"), "utf8");

    expect(notices).toContain("@wundergraph/composition@");
    expect(notices).toContain("graphql@");
    expect(notices).toContain("@babel/parser@");
    expect(notices).not.toContain("@traverse/");
  });

  it("[FR-WB-16] runs from node_modules and catches a planted break", () => {
    const bin = join(project, "node_modules/.bin/traverse");
    const clean = run(bin, ["check", "--base", "HEAD"], project);
    expect(clean.stderr).toBe("");
    expect(clean.status).toBe(0);

    const path = join(project, "graph/cosmo-demo/employees.graphqls");
    writeFileSync(path, readFileSync(path, "utf8").replace(/^\s*tag: String!\n/m, ""));

    const { status, stdout } = run(bin, ["check", "--base", "HEAD"], project);
    expect(stdout).toContain("- Tag");
    expect(status).toBe(1);
  });
});

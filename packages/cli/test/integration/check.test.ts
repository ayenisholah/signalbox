import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const bin = resolve("packages/cli/src/bin.ts");
const demo = resolve("graph/cosmo-demo");
const config = JSON.parse(readFileSync(resolve("traverse.json"), "utf8")) as {
  subgraphs: { name: string; schema: string }[];
};

const inlineOperation = `
import { gql } from "@apollo/client";
export const EMPLOYEE_TAG = gql\`query EmployeeTag { employee(id: 1) { tag } }\`;
export const Tag = () => <p>{EMPLOYEE_TAG.loc?.source.name}</p>;
`;

let root: string;

const git = (...args: string[]) => spawnSync("git", args, { cwd: root, encoding: "utf8" });

const traverse = (...args: string[]) =>
  spawnSync(process.execPath, [bin, ...args], { cwd: root, encoding: "utf8" });

const editSchema = (name: string, edit: (sdl: string) => string): void => {
  const path = join(root, "graph/cosmo-demo", name);
  writeFileSync(path, edit(readFileSync(path, "utf8")));
};

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "traverse-integration-"));
  cpSync(demo, join(root, "graph/cosmo-demo"), { recursive: true });
  mkdirSync(join(root, "src"));
  writeFileSync(join(root, "src/tag.graphql"), "query FileTag { employee(id: 1) { tag } }");
  writeFileSync(join(root, "src/tag.tsx"), inlineOperation);
  writeFileSync(join(root, "src/skip.ts"), "gql`query Dynamic { ${field} }`;");
  writeFileSync(
    join(root, "traverse.json"),
    JSON.stringify({
      subgraphs: config.subgraphs,
      operations: ["src/**/*.{graphql,ts,tsx}"],
      screens: [{ name: "Profile", operations: ["EmployeeTag"] }],
    }),
  );
  git("init", "--quiet");
  git("add", ".");
  git("-c", "user.name=t", "-c", "user.email=t@example.com", "commit", "--quiet", "-m", "base");
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

// Each run starts Node and loads composition and Babel, which is slow on a busy machine.
describe("traverse on the Cosmo demo schemas", { timeout: 60_000 }, () => {
  it("[FR-WB-5] passes when the schema hasn't changed, and lists what it skipped", () => {
    const { status, stdout, stderr } = traverse("check", "--base", "HEAD");

    expect(stderr).toBe("");
    expect(status).toBe(0);
    expect(stdout).toContain("0 broken operations");
    expect(stdout).toContain("src/skip.ts");
  });

  it("[FR-WB-5] exits 1 on a planted break, in a file and in an inline tag", () => {
    editSchema("employees.graphqls", (sdl) => sdl.replace(/^\s*tag: String!\n/m, ""));

    const { status, stdout } = traverse("check", "--base", "HEAD");

    expect(status).toBe(1);
    expect(stdout).toContain("2 broken operations");
    expect(stdout).toContain("- FileTag");
    expect(stdout).toContain("- EmployeeTag");
    expect(stdout).toContain("- Profile: EmployeeTag");
    expect(stdout).toContain("No owner set");
  });

  it("[FR-WB-5] exits 0 again once the break is gone", () => {
    git("checkout", "--quiet", ".");

    expect(traverse("check", "--base", "HEAD").status).toBe(0);
  });

  it("[FR-WB-5] exits 2 when no operations match", () => {
    rmSync(join(root, "src"), { recursive: true });

    const { status, stderr } = traverse("check", "--base", "HEAD");

    expect(status).toBe(2);
    expect(stderr).toContain("No operations");
  });
});

import { describe, expect, it } from "vitest";
import { exitCode, runCheck } from "../src/check.ts";
import { renderText } from "../src/report.ts";

const before = "type Query { a: String b: String }";
const after = "type Query { a: String }";

const config = (overrides: object = {}): string =>
  JSON.stringify({
    subgraphs: [{ name: "s", schema: "s.graphqls", owner: "team" }],
    operations: ["ops/**"],
    ...overrides,
  });

const reader =
  (files: Record<string, string>) =>
  (path: string): string | undefined =>
    files[path];

interface Scenario {
  base?: Record<string, string>;
  head?: Record<string, string>;
}

const check = ({ base, head }: Scenario = {}) => {
  const ops = { "ops/a.graphql": "query A { b } query C { a }" };
  const headFiles = { "traverse.json": config(), "s.graphqls": after, ...ops, ...head };
  return runCheck({
    current: reader({ "traverse.json": config(), "s.graphqls": before, ...base }),
    proposed: reader(headFiles),
    listFiles: () => Object.keys(headFiles).filter((path) => path.startsWith("ops/")),
  });
};

describe("runCheck", () => {
  it("[FR-WB-5] finds the operation a change breaks, with its screen and owner", () => {
    const screens = [{ name: "Home", operations: ["A", "C"] }];
    const outcome = check({ head: { "traverse.json": config({ screens }) } });

    expect(outcome).toMatchObject({
      kind: "report",
      skipped: [],
      report: {
        changes: [
          { coordinate: "Query.b", kind: "removed", subgraphs: [{ name: "s", owner: "team" }] },
        ],
        operations: [{ name: "A" }],
        screens: [{ name: "Home", operations: ["A"] }],
      },
    });
    expect(exitCode(outcome)).toBe(1);
  });

  it("[FR-WB-5] passes when no operation breaks", () => {
    const outcome = check({ head: { "ops/a.graphql": "query C { a }" } });

    expect(outcome).toMatchObject({ kind: "report", report: { operations: [] } });
    expect(exitCode(outcome)).toBe(0);
  });

  it("[FR-WB-5] sees a subgraph removed from the config, through the base config", () => {
    const two = {
      subgraphs: [
        { name: "s", schema: "s.graphqls" },
        { name: "t", schema: "t.graphqls" },
      ],
    };
    const outcome = check({
      base: {
        "traverse.json": config(two),
        "s.graphqls": "type Query { a: String }",
        "t.graphqls": "type Query { b: String }",
      },
    });

    expect(outcome).toMatchObject({ report: { operations: [{ name: "A" }] } });
  });

  it("[FR-WB-5] lists files it couldn't check, without failing on them", () => {
    const outcome = check({
      head: { "ops/a.graphql": "query C { a }", "ops/b.ts": "gql`query B { ${x} }`" },
    });

    expect(outcome).toMatchObject({ kind: "report", skipped: ["ops/b.ts"] });
    expect(exitCode(outcome)).toBe(0);
  });

  it("[FR-WB-5] fails on unchecked files in strict mode only", () => {
    const outcome = check({
      head: { "ops/a.graphql": "query C { a }", "ops/b.ts": "gql`query B { ${x} }`" },
    });

    expect(exitCode(outcome, true)).toBe(2);
    expect(exitCode(check({ head: { "ops/a.graphql": "query C { a }" } }), true)).toBe(0);
  });

  it("[FR-WB-5] keeps checking the base's patterns, so a pull request can't narrow them", () => {
    const narrowed = config({ operations: ["ops/c.graphql"] });
    const outcome = runCheck({
      current: reader({ "traverse.json": config(), "s.graphqls": before }),
      proposed: reader({
        "traverse.json": narrowed,
        "s.graphqls": after,
        "ops/a.graphql": "query A { b }",
        "ops/c.graphql": "query C { a }",
      }),
      listFiles: (patterns) =>
        patterns.includes("ops/**") ? ["ops/a.graphql", "ops/c.graphql"] : ["ops/c.graphql"],
    });

    expect(exitCode(outcome)).toBe(1);
  });

  it("[FR-WB-5] stops on fragments that clash, because either could hide a break", () => {
    const outcome = check({
      head: {
        "ops/a.graphql": "query A { ...F } fragment F on Query { b }",
        "ops/z.graphql": "fragment F on Query { a }",
      },
    });

    expect(outcome).toMatchObject({ kind: "invalid", errors: [expect.stringContaining("F")] });
  });

  it("[FR-WB-5] fails when the proposed schema doesn't compose", () => {
    const outcome = check({ head: { "s.graphqls": "type Query {" } });

    expect(outcome).toMatchObject({ kind: "composition" });
    expect(exitCode(outcome)).toBe(1);
  });

  it("[FR-WB-5] stops when the current schema doesn't compose", () => {
    const outcome = check({ base: { "s.graphqls": "type Query {" } });

    expect(outcome).toMatchObject({ kind: "invalid" });
    expect(renderText(outcome)).toContain("current schema");
    expect(exitCode(outcome)).toBe(2);
  });

  it("[FR-WB-5] skips with a message when the base has no config yet", () => {
    const outcome = runCheck({
      current: () => undefined,
      proposed: reader({
        "traverse.json": config(),
        "s.graphqls": after,
        "ops/a.graphql": "{ a }",
      }),
      listFiles: () => ["ops/a.graphql"],
    });

    expect(outcome).toEqual({ kind: "no-base" });
    expect(exitCode(outcome)).toBe(0);
  });

  it("[FR-WB-5] stops when the repository has no config", () => {
    const outcome = runCheck({
      current: () => undefined,
      proposed: () => undefined,
      listFiles: () => [],
    });

    expect(outcome).toMatchObject({ kind: "invalid", errors: [expect.stringContaining("found")] });
    expect(exitCode(outcome)).toBe(2);
  });

  it.each([
    ["the working tree", { head: { "traverse.json": "{" } }],
    ["the base", { base: { "traverse.json": "{" } }],
  ])("[FR-WB-5] stops on a bad config in %s", (_, scenario) => {
    expect(check(scenario)).toMatchObject({ kind: "invalid" });
  });

  it("[FR-WB-5] stops when a schema file is missing", () => {
    const outcome = check({
      head: { "traverse.json": config({ subgraphs: [{ name: "x", schema: "x.graphqls" }] }) },
    });

    expect(outcome).toMatchObject({ kind: "invalid", errors: [expect.stringContaining("x")] });
  });

  it("[FR-WB-5] stops when a base schema file is missing", () => {
    const base = { "traverse.json": config({ subgraphs: [{ name: "x", schema: "x.graphqls" }] }) };

    expect(check({ base })).toMatchObject({ kind: "invalid" });
  });

  it("[FR-WB-5] never passes when no operations match", () => {
    const outcome = check({ head: { "ops/a.graphql": "" } });

    expect(outcome).toMatchObject({
      kind: "invalid",
      errors: [expect.stringContaining("No operations")],
    });
  });

  it("[FR-WB-5] stops on a file type it can't read", () => {
    expect(check({ head: { "ops/App.vue": "" } })).toMatchObject({ kind: "invalid" });
  });

  it("[FR-WB-5] stops when a screen names an unknown operation", () => {
    const screens = [{ name: "Home", operations: ["Typo"] }];
    const outcome = check({ head: { "traverse.json": config({ screens }) } });

    expect(outcome).toMatchObject({
      kind: "invalid",
      errors: [expect.stringContaining("Typo")],
    });
  });
});

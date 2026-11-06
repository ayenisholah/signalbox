import { describe, expect, it } from "vitest";
import { parseScreens, runCheck, type CheckInput } from "../src/impact/check-request.ts";

const subgraph = (sdl: string) => [{ name: "a", sdl }];
const before = "type Query { a: Int b: Int }";

const input = (overrides: Partial<CheckInput> = {}): CheckInput => ({
  current: subgraph(before),
  proposed: subgraph("type Query { a: Int }"),
  operations: "query UsesB { b } query UsesA { a }",
  screens: "Home: UsesA, UsesB",
  ...overrides,
});

describe("parseScreens", () => {
  it("[FR-WB-3] reads one screen a line", () => {
    expect(parseScreens("Home: A, B\nSearch:C")).toEqual([
      { name: "Home", operations: ["A", "B"] },
      { name: "Search", operations: ["C"] },
    ]);
  });

  it("[FR-WB-3] skips blank lines and lines with no colon", () => {
    expect(parseScreens("\n  \nnot a screen\n")).toEqual([]);
  });
});

describe("runCheck", () => {
  it("[FR-WB-2] answers with the same id and a report", () => {
    expect(runCheck({ id: 7, input: input() })).toMatchObject({
      id: 7,
      report: {
        success: true,
        operations: [{ name: "UsesB" }],
        screens: [{ name: "Home", operations: ["UsesB"] }],
      },
    });
  });

  it("[FR-WB-2] passes on composition errors", () => {
    const response = runCheck({ id: 1, input: input({ proposed: subgraph("type {") }) });

    expect(response).toMatchObject({ report: { success: false, failed: "proposed" } });
  });

  it("[FR-WB-2] turns a crash into a message, so the page can show it", () => {
    const broken = input({ current: undefined as never });

    expect(runCheck({ id: 2, input: broken })).toMatchObject({
      id: 2,
      crash: expect.any(String) as string,
    });
  });
});

import { describe, expect, it, vi } from "vitest";
import { runCheck } from "../src/index.ts";

describe("runCheck", () => {
  it("[FR-DP-7] passes and says so when nothing is wrong", () => {
    const log = vi.fn();
    expect(runCheck("hygiene", [{ path: "a.ts", content: "" }], log)).toBe(0);
    expect(log.mock.calls).toEqual([["hygiene: 1 files clean"]]);
  });

  it("[FR-DP-7] fails and lists each violation with its location", () => {
    const log = vi.fn();
    const files = [{ path: "a.ts", content: "const a: any = 1;" }];
    expect(runCheck("hygiene", files, log)).toBe(1);
    expect(log.mock.calls).toEqual([["a.ts:1 the any type"], ["hygiene: 1 violations"]]);
  });

  it("[FR-DP-8] runs traceability, and lists violations with no line", () => {
    const log = vi.fn();
    expect(runCheck("traceability", [], log)).toBe(1);
    expect(log.mock.calls[0]).toEqual(["docs/REQUIREMENTS.md docs/REQUIREMENTS.md is missing"]);
  });

  it("[FR-DP-7] fails on an unknown check name", () => {
    const log = vi.fn();
    expect(runCheck("nope", [], log)).toBe(1);
    expect(log.mock.calls).toEqual([["unknown check: nope"]]);
  });
});

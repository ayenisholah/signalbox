import { describe, expect, it } from "vitest";
import { checkProgress } from "../src/index.ts";

describe("checkProgress", () => {
  it("[FR-DP-9] passes when the branch changes nothing", () => {
    expect(checkProgress([])).toEqual([]);
  });

  it("[FR-DP-9] passes when the progress log changes with the work", () => {
    expect(checkProgress(["src/a.ts", "docs/PROGRESS.md"])).toEqual([]);
  });

  it("[FR-DP-9] fails when work lands without a progress update", () => {
    expect(checkProgress(["src/a.ts"])).toEqual([
      { path: "docs/PROGRESS.md", message: "this branch changes files but not the progress log" },
    ]);
  });
});

import { describe, expect, it } from "vitest";
import { contrastPairs, contrastRatio, themes, type ThemeName } from "../src/index.ts";

const names = Object.keys(themes) as ThemeName[];

describe("contrastRatio", () => {
  it("[NFR-9] gives 21 for black on white, in either order", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5);
  });

  it("[NFR-9] gives 1 for a colour on itself", () => {
    expect(contrastRatio("#7364db", "#7364db")).toBeCloseTo(1, 5);
  });

  it("[NFR-9] matches a published value", () => {
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
  });
});

describe.each(names)("%s theme", (name) => {
  it.each(contrastPairs)(
    "[NFR-9] $foreground on $background reaches $minimum:1",
    ({ foreground, background, minimum }) => {
      const theme = themes[name];

      expect(contrastRatio(theme[foreground], theme[background])).toBeGreaterThanOrEqual(minimum);
    },
  );
});

describe("contrastPairs", () => {
  it("[NFR-9] covers every token that carries text or marks focus", () => {
    const foregrounds = new Set(contrastPairs.map(({ foreground }) => foreground));

    expect([...foregrounds].sort()).toEqual(
      [
        "brand",
        "brand-fg",
        "danger",
        "fg",
        "fg-muted",
        "fg-subtle",
        "focus-ring",
        "info",
        "on-brand",
        "success",
        "warning",
      ].sort(),
    );
  });
});

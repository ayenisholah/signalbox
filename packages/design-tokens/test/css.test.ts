import { describe, expect, it } from "vitest";
import { renderTokensCss, themes } from "../src/index.ts";

const css = renderTokensCss();

describe("renderTokensCss", () => {
  it("[FR-WB-13] removes Tailwind's default palette, so only semantic colours exist", () => {
    expect(css).toContain("--color-*: initial;");
    expect(css).toContain("--color-fg: var(--fg);");
  });

  it("[FR-WB-13] gives both themes the same token names", () => {
    expect(Object.keys(themes.dark)).toEqual(Object.keys(themes.light));
  });

  it("[FR-WB-13] writes the light theme by default and the dark theme for the OS setting", () => {
    const [light, dark] = css.split("@media (prefers-color-scheme: dark)");

    expect(light).toContain(`--canvas: ${themes.light.canvas};`);
    expect(dark).toContain(`--canvas: ${themes.dark.canvas};`);
    expect(dark).toContain("color-scheme: dark;");
  });

  it("[NFR-10] sizes type and radius in rem, never px", () => {
    expect(css).toContain("--text-h1: 2.5rem;");
    expect(css).toContain("--text-h1--line-height: 3.75rem;");
    expect(css).toContain("--radius-lg: 1rem;");
    expect(css).not.toMatch(/\dpx/);
  });

  it("[FR-WB-13] sets the Frox font", () => {
    expect(css).toContain('--font-sans: "Poppins"');
  });
});

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderTokensCss } from "@traverse/design-tokens";
import { expect, it } from "vitest";

it("[FR-WB-13] keeps the generated CSS in step with its source", () => {
  const generated = readFileSync(join(import.meta.dirname, "../src/generated/tokens.css"), "utf8");

  expect(generated).toBe(renderTokensCss());
});

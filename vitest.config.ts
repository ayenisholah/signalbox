import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/*/test/**/*.test.ts", "subgraphs/*/test/**/*.test.ts"],
    environment: "node",
    restoreMocks: true,
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
      include: ["{packages,subgraphs}/*/src/**/*.ts"],
      // Every exclusion needs a reason. See docs/TEST_STRATEGY.md before adding one.
      exclude: [],
      thresholds: { perFile: true, lines: 100, branches: 100, functions: 100, statements: 100 },
    },
  },
});

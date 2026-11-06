import { defineConfig } from "vitest/config";

// Kept apart from vitest.config.ts because these tests need a finished build.
export default defineConfig({
  test: {
    include: ["{apps,packages}/*/test/integration/**/*.test.ts"],
    environment: "node",
    restoreMocks: true,
    allowOnly: false,
  },
});

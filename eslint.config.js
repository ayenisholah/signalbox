import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

const SOURCE_FILES = ["packages/*/src/**/*.ts", "subgraphs/*/src/**/*.ts", "infra/src/**/*.ts"];

export default tseslint.config(
  { ignores: ["**/dist/**", "**/node_modules/**", "coverage/**", "**/cdk.out/**", "reports/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node } },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: ["**/*.ts"],
    extends: [...tseslint.configs.recommendedTypeCheckedOnly],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    // Fakes in tests are loosely typed by design.
    files: ["**/test/**/*.ts"],
    rules: {
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/unbound-method": "off",
    },
  },
  {
    // Size limits keep functions modular. A describe block is not a unit of design, so tests are exempt.
    files: SOURCE_FILES,
    rules: {
      complexity: ["error", 10],
      "max-depth": ["error", 3],
      "max-params": ["error", 4],
      "max-lines-per-function": ["error", { max: 60, skipBlankLines: true, skipComments: true }],
      "no-console": "error",
    },
  },
);

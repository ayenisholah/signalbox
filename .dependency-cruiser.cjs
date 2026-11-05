/** Module boundaries from docs/ENGINEERING_STANDARDS.md, enforced in CI. */
module.exports = {
  forbidden: [
    { name: "no-circular", severity: "error", from: {}, to: { circular: true } },
    {
      name: "domain-has-no-io",
      comment: "packages/domain is pure logic: no Node built-ins, no I/O packages.",
      severity: "error",
      from: { path: "^packages/domain/src" },
      to: { dependencyTypes: ["core", "npm"], pathNot: "node_modules/zod" },
    },
    {
      name: "packages-stay-inward",
      comment: "Packages never import subgraphs, apps or infrastructure.",
      severity: "error",
      from: { path: "^packages/" },
      to: { path: "^(subgraphs|apps|infra)/" },
    },
    {
      name: "subgraphs-do-not-import-subgraphs",
      severity: "error",
      from: { path: "^subgraphs/([^/]+)/" },
      to: { path: "^subgraphs/", pathNot: "^subgraphs/$1/" },
    },
    {
      name: "no-deep-package-imports",
      comment: "Import a workspace package through its entry point, not its internals.",
      severity: "error",
      from: { path: "^(apps|packages|subgraphs|infra|scripts)/([^/]+)", pathNot: "/test/" },
      to: { path: "^packages/([^/]+)/src/(?!index\\.ts$)", pathNot: "^packages/$2/" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "(^|/)(dist|generated)/" },
    tsConfig: { fileName: "tsconfig.json" },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: { exportsFields: ["exports"], conditionNames: ["import", "default"] },
  },
};

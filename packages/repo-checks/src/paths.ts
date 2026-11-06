// This package's source and tests spell out every pattern it looks for.
export const isOwnPackage = (path: string): boolean => path.startsWith("packages/repo-checks/");

export const isTestFile = (path: string): boolean =>
  path.split("/").slice(0, -1).includes("test") || /\.test\.tsx?$/.test(path);

export const isAppStyleSource = (path: string): boolean =>
  /^apps\/[^/]+\/src\/.*\.(?:css|tsx)$/.test(path) && !path.includes("/generated/");

export const isCode = (path: string): boolean => /\.(?:ts|tsx|js|cjs|mjs)$/.test(path);

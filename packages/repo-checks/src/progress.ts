import type { Violation } from "./types.ts";

const PROGRESS = "docs/PROGRESS.md";

export const checkProgress = (changedPaths: string[]): Violation[] =>
  changedPaths.length === 0 || changedPaths.includes(PROGRESS)
    ? []
    : [{ path: PROGRESS, message: "this branch changes files but not the progress log" }];

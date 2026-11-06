export const createComposeWorker = (): Worker =>
  new Worker(new URL("./compose.worker.ts", import.meta.url), { type: "module" });

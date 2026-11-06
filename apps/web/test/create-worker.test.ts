import { expect, it, vi } from "vitest";
import { createComposeWorker } from "../src/impact/create-worker.ts";

it("[FR-WB-2] starts the compose worker as a module", () => {
  const Worker = vi.fn();
  vi.stubGlobal("Worker", Worker);

  createComposeWorker();

  const [url, options] = Worker.mock.calls[0] as [URL, WorkerOptions];
  expect(url.href).toContain("compose.worker");
  expect(options).toEqual({ type: "module" });
  vi.unstubAllGlobals();
});

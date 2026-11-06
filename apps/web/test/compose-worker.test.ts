import { expect, it, vi } from "vitest";

it("[FR-WB-2] answers each message from the page", async () => {
  const postMessage = vi.spyOn(self, "postMessage").mockImplementation(() => undefined);

  await import("../src/impact/compose.worker.ts");
  const input = { current: [], proposed: [], operations: "", screens: "" };
  self.onmessage?.(new MessageEvent("message", { data: { id: 4, input } }));

  expect(postMessage).toHaveBeenCalledWith(expect.objectContaining({ id: 4 }));
});

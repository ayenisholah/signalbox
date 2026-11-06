import { beforeAll, expect, it, vi } from "vitest";

const input = { current: [], proposed: [], operations: "", screens: "" };

const send = (id: number, origin?: string) => {
  self.onmessage?.(new MessageEvent("message", { data: { id, input }, origin }));
};

beforeAll(async () => {
  await import("../src/impact/compose.worker.ts");
});

it("[FR-WB-2] answers each message from the page", () => {
  const postMessage = vi.spyOn(self, "postMessage").mockImplementation(() => undefined);

  send(4);

  expect(postMessage).toHaveBeenCalledWith(expect.objectContaining({ id: 4 }));
});

it("[FR-WB-2] ignores a message that names an origin", () => {
  const postMessage = vi.spyOn(self, "postMessage").mockImplementation(() => undefined);

  send(5, "https://example.com");

  expect(postMessage).not.toHaveBeenCalled();
});

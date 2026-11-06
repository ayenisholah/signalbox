import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CheckInput, CheckResponse } from "../src/impact/check-request.ts";
import { useImpactCheck } from "../src/impact/use-impact-check.ts";

class FakeWorker {
  onmessage: ((event: { data: CheckResponse }) => void) | null = null;
  onerror: ((event: { message: string }) => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();

  reply(data: CheckResponse) {
    act(() => {
      this.onmessage?.({ data });
    });
  }
}

const input = (operations = ""): CheckInput => ({
  current: [],
  proposed: [],
  operations,
  screens: "",
});

const report = {
  success: true as const,
  changes: [],
  operations: [],
  screens: [],
};

const setup = (first = input()) => {
  const worker = new FakeWorker();
  const createWorker = () => worker as unknown as Worker;
  const view = renderHook(({ value }) => useImpactCheck(value, createWorker), {
    initialProps: { value: first },
  });
  return { worker, ...view };
};

const settle = () => {
  act(() => {
    vi.advanceTimersByTime(300);
  });
};

describe("useImpactCheck", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("[FR-WB-2] starts as checking, and sends the draft after a pause", () => {
    const { worker, result } = setup();

    expect(result.current).toEqual({ status: "checking" });
    expect(worker.postMessage).not.toHaveBeenCalled();

    settle();

    expect(worker.postMessage).toHaveBeenCalledTimes(1);
  });

  it("[FR-WB-2] waits for typing to pause before checking", () => {
    const { worker } = setup();

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(worker.postMessage).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(worker.postMessage).toHaveBeenCalledTimes(1);
  });

  it("[FR-WB-2] shows the report for the latest draft", () => {
    const { worker, result } = setup();
    settle();

    worker.reply({ id: 1, report });

    expect(result.current).toEqual({ status: "done", report });
  });

  it("[FR-WB-2] sends one check for a burst of edits", () => {
    const { worker, rerender } = setup();

    rerender({ value: input("a") });
    rerender({ value: input("ab") });
    settle();

    expect(worker.postMessage).toHaveBeenCalledTimes(1);
    expect(worker.postMessage).toHaveBeenCalledWith({ id: 3, input: input("ab") });
  });

  it("[FR-WB-2] goes back to checking when the draft changes", () => {
    const { worker, result, rerender } = setup();
    settle();
    worker.reply({ id: 1, report });

    rerender({ value: input("a") });

    expect(result.current).toEqual({ status: "checking" });
  });

  it("[FR-WB-2] ignores an answer to an older draft", () => {
    const { worker, result, rerender } = setup();
    settle();
    rerender({ value: input("a") });
    settle();

    worker.reply({ id: 1, report });

    expect(result.current).toEqual({ status: "checking" });
  });

  it("[FR-WB-2] reports a crash in the check", () => {
    const { worker, result } = setup();
    settle();

    worker.reply({ id: 1, crash: "boom" });

    expect(result.current).toEqual({ status: "failed", message: "boom" });
  });

  it("[FR-WB-2] reports a worker that fails to load", () => {
    const { worker, result } = setup();

    act(() => {
      worker.onerror?.({ message: "no worker" });
    });

    expect(result.current).toEqual({ status: "failed", message: "no worker" });
  });

  it("[FR-WB-2] stops the worker when the page goes", () => {
    const { worker, unmount } = setup();

    unmount();

    expect(worker.terminate).toHaveBeenCalled();
  });
});

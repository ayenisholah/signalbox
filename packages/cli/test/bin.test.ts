import { afterEach, describe, expect, it, vi } from "vitest";

const runBin = async (...args: string[]): Promise<void> => {
  vi.resetModules();
  vi.spyOn(process, "argv", "get").mockReturnValue(["node", "bin.ts", ...args]);
  await import("../src/bin.ts");
};

afterEach(() => {
  process.exitCode = undefined;
});

// Each run imports composition and Babel afresh, which takes several seconds.
describe("bin", { timeout: 30_000 }, () => {
  it("[FR-WB-5] passes the arguments through and prints to stdout", async () => {
    const write = vi.spyOn(process.stdout, "write").mockReturnValue(true);

    await runBin("--help");

    expect(write).toHaveBeenCalledWith(expect.stringContaining("Usage"));
    expect(process.exitCode).toBe(0);
  });

  it("[FR-WB-5] sets a failing exit code and prints to stderr", async () => {
    const write = vi.spyOn(process.stderr, "write").mockReturnValue(true);

    await runBin("nope");

    expect(write).toHaveBeenCalledWith(expect.stringContaining("Usage"));
    expect(process.exitCode).toBe(2);
  });
});

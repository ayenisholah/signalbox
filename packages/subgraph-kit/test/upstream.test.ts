import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { fetchJson, fetchRequired, invalidInput, upstreamError } from "../src/index.ts";

const schema = z.object({ value: z.string() });

const request = (fetch: typeof globalThis.fetch) => ({
  source: "npm",
  url: "https://upstream.example/thing",
  schema,
  fetch,
});

const answer =
  (body: unknown, status = 200) =>
  () =>
    Promise.resolve(new Response(JSON.stringify(body), { status }));

describe("fetchJson", () => {
  it("[FR-SG-7] returns the parsed body, dropping fields the schema doesn't name", async () => {
    const fetch = answer({ value: "kept", email: "dropped" });

    expect(await fetchJson(request(fetch))).toEqual({ value: "kept" });
  });

  it("[FR-SG-7] identifies itself without personal details, and sets a timeout", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(answer({ value: "x" }));

    await fetchJson({ ...request(fetch), headers: { accept: "text/plain" } });

    const init = fetch.mock.calls[0]?.[1];
    expect(init?.headers).toEqual({ accept: "text/plain", "user-agent": "traverse" });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    expect(init?.redirect).toBe("error");
  });

  it("[FR-SG-7] gives up after five seconds by default", async () => {
    const timeout = vi.spyOn(AbortSignal, "timeout");

    await fetchJson(request(answer({ value: "x" })));

    expect(timeout).toHaveBeenCalledWith(5000);
  });

  it("[FR-SG-7] gives up when a source hangs", async () => {
    const hangs: typeof globalThis.fetch = (_, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new Error("aborted"));
        });
      });

    await expect(fetchJson({ ...request(hangs), timeoutMs: 10 })).rejects.toMatchObject({
      message: "npm is unavailable.",
    });
  });

  it("[FR-SG-7] refuses a response too large to parse safely", async () => {
    const huge = JSON.stringify({ value: "x".repeat(16_000_001) });

    await expect(
      fetchJson(request(() => Promise.resolve(new Response(huge)))),
    ).rejects.toMatchObject({ message: "npm is unavailable." });
  });

  it("[FR-SG-7] sends a method and body when given them", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(answer({ value: "x" }));

    await fetchJson({ ...request(fetch), method: "POST", body: "{}" });

    expect(fetch.mock.calls[0]?.[1]).toMatchObject({ method: "POST", body: "{}" });
  });

  it("[FR-SG-7] treats 404 as nothing there, not a failure", async () => {
    expect(await fetchJson(request(answer("Not Found", 404)))).toBeNull();
  });

  it("[FR-SG-7] can treat a 404 as a failure, for an endpoint that always exists", async () => {
    await expect(fetchRequired(request(answer({ value: "x" }, 404)))).rejects.toMatchObject({
      message: "npm is unavailable.",
    });
  });

  it.each<[string, typeof globalThis.fetch]>([
    ["a server error", answer({ value: "valid" }, 500)],
    ["rate limiting", answer({ value: "valid" }, 429)],
    ["an empty body", () => Promise.resolve(new Response(null))],
    ["an unexpected shape", answer({ value: 42 })],
    ["text that isn't JSON", () => Promise.resolve(new Response("<html>"))],
    ["a network failure", () => Promise.reject(new TypeError("fetch failed"))],
  ])("[FR-SG-7] reports %s as the source being unavailable", async (_, fetch) => {
    const error = await fetchJson(request(fetch)).catch((failure: unknown) => failure);

    expect(error).toMatchObject({ message: "npm is unavailable." });
    expect((error as { extensions: object }).extensions).toEqual({
      code: "UPSTREAM_UNAVAILABLE",
      source: "npm",
    });
  });
});

describe("invalidInput", () => {
  it("[FR-SG-7] marks the error as the caller's", () => {
    expect(invalidInput("Bad version.")).toMatchObject({
      message: "Bad version.",
      extensions: { code: "BAD_USER_INPUT" },
    });
  });
});

describe("upstreamError", () => {
  it("[FR-SG-7] names the source and nothing about the request", () => {
    expect(upstreamError("OSV")).toMatchObject({
      message: "OSV is unavailable.",
      extensions: { code: "UPSTREAM_UNAVAILABLE", source: "OSV" },
    });
  });
});

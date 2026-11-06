import { describe, expect, it } from "vitest";
import { upsertComment, type Fetch } from "../src/comment.ts";
import { CLEAN_MARKER, MARKER } from "../src/report.ts";

interface Call {
  url: string;
  init: RequestInit;
}

const fakeGitHub = (pages: object[][], writeStatus = 200, listStatus = 200) => {
  const calls: Call[] = [];
  const fetch: Fetch = (url, init) => {
    calls.push({ url, init });
    if (init.method) return Promise.resolve(new Response("{}", { status: writeStatus }));
    const page = Number(new URL(url).searchParams.get("page"));
    return Promise.resolve(
      new Response(JSON.stringify(pages[page - 1] ?? []), { status: listStatus }),
    );
  };
  return { calls, fetch };
};

const request = (fetch: Fetch, body = `${MARKER}\nbroken`) => ({
  apiUrl: "https://api.example.com",
  repository: "o/r",
  pullRequest: 7,
  token: "secret",
  body,
  fetch,
});

const bot = { login: "github-actions[bot]" };
const ours = { id: 9, body: `${MARKER}\nold`, user: bot };

describe("upsertComment", () => {
  it("[FR-WB-5] creates a comment when there's none", async () => {
    const { calls, fetch } = fakeGitHub([[]]);

    expect(await upsertComment(request(fetch))).toEqual({ kind: "created" });
    expect(calls[1]?.url).toBe("https://api.example.com/repos/o/r/issues/7/comments");
    expect(calls[1]?.init.method).toBe("POST");
    expect(calls[1]?.init.headers).toMatchObject({ Authorization: "Bearer secret" });
  });

  it("[FR-WB-5] updates its earlier comment instead of adding another", async () => {
    const { calls, fetch } = fakeGitHub([[ours]]);

    expect(await upsertComment(request(fetch))).toEqual({ kind: "updated" });
    expect(calls[1]?.url).toBe("https://api.example.com/repos/o/r/issues/comments/9");
    expect(calls[1]?.init.method).toBe("PATCH");
  });

  it("[FR-WB-5] finds its comment on a later page", async () => {
    const filler = Array.from({ length: 100 }, (_, id) => ({ id, body: "hi", user: bot }));
    const { fetch } = fakeGitHub([filler, [ours]]);

    expect(await upsertComment(request(fetch))).toEqual({ kind: "updated" });
  });

  it("[FR-WB-5] won't overwrite a person's comment that carries the marker", async () => {
    const pasted = { id: 1, body: MARKER, user: { login: "someone" } };
    const otherBot = { id: 2, body: MARKER, user: { login: "other[bot]" } };
    const { calls, fetch } = fakeGitHub([
      [pasted, otherBot, { id: 3, user: null }, { id: 4, user: bot }],
    ]);

    expect(await upsertComment(request(fetch))).toEqual({ kind: "created" });
    expect(calls[1]?.init.method).toBe("POST");
  });

  it("[FR-WB-5] stays quiet on a clean result with no earlier comment", async () => {
    const { calls, fetch } = fakeGitHub([[]]);
    const body = `${MARKER}\n${CLEAN_MARKER}`;

    expect(await upsertComment(request(fetch, body))).toEqual({ kind: "not-needed" });
    expect(calls).toHaveLength(1);
  });

  it("[FR-WB-5] clears an earlier comment once the break is fixed", async () => {
    const { fetch } = fakeGitHub([[ours]]);
    const body = `${MARKER}\n${CLEAN_MARKER}`;

    expect(await upsertComment(request(fetch, body))).toEqual({ kind: "updated" });
  });

  it("[FR-WB-5] treats a fork's read-only token as expected", async () => {
    const { fetch } = fakeGitHub([[]], 403);

    expect(await upsertComment(request(fetch))).toEqual({ kind: "read-only" });
  });

  it("[FR-WB-5] reports a failed write", async () => {
    const { fetch } = fakeGitHub([[]], 500);

    expect(await upsertComment(request(fetch))).toEqual({ kind: "failed", status: 500 });
  });

  it("[FR-WB-5] reports a failed read", async () => {
    const { fetch } = fakeGitHub([[]], 200, 404);

    expect(await upsertComment(request(fetch))).toEqual({ kind: "failed", status: 404 });
  });
});

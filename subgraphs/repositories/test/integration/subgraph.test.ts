import type { IncomingHttpHeaders, Server } from "node:http";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  runSubgraph,
  serveUpstream,
  type RunningSubgraph,
} from "../../../../packages/subgraph-kit/test/support/run-subgraph.ts";
import { recordings, replay } from "../helpers.ts";

let upstream: Server;
let running: RunningSubgraph;
let upstreamHeaders: () => IncomingHttpHeaders;

beforeAll(async () => {
  const { url, server, lastHeaders } = await serveUpstream((_, body) => replay(body));
  upstream = server;
  upstreamHeaders = lastHeaders;
  running = await runSubgraph(resolve("subgraphs/repositories/src/main.ts"), {
    GITHUB_TOKEN: "test-token",
    GITHUB_GRAPHQL_URL: `${url}/graphql`,
  });
}, 30_000);

afterAll(() => {
  running.child.kill("SIGKILL");
  upstream.close();
});

describe("the repositories subgraph in a real process", { timeout: 30_000 }, () => {
  it("[FR-SG-3] serves a repository, and sends GitHub the token", async () => {
    const response = await fetch(`${running.url}/graphql`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query: `{ _entities(representations: [
          { __typename: "Repository", url: "https://github.com/vercel/ms" }
        ]) { ... on Repository { stars owner } } }`,
      }),
    });

    expect(await response.json()).toEqual({
      data: {
        _entities: [
          { stars: recordings.vercel__ms?.data.repository?.stargazerCount, owner: "vercel" },
        ],
      },
    });
    expect(upstreamHeaders().authorization).toBe("Bearer test-token");
    expect(running.output()).not.toContain("test-token");
  });
});

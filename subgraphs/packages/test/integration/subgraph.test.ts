import type { Server } from "node:http";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  runSubgraph,
  serveUpstream,
  type RunningSubgraph,
} from "../../../../packages/subgraph-kit/test/support/run-subgraph.ts";
import { fixture, replay } from "../helpers.ts";

let upstream: Server;
let running: RunningSubgraph;

beforeAll(async () => {
  const { url, server } = await serveUpstream((path) => replay(`http://upstream${path}`));
  upstream = server;
  running = await runSubgraph(resolve("subgraphs/packages/src/main.ts"), {
    NPM_REGISTRY_URL: url,
    NPM_DOWNLOADS_URL: url,
  });
}, 30_000);

afterAll(() => {
  running.child.kill("SIGKILL");
  upstream.close();
});

describe("the packages subgraph in a real process", { timeout: 30_000 }, () => {
  it("[FR-SG-2] serves a package from npm's responses", async () => {
    const response = await fetch(`${running.url}/graphql`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query: `{ package(name: "@types/ms") { latestVersion weeklyDownloads repositoryUrl } }`,
      }),
    });

    expect(await response.json()).toEqual({
      data: {
        package: {
          latestVersion: fixture("@types__ms.latest").version,
          weeklyDownloads: fixture("@types__ms.downloads").downloads,
          repositoryUrl: "https://github.com/DefinitelyTyped/DefinitelyTyped",
        },
      },
    });
  });

  it("[FR-SG-7] answers health checks", async () => {
    expect((await fetch(`${running.url}/health/ready`)).status).toBe(200);
  });
});

import type { Server } from "node:http";
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

beforeAll(async () => {
  const { url, server } = await serveUpstream(replay);
  upstream = server;
  running = await runSubgraph(resolve("subgraphs/advisories/src/main.ts"), { OSV_URL: url });
}, 30_000);

afterAll(() => {
  running.child.kill("SIGKILL");
  upstream.close();
});

describe("the advisories subgraph in a real process", { timeout: 30_000 }, () => {
  it("[FR-SG-4] serves a package's advisories", async () => {
    const response = await fetch(`${running.url}/graphql`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query: `{ _entities(representations: [{ __typename: "Package", name: "lodash" }]) {
          ... on Package { advisories(version: "4.17.20") { id } }
        } }`,
      }),
    });

    expect(await response.json()).toEqual({
      data: {
        _entities: [{ advisories: recordings["lodash@4.17.20"]?.vulns.map(({ id }) => ({ id })) }],
      },
    });
  });
});

import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { fixture, replay } from "../helpers.ts";

const main = resolve("subgraphs/packages/src/main.ts");

let upstream: Server;
let child: ChildProcess;
let url: string;

const serveRecordings = async (): Promise<string> => {
  upstream = createServer((request, response) => {
    const answer = replay(`http://upstream${request.url}`);
    void answer.text().then((text) => {
      response.writeHead(answer.status, { "content-type": "application/json" }).end(text);
    });
  }).listen(0, "127.0.0.1");
  await once(upstream, "listening");
  return `http://127.0.0.1:${(upstream.address() as AddressInfo).port}`;
};

beforeAll(async () => {
  const base = await serveRecordings();
  child = spawn(process.execPath, [main], {
    env: {
      PATH: process.env.PATH,
      PORT: "0",
      SHUTDOWN_DRAIN_MS: "0",
      NPM_REGISTRY_URL: base,
      NPM_DOWNLOADS_URL: base,
    },
  });
  let output = "";
  const port = await new Promise<string>((done) => {
    child.stdout?.on("data", (chunk: Buffer) => {
      output += chunk.toString();
      const found = /"port":(\d+)/.exec(output)?.[1];
      if (found !== undefined) done(found);
    });
  });
  url = `http://127.0.0.1:${port}`;
}, 30_000);

afterAll(() => {
  child.kill("SIGKILL");
  upstream.close();
});

describe("the packages subgraph in a real process", { timeout: 30_000 }, () => {
  it("[FR-SG-2] serves a package from npm's responses", async () => {
    const response = await fetch(`${url}/graphql`, {
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
    expect((await fetch(`${url}/health/ready`)).status).toBe(200);
  });
});

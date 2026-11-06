import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { createServer, type IncomingHttpHeaders, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { expect, vi } from "vitest";

export interface RunningSubgraph {
  child: ChildProcess;
  url: string;
  output: () => string;
}

/** Starts a real Node process, because Vitest loads modules differently from production. */
export const runSubgraph = async (
  main: string,
  env: Record<string, string>,
): Promise<RunningSubgraph> => {
  const child = spawn(process.execPath, [main], {
    env: { PATH: process.env.PATH, PORT: "0", SHUTDOWN_DRAIN_MS: "0", ...env },
  });
  let output = "";
  const port = await new Promise<string>((done) => {
    child.stdout.on("data", (chunk: Buffer) => {
      output += chunk.toString();
      const found = /"port":(\d+)/.exec(output)?.[1];
      if (found !== undefined) done(found);
    });
  });
  return { child, url: `http://127.0.0.1:${port}`, output: () => output };
};

/** Serves an upstream's recorded answers over real HTTP, and returns its address. */
export const serveUpstream = async (
  answer: (path: string, body: string) => Response,
): Promise<{ url: string; server: Server; lastHeaders: () => IncomingHttpHeaders }> => {
  let lastHeaders: IncomingHttpHeaders = {};
  const server = createServer((request, response) => {
    lastHeaders = request.headers;
    let body = "";
    request.on("data", (chunk: Buffer) => (body += chunk.toString()));
    request.on("end", () => {
      const reply = answer(String(request.url), body);
      void reply.text().then((text) => {
        response.writeHead(reply.status, { "content-type": "application/json" }).end(text);
      });
    });
  }).listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address() as AddressInfo;
  return { url: `http://127.0.0.1:${port}`, server, lastHeaders: () => lastHeaders };
};

/** Proves an entrypoint starts its subgraph and stops on SIGTERM, with the environment it needs. */
export const expectEntrypointToRun = async (load: () => Promise<unknown>): Promise<void> => {
  const before = process.listenerCount("SIGTERM");

  await load();

  expect(process.listenerCount("SIGTERM")).toBe(before + 1);
  process.emit("SIGTERM");
  await vi.waitFor(() => {
    expect(process.listenerCount("SIGTERM")).toBe(before);
  });
};

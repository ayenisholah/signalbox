import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const server = resolve("packages/subgraph-kit/test/integration/fixtures/server.ts");

let child: ChildProcess;
let url: string;
let output = "";

const post = async (query: string) => {
  const response = await fetch(`${url}/graphql`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return (await response.json()) as { errors: { message: string; extensions: object }[] };
};

beforeAll(async () => {
  child = spawn(process.execPath, [server], {
    env: { PATH: process.env.PATH, PORT: "0", SHUTDOWN_DRAIN_MS: "0", NODE_ENV: "development" },
  });
  child.stdout?.on("data", (chunk: Buffer) => (output += chunk.toString()));
  const port = await new Promise<number>((done) => {
    child.stdout?.on("data", () => {
      const found = /"port":(\d+)/.exec(output)?.[1];
      if (found !== undefined) done(Number(found));
    });
  });
  url = `http://127.0.0.1:${port}`;
}, 30_000);

afterAll(() => {
  child.kill("SIGKILL");
});

// Vitest resolves graphql differently from Node, so only a real process proves error handling.
describe("a subgraph in a real Node process", { timeout: 30_000 }, () => {
  it("[FR-SG-7] keeps a deliberate error and its code", async () => {
    const { errors } = await post("{ refuses }");

    expect(errors[0]).toMatchObject({
      message: "Source unavailable",
      extensions: { code: "UPSTREAM_UNAVAILABLE" },
    });
  });

  it("[FR-SG-7] masks an unexpected error", async () => {
    const { errors } = await post("{ fails }");

    expect(errors[0]?.message).toBe("Unexpected error.");
    expect(output).not.toContain("private detail");
  });

  it("[FR-OB-6] writes JSON lines to stdout", () => {
    const lines = output.trim().split("\n");

    for (const line of lines) expect(() => JSON.parse(line) as unknown).not.toThrow();
    expect(lines.length).toBeGreaterThan(1);
  });

  it("[FR-SG-7] exits cleanly on SIGTERM", async () => {
    child.kill("SIGTERM");

    const [code] = (await once(child, "exit")) as [number | null];

    expect(code).toBe(0);
    expect(output).toContain('"msg":"stopped"');
  });
});

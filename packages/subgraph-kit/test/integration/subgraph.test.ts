import { once } from "node:events";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { runSubgraph, type RunningSubgraph } from "../support/run-subgraph.ts";

const server = resolve("packages/subgraph-kit/test/integration/fixtures/server.ts");

let running: RunningSubgraph;

const post = async (query: string) => {
  const response = await fetch(`${running.url}/graphql`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return (await response.json()) as { errors: { message: string; extensions: object }[] };
};

beforeAll(async () => {
  running = await runSubgraph(server, { NODE_ENV: "development" });
}, 30_000);

afterAll(() => {
  running.child.kill("SIGKILL");
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
    expect(running.output()).not.toContain("private detail");
  });

  it("[FR-OB-6] writes JSON lines to stdout", () => {
    const lines = running.output().trim().split("\n");

    for (const line of lines) expect(() => JSON.parse(line) as unknown).not.toThrow();
    expect(lines.length).toBeGreaterThan(1);
  });

  it("[FR-SG-7] exits cleanly on SIGTERM", async () => {
    running.child.kill("SIGTERM");

    const [code] = (await once(running.child, "exit")) as [number | null];

    expect(code).toBe(0);
    expect(running.output()).toContain('"msg":"stopped"');
  });
});

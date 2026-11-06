import { describe, expect, it, vi } from "vitest";
import { createNpmClient, downloadsSchema, latestSchema, versionsSchema } from "../src/npm.ts";
import { fixture } from "./helpers.ts";

const ADDRESSES = [
  "person@example.org",
  "git@example.org",
  "GIT@example.org",
  "person@mail2.example.org",
  "c@163.com",
  "person@xn--80ak6aa92e.com",
  "person@ex_ample.org",
  "josé@example.org",
  "person@exämple.org",
  "person%40example.org",
];

const client = (fetch: typeof globalThis.fetch) =>
  createNpmClient({ fetch, registryUrl: "https://r", downloadsUrl: "https://d" });

describe("latestSchema", () => {
  it.each(ADDRESSES)("[GR-16] keeps %s out of everything it outputs", (address) => {
    const output = latestSchema.parse({
      version: "1.0.0",
      license: `SEE LICENSE IN ${address}`,
      repository: { url: `https://github.com/${address}/repo` },
      dependencies: { [address]: "^1.0.0", safe: `git+ssh://${address}/x.git` },
      maintainers: [{ email: address }],
      bugs: { email: address },
    });

    expect(JSON.stringify(output)).not.toContain(address);
  });

  it.each(ADDRESSES)("[GR-16] refuses a version holding %s", (address) => {
    expect(() => latestSchema.parse({ version: `1.0.0+${address}` })).toThrow();
  });

  it("[GR-16] outputs only the fields it serves, so a cache can't hold anything else", () => {
    const output = latestSchema.parse({ ...fixture("express.latest"), extra: "dropped" });

    expect(Object.keys(output).sort()).toEqual([
      "dependencies",
      "latestVersion",
      "license",
      "repositoryUrl",
    ]);
  });

  it.each([
    "MIT",
    "Apache-2.0",
    "(MIT OR Apache-2.0)",
    "GPL-3.0+",
    "SEE LICENSE IN LICENSE.md",
    "UNLICENSED",
  ])("[FR-SG-2] keeps the licence %s", (license) => {
    expect(latestSchema.parse({ version: "1.0.0", license }).license).toBe(license);
  });

  it.each(["^1.2.3", "~1.0", ">=1.0.0 <2.0.0", "1.x || 2.x", "*", "latest", "1.0.0-beta.1"])(
    "[FR-SG-2] keeps the range %s",
    (range) => {
      const { dependencies } = latestSchema.parse({ version: "1.0.0", dependencies: { a: range } });

      expect(dependencies).toEqual([{ name: "a", range }]);
    },
  );

  it.each(["git+https://user:secret@host.example/x.git", "npm:other@1.0.0", "file:../x"])(
    "[FR-SG-2] reports the range %s as unknown, and keeps the dependency",
    (range) => {
      const { dependencies } = latestSchema.parse({ version: "1.0.0", dependencies: { a: range } });

      expect(dependencies).toEqual([{ name: "a", range: "unknown" }]);
    },
  );

  it("[FR-SG-2] keeps a scoped dependency", () => {
    const { dependencies } = latestSchema.parse({
      version: "1.0.0",
      dependencies: { "@types/ms": "^2.0.0" },
    });

    expect(dependencies[0]?.name).toBe("@types/ms");
  });

  it.each([
    ["a licence", { license: 42 }, { license: null }],
    ["a repository", { repository: 42 }, { repositoryUrl: null }],
    ["dependencies", { dependencies: ["a"] }, { dependencies: [] }],
    ["a dependency value", { dependencies: { a: 1 } }, { dependencies: [] }],
  ])("[FR-SG-2] survives a malformed value for %s", (_, fields, expected) => {
    expect(latestSchema.parse({ version: "1.0.0", ...fields })).toMatchObject(expected);
  });

  it("[FR-SG-2] drops text too long to be real", () => {
    const license = "M".repeat(257);

    expect(latestSchema.parse({ version: "1.0.0", license }).license).toBeNull();
  });

  it("[FR-SG-2] refuses a version too long to be real", () => {
    expect(() => latestSchema.parse({ version: `1.0.0-${"a".repeat(256)}` })).toThrow();
  });
});

describe("versionsSchema", () => {
  it("[GR-16] outputs version numbers only, and drops the objects under them", () => {
    const output = versionsSchema.parse({
      versions: {
        "1.0.0": { _npmUser: { email: "person@example.org" } },
        "1.0.0-person@example.org": {},
      },
    });

    expect(output).toEqual(["1.0.0"]);
  });
});

describe("downloadsSchema", () => {
  it.each([3_000_000_000, -5, 1.5, "many"])("[FR-SG-2] gives no count for %j", (downloads) => {
    expect(downloadsSchema.parse({ downloads })).toBeNull();
  });
});

describe("createNpmClient", () => {
  it.each([
    ["latest", "../../admin"],
    ["versions", "../../admin"],
    ["weeklyDownloads", "../../admin?x=1#"],
    ["latest", "a".repeat(215)],
    ["latest", {}],
    ["versions", null],
    ["weeklyDownloads", ["ms"]],
  ] as const)("[FR-SG-2] %s refuses %j before calling npm", async (method, name) => {
    const fetch = vi.fn<typeof globalThis.fetch>();

    expect(await client(fetch)[method](name as string)).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("[FR-SG-2] allows a name of npm's maximum length", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(() =>
      Promise.resolve(new Response("{}", { status: 404 })),
    );

    await client(fetch).latest("a".repeat(214));

    expect(fetch).toHaveBeenCalled();
  });

  it("[FR-SG-2] waits longer for the large version document", async () => {
    const timeout = vi.spyOn(AbortSignal, "timeout");
    const fetch = () => Promise.resolve(Response.json({ versions: {} }));

    await client(fetch).versions("ms");

    expect(timeout).toHaveBeenCalledWith(15_000);
  });
});

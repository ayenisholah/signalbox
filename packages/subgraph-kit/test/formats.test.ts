import { describe, expect, it } from "vitest";
import { isPackageName, isSafeEndpoint, isVersion } from "../src/index.ts";

describe("isPackageName", () => {
  it.each(["ms", "@types/ms", "lodash.merge", "a".repeat(214)])("[FR-SG-2] accepts %s", (name) => {
    expect(isPackageName(name)).toBe(true);
  });

  it.each(["", "../x", "a/b/c", "a b", "%2e", "a".repeat(215), null, 1, ["ms"]])(
    "[FR-SG-2] refuses %j",
    (name) => {
      expect(isPackageName(name)).toBe(false);
    },
  );
});

describe("isVersion", () => {
  it.each(["1.2.3", "1.0.0-rc.1", "1.0.0+build.5"])("[FR-SG-2] accepts %s", (version) => {
    expect(isVersion(version)).toBe(true);
  });

  it.each(["1.2", "not a version", "1.0.0+a@b.org", `1.0.0-${"a".repeat(256)}`, null])(
    "[FR-SG-2] refuses %j",
    (version) => {
      expect(isVersion(version)).toBe(false);
    },
  );
});

describe("isSafeEndpoint", () => {
  const official = "https://api.example.com";

  it.each([official, "http://127.0.0.1:9", "http://replay/graphql"])(
    "[FR-SG-7] accepts %s",
    (url) => {
      expect(isSafeEndpoint(url, official)).toBe(true);
    },
  );

  it.each([
    "https://other.example.com",
    "http://api.example.com",
    "http://169.254.169.254",
    "https://replay/graphql",
    "ftp://x",
  ])("[FR-SG-7] refuses %s", (url) => {
    expect(isSafeEndpoint(url, official)).toBe(false);
  });
});

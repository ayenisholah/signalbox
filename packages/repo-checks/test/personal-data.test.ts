import { describe, expect, it } from "vitest";
import { findPersonalData, scrubPersonalData } from "../src/index.ts";

describe("scrubPersonalData", () => {
  it.each([
    "person@example.org",
    "person@mail2.example.org",
    "c@163.com",
    "josé@example.org",
    "person@exämple.org",
    "person%40example.org",
    "git@example.org",
  ])("[GR-16] removes %s from text", (address) => {
    expect(JSON.stringify(scrubPersonalData({ note: `ask ${address} now` }))).not.toContain(
      address,
    );
  });

  it("[GR-16] removes an address used as a key", () => {
    expect(JSON.stringify(scrubPersonalData({ "d@example.org": 1 }))).not.toContain("example.org");
  });

  it.each([
    "author",
    "contributors",
    "maintainers",
    "email",
    "publisher",
    "_npmUser",
    "_npmOperationalInternal",
  ])("[GR-16] removes the field %s, however deep", (key) => {
    expect(scrubPersonalData({ a: [{ [key]: { name: "x" }, kept: 1 }] })).toEqual({
      a: [{ kept: 1 }],
    });
  });

  it("[GR-16] stays fast on a long run of hostile text", () => {
    const started = performance.now();

    scrubPersonalData("!@".repeat(200_000));

    expect(performance.now() - started).toBeLessThan(1000);
  });

  it("[GR-16] leaves package versions, numbers and nulls alone", () => {
    const value = { id: "ms@2.1.3", size: 3, nothing: null, ok: true };

    expect(scrubPersonalData(value)).toEqual(value);
  });
});

describe("findPersonalData", () => {
  it("[GR-16] finds addresses and personal keys in a file", () => {
    const found = findPersonalData('{ "publisher": 1, "note": "x@mail2.example.org" }');

    expect(found).toEqual(["x@mail2.example.org", "publisher"]);
  });

  it("[GR-16] finds nothing in clean text", () => {
    expect(findPersonalData('{ "id": "express@5.3.0" }')).toEqual([]);
  });
});

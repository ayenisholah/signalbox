import { describe, expect, it } from "vitest";
import { extractOperations } from "../src/extract.ts";

const extract = (files: Record<string, string>) =>
  extractOperations(Object.keys(files), (path) => files[path]);

const sources = (files: Record<string, string>): string[] => {
  const result = extract(files);
  if (!result.success) throw new Error(result.errors.join());
  return result.files.map(({ source }) => source);
};

describe("extractOperations", () => {
  it.each(["a.graphql", "a.gql"])("[FR-WB-5] reads %s as it is", (path) => {
    expect(sources({ [path]: "query {" })).toEqual(["query {"]);
  });

  it.each([
    ["Apollo", "a.ts", 'import { gql } from "@apollo/client"; const q = gql`query A { a }`;'],
    ["graphql-tag", "a.js", 'import gql from "graphql-tag"; const q = gql`query A { a }`;'],
    ["a comment", "a.mts", "const q = /* GraphQL */ `query A { a }`;"],
    ["codegen", "a.cts", 'import { graphql } from "./gql"; const q = graphql(`query A { a }`);'],
    ["JSX", "a.tsx", "const q = gql`query A { a }`; export const X = () => <p>{q}</p>;"],
    ["JSX", "a.jsx", "const q = gql`query A { a }`; export const X = () => <p>{q}</p>;"],
    ["ES modules", "a.mjs", "export const q = gql`query A { a }`;"],
    ["CommonJS", "a.cjs", "module.exports = gql`query A { a }`;"],
  ])("[FR-WB-5] finds an inline operation written with %s in %s", (_, path, code) => {
    expect(sources({ [path]: code })).toEqual(["query A { a }"]);
  });

  it("[FR-WB-5] keeps a fragment spread when its import is interpolated", () => {
    const code = 'import { F } from "./f"; const q = gql`query A { ...F } ${F}`;';

    expect(sources({ "a.ts": code })).toEqual(["query A { ...F }"]);
  });

  it("[FR-WB-5] returns every tag in a file", () => {
    const code = "const a = gql`query A { a }`; const f = gql`fragment F on Q { a }`;";

    expect(sources({ "a.ts": code })).toHaveLength(2);
  });

  it("[FR-WB-5] finds nothing in a file with no tags", () => {
    expect(extract({ "a.ts": "export const a = 1;" })).toEqual({
      success: true,
      files: [],
      skipped: [],
    });
  });

  it("[FR-WB-5] skips a tag that interpolation leaves unreadable, and keeps its neighbours", () => {
    const code = "const q = gql`query A { ${field} }`; const r = gql`query B { b }`;";

    expect(extract({ "a.ts": code })).toEqual({
      success: true,
      files: [{ path: "a.ts", source: "query B { b }" }],
      skipped: ["a.ts"],
    });
  });

  it("[FR-WB-5] lists a file once, however many of its tags are unreadable", () => {
    const code = "const q = gql`query A { ${a} }`; const r = gql`query B { ${b} }`;";

    expect(extract({ "a.ts": code })).toMatchObject({ skipped: ["a.ts"] });
  });

  it("[FR-WB-5] skips source it can't parse", () => {
    expect(extract({ "a.ts": "export const = ;" })).toEqual({
      success: true,
      files: [],
      skipped: ["a.ts"],
    });
  });

  it("[FR-WB-5] skips a file it can't read", () => {
    expect(extractOperations(["a.graphql"], () => undefined)).toEqual({
      success: true,
      files: [],
      skipped: ["a.graphql"],
    });
  });

  it("[FR-WB-5] rejects a file type it can't read", () => {
    expect(extract({ "App.vue": "<template />", "a.ts": "" })).toEqual({
      success: false,
      errors: [expect.stringContaining("App.vue")],
    });
  });
});

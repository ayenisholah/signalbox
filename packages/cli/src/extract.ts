import { extname } from "node:path";
import { gqlPluckFromCodeStringSync } from "@graphql-tools/graphql-tag-pluck";
import type { OperationFile } from "@traverse/graph-core";
import { parse } from "graphql";
import type { ReadFile } from "./source.ts";

const DOCUMENT_EXTENSIONS = new Set([".graphql", ".gql"]);
const CODE_EXTENSIONS = new Set([".js", ".mjs", ".cjs", ".jsx", ".ts", ".mts", ".cts", ".tsx"]);

export type Extraction =
  | { success: true; files: OperationFile[]; skipped: string[] }
  | { success: false; errors: string[] };

const parses = (source: string): boolean => {
  try {
    parse(source);
    return true;
  } catch {
    return false;
  }
};

const pluck = (path: string, code: string): string[] | undefined => {
  try {
    return gqlPluckFromCodeStringSync(path, code).map(({ body }) => body);
  } catch {
    return undefined;
  }
};

const isSupported = (path: string): boolean => {
  const extension = extname(path);
  return DOCUMENT_EXTENSIONS.has(extension) || CODE_EXTENSIONS.has(extension);
};

/**
 * Pluck drops every `${...}`. That's right for an interpolated fragment, because the spread stays
 * and fragments resolve across files. Anywhere else it can leave text that won't parse, which says
 * nothing about the schema, so that tag is listed as unchecked rather than counted as broken.
 */
const readCode = (path: string, code: string): { sources: string[]; complete: boolean } => {
  const bodies = pluck(path, code);
  if (bodies === undefined) return { sources: [], complete: false };
  const sources = bodies.filter(parses);
  return { sources, complete: sources.length === bodies.length };
};

const readFileOperations = (
  path: string,
  read: ReadFile,
): { sources: string[]; complete: boolean } => {
  const text = read(path);
  if (text === undefined) return { sources: [], complete: false };
  if (DOCUMENT_EXTENSIONS.has(extname(path))) return { sources: [text], complete: true };
  return readCode(path, text);
};

export const extractOperations = (paths: string[], read: ReadFile): Extraction => {
  const unsupported = paths.filter((path) => !isSupported(path));
  if (unsupported.length > 0) {
    return {
      success: false,
      errors: unsupported.map(
        (path) => `Can't read operations from ${path}. Narrow the operations patterns.`,
      ),
    };
  }

  const files: OperationFile[] = [];
  const skipped: string[] = [];
  for (const path of paths) {
    const { sources, complete } = readFileOperations(path, read);
    files.push(...sources.map((source) => ({ path, source })));
    if (!complete) skipped.push(path);
  }
  return { success: true, files, skipped };
};

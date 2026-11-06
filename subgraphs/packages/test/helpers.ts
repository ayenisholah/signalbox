import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const fixtures = join(import.meta.dirname, "fixtures");

export const fixtureFiles = (): string[] => readdirSync(fixtures);

export const fixture = (file: string): Record<string, unknown> =>
  JSON.parse(readFileSync(join(fixtures, `${file}.json`), "utf8")) as Record<string, unknown>;

const NPM_PATH = /^\/(?<name>(?:@[^/]+%2f)?[^/]+?)(?<latest>\/latest)?$/;
const DOWNLOADS_PATH = /^\/downloads\/point\/last-week\/(?<name>.+)$/;

/** Answers a recorded response for an npm URL, the same way the real services do. */
export const replay = (url: string): Response => {
  const { pathname } = new URL(url);
  const downloads = DOWNLOADS_PATH.exec(pathname)?.groups?.name;
  const registry = NPM_PATH.exec(pathname)?.groups;
  const file = downloads
    ? `${downloads.replace("/", "__")}.downloads`
    : `${String(registry?.name).replace("%2f", "__")}.${registry?.latest ? "latest" : "versions"}`;
  if (!fixtureFiles().includes(`${file}.json`)) return new Response('"Not Found"', { status: 404 });
  return Response.json(fixture(file));
};

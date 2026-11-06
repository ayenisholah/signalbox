import { readFileSync } from "node:fs";
import { join } from "node:path";

export const recordingsFile = join(import.meta.dirname, "fixtures/recordings.json");

const recordings = JSON.parse(readFileSync(recordingsFile, "utf8")) as Record<
  string,
  Record<string, unknown>
>;

export const fixture = (key: string): Record<string, unknown> => {
  const recording = recordings[key];
  if (recording === undefined) throw new Error(`No recording for ${key}`);
  return recording;
};

const NPM_PATH = /^\/(?<name>(?:@[^/]+%2f)?[^/]+?)(?<latest>\/latest)?$/;
const DOWNLOADS_PATH = /^\/downloads\/point\/last-week\/(?<name>.+)$/;

const keyFor = (pathname: string): string => {
  const downloads = DOWNLOADS_PATH.exec(pathname)?.groups?.name;
  if (downloads !== undefined) return `${downloads.replaceAll("/", "__")}.downloads`;
  const { name, latest } = NPM_PATH.exec(pathname)?.groups ?? {};
  return `${String(name).replaceAll("%2f", "__")}.${latest ? "latest" : "versions"}`;
};

/** Answers a recorded response for an npm URL, the same way the real services do. */
export const replay = (url: string): Response => {
  const recording = recordings[keyFor(new URL(url).pathname)];
  return recording ? Response.json(recording) : new Response('"Not Found"', { status: 404 });
};

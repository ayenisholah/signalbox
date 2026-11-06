import { readFileSync } from "node:fs";
import { join } from "node:path";

export const recordingsFile = join(import.meta.dirname, "fixtures/recordings.json");

export const recordings = JSON.parse(readFileSync(recordingsFile, "utf8")) as Record<
  string,
  { vulns: { id: string; summary: string }[] } & { id: string }
>;

interface OsvQuery {
  package: { name: string };
  version?: string;
}

/** Answers a recorded response for an OSV request, the same way OSV does. */
export const replay = (path: string, body: string): Response => {
  const id = /^\/v1\/vulns\/(.+)$/.exec(path)?.[1];
  if (id !== undefined) {
    const record = recordings[id];
    return record ? Response.json(record) : new Response("{}", { status: 404 });
  }
  const { package: target, version } = JSON.parse(body) as OsvQuery;
  const key = version ? `${target.name}@${version}` : target.name;
  return Response.json(recordings[key] ?? {});
};

import { readFileSync } from "node:fs";
import { join } from "node:path";

export const recordingsFile = join(import.meta.dirname, "fixtures/recordings.json");

export const recordings = JSON.parse(readFileSync(recordingsFile, "utf8")) as Record<
  string,
  { data: { repository: { stargazerCount: number } | null } }
>;

interface GithubRequest {
  variables: { owner: string; name: string };
}

/** Answers a recorded response for a GraphQL request, the same way GitHub does. */
export const replay = (body: string): Response => {
  const { owner, name } = (JSON.parse(body) as GithubRequest).variables;
  const missing = recordings["no-such-owner-traverse__nothing"];
  return Response.json(recordings[`${owner}__${name}`] ?? missing);
};

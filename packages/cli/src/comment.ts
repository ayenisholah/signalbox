import { CLEAN_MARKER, MARKER } from "./report.ts";

export type Fetch = (url: string, init: RequestInit) => Promise<Response>;

export interface CommentRequest {
  apiUrl: string;
  repository: string;
  pullRequest: number;
  token: string;
  body: string;
  fetch: Fetch;
}

export type CommentResult =
  { kind: "created" | "updated" | "not-needed" | "read-only" } | { kind: "failed"; status: number };

interface IssueComment {
  id: number;
  body?: string;
  user: { login: string } | null;
}

const PAGE_SIZE = 100;

const headers = (token: string): Record<string, string> => ({
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2026-03-10",
});

/** The author of comments made with `GITHUB_TOKEN`, which is the only token the Action uses. */
const AUTHOR = "github-actions[bot]";

// The marker alone isn't enough: anyone could paste it, and their comment would be overwritten.
const isOurs = ({ body, user }: IssueComment): boolean =>
  user?.login === AUTHOR && body?.startsWith(MARKER) === true;

const findComment = async ({
  apiUrl,
  repository,
  pullRequest,
  token,
  fetch,
}: CommentRequest): Promise<IssueComment | undefined | number> => {
  for (let page = 1; ; page += 1) {
    const url = `${apiUrl}/repos/${repository}/issues/${pullRequest}/comments?per_page=${PAGE_SIZE}&page=${page}`;
    const response = await fetch(url, { headers: headers(token) });
    if (!response.ok) return response.status;

    const comments = (await response.json()) as IssueComment[];
    const found = comments.find(isOurs);
    if (found) return found;
    if (comments.length < PAGE_SIZE) return undefined;
  }
};

const failure = (status: number): CommentResult =>
  status === 403 ? { kind: "read-only" } : { kind: "failed", status };

const send = async (
  request: CommentRequest,
  method: string,
  url: string,
  kind: "created" | "updated",
): Promise<CommentResult> => {
  const { body, token, fetch } = request;
  const response = await fetch(url, {
    method,
    headers: headers(token),
    body: JSON.stringify({ body }),
  });
  return response.ok ? { kind } : failure(response.status);
};

/**
 * Keeps one comment per pull request. A clean result only ever updates an earlier comment, so a
 * pull request that breaks nothing stays quiet. A fork's token is read-only, which isn't a fault.
 */
export const upsertComment = async (request: CommentRequest): Promise<CommentResult> => {
  const { apiUrl, repository, pullRequest, body } = request;
  const existing = await findComment(request);
  if (typeof existing === "number") return failure(existing);
  if (existing) {
    const url = `${apiUrl}/repos/${repository}/issues/comments/${existing.id}`;
    return send(request, "PATCH", url, "updated");
  }
  if (body.includes(CLEAN_MARKER)) return { kind: "not-needed" };
  return send(
    request,
    "POST",
    `${apiUrl}/repos/${repository}/issues/${pullRequest}/comments`,
    "created",
  );
};

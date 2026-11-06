import { GraphQLError } from "graphql";
import type { z } from "zod";

export type UpstreamFetch = typeof globalThis.fetch;

interface UpstreamRequest<T> {
  source: string;
  url: string;
  schema: z.ZodType<T>;
  fetch: UpstreamFetch;
  method?: string;
  body?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 5000;

// Twice the largest real document seen, npm's 8.8 MB for `typescript`. Parsing far more than this
// can exhaust the heap, which would take every request in flight with it.
const MAX_RESPONSE_BYTES = 16_000_000;

/** Says which source failed and nothing else, so no URL, token or upstream text reaches a client. */
export const upstreamError = (source: string): GraphQLError =>
  new GraphQLError(`${source} is unavailable.`, {
    extensions: { code: "UPSTREAM_UNAVAILABLE", source },
  });

const readBody = async (response: Response): Promise<string> => {
  if (response.body === null) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (let part = await reader.read(); !part.done; part = await reader.read()) {
    size += part.value.length;
    if (size > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new Error("response too large");
    }
    chunks.push(part.value);
  }
  return Buffer.concat(chunks).toString("utf8");
};

/**
 * Upstream text is untrusted, so the schema decides what gets past this point. Each schema must
 * also clean what it keeps, because this result is what gets cached (GR-13, GR-16). A 404 means
 * nothing is there. Redirects are refused, so a source can't send a request somewhere else.
 */
export const fetchJson = async <T>({
  source,
  url,
  schema,
  fetch,
  headers,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  ...init
}: UpstreamRequest<T>): Promise<T | null> => {
  try {
    const response = await fetch(url, {
      ...init,
      headers: { ...headers, "user-agent": "traverse" },
      redirect: "error",
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`status ${response.status}`);
    return schema.parse(JSON.parse(await readBody(response)));
  } catch {
    throw upstreamError(source);
  }
};

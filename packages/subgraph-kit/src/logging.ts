import { AsyncLocalStorage } from "node:async_hooks";
import { randomBytes } from "node:crypto";
import { pino, type DestinationStream, type Logger } from "pino";

export type { DestinationStream, Logger };

// Version ff and all-zero IDs are invalid in W3C Trace Context.
const TRACEPARENT = /^(?!ff)[0-9a-f]{2}-(?!0{32})([0-9a-f]{32})-[0-9a-f]{16}-[0-9a-f]{2}$/;

/**
 * Subgraph code logs through this too, so the rules live here rather than in convention (GR-4). An
 * error's message and stack can quote upstream text or variables, so only its name is kept.
 */
export const createLogger = (
  name: string,
  level: string,
  stream: DestinationStream | undefined,
): Logger =>
  pino(
    {
      name,
      level,
      base: { name },
      serializers: { err: ({ name: errorName }: Error) => ({ name: errorName }) },
      redact: {
        paths: ["authorization", "token", "variables", "email", "headers", "query"],
        remove: true,
      },
    },
    stream,
  );

export const traceIdFrom = (traceparent: unknown): string =>
  TRACEPARENT.exec(String(traceparent))?.[1] ?? randomBytes(16).toString("hex");

export interface RequestScope {
  run: <T>(logger: Logger, work: () => T) => T;
  current: () => Logger;
}

/** Error masking has no request context of its own, so the request's logger travels this way. */
export const createRequestScope = (fallback: Logger): RequestScope => {
  const storage = new AsyncLocalStorage<Logger>();
  return {
    run: (logger, work) => storage.run(logger, work),
    current: () => storage.getStore() ?? fallback,
  };
};

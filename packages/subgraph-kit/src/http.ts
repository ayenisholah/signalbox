import type { IncomingMessage, RequestListener, ServerResponse } from "node:http";
import { traceIdFrom, type Logger, type RequestScope } from "./logging.ts";

type Serve = (request: IncomingMessage, response: ServerResponse, context: object) => unknown;

interface Routes {
  serve: Serve;
  isReady: () => boolean;
  logger: Logger;
  scope: RequestScope;
}

const respond = (response: ServerResponse, status: number): void => {
  response.writeHead(status).end();
};

const isJson = ({ headers }: IncomingMessage): boolean =>
  String(headers["content-type"]).startsWith("application/json");

/**
 * Only the router's POST reaches Yoga. Paths aren't logged, and nothing else is routed, so a client
 * can't put text in the logs or reach Yoga's own routes.
 */
export const createRequestListener = ({
  serve,
  isReady,
  logger,
  scope,
}: Routes): RequestListener => {
  const serveGraphql = (request: IncomingMessage, response: ServerResponse): void => {
    const traceId = traceIdFrom(request.headers.traceparent);
    const requestLogger = logger.child({ traceId });
    const started = performance.now();
    // `close` also fires for a request the caller abandons, which `finish` doesn't.
    response.once("close", () => {
      const durationMs = Math.round(performance.now() - started);
      requestLogger.info({ status: response.statusCode, durationMs }, "request");
    });
    scope.run(requestLogger, () => serve(request, response, { traceId, logger: requestLogger }));
  };

  return (request, response) => {
    const path = String(request.url).split("?", 1).join();
    if (path === "/health/live") respond(response, 200);
    else if (path === "/health/ready") respond(response, isReady() ? 200 : 503);
    else if (path !== "/graphql") respond(response, 404);
    else if (request.method !== "POST") respond(response, 405);
    else if (!isJson(request)) respond(response, 415);
    else serveGraphql(request, response);
  };
};

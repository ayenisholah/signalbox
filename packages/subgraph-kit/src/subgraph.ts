import { createServer } from "node:http";
import { createUserVerifier, noUser, type KeySource } from "./auth.ts";
import { parseConfig } from "./config.ts";
import { createGraphql, type SubgraphDefinition } from "./graphql.ts";
import { createRequestListener } from "./http.ts";
import { createLifecycle, type SignalSource } from "./lifecycle.ts";
import { createLogger, createRequestScope, type DestinationStream } from "./logging.ts";

export interface SubgraphDependencies {
  env?: Record<string, string | undefined>;
  logStream?: DestinationStream;
  keys?: KeySource | undefined;
  signals?: SignalSource;
}

export interface Subgraph {
  listen: (port?: number) => Promise<number>;
  shutdown: () => Promise<void>;
  closed: Promise<void>;
}

export const createSubgraph = (
  definition: SubgraphDefinition,
  dependencies: SubgraphDependencies = {},
): Subgraph => {
  const { env, logStream, keys, signals } = { env: process.env, signals: process, ...dependencies };
  const config = parseConfig(env);
  const logger = createLogger(definition.name, config.logLevel, logStream);
  const scope = createRequestScope(logger);
  const verifyUser = config.jwt ? createUserVerifier(keys, config.jwt) : noUser;
  const yoga = createGraphql(definition, verifyUser, scope);

  const server = createServer(
    createRequestListener({
      serve: (request, response, context) => void yoga(request, response, context),
      isReady: () => lifecycle.isReady(),
      logger,
      scope,
    }),
  );
  const lifecycle = createLifecycle({
    server,
    signals,
    logger,
    drainMs: config.drainMs,
    closeMs: config.closeMs,
    dispose: () => yoga.dispose(),
  });

  return {
    listen: (port = config.port) => lifecycle.listen(port),
    shutdown: lifecycle.shutdown,
    closed: lifecycle.closed,
  };
};

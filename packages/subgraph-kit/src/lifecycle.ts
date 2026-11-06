/// <reference lib="es2024.promise" />
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import type { Logger } from "./logging.ts";

export interface SignalSource {
  on: (signal: "SIGTERM" | "SIGINT", listener: () => void) => unknown;
  off: (signal: "SIGTERM" | "SIGINT", listener: () => void) => unknown;
}

interface LifecycleOptions {
  server: Server;
  signals: SignalSource;
  logger: Logger;
  drainMs: number;
  closeMs: number;
  dispose: () => unknown;
}

export interface Lifecycle {
  listen: (port: number) => Promise<number>;
  shutdown: () => Promise<void>;
  isReady: () => boolean;
  closed: Promise<void>;
}

const SIGNALS = ["SIGTERM", "SIGINT"] as const;

// A connection that sends nothing, or a resolver that never settles, must not block the exit.
const closeWithin = async (server: Server, closeMs: number): Promise<void> => {
  const deadline = setTimeout(() => {
    server.closeAllConnections();
  }, closeMs);
  await new Promise((resolve) => {
    server.close(resolve);
    server.closeIdleConnections();
  });
  clearTimeout(deadline);
};

export const createLifecycle = ({
  server,
  signals,
  logger,
  drainMs,
  closeMs,
  dispose,
}: LifecycleOptions): Lifecycle => {
  let ready = false;
  let stopping: Promise<void> | undefined;
  const { promise: closed, resolve: markClosed } = Promise.withResolvers<void>();

  const onSignal = (): void => {
    void shutdown();
  };

  const stop = async (): Promise<void> => {
    await delay(drainMs);
    await closeWithin(server, closeMs);
    await dispose();
    for (const signal of SIGNALS) signals.off(signal, onSignal);
    logger.info("stopped");
    markClosed();
  };

  // Readiness fails first, so load balancers move traffic away before connections close.
  function shutdown(): Promise<void> {
    ready = false;
    stopping ??= stop();
    return stopping;
  }

  const listen = (port: number): Promise<number> =>
    new Promise((resolve) => {
      server.listen(port, () => {
        const { port: bound } = server.address() as AddressInfo;
        for (const signal of SIGNALS) signals.on(signal, onSignal);
        ready = true;
        logger.info({ port: bound }, "listening");
        resolve(bound);
      });
    });

  return { listen, shutdown, isReady: () => ready, closed };
};

import type { GraphQLResolverMap } from "@apollo/subgraph/dist/resolvers.js";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { parse } from "graphql";
import { createYoga, type Plugin } from "graphql-yoga";
import type { VerifyUser } from "./auth.ts";
import { createErrorMask } from "./errors.ts";
import type { Logger, RequestScope } from "./logging.ts";

export interface SubgraphContext {
  userId: string | undefined;
  traceId: string;
  logger: Logger;
}

export interface SubgraphDefinition {
  name: string;
  typeDefs: string;
  resolvers: GraphQLResolverMap<SubgraphContext>;
}

export interface RequestContext {
  traceId: string;
  logger: Logger;
}

// Only the router calls a subgraph, and its fetches are small. Far larger bodies exhaust the heap.
const MAX_BODY_BYTES = 1_000_000;
const MAX_TOKENS = 20_000;

const limitTokens: Plugin = {
  onParse: ({ setParseFn }) => {
    setParseFn((source: string) => parse(source, { maxTokens: MAX_TOKENS }));
  },
};

export const createGraphql = (
  { typeDefs, resolvers }: SubgraphDefinition,
  verifyUser: VerifyUser,
  scope: RequestScope,
) =>
  createYoga<RequestContext, SubgraphContext>({
    schema: buildSubgraphSchema([{ typeDefs: parse(typeDefs), resolvers }]),
    graphiql: false,
    landingPage: false,
    logging: false,
    cors: false,
    maxRequestBodySize: MAX_BODY_BYTES,
    plugins: [limitTokens],
    maskedErrors: { maskError: createErrorMask(scope.current) },
    context: async ({ request, traceId, logger }) => ({
      userId: await verifyUser(request.headers.get("authorization"), logger),
      traceId,
      logger,
    }),
  });
